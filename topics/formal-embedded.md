---
layout: page
title: Formal Methods for Embedded Systems
---

Formal methods can be key technology to ensure the reliable, correct and safe
execution of embedded systems with their ever increasing complexity.

With our strong background both in formal verification and embedded system
design, the AEMY team currently works on various topics, mostly around:

- Formal verification of embedded virtualization technologies
- Easier access to formal verification of standard libraries for embedded
  systems and their startup code
- New methods for formal verification of embedded floating point software

## Formal Verification of Embedded Virtualization Technologies

[WebAssembly](https://webassembly.org/) (WASM) is a modern high-level virtual
machine which looks promising for implementation on embedded systems. Due to its
formally-defined semantics, its efficiency and well-developed tool support, it
could be an interesting alternative to systems like JavaCard as the _assembly
language_ of embedded systems.

WASM is supported by many compilers as a back-end and therefore allows for
software to be implemented in a wide array of languages but run on the same
virtual machine.

Due to security and safety risks, an interpreter of WASM on embedded systems
must guarantee that:

- the execution corresponds to the WASM semantics

- the interpreter is free of dangerous run-time errors like buffer-overflows
  or other security risks which might be exploitable by an attacker

To ensure this we evaluate different formal verification approaches to increase
the quality and robustness of the resulting interpreter. This evaluation includes

- Model Checking as in the C bounded model-checker [CBMC](https://www.cprover.org/)

- Deductive Verification based on Hoare-Logic as in
  [Frama-C / ACSL](https://frama-c.com/) or [Dafny](https://dafny.org/)

- Correct-by-construction approaches as in the [B-method](https://www.atelierb.eu/en/)

In this case the first priority is correctness of the interpreter and not
efficiency. As our goal is the development of a big community of users, we also
evaluate how optimizations and efficient implementation techniques can be
realized in a verified interpreter.
