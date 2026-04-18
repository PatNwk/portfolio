# ThreeKeys

- Category: `rev`
- Flag: `HTB{l3t_th3_hun7_b3g1n!}`

## Challenge summary

This challenge provided three AES keys and three decryption-related functions, but intentionally made the naming misleading. The real task was not heavy cryptanalysis; it was understanding that the presented labels were designed to trick anyone who assumed the code was semantically honest.

## First observation

The binary referenced three different keys and applied AES decryption in multiple stages. The obvious assumption would be that:

- `the_first_key` uses `KEY1`
- `the_second_key` uses `KEY2`
- `the_third_key` uses `KEY3`

But reversing showed that the mapping had been shuffled.

The actual relationship was:

- `the_third_key` actually used `KEY1`
- `the_second_key` used `KEY2`
- `the_first_key` used `KEY3`

## Solving approach

Because only three layers were involved, there were just six possible key orders. That made brute force the cleanest solution.

The approach was:

1. extract the ciphertext,
2. recover the three AES keys from the binary,
3. test all six decryption orders,
4. check which resulting plaintext looked valid.

## Correct order

The only order that yielded a valid HTB flag was:

```text
KEY3 -> KEY2 -> KEY1
```

That is exactly the reverse of what a careless reader might infer from the misleading function names.

## Why this challenge is nice

The difficulty is not in AES itself. The interesting part is recognizing that reverse engineering is often about separating:

- names and comments, which may lie,
- actual behavior, which does not.

## Flag

```text
HTB{l3t_th3_hun7_b3g1n!}
```

## Takeaway

When solving reversing challenges, trust data flow more than symbol names. The fastest path is often to verify what is really used rather than what the author claims is used.
