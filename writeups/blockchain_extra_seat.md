# Extra Seat

- Category: `blockchain`
- Flag: `HTB{smuggl3d_1nt0_th3_st4rl1ner_w3lc0m3_ab0ard_Astro}`

## Challenge summary

The challenge revolved around a boarding system for a fictional starliner. Seats were reserved and boarding passes were digitally approved. The goal was to board one additional passenger even though all approved seats were supposedly already accounted for.

The core bug was a classic Solidity mistake: using `abi.encodePacked` with multiple dynamic values in a way that made distinct logical inputs collide.

## Root cause

The contract built a checksum or approval digest from values equivalent to:

- `name`
- `seat`
- `destination`

Because `name` and `seat` were dynamic strings and were packed together with `abi.encodePacked`, different splits of the same byte sequence could produce the same packed encoding.

For example, these two tuples lead to the same packed string portion:

```text
("Captain Orion", "1A")
("Captain Orio", "n1A")
```

Both collapse to:

```text
"Captain Orion1A"
```

before the destination value is appended.

## Why that matters

If the contract validates boarding passes by comparing a checksum over packed fields, then a checksum issued for one tuple can be reused for another tuple that packs to the same bytes.

That means approval can be transferred from one passenger description to another without forging the signature in the cryptographic sense.

## Exploit path

The valid approved VIP boarding pass was:

```text
("Captain Orion", "1A", Mars)
```

The forged pass used:

```text
("Captain Orio", "n1A", Mars)
```

This preserved the exact same packed byte representation, so the approval remained valid.

## Bypassing the boarded-passenger check

The contract also tracked whether a passenger had already boarded by indexing into a structure using the raw `name`.

That is where the exploit becomes especially clean:

- the checksum saw the forged pass as equivalent to the approved one,
- the “already boarded” logic saw `"Captain Orio"` as a completely new passenger.

So the contract accepted a second boarding action based on the same effective approval.

## Final impact

The forged boarding increased `totalPassengers` from `5` to `6`, which was the condition needed to unlock the flag.

## Flag

```text
HTB{smuggl3d_1nt0_th3_st4rl1ner_w3lc0m3_ab0ard_Astro}
```

## Takeaway

This is a textbook example of why `abi.encodePacked` must be used carefully with multiple dynamic fields. If logical field boundaries are not preserved, approval systems can become collision-prone even when the cryptography itself is sound.
