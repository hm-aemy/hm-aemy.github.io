---
layout: post
title: "Fault-Injection with Verilator: Update on the DPI-Hook Extension"
author: Jonathan Schröter
date: 2026-07-22
updated: 2026-11-12
---
*Update (November 2026): This post has been revised to match the version of the extension we submitted as a PR for upstream. Main changes since July include: rework of bit selection, callback signatures, reading of the runtime binding, hooked signal behavior, signal support.*

This post updates our earlier writeup on extending Verilator with native
fault-injection support, in which we presented the initial version of a fault-injection extension in Verilator. This extension is part of our ongoing efforts to improve tooling for hardware verification and software–hardware co-design.
For further background on the extension's initial structure and motivation, see *"[Update on Fault-Injection with Verilator](https://aemy.cs.hm.edu/2025/11/24/verilator-extension.html)"*.
For the project context, see *"Fault-injection support with the Verilator simulation tool"* in the [Isolde project overview](https://aemy.cs.hm.edu/projects/isolde).

Since then, the extension has matured considerably, and we want to introduce you to the changes.

Our biggest change since the first post is that the target and the fault case are now selected at runtime instead of at compile time.
We no longer bake a specific fault case and target instance into the generated model.
Instead, we build the model **once** and select *which instance* and *which fault case* to inject **at simulation runtime** through two dedicated input ports.
Apart from this, the configuration syntax changed, the supported targets grew to cover most RTL signal kinds, and a companion framework (*Verminator*) is now available to drive full fault-injection campaigns using this extension.

As before, the goal is to add DPI *hook-insertion* to Verilator and to keep it aligned with Verilator's existing configuration options, its speed, and long-term
maintainability.
The actual *fault-injection* happens in the user-provided DPI callbacks.
So the extension does the insertion of the *fault-site*, while the DPI does the *fault-injection*.
This also means the extension is not tied to one specific use case, even though we primarily use the term *fault*.
The initial draft pull request for adding this extension to Verilator is
[here](https://github.com/verilator/verilator/pull/6518).
The version described in this post is submitted in a new [pull request](https://github.com/verilator/verilator/pull/...). <!--TODO-->


## Motivation: large-scale fault-injection campaigns

The reason the extension changed shape is **Verminator**, our fault-injection
framework that runs campaigns on top of this feature.
It automates the creation of the configuration file, the C++ simulation wrapper and the fault model to enable large-scale fault campaigns with many different signals and fault behaviors on the same design.

**The key design decision for this framework is that target selection and fault behavior are runtime inputs, not compile-time configuration.**
Since *which* instance to hit (`DPIHOOK_PATH`) and *which* fault case to run (`DPIHOOK_CASE_ID`) are ordinary model inputs, the instrumented model is **built once and reused for the entire campaign**.
Every additional combination of target and fault case then adds a simulation *run*, not a rebuild.
For short runs, rebuilding a non-trivial design for every fault would cost more than the runs themselves.

From a single `verminatorConfig.toml` describing the design, the targets, the fault
types and their time windows, Verminator:

1. generates the `.vlt` (the `insert_dpihook` lines) and a `sim_main.cpp` driver
   containing the per-run table of `(case_id, instance path)` combinations,
2. builds the hook-inserted model **once**,
3. runs the golden reference plus every fault run by re-setting `DPIHOOK_PATH` /
   `DPIHOOK_CASE_ID`, and
4. collects per-run waveforms (FST) and performance data into a staged output
   pipeline (verilate golden → generate → hooked build → simulation) plus a machine-readable
   report.

For a deeper dive into Verminator itself, including an example campaign configuration, see *"[Verminator: Automating Fault-Injection Campaigns with Verilator]({% post_url 2026-07-22-verminator-framework %})"*.
The rest of this post explains the current mechanics of the Verilator extension.

## What changed since the first post
If you used the extension with the first post as reference, these are the changes you need to make to your setup:

| Topic | Previous version (Nov 2025) | Current version |
| --- | --- | --- |
| Config keyword | `insert_hook` | `insert_dpihook` |
| Target flag | `-target "..."` | `-var "..."` |
| Fault-case id | `-id <n>` (compile-time) | removed — selected at runtime via `DPIHOOK_CASE_ID[i]` |
| Enabling the feature | `--insert-hook` CLI flag | automatic — enabled when the `.vlt` contains `insert_dpihook` entries |
| Target selection | one hooked instance baked into the build | one slot per `insert_dpihook` directive, each selected at runtime via `DPIHOOK_PATH` |
| Callback signature | single generic `cb(int id, svBit, int)` | `<ret> cb(int id, svBit trigger, <value>)`, typed like a DPI import of the signal (see below) |
| Evaluation trigger rate | not configurable | `--dpihook-trigger-step <n>` (default 1 = every time step) |
| Campaign tooling | none (future work) | *Verminator*: TOML-driven campaign framework |

The example further below shows these in use, including how the simulation wrapper sets the two runtime inputs.

## How the extension works

The extension inserts DPI call hooks into the generated model automatically.
It does this by transforming Verilator's AST, which is then used for the compilation to C++.
The transformations extend the module that declares a target in place, add variables and helper logic, redirect the reads of the target to the result of the callback, and insert a hook *trigger* that forces the DPI call even when the original model output has not changed.
Because the trigger relies on timing behavior, `--timing` must be used.

For the runtime selection, the pass adds the `DPIHOOK_PATH` and `DPIHOOK_CASE_ID` input ports and inserts path-filter logic along the instance hierarchy.
The testbench fills one *slot* per `insert_dpihook` directive with a path and a case id.
The hooks compare their own hierarchical position against `DPIHOOK_PATH` and only fire on the selected instance, while `DPIHOOK_CASE_ID` selects the behavior inside the callback.
A signal hook that is inserted but not bound skips the DPI call.
The actual usage of these ports is explained further down in the *Running* section.

When a signal is successfully hooked, it behaves like a **faulted net**. This means that every read of it in its module, through hierarchical references and, for interface signals, in every module accessing it sees the modified value.
Therefore, the effect propagates outwards through ports.
If the targeted signal is an output port, the drivers write an internal pre-hook variable and the port carries the hook result. This way, a register keeps its own state while every reader, including its own next-state logic, sees the fault.

The fault effect can be followed in the traces.
Note that the necessary helper variables are kept out of the traces, so the signals in the traces represent the original design.
Since the modified value is provided directly to the signals reading the target, the fault shows up on their traces, not on the trace of the targeted signal itself.
The exceptions here are output ports: they carry the hook result, so their own trace shows the fault.

## Use-case example

We reuse the small counter design from the first post. The counter is 64 bits wide:

```verilog
module counter (
    input logic clk, reset, en,
    output logic [63:0] count
);
    logic [63:0] count_reg;

    always @(posedge clk or posedge reset) begin
        if (reset)
            count_reg <= 64'd0;
        else if (en)
            count_reg <= count_reg + 1;
    end

    assign count = count_reg;
endmodule
```

A testbench top instantiates five instances of a `controller` module, each wrapping one counter, so we
can demonstrate instance hierarchies and per-instance targeting:

```verilog
module tb_counter (
    input logic clk, reset, enable,
    output logic [63:0] counter1, counter2, counter3, counter4, counter5
);
    controller uut (clk, reset, enable, counter1);
    controller uut1(clk, reset, enable, counter2);
    controller uut2(clk, reset, enable, counter3);
    controller uut3(clk, reset, enable, counter4);
    controller uut4(clk, reset, enable, counter5);
endmodule

module controller(
    input logic clk, reset, enable,
    output logic [63:0] counter_out
);
    counter cut(.clk(clk), .reset(reset), .en(enable), .count(counter_out));
endmodule
```

### Configuration

The feature extends Verilator's configuration file (typically `.vlt`) with a hook-insertion directive. This directive looks like this:

```
insert_dpihook -callback "<c-function name>" -var "<top.instance.….var>"
```

- **`-callback`** — name of the C/C++ callback that implements the fault model.
- **`-var`** — the target signal path. It starts with the top module,
  followed by the *instance* names on the path (intermediate module names are
  omitted), ending with the variable. For `count_reg` inside `cut`, reached through
  `uut1` in `tb_counter`, this is `tb_counter.uut1.cut.count_reg`.

The configuration holds neither a bit selection nor a fault-case id. The hook always
hands the whole signal to the callback, which decides which bits a fault touches, and
the fault-case id is a runtime input (`DPIHOOK_CASE_ID`, see below) selecting the fault model in the callback.

Multiple targets are configured by adding multiple lines. A `.vlt` hooking three different signals of the counter, each with its own callback, would look like this:

```
`verilator_config

insert_dpihook -callback "fault_count_reg" -var "tb_counter.uut1.cut.count_reg"
insert_dpihook -callback "fault_count"     -var "tb_counter.uut2.cut.count"
insert_dpihook -callback "fault_en"        -var "tb_counter.uut3.cut.en"
insert_dpihook -callback "fault_count_reg" -var "tb_counter.uut4.cut.count_reg"
```

The hook is inserted into the module that declares the signal, so **every instance** of
`counter` carries all three hooks, and the path in the `.vlt` only has to name one of
them. Which instance is actually faulted is decided at runtime (see below). The fourth
line names `count_reg` again, through `uut4`: the hook already exists, but every directive
adds one slot, so both instances can be faulted in the same run. Naming the same signal
again is fine as long as the callback is the same. A second callback for one signal is
rejected.

The July version of this example also hooked the counter's `reset`. Clocks and
asynchronous resets are now rejected as targets, since a fault on them would only re-time the
design instead of modeling a realistic timing glitch, which a cycle-based simulator like Verilator cannot
reproduce.

### The C/C++ callbacks

The callback is still a plain `extern "C"` function. Its first two parameters are
always the fault-case id and the DPI trigger, followed by the value of the signal, and
it returns the value every read of the signal sees. The types are exactly those of a DPI
import of the signal, so they follow its width and kind:

| Signal | Return type | Value parameter |
| --- | --- | --- |
| 1-bit `logic` | `svBit` | `svLogic` |
| `logic` vector, 2–64 bits | `char` / `short` / `int` / `long long` (the smallest that fits) | `const svLogicVecVal*` |
| `bit` vector, 2–64 bits | as above | `const svBitVecVal*` |
| `byte` / `shortint` / `int` / `longint` | the same C type | passed by value |
| wider than 64 bits | `void`; the result goes to a leading `svLogicVecVal*` / `svBitVecVal*` argument | `const svLogicVecVal*` / `const svBitVecVal*` |

Packed structs, unions, packed arrays and enums count as a vector of their width (an
enum as its base type). Signals that share a callback must therefore have the same width
and kind. The safest way to get the types right is to include the generated
`V<top>__Dpi.h` in the callback file, since a definition that does not match then fails to
compile instead of silently misreading its arguments. The callbacks for the three hooks
above would therefore look like this:

```cpp
#include "Vtb_counter__Dpi.h"  // generated prototypes: a signature mismatch fails to compile
#include <verilated.h>
#include <cstdint>

// A 4-state vector arrives as 32-bit svLogicVecVal words; aval holds the value bits.
static uint64_t value64(const svLogicVecVal* x) {
    return static_cast<uint64_t>(static_cast<uint32_t>(x[0].aval))
           | static_cast<uint64_t>(static_cast<uint32_t>(x[1].aval)) << 32;
}

// count_reg (logic [63:0]), present in every counter instance; the case id picks the effect.
extern "C" long long fault_count_reg(int id, svBit trigger, const svLogicVecVal* x) {
    (void)trigger;
    const uint64_t v = value64(x);
    const bool window = VL_TIME_Q() >= 150 && VL_TIME_Q() < 200;
    switch (id) {
    case 1: return window ? v ^ 0x1ULL : v;  // bit 0 flipped
    case 2: return window ? v | 0xFULL : v;  // bits 3:0 stuck at 1
    default: return v;
    }
}

// count (output port, logic [63:0]): stuck at 0 from t = 120 on.
extern "C" long long fault_count(int id, svBit trigger, const svLogicVecVal* x) {
    (void)trigger;
    return (id == 1 && VL_TIME_Q() >= 120) ? 0 : value64(x);
}

// en (input port, 1-bit logic): stuck at 0 inside the window.
extern "C" svBit fault_en(int id, svBit trigger, svLogic x) {
    (void)trigger;
    return (id == 1 && VL_TIME_Q() >= 150 && VL_TIME_Q() < 200) ? 0 : x;
}
```

The `id` argument is fed from the runtime `DPIHOOK_CASE_ID` input, so the `switch`
still selects the behavior, but which case runs is now decided per simulation run
rather than at build time. `VL_TIME_Q()` from `verilated.h` remains available for
time-dependent faults, and a bit selection can be implemented by a plain mask in the callback (`^` flips
bits, `|` forces them to 1, `& ~` forces them to 0).

### Building

Because hook-insertion is enabled automatically when the `.vlt` contains
`insert_dpihook` entries, there is no separate `--insert-hook` flag anymore. A build
looks like a normal Verilator invocation with `--timing`, the `.vlt`, and the
callback source added:

```sh
verilator --cc --exe --build --timing --trace-fst \
  --top-module tb_counter \
  tb_counter.v counter.v \
  instrumentation.vlt \
  sim_main.cpp fault_injection.cpp
```

### Running: selecting target and fault case at runtime

As mentioned above, the hook-inserted C++ model now exposes two extra inputs on the DUT, both indexed by target *slot*, one per `insert_dpihook` directive:

- **`DPIHOOK_PATH[i][j]`** — a string array that names the instance path each of the hooks should target for this run. Slot `i` selects the target, `j` indexes the hierarchical path parts.
- **`DPIHOOK_CASE_ID[i]`** — one 32-bit fault case per slot, passed to the callback as `id`. The id in slot `i` travels with the path in slot `i`, so every target carries its own case even when several targets share one callback.

We decided to read the binding only once, at time zero, because this improves the performance of the hooked model.
Therefore, both inputs must be written **before the first `eval()`**.
If a user writes the binding only later, no target is hooked, and the model reports this mistake with a warning at the end of the simulation.
Additionally, the model warns if a slot's path matches no hooked signal.
Not every slot has to be used: four directives provide four slots, but a run may bind fewer.
In short, a fault is only applied when a slot's path matches a hooked signal and its case id selects a fault in the callback.

Our example run binds all four slots, one per directive:

```cpp
// Bind before the first eval(): one slot per target, path parts plus a case id.
const std::vector<std::pair<int, std::vector<std::string>>> slots = {
    {1, {"uut1", "cut", "count_reg"}},  // flip bit 0 of count_reg in uut1
    {1, {"uut2", "cut", "count"}},      // count of uut2 stuck at 0
    {1, {"uut3", "cut", "en"}},         // enable of uut3 stuck at 0
    {2, {"uut4", "cut", "count_reg"}},  // bits 3:0 of count_reg in uut4 stuck at 1
};
for (size_t i = 0; i < slots.size(); ++i) {
    dut->DPIHOOK_CASE_ID[i] = slots[i].first;
    for (size_t j = 0; j < slots[i].second.size(); ++j)
        dut->DPIHOOK_PATH[i][j] = slots[i].second[j];
}

dut->clk = 0;
while (ctx->time() < 300 && !ctx->gotFinish()) {
    dut->clk = !dut->clk;
    dut->reset = ctx->time() < 50;
    dut->enable = ctx->time() >= 100;
    dut->eval();
    if (!dut->eventsPending()) break;
    ctx->time(dut->nextTimeSlot());  // the hook trigger schedules a slot every time step
}
```

The evaluation trigger schedules an event in every time step, so the driver steps from
one scheduled time slot to the next with `ctx->time(dut->nextTimeSlot())`. Jumping over a
slot aborts the simulation with "Missed a time slot?".

Printing the five counter outputs at the end, once without any binding and once with the
binding above, gives:

```
golden : 100 100 100 100 100
faulted: 100 75 0 75 466
```

- `counter1` (`uut`) is unchanged: its counter carries the same hooks, but nothing is
  bound to it, so it is not faulted.
- `counter2` (`uut1`): when the window opens, `count_reg` holds 25. The hook flips bit 0,
  so every read, including the register's own `count_reg + 1`, sees 24, and the register
  stays at 25 for the whole window.
- `counter3` (`uut2`): the output port `count` is stuck at 0 from t = 120 on.
- `counter4` (`uut3`): the enable is held at 0 for 25 clock cycles.
- `counter5` (`uut4`): every read sees bits 3:0 set, so the register jumps ahead during
  the window.

With the runtime approach, a whole campaign (a golden run plus N fault runs) only re-instantiates the model and sets a new binding for each run, without recompiling.

## Supported targets

The set of signals a hook can target covers what an RTL design contains:

- packed types, including signals wider than 64 bits
- unpacked aggregates (whole arrays and structs) and their leaves addressed by path
- single elements of unpacked arrays (`mem[2]`)
- signals in generate scopes and in instances inside generate blocks
- interface signals, including multiply-instantiated and arrayed interfaces
- output ports, independent of how they are driven
- signals of the top module

All of them are covered by regression tests that come with the pull request.

## What carrying hooks costs

To see what the hook-insertion itself costs, we measured hooks that are inserted but never bound on four RISC-V cores, as median simulation throughput relative to each core's unhooked build.
The 10 and 100 hooks are the first signals Verminator discovers in each core; the single hook is a 1-bit input:

| Core | 1 hook | 10 hooks | 100 hooks |
| --- | --- | --- | --- |
| PicoRV32 | 0.95x | 0.92x | 0.86x |
| SERV | 0.27x | 0.25x | 0.11x |
| Ibex | 0.34x | 0.25x | 0.12x |
| CV32E40X | 0.52x | 0.38x | 0.16x |

Every measured build runs the cores' self-checking crc32 and AES programs with the same output and cycle count as the uninstrumented one.
The cost depends far more on the design and on whether the hooked signals sit in its hot paths than on the number of hooks.

## Current limitations

The extension is functional and considerably more capable than at the time of the first post, but some limitations remain:

- A target is always a signal. Naming a module instance to hook all of its signals is not supported.
- Clocks and asynchronous resets are rejected, as is a signal read in an event control without an edge (`always @(a or b)`). This also applies when another module reads them through a hierarchical reference or an interface port.
- A clock or reset that reaches a sensitivity list only through another signal, i.e. a port connection or an assignment (e.g. `top.rst` wired to the asynchronous reset of a submodule), is not detected and therefore accepted. A fault on it then behaves like a fault on that net.
- A signal carries at most one hook configuration, and signals sharing a callback must have the same width and kind.
- The binding is read once at time zero, so a slot cannot be rebound while the model runs.
- Not supported as targets:
  - arrayed module instances (arrayed interfaces work)
  - an unpacked aggregate or a member path inside an interface
  - a member path into a variable declared in a generate block
  - a member of an unpacked-array element (`arr[1].b`)
  - an element of a multi-dimensional unpacked array (`m[1][2]`)
  - a member of a packed union or an element of a packed array
  - non-hardware types such as associative and dynamic arrays, queues,
  class handles, `string`, `event`, `real` and `shortreal`.

We plan to address these in future work.

## Outlook

With the runtime-selection foundation and the Verminator framework in place, our primary focus will now shift to scaling and analysis.
This includes running large fault campaigns efficiently, comparing faulted runs against the golden reference, and turning the collected traces and performance data into insight about how injected faults propagate.
The aim remains to help hardware developers build more stable and secure systems.
