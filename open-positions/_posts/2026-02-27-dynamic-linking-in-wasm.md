---
layout: job
title: Evaluation and Implementation of On-Demand Module Loading in WebAssembly on Embedded Systems
tag: master
contact: simon.mederer@hm.edu
---

For our research group we are looking for a motivated student to evaluate and implement dynamic 
linking mechanisms for WebAssembly interpreters on microcontrollers.

WebAssembly is a modern, low-level, assembly-like language with a compact binary format designed 
for improved application performance in web browsers. Through its security features like sandboxing, 
it is a promising technology for a wide variety of applications. But it can also be used outside 
the browser. For example, on microcontrollers. In our labs in Munich and Bad Tölz, we are currently
working on an ecosystem of efficient, practical WebAssembly runtimes and supporting tools for modern 
embedded systems. 

Memory of embedded systems is always a critical limiting factor. One attempt to solve this problem 
could be minimizing the code flashed onto the controller by offloading not needed code onto a server
and dynamically loading it during runtime. By being able to dynamically load and delete modules 
from the controller it might be possible to execute more complex programs using less flash memory.

The research direction is open, but the following points outline possible focus areas:
- Investigate the current state of the art of dynamic linking in terms of WebAssembly
- Evaluate linking strategies for libraries 
- Implement a demonstrator that shows how dynamic linking can work in WebAssembly
- Analyze the memory savings and introduced execution overhead 

If this topic sounds interesting to you, or if you’ve been inspired and have a suggestion for a 
related topic, feel free to reach out!
