---
layout: job
title: Improvement of a WebAssembly In-Place Interpreter in Rust
tag: master
contact: simon.mederer@hm.edu
---


# Description 

For our research group we are looking for a motivated student to extend our **Rust**-based in-place
**WebAssembly** interpreter.

WebAssembly is a modern, low-level, assembly-like language with a compact binary format designed 
for improved application performance in web browsers. It is becoming increasingly popular, since 
it can be used as a compile target for popular programming languages such as **Rust, C/C++, Go, or 
Kotlin**. Thanks to its security features, such as sandboxing, it is a promising technology for a 
wide range of applications, including those that run outside the browser, for example, on 
microcontrollers. In our labs in Munich and Bad Tölz, we are currently working on an ecosystem of 
efficient, practical WebAssembly runtimes and supporting tools for modern embedded systems. 

In the context of WebAssembly, so-called rewriting interpreters are commonly used. These 
interpreters transform the original bytecode into an intermediate representation (IR), which 
simplifies the handling of the structured control flow of WebAssembly. In contrast, in-place 
interpreters execute the original, unmodified bytecode directly, which reduces memory overhead and 
improves startup performance. Moreover, alternative execution tiers are often unsuitable for 
safety-critical environments. For this, we are looking for a motivated student with an interest in 
developing Rust for highly resource-constrained and security-critical systems.

# Topic Suggestions

The research direction is open, but the following points outline possible focus areas:
- Try out new WebAssembly features (e.g. Tail Calls, Threads, Component Model) and integrate them 
  into our interpreter
- Measure and improve the speed and memory use of our Rust-based interpreter

What you should bring (preferred, not mandatory):
- Ongoing studies in computer science or a related field
- Solid knowledge of embedded systems
- Programming experience, ideally in Rust
- Independent, structured way of working and curiosity about security topics

If this topic sounds interesting to you, or if you’ve been inspired and have a suggestion for a related topic, feel free to reach out!



# Related Job Openings
- [https://aemy.cs.hm.edu/open-positions/2026/11/09/rust-based-in-place-wasm-interpreter_devops.html](DevOps for a WebAssembly In-Place Interpreter in Rust)
- [https://aemy.cs.hm.edu/open-positions/2026/11/09/wasm-application-areas.html](Exploring new Areas of Application for WebAssembly in Embedded Systems)
- [https://aemy.cs.hm.edu/open-positions/2026/11/09/wasm-smart-cards.html](Development of a WebAssembly-based Smart Card Platform)
- [https://aemy.cs.hm.edu/open-positions/2026/11/09/shk-rust-based-webassembly.html](Rust and WebAssembly for Secure Embedded Systems)
