---
title: RISC-V and WebAssembly
label: RISC-V and WebAssembly
summary: Extending the open RISC-V instruction set for signal processing, security and bytecode execution, and bringing portable, sandboxed WebAssembly to embedded systems.
color: green
order: 1
---

[RISC-V](https://riscv.org) is an open instruction set architecture, which is
the interface between software and a processor. As an open standard it
accelerates new innovative chip platforms, industry competition and easier
access from academia.

The AEMY team is one of the key European entities of RISC-V and is involved in
the RISC-V leadership and broad community. In research we focus on the
extendability of RISC-V in the following areas:

- RISC-V compressed instructions for signal processing
- RISC-V ISA extensions for DSP and cryptographic applications
  ([BCDC](/projects/bcdc))
- RISC-V support to accelerate the execution of bytecode virtual machines such
  as WebAssembly ([ISOLDE](/projects/isolde))
- Framework for the exploration of RISC-V high-density compressed instructions
  using variable length instruction coding for application domains
  ([Scale4Edge](/projects/scale4edge))
- Evaluation and verification of instruction set extensions
  ([DI-OSVISE](/projects/osvise))

## WebAssembly for embedded systems

Application development for modern IoT systems is held back by many of the constraints of low-resource embedded processors.
The memory and processing abilities of IoT devices do not support the tools utilized in other application domains like
cloud-native, which profit from automatic application deployment, monitoring, and scaling.

[WebAssembly](https://webassembly.org/) is a modern, high-level, virtual machine that, due to its features and efficient semantics,
can easily be implemented on most IoT devices.
This can streamline the process of developing and managing software on embedded systems and solve many challenges associated with
utilizing heterogeneous, low-resource devices.

Some advantages WebAssembly can bring to embedded systems are:

- Sandboxed, efficient multiprocess devices.
- Fault tolerance, monitoring, and lifecycle management of IoT applications.
- Automatic (re-)deployment of applications based on device type and features.
- Emulation of missing hardware features using a WebAssembly interface.
- Binary compatibility with various devices and generations.

At AEMY, we are working on an ecosystem of efficient, practical WebAssembly runtimes and supporting
tools for embedded systems.

One example is [TWEED](https://github.com/hm-aemy/tweed), an in-place
interpreter that executes WebAssembly bytecode directly, without first
converting it into an intermediate representation. We develop it in our
[IoT prototyping lab at TIZIO](/projects/tizio).

### Publications

- [Support for Just-in-Time Compilation of WebAssembly for Embedded Systems (2023)](https://doi.org/10.1109/MECO58584.2023.10155088)
- [Potential of WebAssembly for Embedded Systems (2022)](https://doi.org/10.1109/MECO55406.2022.9797106)
