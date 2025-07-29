---
layout: job
title: Design, Impelementation and Evaluation of signal hierarchy checking during runtime
tag: master
contact: jonathan.schroeter@hm.edu
---

For our research project [ISOLDE](https://aemy.cs.hm.edu/projects/isolde) we are looking for a motivated student to research an alternative approach for fault simulation
with [Verilator](https://www.veripool.org/verilator/).

Verilator is a powerful and widely adopted open-source tool for simulating digital hardware described in Verilog or SystemVerilog.
Unlike traditional event-driven simulators, Verilator translates HDL code into cycle-accurate, synthesizable C++ or SystemC code, enabling extremely fast simulation performance.
It is particularly valued in large-scale and performance-sensitive verification environments, where simulation speed and integration with software testbenches are critical.
These characteristics—high simulation speed and open-source accessibility—make Verilator especially attractive for safety validation and fault simulation.

This thesis explores an alternative approach to signal hierarchy validation by shifting the responsibility from compile time to runtime.
The research direction is open, but the following points outline possible focus areas:
- Investigating how signal hierarchies are currently represented and handled in Verilator-generated simulation code
- Designing and implementing a flexible runtime mechanism for hierarchy representation, introspection, and validation
- Developing an interface or format to define reference hierarchies for comparison during simulation
- Creating example hardware designs to demonstrate and test the runtime checking approach
- Evaluating the performance, correctness, and applicability of the runtime mechanism for fault simulation

If this topic sounds interesting to you, or if you’ve been inspired and have a suggestion for a related topic, feel free to reach out!