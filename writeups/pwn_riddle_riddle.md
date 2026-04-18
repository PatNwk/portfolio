# Riddle

- Category: `pwn`
- Difficulty: easy
- Flag: `HTB{1nt3g3R_0v3rfl0w_101}`

## Challenge summary

The challenge presented a very small interactive binary wrapped as a “riddle.” The prompt strongly hinted that the intended bug had something to do with arithmetic rather than with memory corruption. After a quick look at the behavior, the key question became: can we make the program accept two valid-looking numbers but still push its logic into an unexpected branch?

That is exactly what happens.

## Initial observation

The binary reads two integers from standard input and appears to enforce only a basic sanity check:

- each number must be non-negative

After that, it adds them together and decides whether the result should trigger the success path.

At first glance this sounds pointless, because two non-negative integers should never add up to a negative result. But that statement is only true in normal mathematical arithmetic, not in fixed-width signed machine arithmetic.

## Root cause

The program performs the addition on signed 32-bit integers.

That means values are stored in the range:

```text
-2147483648 to 2147483647
```

If two large positive numbers are added together and the result exceeds `2147483647`, the sum wraps around in two’s complement representation and becomes negative.

So the developer’s logic was effectively:

1. reject negative inputs,
2. add the two inputs,
3. if the sum is negative, treat it as success.

That is a classic signed integer overflow bug.

## Exploitation strategy

To exploit this, we want:

- both input numbers to pass the non-negative check,
- their sum to overflow into a negative value.

The easiest choice is the largest possible signed 32-bit integer twice:

```text
2147483647
2147483647
```

In signed 32-bit arithmetic:

```text
2147483647 + 2147483647 = -2
```

This means the internal comparison sees a negative result even though both original values were accepted as valid.

## Working input

The interaction used was:

```text
1
2147483647
2147483647
```

The initial `1` was the menu selection that led to the vulnerable code path.

## Why it works

This succeeds because the program mixed:

- semantic validation done on the original inputs,
- security-sensitive logic done on the overflowed result.

That gap is exactly what integer overflow bugs exploit.

## Flag

```text
HTB{1nt3g3R_0v3rfl0w_101}
```

## Takeaway

Even the simplest arithmetic checks can become dangerous when developers assume machine integers behave like mathematical integers. This challenge was a very clean introduction to signed overflow in exploit development.
