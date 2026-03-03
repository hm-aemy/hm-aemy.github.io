---
layout: job
title: Proof of concept - WebAssembly in AUTOSAR Adaptive
tag: master
contact: simon.mederer@hm.edu
---

For our research group we are looking for a motivated student to research the possibilities of how 
it might be possible to utilize WebAssembly in an 
[AUTOSAR Adaptive Platform](https://www.autosar.org/standards/adaptive-platform).  

WebAssembly is a modern, low-level, assembly-like language with a compact binary format designed 
for improved application performance in web browsers. Through its security features like sandboxing, 
it is a promising technology for a wide variety of applications. But it can also be used outside 
the browser. For example, on microcontrollers. In our labs in Munich and Bad Tölz, we are currently
working on an ecosystem of efficient, practical WebAssembly runtimes and supporting tools for modern 
embedded systems. 

Currently AUTOSAR Adaptive and its applications are almost exclusively developed in C++ with some
exceptions in Rust. By enabling the use of WebAssembly in AUTOSAR Adaptive, its applications can be 
developed in any programming language that can be compiled to it. WebAssembly can also simplify
the OTA Update functionality, since it is not dependent on a specific architecture. When using 
WebAssembly only the Runtime must be compiled for a specific architecture, while the modules 
can be used on every architecture. At last, through the security guarantees of WebAssembly like 
sandboxing the safety of the system can be improved generally. 

The research direction is open, but the following points outline possible focus areas:
- Investigate the current state of the art of WebAssembly in the field of automotive
- Develop different approaches for integrating WebAssembly into AUTOSAR (Adaptive)
- Implement a demonstrator that shows how WebAssembly can be used
- Analyze the effects of WebAssembly on execution speed, memory usage, vulnerability of the system

If this topic sounds interesting to you, or if you’ve been inspired and have a suggestion for a 
related topic, feel free to reach out!
