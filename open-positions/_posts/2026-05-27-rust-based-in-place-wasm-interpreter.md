---
layout: job
title: Feature Extension of an In-Place WebAssembly interpreter in Rust
tag: master
contact: simon.mederer@hm.edu
---

For our research group we are looking for a motivated student to extend our Rust-based In-Place
WebAssembly interpreter.

WebAssembly is a modern, low-level, assembly-like language with a compact binary format designed 
for improved application performance in web browsers. Through its security features like sandboxing, 
it is a promising technology for a wide variety of applications. But it can also be used outside 
the browser. For example, on microcontrollers. In our labs in Munich and Bad Tölz, we are currently
working on an ecosystem of efficient, practical WebAssembly runtimes and supporting tools for modern
embedded systems. Currently, we are focusing on developing a Rust-based WebAssembly In-Place 
interpreter for embedded systems. 

In the context of WebAssembly, so-called rewriting interpreters are commonly used. These 
interpreters transform the original bytecode into an intermediate representation (IR), which 
simplifies the handling of the structured control flow of WebAssembly. In contrast, In-Place 
interpreters execute the original, unmodified bytecode directly, which reduces memory overhead and 
improves startup performance. Moreover, alternative execution tiers are often unsuitable for 
safety-critical environments. 

The research direction is open, but the following points outline possible focus areas:
- Evaluate relevant WebAssembly proposals (e.g., Tail Calls, Threads, Component Model, ...) and 
  integrate them directly into the interpreter.
- Benchmark, profile, and optimize the interpreter to minimize execution latency and memory 
  overhead using Rust’s zero-cost abstractions.
- Investigate the usability of the Rust-based In-Place interpreter from an application-level 
  perspective. 
- Establish a CI pipeline to automate benchmarking and profiling on target microcontroller hardware.
- Research into how WebAssembly binaries can be debugged on embedded hardware while being executed 
  by an In-Place interpreter.

If this topic sounds interesting to you, or if you’ve been inspired and have a suggestion for a 
related topic, feel free to reach out!
