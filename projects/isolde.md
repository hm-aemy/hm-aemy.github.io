---
layout: page
title: ISOLDE
---

ISOLDE Project will have high performance RISC-V processing systems and
platforms at least at TRL 7 for the vast majority of building blocks,
demonstrated for key European application domains such as automotive, space and
IoT with the expectation that two years after completion ISOLDE's high
performance components will be used in industrial quality products.

The AEMY team works on two major topics inside the ISOLDE project:

 - Processor support to accelerate Bytecode Virtualization (WebAssembly)
 - Fault-injection support with the Verilator simulation tool and frameworks
   targeted at Hardware/Software-Codesign of mitigations

[ISOLDE website](https://isolde-project.eu/)

The ISOLDE project, nr. 101112274 is supported by the Chips Joint Undertaking
and its members Austria, Czechia, France, Germany, Italy, Romania, Spain,
Sweden, Switzerland.

## Fault-injection support with the Verilator simulation tool

[Verilator](https://www.veripool.org/verilator/) is a known open source high performance tool for simulating (System)Verilog models.
This high performance property results from its approach to use cycle-based simulation and generating an optimized C++ or SystemC model.

One key aspect when verifying hardware designs, is to ensure that the design operates as intened even under unexpected conditions, like faults or errors.
A popular approach to discover unexpected behavior due to faults, is to use fault injection.
Fault injection is crucial for identifying potential weaknesses in the design, which could lead to system failures in real-world applications.
Currently Verilator does not provide a feature for fault injection by itself.
Possible methods are editing the design code or relying on tools around Verilator implementing faults.
While the first solution requires additional resources and can be prone to additional errors, the second solution can reduce the performance advantage Verilator offers, in addition to the requirement to maintain support for the latest Verilator version.
Since a continous maintenance is not guaranteed, this can lead to users needing to rely on outdated Verilator versions.

![Current Approaches](/assets/img/current-approaches.png)

Therefore, the Aemy team focuses on providing a solution that is easy to use and directly integrated into Verilator's source code.
The goal is to upstream the fault injection solution and therefore keep it maintained and ready to use.
Additionally, integrating the solution into Verilator allows us to leverage its performance benefits for fault injection simulation.
This performance is crucial, as a large space of different faults needs to be investigated without excessive time effort.
Finally, we aim to adopt the existing user configurations in Verilator to ensure ease of use when creating user-specified fault injections.

![Project Target (Red represents injections of faults)](/assets/img/project-target-fi.png)