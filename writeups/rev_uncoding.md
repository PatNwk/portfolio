# Uncoding

- Category: `rev`
- Flag: `HTB{0n3_t1m3_p4d_tw0_t1m3_p4d_thr33_t1m3_p4d...}`

## Challenge summary

The binary presented a set of messages, some of which were available through the normal user flow and one of which was apparently protected or hidden. The challenge was to determine whether that hidden message was truly inaccessible or simply obscured at the application layer.

As it turned out, the protection was weak: the message was still present inside the binary and the decryption routine was simple enough to reproduce offline.

## Static analysis

The key function was `decrypt_message`, which performed a byte-wise XOR against a repeating 16-byte key.

That immediately simplifies the challenge because XOR-based protection has two very useful properties:

- it is easy to reverse once the key is known,
- it leaves the encrypted data in the binary in a recoverable form.

The program might prevent users from selecting the hidden entry, but that does not matter if the data is still stored locally.

## Data recovery

The solve path was:

1. inspect the binary’s data section,
2. identify the message table,
3. locate the repeating key used by `decrypt_message`,
4. apply the same XOR routine outside the binary,
5. decode every entry, including the hidden one.

The hidden entry was still sitting in the table and simply was not exposed through the normal interface.

## Why the challenge works

This is a classic reverse-engineering lesson: application restrictions are not meaningful protection if the sensitive data is still bundled in the executable. Once the attacker can read the binary and understand the transform, hidden content becomes accessible.

## Recovered flag

The hidden message at index `3` decrypted to:

```text
HTB{0n3_t1m3_p4d_tw0_t1m3_p4d_thr33_t1m3_p4d...}
```

## Takeaway

The challenge plays on the idea of “locked memories,” but the binary never truly removed the secret. It only hid it behind an easily reversible encoding layer.
