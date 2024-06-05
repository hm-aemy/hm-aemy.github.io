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

## Verification of Floating Point Algorithms on Embedded Systems

More an more software is used in safety critical domains. For systems like rail,
the necessary calculation involve mainly quadratic equations to compute safe
braking curves. Such algorithms often use fixed point arithmetic because the
required number ranges are rather small and uniform.

In more complex applications, e.g., advanced driver assistance systems (ADAS) in
the automotive domains, require more complex calculations, often involving
elementary function like trigonometry.

These algorithms generally assume real numbers which are approximated as IEEE745
floating point values. Floating point has known challenges due to the finite
approximation of infinitely many numbers. Many programmers are aware of some of
the challenges, but it is very difficult to consider all possible
pitfalls.

Our goal is to develop verification methods which allow for guaranteeing the
absence of systematic failures in floating point algorithms. IEEE754 is very
difficult for some verification methods, e.g., deductive verification and
abstract interpretation.

We currently focus mainly on using satisfiability-based methods using SAT or SMT
solvers to verify algorithms that rely on floating point calculations. Due to
the complexity of the problems, such enumerative approaches are theoretically
not very efficient. But in practice, the underlying structure of the problems
often allows for solving large problems using modern SAT and SMT solvers.
