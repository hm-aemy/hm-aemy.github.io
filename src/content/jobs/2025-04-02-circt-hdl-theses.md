---
layout: job
title: Design and Implementation of a Reduced Hardware Description Language for CIRCT
tag: master
contact: tobias.woelfel@hm.edu
---

For our research project [DI-OSVISE](https://aemy.cs.hm.edu/projects/osvise) we
are looking for a motivated student to research the possibility of a Reduced
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

In this master's thesis, a completely new hardware description language should be
designed and implemented with the internals of CIRCT in mind.
The research is not restricted, but for inspiration here are some ideas:
- Defining a minimal set of operations
- Implementing a parser
- Creating simple examples to showcase the functionality
- Creating a tutorial for the new language
- Adding verification support to the new language, make use of CIRCT's LTL

With this work you will learn the internals of an LLVM/MLIR based compiler. This
is a compiler widely used in the industry, for example for RISC-V but also for
custom AI accelerators. You will also learn the difference of hardware
description language and programming languages.

If this topic is interesting to you and you want to learn more about it, or got
inspired and have a suggestion for a similar topic, feel free to reach out!
It is also possible to cover this topic by a bachelor's thesis.
