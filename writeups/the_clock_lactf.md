title: the-clock — write-up subtitle: "Diffie-Hellman on Clock Groups & Pohlig-Hellman Attack" date: 2026-02-17T09:05:00Z tags: ["cryptography", "discrete-log", "pohlig-hellman", "clock-group", "python"] featured: true mood: "analytical"
## The Clock — Write-Up

### Goal
The objective of this challenge is to recover the shared secret key of a Diffie-Hellman protocol implemented over a "clock group" to decrypt an AES-ECB protected flag.

---

### 1. Mathematical Analysis
The challenge defines a group operation on points \((x, y)\) as follows:

\[
(x_1, y_1) * (x_2, y_2) = \big((x_1 y_2 + y_1 x_2), (y_1 y_2 - x_1 x_2)\big) \mod p
\]

#### Key Properties:
- **Circle Equation**: Each point satisfies \(x^2 + y^2 \equiv 1 \pmod{p}\).
- **Group Order**: The order of the group is \(|G| = p + 1\).
- **Identity**: The neutral element is \((0, 1)\).

---

### 2. Retrieving the Modulus \(p\)
The modulus \(p\) is not explicitly provided. However, since every point satisfies \(x^2 + y^2 - 1 \equiv 0 \pmod{p}\), \(p\) can be recovered by calculating the Greatest Common Divisor (GCD) of this equation applied to several known points (\(G, A, B\)).

---

### 3. Attack Strategy
The protocol follows a standard Diffie-Hellman scheme (\(A = G^a, B = G^b\)). To solve the challenge, we must compute the private exponent \(a\) by solving the Discrete Logarithm Problem (DLP).

#### Exploiting Weakness:
- The security relies on the hardness of the DLP.
- Here, \(p + 1\) is highly factorable (a "smooth" number composed of small prime factors).

#### Algorithm:
- **Pohlig-Hellman Attack**: Leverages the smoothness of \(p + 1\) to solve the DLP in smaller subgroups.
- **Baby-Step Giant-Step (BSGS)**: Efficiently computes the discrete logarithm within each subgroup.
- **Chinese Remainder Theorem (CRT)**: Combines the partial results to reconstruct the final secret \(a\).

---

### 4. Decryption
Once \(a\) is recovered, the shared secret is computed as:

\[
\text{Shared} = B^a
\]

The AES key is derived using an MD5 hash of the shared point's coordinates:

```python
from hashlib import md5
from Crypto.Cipher import AES

key = md5(f"{shared[0]},{shared[1]}".encode()).digest()
cipher = AES.new(key, AES.MODE_ECB)
# Decrypt and unpad...
```

Running the solver yields the final flag.

---

### 5. Notes & Tips
- **Pohlig-Hellman**: Always verify if the group order (\(p + 1\) or \(p - 1\)) is smooth. If it is, the DLP is effectively broken regardless of the key size.
- **Fast Powering**: Use the double-and-add (square-and-multiply) algorithm for efficient exponentiation in this group.
- **AES-ECB**: Deriving a key using MD5 on raw coordinate strings is a weak cryptographic practice.

---

### Flag
The final flag is:

```
lactf{t1m3_c0m3s_f4r_u_4all}
```

By **N3akz**
