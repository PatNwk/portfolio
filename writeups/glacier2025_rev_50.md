---
title: "GlacierCTF 2024 – Reverse / Rev50"
subtitle: "ELF Analysis → Fake Flags → Correct Index"
date: 2024-03-25T10:00:00Z
tags: ["reverse", "glacierctf", "elf", "strings", "writeup"]
featured: true
mood: "focus"
---

We are given a single **ELF 64-bit binary** named `challenge`.

When executed, the program prompts the user:

```text
Enter flag:
```

It then replies with:

- **Correct** if the input is valid.
- **Incorrect** otherwise.

No hints are provided. This is a classic introductory reverse engineering challenge.

---

## 1 – Initial Analysis

Before diving into disassembly, the first step is to inspect the binary strings:

```bash
strings challenge | grep gctf
```

The result is immediately suspicious. Dozens of strings matching the expected flag format appear:

```text
gctf{318259a6_w3lc0m3_t0_r3v_e8187d73}
gctf{49a12f66_w3lc0m3_t0_r3v_d4457a83}
gctf{ad2a0048_w3lc0m3_t0_r3v_61a80da6}
...
```

This strongly suggests the presence of a **fake flag array**. The real flag is one of these values, but only a single one is actually checked by the program.

---

## 2 – Understanding the Logic

This type of challenge typically follows a simple strategy:

1. Store multiple fake flags in a table.
2. Select a single entry using a fixed index.
3. Compare user input against that value.
4. Print **Correct** or **Incorrect**.

The key question is: **Which index is used by the program?**

---

## 3 – Reverse Engineering the Binary

We proceed with static analysis:

```bash
objdump -d challenge
```

From the disassembly, the program's flow becomes clear:

1. The program prints "Enter flag:".
2. It reads input using `fgets`.
3. It loads a pointer from a constant table in `.rodata`.
4. It compares the input using `strcmp`.
5. It prints the result.

In simplified pseudo-code, the core logic looks like this:

```c
char *flags[] = { "...", "...", "...", ... };

int index = CONSTANT_VALUE;

if (strcmp(user_input, flags[index]) == 0) {
    puts("Correct");
} else {
    puts("Incorrect");
}
```

The index is not computed dynamically; it is loaded as a constant directly in the code. By examining the instructions before the `strcmp` call, we can identify the offset in the table used. That offset corresponds to the real flag.

---

## 4 – Extracting the Correct Flag

There are two straightforward ways to solve this:

### Method 1 – Static Reverse
Identify the index in the assembly (e.g., via a `mov` instruction loading a constant) and extract the corresponding string from the table.

### Method 2 – Brute Force
Since the number of fake flags is limited, automate the process:

1. Iterate over all candidate flags.
2. Feed each one to the binary.
3. Check which input produces **Correct**.

This approach works even without deep assembly knowledge.

---

## 5 – Final Result

After identifying the correct index (or brute-forcing the candidates), only one flag is accepted:

```text
gctf{bd88c4d4_w3lc0m3_t0_r3v_574dc8aa}
```

---

## 6 – Takeaways

This challenge is an excellent introduction to reverse engineering. Key lessons include:

- **Strings analysis** can reveal critical information.
- **Fake flag arrays** are a common beginner trap.
- Understanding `.rodata` and constant tables is essential.
- `strcmp` checks are easy to recognize in disassembly.
- **Brute force** is a valid technique when the search space is small.

In reverse engineering, understanding the control flow matters more than reading every instruction.

---

Write-up by N3akz