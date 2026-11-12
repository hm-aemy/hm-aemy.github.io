---
layout: post
title: "Verminator: Automating Fault-Injection Campaigns with Verilator"
author: Jonathan Schröter
date: 2026-07-22
updated: 2026-11-12
---
*Update (November 2026): This post has been revised for the current version of Verminator, which was updated for the current version of the DPI-hook extension.*

In this post, we present Verminator, our fault-injection framework that uses the Verilator DPI-hook extension. The DPI-hook extension was introduced in a previous post, [Update on Fault-Injection with Verilator]({% post_url 2025-11-21-verilator-extension %}). In that post, we described the first version of our Verilator extension that adds native _DPI-hook-insertion_: the inserted DPI-hooks let external C/C++ code observe and modify signals during a simulation, which in turn enables fault-injection without manual HDL modifications.

The concept from that initial extension post was updated during further development and analysis. The updates are explained in our follow-up post [Fault-Injection with Verilator: Update on the DPI-Hook Extension]({% post_url 2026-07-22-verilator-extension-update %}).

The developed extension answers the question of _how_ a single fault reaches a single signal.
It does not, by itself, answer the questions that come up the moment you want to study a design seriously: to which signals do I inject a fault, with which fault models, over which time windows, and how do I run hundreds of such experiments without manually writing configuration files, simulation wrappers and fault models?

This is the gap the _Verminator_ framework tries to fill.
In short, the extension is the mechanism and Verminator orchestrates it.
You describe an entire fault-injection (FI) **campaign** in a single configuration file. Then Verminator verilates your design, discovers its signal tree, generates all the hook-insertion configurations, the fault model and the simulation wrapper the extension needs, builds **one** instrumented simulation binary, and runs every fault scenario in parallel, collecting waveform and performance data for each run.

This division of labor is important to keep in mind:

> Verminator orchestrates the campaign. The actual fault injection at runtime is still performed by the DPI-hooks that the Verilator DPI-hook extension inserts. Verminator generates the extension's configuration and the C++ fault model, builds the binary, and drives the runs.

