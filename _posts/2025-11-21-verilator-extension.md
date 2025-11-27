---
layout: post
title: Update on Fault-Injection with Verilator
author: Jonathan Schröter
date: 2025-11-24
---
As part of our ongoing efforts to improve tooling for hardware verification and software–hardware co-design, we have extended Verilator with support for fault-injection mechanisms.  
Below is a concise overview of the changes introduced and how to use the extension.

If you’re looking for background on the motivation behind this feature, please refer to "Fault-injection support with the Verilator simulation tool" in the [Isolde project overview](https://aemy.cs.hm.edu/projects/isolde).

# What's new
> Note: Throughout this post we use the terms: _hook-insertion_ and _fault injection_.  
    - **Hook-insertion**: adding the SystemVerilog Direct Programming Interface (DPI) call points to a design (from now on _hooks_). These _hooks_ form an interface that external code can use to observe or modify signals.  
    - **Fault injection**: the act of injecting faults or tampering with signal values during simulation.  
In short, _hooks_ are the interface; fault injection is the action performed through that interface.

  

**What is the DPI, and why do we use it?**  
The Direct Programming Interface (DPI) is a SystemVerilog feature that allows the design to call functions defined in another language (typically written in C or C++). This then in turn also allows to integrate other languages, for example, Python.

**Why DPI instead of adding fault injection directly into Verilator?**  
There are two main reasons for us to choose the _hook-insertion_ with DPI over the direct addition to Verilator:
- DPI evaluation happens as the last step of a Verilog simulation; therefore, there should be no issue with masked faults or values being overwritten during the simulation process.
- DPI is general-purpose: it enables multiple uses beyond fault injection and keeps the implementation modular.

**Does this limit us to SystemVerilog?**  
Not really. DPI is defined for SystemVerilog, but Verilator treats Verilog sources as SystemVerilog for this purpose, so the mechanism also works for Verilog models.

**How does the extension work?**  
Without automation, a user would manually add DPI calls and the surrounding logic. That quickly becomes tedious when many signals are _hook-inserted_ and increasingly complex with the complexity of the model. Our extension modifies Verilator to insert the needed statements automatically.

We implement this by manipulating the Abstract Syntax Tree (AST) that Verilator builds when compiling the (System)Verilog design into C++. The AST changes include duplicating the original module (so the tool can select between the original and the _hook-inserted_ version), adding variables and functions, creating additional assigns, and inserting an _hook_ trigger that forces the DPI call even when the original model has not changed. Because this trigger relies on timing-related behavior, the `--timing` flag must be used when running Verilator.

With these AST transformations, Verilator will generate _hook-inserted_ code. To perform fault injection the user has to provide a `.cpp` file that implements the fault model. Verilator will use this file and compile it into the simulator. The user also has to enable the _hook-insertion_ with the new `--insert-hook` flag.

Once the Verilator-generated simulator with the fault-model `.cpp` is built, run the simulator as usual to observe the injected faults.

**How do you configure the hook-insertion for fault injection?**  
_Hook-Insertion_ is configured via Verilator configuration files (typically ending with `.vlt`). We extended the configuration syntax to describe _hook-insertion_ entries. Each _hook-insertion_ entry specifies:
- The target signal path
- The C/C++ callback function name
- An ID used to select different fault behaviors inside the callback

An expected configuration line for the _hook-insertion_ looks like:  
`insert_hook -callback "<c-function name>" -id <fault type/id> -target "<topmodule.instance.instance.instance.var>"`

The flags `insert_hook` and `-callback` are the easier flags to provide, with `insert_hook` representing the keyword to enable the _hook-insertion_ and the `-callback` flag defining the name of the callback c-function defined in the `.cpp` file.  
The `-id` flag selects a specific fault cases, if different fault cases are defined on the C side of the DPI (for example, via a `switch`).  
Last but not least there is the `-target` flag. This flag is more complex and represents the path to the target signal.  
The path to the targeted signal should start with the top module followed by the instances calling the module containing the targeted signal.  
It does not matter if the instance calles the module directly or indirectly as soon as it is in the path it has to be part of the target string.

Since it is always easier to undestand such a feature with an example, we provide a small example below to illustrate the `-target` format.

## Counter example
First, a simple counter module:

```verilog
module counter (
    input logic clk,
    input logic reset,
    input logic en,
    output logic [31:0] counter_out
);

    logic [31:0] counter_reg;

    always_ff @(posedge clk or posedge reset) begin
        if (reset)
            counter_reg <= 32'd0;
        else if(en)
            counter_reg <= counter_reg + 32'd1;
    end

    assign counter_out = counter_reg;

endmodule
```

To demonstrate the creation of the `-target` string more in depth, we add a top module that instantiates multiple controllers that in turn instantiate the counter module:

```verilog

module tb_counter (
    input wire clk,
    input wire reset,
    output logic [31:0] counter1,
    output logic [31:0] counter2,
    output logic [31:0] counter3,
    output logic [31:0] counter4,
    output logic [31:0] counter5
);

    controller uut(clk, reset, counter1);
    controller uut1(clk, reset, counter2);
    controller uut2(clk, reset, counter3);
    controller uut3(clk, reset, counter4);
    controller uut4(clk, reset, counter5);

endmodule

module controller(
    input wire clk,
    input wire enable,
    input wire reset,
    output logic counter
);

    counter cut(clk, reset, counter);

endmodule
```

Combining this top module with the above provided counter we now know that, if we want to target the `counter_reg` this signal can be found in the counter module. This module in turn is called by the controller module via the `cut` instance and indirectly from the `tb_counter` module via a variety of instances. Since we have different instances in the `tb_counter` we need to define which specific instance should be targeted, which will be the instance `uut1` for this example.

To form the correct `-target` string from this signal path, we need to omit all intermediate module names except the top module and apply the format explained above. This will result in the following string for the `target` flag, which needs to be added to the configuration line:  
`tb_counter.uut1.cut.counter_reg`

Use -id when a single callback handles multiple cases. If the callback needs no variants, set -id to 0 or any fixed value. In this example we use id _0_ for stuck-at-0 and _1_ for stuck-at-1; here we choose _1_ for a stuck-at-1 case for the `counter_reg`.

All these steps should result in the following configuration file, which we named `verilator.vlt` for this example:

```
`verilator_config

hook_insert -callback "faultInjection" -id 1 -target "tb_counter.uut1.cut.counter_reg"
```
With the configuration and the (System)Verilog files ready for Verilator, we can now define the fault model for the signal in our `.cpp` file (here `fault_models.cpp`). This file will contain our callback function called `faultInjection()`.

This could generally look something like this:

```cpp
#include <svdpi.h>
#include <verilated.h>

extern "C" int faultInjection(int id, svBit trigger, const int verilogInput) {
    static int out;
    switch(id) {
    case 0:
        if(VL_TIME_Q() >= 50 & VL_TIME_Q() <= 70) {
            return 0;
        } else {
            return x;
        }

    case 1:
        if(VL_TIME_Q() >= 10 & VL_TIME_Q() <= 50) {
            return 1;
        } else {
            return x;
        }
    default:
        return x;
    }
}
```

The `verilated.h` header is included to access simulation time (`VL_TIME_Q()`), which is needed to enable time-dependent faults.

Run Verilator with the `--timing` and `--insert-hook` flags to enable the _hook-insertion_ and _hook_ trigger (mentioned earlier). Exemplary build and run commands coud look like this:
```sh
verilator --exe --build --trace -cc --timing --insert-hook \
--top-module tb_counter \
tb_counter.v counter.v \
verilator.vlt \
sim_main.cpp fault_models.cpp

./obj_dir/Vtbcounter
```
We also added the `--trace` flag to enable waveform tracing.

Executing the above mentioned build an run commands will lead in our example to the following waveform output:
![Waveform](assets/faulty-output-counter.png)
Here we can see the that all counters are counting on the positive edge of the clock and remain at their initial value while the reset is active.
The only counter which is behaving differently is `counter1`, which is the counter represented by instance uut1 and the one we targeted with the _hook-insertion_.
As expected the fault propagets to the counter output during the time points _10_ and _50_ with the value at _1_.

### Current Limitations
Even though this example shows the functionality of the extension, it is important to note that currently there are limitations of the extension.  
The first limitation we want to address that currently there is no way to _insert-hooks_ to the top module of a design.  
Also the signals targeted for the _hook-insertion_ need to fulfill two conditions. With the conditions being:
- the signal must be of the type implicit or literal
- the singal must not have a range greater than 64 bits

Even tough there currently are these limitation, which we are looking forward to resolve in the future, this is in our opinion a very nice approach to provide the possibility for fault injection, while not adding a feature to Verilator which is only bound to one specific use case.

Currently there exists a draft pull request on the Verilator project to add this extension to the Verilator source code, which can be found [here](https://github.com/verilator/verilator/pull/6518).