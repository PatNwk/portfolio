# Cubic

- Category: `misc`
- Flag: `HTB{7H1rd_0rD3r_21b1e1d5f14266efdb542c85382c4f03}`

## Challenge summary

The challenge revolved around solving third-degree polynomial equations and returning all three roots in the format expected by the server. At first this sounds like a straightforward implementation of Cardano’s formula, but the tricky part was that some test cases were large enough or awkward enough to make a naive floating-point implementation unreliable.

The real challenge was not simply “solve a cubic,” but “solve it robustly enough that your output survives checker precision requirements.”

## Problem with the naive approach

For cubic equations, many people reach immediately for a closed-form floating-point implementation. That works for some cases, but it can fail in CTF environments because:

- floating-point rounding can slightly perturb a real root,
- a root that should be an exact integer may come out as `2.9999999997`,
- the quadratic factor after division can become inaccurate,
- formatting complex roots can drift just enough to fail strict checking.

That meant a purely numeric approach was too fragile.

## Better strategy

A much more reliable approach was:

1. normalize the cubic into monic form,
2. analyze the derivative to find monotonic intervals,
3. search those intervals for an integer real root,
4. factor the cubic by dividing by `(x - r)`,
5. solve the remaining quadratic exactly,
6. sort and format the three roots as required.

This works particularly well when at least one root is integral, which was the key observation for the provided challenge instances.

## Solving the real root

Rather than trusting floating-point Cardano output, the solve script searched for a real integer root by:

- computing critical points from the derivative,
- splitting the cubic into monotonic intervals,
- using interval logic and binary search to locate a real root safely.

Once that root was found exactly, the rest of the problem became much easier.

## Reducing to a quadratic

After finding an exact root `r`, the cubic can be factored as:

```text
(x - r)(x^2 + ax + b)
```

Now the remaining two roots come from a standard quadratic equation. This has two big advantages:

- it avoids the instability of full cubic closed-form computations,
- it makes exact or near-exact formatting much easier.

## Output formatting

The checker expected roots in a specific sorted textual form, including complex roots written like:

```text
a+bi
```

Handling the formatting carefully was as important as solving the math correctly. Even with the right roots, sloppy string formatting could easily fail the challenge.

## Why this solve path was reliable

This method avoided the most fragile part of the problem:

- no dependence on unstable floating-point branching inside Cardano,
- exact identification of one real root,
- simpler and more controlled handling of the remaining two roots.

That made it robust enough for the remote service.

## Flag

```text
HTB{7H1rd_0rD3r_21b1e1d5f14266efdb542c85382c4f03}
```

## Takeaway

When a challenge involves math with strict remote checking, the intended difficulty is often not the formula itself, but making the implementation numerically stable and formatting-safe.
