# Faulty Machine

- Category: `crypto`
- Flag: `HTB{1t_m34n5_th4t-th15_d4mn_th1ng_d035nt-w0rk_4t_4ll!!}`

## Challenge summary

This challenge presented an RSA setup that looked almost normal at first glance, except for one extremely suspicious parameter:

```text
e = 88
```

That immediately suggests something is wrong, because RSA requires the public exponent to be invertible modulo `phi(n)`. The challenge title was also a hint: the “machine” was faulty because the cryptosystem had been configured in a fundamentally broken way.

## The core issue

In standard RSA, decryption relies on computing:

```text
d = e^{-1} mod phi(n)
```

That only exists when:

```text
gcd(e, phi(n)) = 1
```

Here, after using the provided `p` and `q`, we get:

```text
gcd(88, (p - 1)(q - 1)) = 8
```

So `e` is not invertible. That means the RSA map is not a permutation anymore. Instead of every ciphertext corresponding to a unique plaintext, multiple plaintexts can map to the same ciphertext.

## Why normal RSA decryption fails

If `e` and `phi(n)` are not coprime:

- there is no unique private exponent in the usual sense,
- modular exponentiation by `e` is not bijective,
- decrypting becomes a root-finding problem instead of a simple inverse exponentiation.

So the task becomes: find all possible plaintexts `m` such that:

```text
m^88 = c mod n
```

## Exploitation idea

Because `88 = 8 * 11`, the solve can be broken into manageable pieces.

Using the known prime factorization:

1. work modulo `p`,
2. work modulo `q`,
3. reduce the `11`-power part where possible,
4. enumerate the possible 8th roots in each prime field,
5. combine the candidates with the Chinese Remainder Theorem,
6. identify the valid plaintext by its flag structure.

## Why enumeration works

Since the non-invertibility factor was small enough, the number of candidate roots was still manageable. Instead of trying to force RSA to behave normally, the solve embraced the fact that there would be multiple candidates and simply reconstructed all plausible preimages.

Once those candidates were recombined modulo `n`, only one of them looked like a valid HTB flag.

## Result

The unique flag-shaped plaintext was:

```text
HTB{1t_m34n5_th4t-th15_d4mn_th1ng_d035nt-w0rk_4t_4ll!!}
```

## Takeaway

This challenge is a good illustration of a subtle but devastating RSA failure mode. If the public exponent is not coprime with `phi(n)`, RSA stops being the one-to-one trapdoor permutation it is supposed to be, and the entire system breaks in a structurally interesting way.
