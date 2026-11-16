---
layout: job
title: Development of a Framework for Reduced Hardware Description Language for CIRCT
tag: student-assistant
contact: tobias.woelfel@hm.edu
---

For our research project [DI-OSVISE](https://aemy.cs.hm.edu/projects/osvise) we
are looking for a motivated student to assist on the development of a Reduced
Hardware Description Language for [CIRCT](https://circt.llvm.org/).

Circuit IR Compilers and Tools (CIRCT) is a Multi-Level Intermediate
Representation (MLIR) Framework based hardware compiler.
It is a relatively new tool which offers a new approach to translate hardware
descriptions into various formats needed in the hardware design flow.
It leverages design principles common in traditional software compilers and
reuses the infrastructure of MLIR. This allows for multiple front-ends to coexist.
Examples of input languages include SystemVerilog, Python and Chisel.
Each of those hardware description/construction languages was designed
independently of CIRCT.

Your tasks will be centered around a new hardware description language. The
language goals are to offer a simple and minimal functionality and target
CIRCT's internal structures. The work may include:
- Implementation of the parser
- Implementation of compiler tool
- Design and implement test infrastructure
- Create tutorial for HDL implementation in CIRCT
- Document CIRCT dialects used by new HDL
- Add verification support to HDL
- Create IP examples with Verilog output

With this work you will learn the internals of an LLVM/MLIR based compiler. This
is a compiler widely used in the industry, for example for RISC-V but also for
custom AI accelerators. You will also learn the difference of hardware
description language and programming languages.

If this topic is interesting to you and you want to learn more about it, or got
inspired and have a suggestion for a similar topic, feel free to reach out!
It is also possible to cover this topic by a bachelor's or master's thesis.
