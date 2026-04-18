# Logics & Business

- Category: `web`
- Flag: `HTB{FR0NT_4ND_B4CK_TH3_BU51N355_3Y3_D035_533#!#$}`

## Challenge summary

This challenge focused on business logic flaws in a banking-style application. The frontend presented one set of assumptions about what users were allowed to do, while the backend enforced a weaker and inconsistent set of rules. The objective was to discover the gap between those layers and use it to break the intended financial constraints.

This was not about classic SQL injection or command execution. It was about abusing the application’s own rules.

## Main issue

The most important flaw was that the backend still accepted negative amounts in sensitive flows, especially around the loan system, even though the frontend tried to prevent such values from being submitted.

In other words:

- the frontend looked restrictive,
- the backend was still logically exploitable.

That is exactly the kind of mismatch business-logic challenges are built around.

## Why frontend-only validation is weak

Any client-side restriction can be bypassed by:

- modifying requests in the browser,
- replaying API calls manually,
- scripting requests directly with custom payloads.

So if the backend does not independently enforce the true business rules, the frontend becomes little more than a suggestion.

## Exploitation path

The challenge hinged on abusing the loan flow and related amount handling. By sending crafted requests directly to the API, it remained possible to:

- submit negative values,
- manipulate balances or debt calculations in unintended ways,
- bypass limits that only existed in the frontend,
- continue exploiting inconsistent logic until the checker condition was met.

The important point is that the exploit was not a single bug in isolation. It was the combination of:

- negative amount handling,
- inconsistent loan validation,
- mismatched assumptions between UI and backend.

## Fixing the challenge properly

To satisfy the checker cleanly and leave the application in a coherent state, the logic had to be aligned across the whole stack:

- validate amounts on the backend,
- reject negative values where they make no business sense,
- enforce consistent loan ceilings,
- ensure derived operations cannot reintroduce the same flaw elsewhere.

This is what made the solve interesting: the bug existed at the level of business invariants, not just input parsing.

## Flag

```text
HTB{FR0NT_4ND_B4CK_TH3_BU51N355_3Y3_D035_533#!#$}
```

## Takeaway

This challenge is a strong reminder that secure application design is not just about technical filters. If the business rules are inconsistent across layers, attackers can often turn “valid features” into unintended exploit chains.
