---
layout: job
title: A GCC-Based C++ Front End for R3 and AI-Driven Test Generation
tag: master
contact: mario.qosja@hm.edu
---

R3 is a static analysis tool that translates programs into an internal graph representation called GAST, on which all of its analyses operate. R3 is also the foundation of AMSGen, our tool that uses AI agents to automatically generate GoogleTest unit tests for C++ code from ACSL++ invariants. At present, C++ code can only enter R3 through a Clang-based front end, QuickDump.

Many industrial embedded projects, however, are built with GCC. Differences between the compilers, such as language extensions, template instantiation, and standard library implementations, can prevent R3 and AMSGen from processing this code. In this thesis, you will design and implement QuickGcc, a second C++ front end that uses GCC as the parser (for example, as a GCC plugin) and translates GCC's internal representation into GAST. This makes R3
Potential areas of focus include:
-	Studying the GAST format and the existing Clang-based front end (QuickDump)
-	Selecting a suitable GCC representation (e.g., GENERIC or GIMPLE) and extraction mechanism
-	Implementing the translation for core C++ features: classes, inheritance, templates, references
-	Differential testing: comparing the GAST produced by QuickGcc and QuickDump on the same programs
-	Running AMSGen on GCC-only code bases through QuickGcc and comparing generated tests and coverage (gcov)


This project offers an opportunity to gain hands-on experience in compilers, static analysis, and advanced C++ language features.
For further information or to express your interest feel free to reach out.

