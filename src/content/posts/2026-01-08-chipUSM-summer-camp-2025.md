---
layout: post
title: ChipUSM Summer-Camp Chile 2025 
author: Daniel Arévalos
date: 2026-01-08
---

The ChipUSM Summer Camp 2025 – Digital Track represents one of the educational outcomes of the ongoing efforts of the [AEMY research group](https://aemy.cs.hm.edu/) to promote open-source integrated circuit design education at universities in Germany and worldwide. The course builds on AEMY's first open-source System-on-Chip (SoC) silicon tape-out, completed in September 2025, thereby establishing a strong link between research, real silicon, and education.

The Summer Camp was held over five intensive days, from December 9th to December 13th, in Valparaíso, Chile, and was organized by the [ChipUSM student initiative](https://www.linkedin.com/company/chipusm/) at the [Technical University Federico Santa María](https://usm.cl/) (UTFSM). It brought together undergraduate and graduate students interested in gaining hands-on experience with modern digital IC design methodologies using professional-grade open-source tools.

The course was conceived as an in-person program following a [Problem-Based Learning (PBL)](https://mediapool.hm.edu/mediapool/media/dachmarke/dm_lokal/bologna/hd_mint/veroeffentlichungen_3/Wolf_et_al_HDMINT_2013.pdf) approach. Short theoretical introductions were combined with extensive guided practical sessions, where students were presented with concrete design challenges and encouraged to explore, experiment, and iterate on solutions. Through this methodology, participants worked collaboratively on a realistic SoC design, gaining insight into the structure of modern digital systems and the complete open-source RTL-to-GDS design flow.

From an AEMY perspective, this activity illustrates how research-driven open-source design efforts can be effectively transferred into educational settings, fostering reproducible workflows, lowering entry barriers, and enabling students to work with the same design artifacts and methodologies used in cutting-edge academic and industrial projects.

![studentgroup](/assets/img/chipusm-ChipUSM-summer-camp.png)

## Course overview

The Digital Track was designed as a guided exploration of the complete RTL-to-GDS design flow, using the [CROC SoC](https://github.com/pulp-platform/croc), an open-source RISC-V–based system developed within the [PULP Platform](https://pulp-platform.org/). By working with an existing, production-quality design, students were able to focus on understanding each stage of the flow rather than spending time building infrastructure from scratch.

This approach gave participants a clear view of a realistic Application-Specific Integrated Circuits (ASIC) design workflow, closely resembling those used in academic research projects and industrial environments, while remaining fully reproducible using open-source tools.

### Course structure and content

The camp followed a Project-Based Learning (PBL) methodology. Each module combined short theoretical introductions with extensive guided practical sessions, where students interacted directly with the design, tools, and intermediate results. To support the learning process, the course adopted a progressive approach, starting from simpler digital systems and gradually advancing toward the complete SoC design.

At the beginning of each major stage of the flow, demonstrations and problem-solving exercises were carried out using a simplified digital design. This allowed participants to focus on understanding the underlying concepts, tools, and design artifacts without being overwhelmed by the size and complexity of the full system. Once these concepts were well understood, students advanced to a challenge phase, where the same design step was performed on the complete SoC.

This structure enabled participants to first gain confidence with the tools and methodology, and then apply the acquired knowledge to a realistic, large-scale design, closely resembling professional ASIC development workflows.

#### Module 1: Introduction and Tools Installation

This module introduced the overall context of open-source digital IC design and the structure of modern SoC projects. Participants set up the required open-source Electronic Design Automation (EDA) environment and toolchain. The CROC SoC was presented at a high level, highlighting its main architectural components and its role as the reference design throughout the camp.

#### Module 2: RTL Structure and Simulation

Participants explored the RTL hierarchy of the digital systems, identifying key modules, interfaces, and design abstractions. They also ran simulation using Verilator, allowing them to validate behavior, inspect waveforms, and understand how functionality is verified at the RTL level.

#### Module 3: Logic Synthesis

In this module, participants synthesized selected RTL components using Yosys to learn how to interpret synthesis reports. The focus was not on optimization per se, but on understanding how RTL translate into gate-level implementations and how it is related to the Open-PDK.

#### Module 4: Physical Design Flow

This module covered the main stages of physical implementation, including floorplanning, placement, and routing, using OpenROAD and LibreLane. Participants analyzed congestion, area utilization, and design quality metrics, and learned how physical constraints impact the final layout. The resulting layouts were inspected using KLayout and OpenROAD, reinforcing the connection between abstract RTL descriptions and physical silicon.

#### Module 5: Digital Design Flow with Librelane

This module consolidated the previous steps by running an integrated digital design flow using LibreLane. Students gained an overview of how modern automated flows orchestrate multiple tools, manage intermediate artifacts, and generate final design outputs. This module emphasized reproducibility, automation, and best practices for managing complex SoC design flows.

#### Module 6: Final Projects

The final module consisted of a hands-on project, carried out either individually or in small groups. Participants were free to choose between two main project directions:

1. Optimization of the existing SoC design, focusing on aspects such as timing, area, or flow configuration.
2. Integration of an additional peripheral, extending the SoC functionality and exploring hardware integration challenges.

<p align="center">
  <img alt="student-picture-1" src="/assets/img/chipusm-pic-mod-4.png" width="48%">
  <img alt="student-picture-2" src="/assets/img/chipusm-pic-mod-5.png" width="48%">
</p>

<p align="center">
  <img alt="student-picture-3" src="/assets/img/chipusm-pic-mod-1.png" width="32%">
  <img alt="student-picture-4" src="/assets/img/chipusm-pic-mod-2.png" width="32%">
  <img alt="student-picture-5" src="/assets/img/chipusm-pic-mod-3.png" width="32%">
</p>

<p align="center">
  <img alt="lecturing" src="/assets/img/chipusm-pic-mod-6.png" width="48%">
  <img alt="lecturing" src="/assets/img/chipusm-pic-mod-7.png" width="48%">
</p>


### Tools used

The Digital Track was based entirely on open-source EDA tools, enabling a complete and reproducible RTL-to-GDS design flow. Each tool was introduced in the context of a specific design stage, allowing participants to understand its role within the overall workflow.

- [Verilator](https://www.veripool.org/verilator/) – Fast functional simulation and waveform analysis.
- [Surfer](https://surfer-project.org/) – Waveform visualization and interactive signal inspection during simulation/debug.
- [riscv-gnu-toolchain](https://github.com/riscv-collab/riscv-gnu-toolchain) – Compilation of software programs executed and simulated on the RISC-V SoC.
- [Yosys](https://yosyshq.net/yosys/) – Logic synthesis and generation of gate-level netlists.
- [OpenROAD](https://theopenroadproject.org/)/[Librelane](https://librelane.readthedocs.io/en/latest/) – Floorplanning, placement, routing, and physical implementation flow orchestration.
- [Klayout](https://www.klayout.de/) – Layout visualization and inspection.

### Aditional Course Activities

In addition to the technical modules, the summer camp included several extra activities that helped improve the learning experience and encouraged interaction among participants.

One highlight was a guest talk by members of the PULP Platform, who shared insights into open-source SoC development, real-world design challenges, and the role of collaborative hardware ecosystems. This session provided students with direct exposure to an active international research and development community.

The program also included a research-oriented talk delivered by the course instructor, presenting an overview of current microelectronics research in Germany, with a particular focus on academic pathways, international collaboration, and opportunities for students interested in pursuing graduate studies or research careers in the field.

As part of the on-site activities, participants visited the [Advance Center for Electrical and Electronic Engeneering](https://ac3e.usm.cl/language/en/) (AC3E) research center, where they were introduced to ongoing work in microelectronics and integrated systems. During the visit, students learned about the testing and characterization of chips previously designed by students, as well as current efforts toward the design and development of new integrated circuits.

At the end of the camp, participants took part in project design reviews presented in the format of lightning talks. These short, focused presentations allowed students to summarize their work, reflect on the challenges they encountered, and discuss results with peers and instructors in a structured but informal setting.

The course concluded with a social closing activity, including a shared pizza session, which helped strengthen group cohesion and provided space for informal discussion, feedback, and networking.

Together, these activities complemented the technical content of the course, reinforcing both the collaborative nature of open-source hardware development and the importance of communication and peer exchange in engineering practice.

<p align="center">
  <img alt="Pulp-talk" src="/assets/img/chipusm-pulp-talk.png" width="41%">
  <img alt="Daniel-talk" src="/assets/img/chipusm-daniel-talk.png" width="55%">
</p>

<p align="center">
  <img alt="student-project" src="/assets/img/chipusm-project1.png" width="52%">
  <img alt="pizza-time" src="/assets/img/chipusm-pizza.png" width="22%">
  <img alt="student-chip" src="/assets/img/chipusm-ldo-chip.png" width="22%">
</p>

## Conclusions and Outlook

The Digital Track of the ChipUSM Summer Camp showed that advanced SoC design can be taught effectively using only open-source tools, without losing realism or technical value. For many participants, this was their first experience with a full ASIC design flow, going beyond FPGA-based or purely theoretical courses.

From the AEMY perspective, activities like this are especially important. They help students get familiar with open-source EDA tools early on, understand the complete design process, and gain skills that are directly useful for research and real-world chip design projects.

Beyond the learning outcomes, the camp also produced reproducible workflows, clear documentation, and a solid basis for future editions, including possible extensions toward mixed-signal design and international collaboration.

Building on this experience, a two-week block course on open-source chip design will take place at Hochschule München (HM) in February 2026. This upcoming camp is exclusively for HM students and offers a hands-on introduction to chip design, following a similar practical and project-based approach. Interested students are warmly encouraged to take part and explore the world of open-source microelectronics.

<p align="center">
  <img alt="poster1" src="/assets/img/chipusm-poster-1.jpg" width="48%">
  <img alt="poster2" src="/assets/img/chipusm-poster-2.jpg" width="48%">
</p>
