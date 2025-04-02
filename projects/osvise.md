---
layout: page
title: DI-OSVISE
---

Our team leads the research project *Open Source Verification of Instruction Set
Extensions (OSVISE)* which is funded by the German Ministry of Research and
Education in their [open source EDA software program](https://www.elektronikforschung.de/foerderung/bekanntmachungen/design).

Three work areas are covered by OSVISE:

- Efficient evaluation and verification of instruction set extensions
- Evaluation of non-functional properties of such extensions
- Improving support of linear temporal logic across multiple open source EDA
  tools

All results of the project will be open source. The following diagram shows the
contributions of the project and how they integrate with existing open source
tools.

![DI-OSVISE Overview](/assets/img/osvise-overview.png)

HM-AEMY contributions to the project are centered around the [CIRCT LLVM
framework](https://circt.llvm.org).

## Verification with linear temporal logic

To verify hardware designs, the values of signals can be checked at each time
step. This allows for the detection of known illegal values at specific times,
as well as identifying prohibited combinations of signals. As the signals change
with time, a view restricted to one point in time limits the ability of the
verification. For example, a module which has a request/response interface
typically will have a valid response after a request was made, but at a later
point in time. The behavior in time can be expressed with linear temporal logic
(LTL). Combined with regular expressions and a finer control in temporal
specifications, this concept is known as concurrent assertions in
SystemVerilog Assertions (SVA).

Support for concurrent assertions is practically non-existent in open source EDA
tools. By extending CIRCT (serving as a central tool working together with
existing open source solutions) with LTL/SVA for various input and output paths,
this will enhance advanced verification for open source hardware designs.

In this work, the existing [LTL dialect](https://circt.llvm.org/docs/Dialects/LTL/)
will be investigated and extended.
Currently, the LTL dialect is only used in the Chisel flow via the
[firrtl dialect](https://circt.llvm.org/docs/Dialects/FIRRTL/).
In order to support SVAs, work focuses on the components such as
[slang](https://sv-lang.com/),
the [SV](https://circt.llvm.org/docs/Dialects/SV/)
and [Verif dialect](https://circt.llvm.org/docs/Dialects/Verif/).
Additionally, a link to [yosys](https://github.com/YosysHQ/yosys) and
[Verilator](https://www.veripool.org/verilator/), two widely used open source
tools for synthesis and simulation is created to make use of the new
functionalities.
