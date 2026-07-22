---
layout: post
title: "Verminator: Automating Fault-Injection Campaigns with Verilator"
author: Jonathan Schröter
date: 2026-07-22
---
In this post we present the first instance of our Verminator fault-injection framework which uses the Verilator DPI-hook extension. The DPI-hook extension was introduced thorugh a previous post [Update on Fault-Injection with Verilator]({% post_url 2025-11-21-verilator-extension %}). In this post we describe our first instance of the extension of Verilator that adds native _DPI-hook-insertion_: The inserted DPI-hooks that let external C/C++ code observe and modify signals during a simulation, which in turn enables fault-injection without manual HDL modifications.

This initial post containing our first concept was updated during further development and analysis. The implemented updates are explained in our followup post [Fault-Injection with Verilator: Update on the DPI-Hook Extension]({% post_url 2026-07-22-verilator-extension-update %}).

The developed extension answers the question of _how_ a single fault reaches a single signal.
It does not, by itself, answer the questions that comes up the moment you want to study a design seriously: to which signals do I inject a fault, with which fault models, over which time windows, and how do I run hundreds of such experiments without hand-editing configuration files and rebuilding the simulator for every one of them?

This is the gap the _Verminator_ framework fills.
Where the extension is the mechanism, Verminator is the orchestration around it.
You describe an entire fault-injection (FI) **campaign** in a single configuration file; Verminator verilates your design, discovers its signal tree, generates all the instrumentation the extension needs, builds **one** instrumented simulation binary, and then runs every fault scenario in parallel — collecting a waveform and performance data for each run.

It is important to keep the division of labour in mind throughout this post:

> Verminator orchestrates the campaign. The actual fault injection at runtime is still performed by the Verilator DPI extension. Verminator generates the extension's configuration and the C++ fault model, builds the binary, and drives the runs.

Below we walk through the framework the same way we did for the extension: first a concrete use-case example, then an explanation of how it works, followed by the core design ideas and the current limitations.
The project can be found (here)[https://github.com/joschroeter/verminator]

## Use-case example

Let's reuse a familiar starting point — a counter design — but this time we are not interested in a single, hand-written fault. We want to ask a broader question: _what happens to this design under a range of faults on a few interesting registers?_

With Verminator, you do not touch the RTL, the `.vlt` file, or any C++ by hand. You write one `verminator.toml` that describes the campaign:

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
    { path = "tb_counter.uut1.cut.count",    fault_type = "stuck_at_0", width = 8, sv_type = "logic" },
]

