---
layout: job
title: Implementation and Evaluation of Verilator fault simulation optimization
tag: master
contact: jonathan.schroeter@hm.edu
---

For our research project [ISOLDE](https://aemy.cs.hm.edu/projects/isolde) we are looking for a motivated student to research an alternative approach for fault simulation
with [Verilator](https://www.veripool.org/verilator/).

Verilator is a powerful and widely adopted open-source tool for simulating digital hardware described in Verilog or SystemVerilog.
Unlike traditional event-driven simulators, Verilator translates HDL code into cycle-accurate, synthesizable C++ or SystemC code, enabling extremely fast simulation performance.
It is particularly valued in large-scale and performance-sensitive verification environments, where simulation speed and integration with software testbenches are critical.
These characteristics—high simulation speed and open-source accessibility—make Verilator especially attractive for safety validation and fault simulation.

As part of the Isolde project, we have implemented an approach that enables the instrumentation of a (System)Verilog design, which allows the simulation of faults.
At present, the signal hierarchy for the instrumentation is validated using additional logic at the RTL level using parameters.
This thesis explores an alternative approach to signal hierarchy validation by shifting this process to the C++ level of Verilator.
The research direction is open, but the following points outline possible focus areas:
- Investigating how signal hierarchies are currently represented and handled in Verilator-generated simulation code
- Implementing an alternative mechanism for hierarchy representation, introspection, and validation
- Developing possible optimizations for the currently implemented approach
- Creating example hardware designs to demonstrate and test the alternative checking approach
- Evaluating the performance, correctness, and applicability of the approaches for fault simulation

If this topic sounds interesting to you, or if you’ve been inspired and have a suggestion for a related topic, feel free to reach out!