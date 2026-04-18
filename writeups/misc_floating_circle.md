# Floating Circle

- Category: `misc`
- Flag: `HTB{r0uNd1nG_fL0aTs_f0r_fUN!_1c7ce8ecd51adaa6d614eafbb6c45a5a}`

## Challenge summary

This challenge looked simple on paper: take a decimal number and output it in a specific rounded form. In practice, the interesting part was not the math itself, but the exact behavior expected by the remote checker.

The server clearly wanted a value rounded to one decimal place, but not every seemingly equivalent Python implementation behaved the same way against the backend.

## First attempts

A natural first solution for this kind of challenge is:

```python
print(round(float(input()), 1))
```

That is logically correct for many local situations. However, on the remote service this approach triggered an internal failure rather than returning a clean wrong answer.

That strongly suggested the checker or backend was doing something brittle with the returned value, most likely involving string formatting or strict parsing assumptions.

## Reliable solution

The version that passed consistently was:

```python
print(f"{float(input()):.1f}")
```

This does not just compute a rounded number internally. It explicitly formats the output as a fixed-point decimal with exactly one digit after the decimal point.

That distinction matters.

## Why formatting mattered

There are several reasons why `round()` and `:.1f` can behave differently in a challenge checker:

- `round()` returns a Python number, not a formatted string
- printing that number may produce `1.0`, `1`, or another representation depending on the case
- the backend may expect exactly one decimal place every time
- some float edge cases may interact poorly with their validation logic

By using:

```python
f"{value:.1f}"
```

we force a stable textual representation that matches what the service expects.

## Final solution

```python
print(f"{float(input()):.1f}")
```

## Flag

```text
HTB{r0uNd1nG_fL0aTs_f0r_fUN!_1c7ce8ecd51adaa6d614eafbb6c45a5a}
```

## Takeaway

This challenge is a good reminder that in CTF infrastructure, “numerically correct” is not always enough. Sometimes the real task is to produce the exact string representation the checker expects.
