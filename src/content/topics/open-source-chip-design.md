---
title: Open Source Design Flows and Tools
label: Design Flows and Tools
summary: Open source chip design tools, from hardware description languages to complete RTL-to-GDS flows, as the basis for a resilient, sovereign chip design ecosystem.
color: blue
order: 2
---

Open Source tools for chip design have seen an incredible boost over the last
years, mainly due to the influx of curious software developers in chip design
and the increased attention around sovereignty of chip design. The ease of
access for academia, hobbyists and also industry is a key cornerstone of
attracting more talent and driving innovative chip design in mature technology
nodes.

We contribute to the tools themselves and merge our work upstream wherever
possible, so it stays maintained. Our main focus areas include:

- Design entry with the [Spade hardware description language](https://spade-lang.org/)
  and flow integration ([ODE4EC-PIV](/projects/ode4ec-piv))
- The [CIRCT](https://circt.llvm.org) compiler framework, including inference
  of arithmetic and DSP blocks ([ODE4EC-DIG](/projects/ode4ec-dig))
- Incremental builds, reporting and stability of the
  [LibreLane](https://github.com/librelane/librelane) RTL-to-GDS flow
  ([ODE4EC-DIG](/projects/ode4ec-dig))
- Automated IP integration ([DI-FITS](/projects/fits))
- Generators for on-chip and off-chip interconnects ([BCDC](/projects/bcdc))
- Tool interoperability of major open source tools like
  [CIRCT](https://circt.llvm.org), [Yosys](https://yosys.org),
  [Verilator](https://verilator.org) and the waveform viewer
  [Surfer](https://surfer-project.org/)
