---
layout: page
title: Scale4Edge
---

Scale4Edge is a joint project funded by the BMBF (Federal Ministry of Education
and Research), which aims to significantly reduce the currently relatively long
development times and high development costs of application-specific edge
components (platform concept). The approach pursued in the project is based on
providing a commercial ecosystem for a scalable and flexibly expandable edge
computing platform after the end of the project. The ecosystem will be created
by a large number of SMEs in cooperation with industry and research institutes.
Each SME contributes its expertise and markets the result as part of its own
product portfolio after the end of the project.

In this project the AEMY team focuses on methodologies and tools to guide the design of instruction set extensions for RISC-V based computing platforms utilizing variable length instruction codings.

[Scale4Edge Website](https://www.edacentrum.de/scale4edge/)


## SIZALIZER: A Multi-layer Analysis Framework for ISA Optimization


[SIZALIZER](https://github.com/AndHager/Sizalizer) is an innovative multi-layer analysis framework designed to address 
the growing need for optimizing the instruction set architectures (ISAs) in 
embedded systems. As resource constraints and environmental considerations 
continue to shape the evolution of embedded systems, SIZALIZER provides a 
cutting-edge solution for co-designing embedded C/C++ applications and RISC-V 
ISA extensions. By automating analysis at three critical layers—LLVM intermediate 
representation, executable binary code, and runtime instruction execution—the 
framework leverages advanced techniques such as data flow graph analysis, static 
binary analysis, and dynamic execution analysis.

The results, as demonstrated using the Embench benchmark suite, showcase SIZALIZER's 
remarkable ability to identify optimization opportunities for reducing static and 
dynamic code sizes. This achievement stems from its innovative approach to 
calculating code size improvements for newly designed RISC-V instructions. By 
leveraging its unique multi-layer architecture, SIZALIZER empowers developers to 
extract actionable insights from intricate software structures, making it an 
essential framework for advancing size-optimized ISA enhancements. This 
work is supported by the Scale4Edge project, emphasizing the collaborative effort 
to push the boundaries of efficiency and performance in embedded systems.

![SIZALIZER Architektur](/assets/img/ArchitekturMatrix.drawio.png)