Below we walk through the framework the same way we did in the first extension post: first a concrete use-case example, then an explanation of how it works, followed by the core design ideas and the current limitations.
The project itself can be found [here](https://github.com/hm-aemy/verminator).

## Use-case example

Let's reuse a familiar starting point, the counter design, but this time we are not interested in a single, hand-written fault. We want to ask a broader question: _what happens to this design under a range of faults on a few interesting registers?_

With Verminator, you do not touch the RTL, the `.vlt` file, or any C++ by hand. You write one `verminatorConfig.toml` that describes the campaign:

```toml
[input.hw]
top_module   = "tb_counter"
design_files = ["rtl/counter.sv", "tb/tb_counter.sv"]

[simulation]
tb_mode        = "cpp_driven"      # auto | cpp_driven | sv_driven
driver_file    = "tb/driver.cpp"   # required for cpp_driven
timeout_cycles = 1000
seed           = 42

[simulation.waveform]
enabled = true
format  = "fst"                    # fst | vcd

[simulation.fault_injection]
depth = "custom"

# --- A single-signal target ---
[[simulation.fault_injection.targets]]
name         = "counter_register"
path         = "tb_counter.uut.cut.count_reg"
sv_type      = "logic"
width        = 64
fault_types  = ["bit_flip", "stuck_at_0"]
time_windows = [{ begin = 100, end = 250 }]   # optional; omit = whole simulation

# --- A multi-signal combination ---
[[simulation.fault_injection.combinations]]
name = "reg_and_count"
signals = [
    # count_reg is also a target above, so width/sv_type are inherited.
    { path = "tb_counter.uut.cut.count_reg", fault_type = "bit_flip" },
    # count is not a target, so it declares its own width/sv_type.
    { path = "tb_counter.uut1.cut.count",    fault_type = "stuck_at_0", width = 64, sv_type = "logic" },
]

[output]
results_dir = "results/"
```

Two concepts in this file are worth calling out, because they define what Verminator will actually run.

A **target** is a single signal you want to fault. Each target expands into one run for every combination of `(fault_type × time_window)`. The `counter_register` target above therefore produces two runs on its own: `bit_flip` in the window `[100, 250]`, and `stuck_at_0` in the same window, each faulting only that one register.

A **combination** faults several signals **together in one run**, each signal with its own fault type (and, if you want, its own timing).
The `reg_and_count` combination above is a single run in which `count_reg` is bit-flipped while `count` is held stuck-at-0 at the same time.
Combinations are how you study the effects of interacting faults rather than of isolated ones.

Before committing to a run, it helps to know which signals are eligible to be faulted.
Verminator can verilate the design and list its injectable signals without simulating anything:

```sh
verminator run verminatorConfig.toml --list-signals
```

When everything is defined, you can preview the full campaign matrix, showing every run that _would_ be executed, without building or running anything.
This way, you can check the planned campaign before running it:

```sh
verminator run verminatorConfig.toml --dry-run
```

Once the plan looks right, you launch the campaign. The `--jobs` flag controls how many fault runs execute in parallel:

```sh
verminator run verminatorConfig.toml --jobs 8
```

Verminator verilates the golden design once, generates the instrumentation, builds a single binary, and then fans the fault runs out across your cores. When it finishes, the results are laid out in a structured directory, with one sub-directory per run, each with its own waveform and timing data, plus a campaign-wide performance summary and a machine-readable description of the whole fault matrix:

```
results/
├── 01_golden/build/          # netlist JSON (signal discovery, no simulation)
├── 02_generate/              # generated fault_config.vlt + faultModel.cpp + sim_main.cpp
├── 03_hooked/build/Vtb_counter   # the single instrumented binary
└── 04_simulation/
    ├── golden/               # golden (fault-free) reference trace + perf.json
    ├── run_0000/  run_0001/  # one directory per fault run
    ├── perf_summary.csv      # golden vs. average-FI plus per-run detail
    └── campaign.json         # the full fault matrix metadata
```

That is the whole workflow: one config file in, a directory of per-fault results out.

The rest of this post explains what happens between those two points.

## How the framework works

Verminator runs a fixed four-step pipeline. Each step produces artifacts the next one consumes, and the directory layout above mirrors these steps exactly.
The steps are the following:

```
1. Verilate golden   ->  discover the design's signal tree (no simulation)
2. Generate          ->  fault_config.vlt, faultModel.cpp, sim_main.cpp
3. Build hooked      ->  one instrumented V<top> binary
4. Run campaign      ->  golden reference run, then all fault runs in parallel
```

**Step 1 — Golden verilation.** Verminator first runs Verilator in a JSON-only mode to obtain the design's netlist as an AST, _without_ compiling or simulating anything. From this, it extracts the full hierarchical signal tree: every injectable signal with its instance path, data type and bit width, down to leaf level (struct members, unpacked-array elements, signals and instances inside generate blocks, interface signals and signals of the top module), each with the runtime path used to bind it. Clocks and asynchronous resets are left out, since the extension rejects them as targets. This is what powers `--list-signals`, and it is also what lets you fault a deeply nested signal by its path (for example `tb_counter.uut1.cut.count`) without knowing the internal module structure in advance.

**Step 2 — Generation.** This is where Verminator translates your high-level campaign into the low-level artifacts the extension expects. Three files are produced:

- `fault_config.vlt`: The hook configurations that tell the DPI extension _which_ signals to insert hooks on. These are exactly the `insert_dpihook` directives described in the extension post, but written out automatically, one per unique signal path, instead of by hand.
- `faultModel.cpp`: The C++ fault model. Verminator generates the callback functions that implement bit-flip, stuck-at-0 and stuck-at-1 behavior, restricted to the configured bits and gated by the time windows from your config. You do not write this file; it is derived entirely from the configured campaign.
- `sim_main.cpp`: The simulation wrapper. It contains a compact static table of all runs and dispatches on a `--run N` argument, so the _same_ binary can execute any run in the campaign.

**Step 3 — Hooked build.** Verminator invokes Verilator once, with the fault-injection extension enabled, to compile the design together with the generated `.vlt` and `.cpp` files into a single instrumented `V<top>` binary.

**Step 4 — Campaign execution.** Verminator first runs the binary in golden mode to capture a fault-free reference, then launches the fault runs in parallel. Each run is a separate process invoking the shared binary with its own `--run` index. Every run writes its waveform and a small timing record into its own directory. Finally, the per-run timings are aggregated into `perf_summary.csv`.

### Two concepts that make it scale: effects and runs

The heart of Verminator is a deliberate separation between _what a fault does_ and _which faults are applied together_.

A **fault effect** is a unique `(signal path, fault_type, time_windows, bit selection)` quadruple. Each effect becomes exactly one `switch`-case in the generated `faultModel.cpp` and receives a globally unique id. Effects are **deduplicated**: if the same signal is faulted the same way both as a standalone target and as part of a combination, both reuse the same case id and the same generated code. This way, the code that _computes a single signal's faulted value_ is written once.

A **fault run** is one simulation. It carries a list of **hooks**, where each hook binds a signal path to an effect's id. A single-signal target becomes a run with one hook, while a combination becomes a run with several hooks that fire simultaneously. The run is _where_ and _how many_ signals get faulted together, and the effect is _what_ each fault does.

Deduplication happens at the level of this generated code, **not** at the level of runs. A standalone target and a combination that share a signal are still two separate runs, each with its own process, waveform, and results. So a fault that is harmless in isolation but harmful when combined with another is fully captured.

This split is what lets a campaign grow cheaply. Adding a combination that reuses signals you already fault elsewhere adds a run, but no new fault-model code. The generated C++ stays small, so compile time stays flat, while the number of runs can grow freely.

### The shared contract with the extension

Because Verminator generates _both_ the `.vlt` hook directives and the `faultModel.cpp` callbacks, it is responsible for keeping them in agreement on a single C ABI. The extension declares each callback like a DPI import of the hooked signal, so its types follow the signal's width and kind. Verminator names the callbacks accordingly, e.g. `fault_<w>` for 4-state vectors, `fault_<w>_bit` for 2-state vectors and `fault_int`, `fault_byte`, … for integer atoms.
An overview of the signals and their types is presented here:

| Signal | Return type | Value parameter |
|---|---|---|
| `logic`/`reg`/`wire`, width 1 | `svBit` | `svLogic` |
| `logic`/`reg`/`wire`, width 2–64 | `char` / `short` / `int` / `long long` | `const svLogicVecVal*` |
| `bit`, width 2–64 | `char` / `short` / `int` / `long long` | `const svBitVecVal*` |
| `byte` / `shortint` / `int` / `longint` | same C type | passed by value |
| any, width > 64 | `void`, result in a leading `result` argument | `const svLogicVecVal*` / `const svBitVecVal*` |

The generated `faultModel.cpp` includes the `V<top>__Dpi.h` header that the extension generates, so a callback whose signature does not match fails to compile instead of silently misreading its arguments.

The bit selection changed with the newer version of the extension.
It is no longer part of the `.vlt`. Instead, the whole signal is handed to the callback, and each fault case applies its own mask (flip `^ mask`, stuck-at-0 `& ~mask`, stuck-at-1 `| mask`). One callback therefore serves whole-signal, single-bit and bit-range faults on a signal, and one signal can carry several selections in one campaign, for example a whole-signal flip in one run and a single-bit stuck-at in another. In the config, a bit selection is still just `bit = N` or `bit_range = [hi, lo]` on a target or a combination signal.

### Random campaigns and fault types

Instead of listing targets and combinations by hand, Verminator can also draw them at random from the signals the golden verilation discovered:

```sh
verminator run verminatorConfig.toml --list-random-signals   # what can be drawn
verminator run verminatorConfig.toml --random-signals 10     # 10 random single-signal runs
verminator run verminatorConfig.toml --random-combs 4        # 4 random multi-signal combinations
verminator run verminatorConfig.toml --random-mix 6          # half signals, half combinations
verminator run verminatorConfig.toml --fill-signals 20       # keep the config's targets, add random ones up to 20
```

Setting `depth = "random"` makes the config itself random, without any flag: `kind` (`signals`, `combs` or `mix`) and `count` in `[simulation.fault_injection.random]` decide what is drawn. The same section tunes the generator (internal signals only or ports as well, fault types, window lengths, combination sizes).

The fault type can be left to chance as well, also in a hand-written config: `fault_types = ["random"]` on a target, or `fault_type = "random"` on a combination signal, is resolved to bit-flip, stuck-at-0 or stuck-at-1 when the campaign is built. The draw is seeded with `seed` from `[simulation]`, so the same config always yields the same campaign, and `--dry-run` shows which type was drawn.

### Testbench modes

Not every design is driven the same way, so Verminator supports three testbench modes and generates the appropriate wrapper for each:

| Mode | You provide | Verminator generates |
|---|---|---|
| `auto` | nothing | `sim_main.cpp` **and** a `driver.cpp` template to fill in |
| `cpp_driven` | a `driver.cpp` with `drive_simulation()` | `sim_main.cpp` |
| `sv_driven` | a self-driving SystemVerilog testbench | `sim_main.cpp` (event loop) |

## Current status and limitations

Verminator is under active development. What works and has been verified end-to-end today:

- Golden verilation and leaf-level signal discovery.
- Targets of any type and width the extension can hook, including signals wider than 64 bits and integer atoms.
- Custom campaigns combining single-signal targets and multi-signal combinations, and random campaigns.
- Whole-signal, single-bit and bit-range targeting.
- Bit-flip, stuck-at-0 and stuck-at-1 fault models, each with optional time windows, plus a `random` fault type that draws one of them.
- A single instrumented build with parallel per-run execution.
- FST/VCD waveforms and a per-run performance summary.

Some capabilities are deliberately deferred to future work:

- **Depth presets** (auto-generated campaigns like `minimal` / `extensive`): only explicit `custom` campaigns and `random` ones are supported today.
- **An analysis layer**: comparing each faulted run against the golden reference to classify outcomes (masked, detected, silent data corruption). At present only the performance summary is produced; the waveform diff and classifier are the natural next step.
- **In-pipeline firmware builds** for software–hardware co-simulation.

The remaining limitations are mostly those of the extension: clocks and asynchronous resets cannot be targets, and some signal shapes (arrayed module instances, members of array elements, elements of multi-dimensional unpacked arrays) cannot be hooked. Discovery does not list memories (arrays of more than 1024 words) or arrays of unpacked aggregates, although a single word can still be configured as `mem[k]`. Random generation does not draw signals of the top module, since that is usually the testbench.

## Outlook

The [extension post]({% post_url 2025-11-21-verilator-extension %}) closed by pointing towards exactly this framework, and Verminator is the first concrete step in that direction: a way to go from a single hand-configured fault to a described, repeatable, parallel campaign over many faults.

The clearest next milestone is the analysis layer. Running hundreds of faults is only useful if the effect of each fault can be classified automatically: did the design mask it, detect it, or silently corrupt its output? With signal discovery, campaign orchestration, and per-run traces already in place, that classification is the piece that turns Verminator from a fault _runner_ into a fault _analysis_ tool, and it is where our focus turns next.

Ultimately the goal is unchanged from the extension work: to give hardware developers a fast, low-friction way to study how their designs behave under faults, and to use that understanding to build more stable and secure hardware systems.