[output]
results_dir = "results/"
```

Two concepts in this file are worth calling out, because they define what Verminator will actually run.

A **target** is a single signal you want to fault. Each target expands into one run for every combination of `(fault_type × time_window)`. The `counter_register` target above therefore produces multiple runs on its own: `bit_flip` in the window `[100, 250]`, and `stuck_at_0` in the same window, each faulting only that one register.

A **combination** faults several signals **together in one run**, each signal with its own fault type (and, if you want, its own timing). The `reg_and_count` combination above is a single run in which `count_reg` is bit-flipped while `count` is held stuck-at-0 at the same time. Combinations are how you study interacting faults rather than isolated ones.

Before committing to a run, it helps to know which signals even exist to be faulted. Verminator can verilate the design and list its injectable signal tree without simulating anything:

```sh
verminator run verminator.toml --list-signals
```

And you can preview the full campaign matrix — every run that _would_ be executed — without building or running anything:

```sh
verminator run verminator.toml --dry-run
```

Once the plan looks right, you launch the campaign. The `--jobs` flag controls how many fault runs execute in parallel:

```sh
verminator run verminator.toml --jobs 8
```

Verminator verilates the golden design once, generates the instrumentation, builds a single binary, and then fans the fault runs out across your cores. When it finishes, the results are laid out in a structured directory — one sub-directory per run, each with its own waveform and timing data, plus a campaign-wide performance summary and a machine-readable description of the whole fault matrix:

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

That is the whole workflow: one config file in, a directory of per-fault results out. The rest of this post explains what happens between those two points.

## How the framework works

Verminator runs a fixed four-step pipeline. Each step produces artefacts the next one consumes, and the directory layout above mirrors these steps exactly.

```
1. Verilate golden   ->  discover the design's signal tree (no simulation)
2. Generate          ->  fault_config.vlt, faultModel.cpp, sim_main.cpp
3. Build hooked      ->  one instrumented V<top> binary
4. Run campaign      ->  golden reference run, then all fault runs in parallel
```

**Step 1 — Golden verilation.** Verminator first runs Verilator in a JSON-only mode to obtain the design's netlist as an AST, _without_ compiling or simulating anything. From this it extracts the full hierarchical signal tree — every injectable signal with its instance path, data type, and bit width. This is what powers `--list-signals`, and it is also what lets you fault a deeply nested signal by its path (for example `tb_counter.uut1.cut.count`) without knowing the internal module structure in advance.

**Step 2 — Generation.** This is where Verminator translates your high-level campaign into the low-level artefacts the extension expects. Three files are produced:

- `fault_config.vlt` — the hook directives that tell the DPI extension _which_ signals to insert hooks on. These are exactly the `insert_dpihook`-style directives described in the extension post, but written out automatically, one per unique signal path, instead of by hand.
- `faultModel.cpp` — the C++ fault model. Verminator generates the callback functions that implement bit-flip, stuck-at-0 and stuck-at-1 behaviour, gated by the time windows from your config. You do not write this file; it is derived entirely from the campaign.
- `sim_main.cpp` — the simulation driver. It contains a compact static table of all runs and dispatches on a `--run N` argument, so the _same_ binary can execute any run in the campaign.

**Step 3 — Hooked build.** Verminator invokes Verilator once, with the fault-injection extension enabled, to compile the design together with the generated `.vlt` and `.cpp` files into a single instrumented `V<top>` binary. Building once rather than once-per-fault is a deliberate design choice: compilation is by far the most expensive step, and a campaign of hundreds of runs would be dominated by it otherwise.

**Step 4 — Campaign execution.** Verminator first runs the binary in golden mode to capture a fault-free reference, then launches the fault runs in parallel — each run is a separate process invoking the shared binary with its own `--run` index. Every run writes its waveform and a small timing record into its own directory. Finally, the per-run timings are aggregated into `perf_summary.csv`.

### Two concepts that make it scale: effects and runs

The heart of Verminator is a deliberate separation between _what a fault is_ and _when it is applied_.

A **fault effect** is a unique `(signal path, fault_type, time_windows)` triple. Each effect becomes exactly one `switch`-case in the generated `faultModel.cpp` and receives a globally unique id. Effects are **deduplicated**: if the same signal is faulted the same way both as a standalone target and as part of a combination, both reuse the same case id and the same generated code — the code that _computes a single signal's faulted value_ is written once.

A **fault run** is one simulation. It carries a list of **hooks**, where each hook binds a signal path to an effect's id. A single-signal target becomes a run with one hook; a combination becomes a run with several hooks that fire simultaneously. The run is _where_ and _how many_ signals get faulted together; the effect is _what_ each fault does.

Deduplication happens at the level of this generated code, **not** at the level of runs. A standalone target and a combination that share a signal are still two separate runs, each with its own process, waveform, and results. So a fault that is harmless in isolation but harmful when combined with another is fully captured: the combination is its own run in which both signals are faulted _simultaneously_, and any interaction between them emerges there at simulation time. Deduplication only avoids generating the same per-signal fault code twice; it never merges experiments.

This split is what lets a campaign grow cheaply. Adding a combination that reuses signals you already fault elsewhere adds a run, but no new fault-model code. The generated C++ stays small, so compile time stays flat, while the number of runs — which are just cheap parallel process launches — can grow freely.

### The shared contract with the extension

Because Verminator generates _both_ the `.vlt` hook directives and the `faultModel.cpp` callbacks, it is responsible for keeping them in agreement on a single C ABI. The extension synthesises each callback's parameter list from the `.vlt` directive and then links it against the definition of the same name in `faultModel.cpp`; if the two disagree, arguments silently shift.

Verminator therefore emits both sides from one set of rules. The callback name encodes the signal width _and_ the bit-selection shape, so a whole-signal fault, a single-bit fault (`-bit-pos`) and a bit-range fault (`-bit-range`) each get their own function signature and can never collide on one C symbol:

| Config | `.vlt` directive | Callback signature |
|---|---|---|
| whole signal | *(no bit directive)* | `fault_<w>(int id, svBit trigger, <value>)` |
| `bit = N` | `-bit-pos N` | `fault_<w>_bitpos(int id, svBit trigger, int bitPos, <value>)` |
| `bit_range = [hi, lo]` | `-bit-range "hi:lo"` | `fault_<w>_bitrange(int id, svBit trigger, int bitStartPos, int bitEndPos, <value>)` |

This lets you narrow a fault from a whole register down to a single bit or a contiguous bit range purely in the config — Verminator threads the selection through to both generated artefacts consistently.

### Testbench modes

Not every design is driven the same way, so Verminator supports three testbench modes and generates the appropriate wrapper for each:

| Mode | You provide | Verminator generates |
|---|---|---|
| `auto` | nothing | `sim_main.cpp` **and** a `driver.cpp` template to fill in |
| `cpp_driven` | a `driver.cpp` with `drive_simulation()` | `sim_main.cpp` |
| `sv_driven` | a self-driving SystemVerilog testbench | `sim_main.cpp` (event loop) |

## Current status and limitations

Verminator is under active development. What works and has been verified end-to-end today:

- Golden verilation and full-hierarchy signal discovery.
- Custom campaigns combining single-signal targets and multi-signal combinations.
- Whole-signal, single-bit and bit-range targeting.
- Bit-flip, stuck-at-0 and stuck-at-1 fault models, each with optional time windows.
- A single instrumented build with parallel per-run execution.
- FST/VCD waveforms and a per-run performance summary.

Some capabilities are deliberately deferred to future work:

- **Depth presets** (auto-generated campaigns like `minimal` / `extensive`): only fully explicit `custom` campaigns are supported today. Automatic combination generation needs a design decision on which combinations to sample.
- **An analysis layer**: comparing each faulted run against the golden reference to classify outcomes (masked, detected, silent data corruption). At present only the performance summary is produced; the waveform diff and classifier are the natural next step.
- **Random signal selection** and a **random fault type**, for exploratory campaigns over large designs.
- **In-pipeline firmware builds** for software–hardware co-simulation.

Signal widths above 64 bits are not currently supported, mirroring the corresponding limitation in the extension.

## Outlook

The [extension post]({% post_url 2025-11-21-verilator-extension %}) closed by pointing towards exactly this framework, and Verminator is the first concrete step in that direction: a way to go from a single hand-configured fault to a described, repeatable, parallel campaign over many faults.

The clearest next milestone is the analysis layer. Running hundreds of faults is only useful if the effect of each fault can be classified automatically — did the design mask it, detect it, or silently corrupt its output? With signal discovery, campaign orchestration, and per-run traces already in place, that classification is the piece that turns Verminator from a fault _runner_ into a fault _analysis_ tool, and it is where our focus turns next.

Ultimately the goal is unchanged from the extension work: to give hardware developers a fast, low-friction way to study how their designs behave under faults, and to use that understanding to build more stable and secure hardware systems.
