---
layout: post
title: "Fault-Injection with Verilator: Update on the DPI-Hook Extension"
author: Jonathan Schröter
date: 2026-07-22
---
This post updates our earlier writeup on extending Verilator with native
fault-injection support, in which we presented the initial version of a fault injection extension in Verilator. This extension is part of our ongoing efforts to improve tooling for hardware verification and software–hardware co-design.
For further background on the initial structure of the extension and motivation, see “[Update on Fault-Injection with Verilator](https://aemy.cs.hm.edu/2025/11/24/verilator-extension.html)".

Since then the extension matured considerably: the configuration syntax changed,
the compile-time approach was replaced by a **runtime-selectable** hook mechanism,
bit-level targeting was added, and a companion framework (*Verminator*) now drives
full fault-injection campaigns on top of the feature.

The biggest change since the last post: we no longer bake a specific fault case and a specific
target instance into the generated model. Instead we build the model **once** and
select *which instance* and *which fault case* to inject **at simulation runtime**
through two dedicated input ports. This is what makes large-scale campaigns
practical.

As before, the goal is to add DPI *hook-insertion* to Verilator — an interface that
external C/C++ code can use to observe or modify signals — and to keep it aligned
with Verilator's existing configuration options, its speed, and long-term
maintainability. The actual *fault-injection* happens in the user-provided DPI
callbacks. For background and motivation, see *"Fault-injection support with the
Verilator simulation tool"* in the [Isolde project overview](https://aemy.cs.hm.edu/projects/isolde).
The initial draft pull request for adding this extension to Verilator is
[here](https://github.com/verilator/verilator/pull/6518).

## Motivation: large-scale fault-injection campaigns

The reason the extension changed shape is **Verminator**, our fault-injection
framework that runs campaigns on top of this feature: the same design instrumented
on many different signals, each with many fault behaviors and time windows.

**The key design decision is that target selection and fault behavior are runtime
inputs, not compile-time configuration.** Because *which* instance to hit
(`DPIHOOK_PATH`) and *which* fault case to run (`DPIHOOK_CASE_ID`) are ordinary model
inputs, the instrumented model is **built once and reused for the entire campaign**.
Adding a target or a fault type then adds simulation *runs*, not rebuilds — and for a
non-trivial design the one-time Verilator/C++ build dominates the wall-clock cost, so
this is the difference between a campaign that recompiles per fault and one that does
not.

Verminator automates the whole loop. From a single `verminatorConfig.toml`
describing the design, the targets, the fault types and their time windows, it:

1. generates the `.vlt` (the `insert_dpihook` lines) and a `sim_main.cpp` driver
   containing the per-run table of `(case_id, instance path)` combinations,
2. builds the hook-inserted model **once**,
3. runs the golden reference plus every fault run by re-setting `DPIHOOK_PATH` /
   `DPIHOOK_CASE_ID`, and
4. collects per-run waveforms (FST) and performance data into a staged output
   pipeline (config → generate → hooked build → simulation) plus a machine-readable
   report.

An excerpt of a campaign config:

```toml
[[simulation.fault_injection.targets]]
name        = "count_reg_uut"
path        = "tb_counter.uut.cut.count_reg"
sv_type     = "logic"
width       = 64
fault_types = ["stuck_at_0", "stuck_at_1", "bit_flip"]

  [[simulation.fault_injection.targets.time_windows]]
  begin = 100
  end   = 250
```

The rest of this post explains the mechanics that make this possible: the
configuration syntax, the DPI callbacks, and the runtime interface. For a deeper dive into Verminator itself, see *"[Verminator: Automating Fault-Injection Campaigns with Verilator](https://aemy.cs.hm.edu/2026/07/03/verminator-framework.html)"*. Here the presented toml is also put into an example context and further information is provided.

## What changed since the first post
If you used the extension with the previous blog post as reference these are changes you need to make to your setup:

**Changes to the configuration:**

| Topic | Previous version (Nov 2025) | Current version |
| --- | --- | --- |
| Config keyword | `insert_hook` | `insert_dpihook` |
| Target flag | `-target "..."` | `-var "..."` |
| Fault-case id | `-id <n>` (compile-time) | removed — selected at runtime via `DPIHOOK_CASE_ID[i]` |
| Bit selection | whole signal only | `-bit-pos <n>` (single bit) or `-bit-range "<l>:<r>"` (bit range) |
| Enabling the feature | `--insert-hook` CLI flag | automatic — enabled when the `.vlt` contains `insert_dpihook` entries |
| Target selection | one hooked instance baked into the build | up to `DPIHOOK_MAX_TARGETS` (currently 4) targets, each selected at runtime via `DPIHOOK_PATH` |
| Callback signature | single generic `faultInjection(int id, svBit, int)` | type- and selection-specific signatures (see below) |
| Campaign tooling | none (future work) | *Verminator*: TOML-driven campaign framework |

`--timing` is still required (the hook trigger relies on timing behavior), and the
DPI interface is still enabled automatically for hook-inserted builds.

**Changes to the simulation wrapper:**
This is the core change. The hook-inserted model exposes two extra inputs on the DUT,
both indexed by target *slot* (`0 .. DPIHOOK_MAX_TARGETS-1`):

- **`DPIHOOK_PATH[i][j]`** — a string array that names the instance path each of the
  (up to `DPIHOOK_MAX_TARGETS`) hooks should target for this run. Slot `i` selects
  the target, `j` indexes the hierarchical path parts.
- **`DPIHOOK_CASE_ID[i]`** — one 32-bit fault case per slot, passed to the callback
  as `id`. The id in slot `i` travels with the path in slot `i`, so every target
  carries its own case even when several targets share one callback.

A fault will only be applied if these two inputs get the data corresponding to the previously defined configuration.

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

A testbench top instantiates several instances called controller, each wrapping one counter, so we
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

The feature still extends Verilator's configuration file (typically `.vlt`), but the
syntax changed. A hook-insertion entry now uses the `insert_dpihook` keyword and the
`-var` flag for the target path, and optionally selects a single bit or a bit range:

```
insert_dpihook -callback "<c-function name>" -var "<top.instance.….var>"
insert_dpihook -callback "<c-function name>" -var "<top.instance.….var>" -bit-pos <n>
insert_dpihook -callback "<c-function name>" -var "<top.instance.….var>" -bit-range "<left>:<right>"
```

- **`-callback`** — name of the C/C++ callback that implements the fault model.
- **`-var`** — the target signal path. As before, it starts with the top module,
  followed by the *instance* names on the path (intermediate module names are
  omitted), ending with the variable. For `count_reg` inside `cut`, reached through
  `uut1` in `tb_counter`, this is `tb_counter.uut1.cut.count_reg`.
- **`-bit-pos` / `-bit-range`** — optional. Restrict the hook to a single bit or a
  contiguous bit range of the target. Omit both to hook the whole signal.

Note there is **no `-id` flag anymore**. The fault-case selector that used to be
fixed at compile time is now a runtime input (`DPIHOOK_CASE_ID`, see below), so a
single build can exercise every case.

Multiple targets are configured by adding multiple lines. A `.vlt` exercising four
different targets and callbacks at once:

```
`verilator_config

insert_dpihook -callback "reg_injection_bitPos"        -var "tb_counter.uut1.cut.count_reg" -bit-pos 0
insert_dpihook -callback "logicwidth_count_reg_timing" -var "tb_counter.uut2.cut.count"
insert_dpihook -callback "logic_clk_timing"            -var "tb_counter.uut3.cut.reset"
insert_dpihook -callback "reg_injection_bitRange"      -var "tb_counter.uut4.cut.count_reg" -bit-range "3:0"
```

### The C/C++ callbacks

The callback is still a plain `extern "C"` function, and its first two parameters are
always the fault-case id and the DPI trigger. What changed is that the remaining
parameters now depend on the **type** of the target and on the **bit selection**, so
the value is passed back and forth without loss. The relevant shapes are:

```cpp
#include <svdpi.h>
#include <verilated.h>

// Whole multi-bit signal (<= 64 bits)
extern "C" uint64_t logicwidth_count_reg_timing(int id, svBit trigger, const uint64_t* x) {
    switch (id) {
    case 1:  // stuck-at-1 within a time window
        if (VL_TIME_Q() >= 10 && VL_TIME_Q() <= 50) return 1;
        return *x;
    default:
        return *x;
    }
}

// Single bit (-bit-pos)
extern "C" uint64_t reg_injection_bitPos(uint8_t id, svBit trigger,
                                         int bitIndex, const svBitVecVal* x) {
    switch (id) {
    case 0: return 0;                              // stuck-at-0
    case 1: return *x | (1ULL << bitIndex);        // stuck-at-1 on the selected bit
    case 2: return ~(*x);                          // bit flip
    default: return *x;
    }
}

// Bit range (-bit-range "l:r")
extern "C" uint64_t reg_injection_bitRange(uint8_t id, svBit trigger,
                                          int left, int right, const svBitVecVal* x) {
    switch (id) {
    case 0: return 0;
    case 1: {
        uint64_t mask = ((1ULL << (left - right + 1)) - 1) << right;
        return *x | mask;
    }
    default: return *x;
    }
}

// 1-bit logic (e.g. a reset or clock line)
extern "C" int logic_clk_timing(int id, svBit trigger, svBit x) {
    switch (id) {
    case 1: return (VL_TIME_Q() >= 50 && VL_TIME_Q() <= 70) ? 1 : x;
    default: return x;
    }
}
```

The `id` argument is fed from the runtime `DPIHOOK_CASE_ID` input, so the `switch`
still selects the behavior — but which case runs is now decided per simulation run
rather than at build time. `VL_TIME_Q()` from `verilated.h` remains available for
time-dependent faults.

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
As mentioned above this is the core change, which added two extra inputs available in the simulation wrapper.

A simulation driver sets them before stepping the model. A single run that injects a
stuck-at-1 into `uut.cut.count_reg` (case id `1`) uses slot `0` for both inputs:

```cpp
dut->DPIHOOK_CASE_ID[0] = 1;              // fault case for slot 0
dut->DPIHOOK_PATH[0][0] = "uut";          // instance path parts of target 0
dut->DPIHOOK_PATH[0][1] = "cut";
dut->DPIHOOK_PATH[0][2] = "count_reg";
// ... then drive clock/reset/enable and eval() as usual
```

Because target and case are runtime inputs, one build can run a whole campaign
(a golden run plus N fault runs) just by re-instantiating the model and re-setting
these values — no recompilation per fault. This is exactly what Verminator automates
(see the Motivation section).

## How the extension works

The extension inserts DPI call hooks into the generated model automatically. It does
this by transforming Verilator's AST, which is then used for the compilation to C++. The transformations
include duplicating modules when needed (so the tool can switch between the original
and the hook-inserted version), adding variables and helper logic, creating the extra
assignments that route a signal through the callback, and inserting a hook *trigger*
that forces the DPI call even when the original model output has not changed. Because
the trigger relies on timing behavior, `--timing` must be used.

What is new compared to the first post is the **runtime selection layer**. Instead of
committing to one instance and one fault case at build time, the pass adds the
`DPIHOOK_PATH` and `DPIHOOK_CASE_ID` input ports and threads path-filter logic down
the instance hierarchy. At runtime the hooks compare their own hierarchical position
against `DPIHOOK_PATH` and only fire on the selected instance, while `DPIHOOK_CASE_ID`
selects the behavior inside the callback. This keeps a single compiled model reusable
across an entire campaign.

### Why use the DPI?

The reasoning is unchanged from the first post:

- DPI keeps Verilator's optimizations intact, preserving fast simulation.
- DPI calls occur late in the evaluation order, reducing the risk of masked or
  overwritten values.
- DPI is general-purpose and reusable beyond fault injection.

## Current limitations

The extension is functional and considerably more capable than at the first post, but
some limitations remain:

- Hooks still cannot be inserted directly into the top module of a design; the
  top-module checker now reports this cleanly instead of failing silently.
- The target must resolve to a *basic* scalar/packed signal: either an
  implicitly-typed net/variable (a `wire`/`reg`/`logic` declared without an explicit
  data type) or one of Verilator's built-in packed *literal* types (`bit`, `logic`,
  `byte`, `int`, `integer`, `shortint`, `longint`), and no wider than 64 bits.
  Compound types — packed/unpacked arrays, structs, unions, `string`, `event` — are
  rejected with a clear error.
- The number of simultaneous targets is currently bounded by `DPIHOOK_MAX_TARGETS`
  (4 at the time of writing).

We plan to address these in future work. Despite them, the approach provides a
flexible, campaign-friendly fault-injection capability without tying Verilator to one
specific use case.

## Outlook

With the runtime-selection foundation and the Verminator framework in place, our focus
shifts to scaling and analysis: running large fault campaigns efficiently, comparing
faulted runs against the golden reference, and turning the collected traces and
performance data into insight about how injected faults propagate. The aim remains to
help hardware developers build more stable and secure systems.
