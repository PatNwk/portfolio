---
title: Linearity — write-up
subtitle: "Recovering the flag from a low-entropy linear mask"
date: 2025-11-10T10:00:00Z
tags: ["crypto", "linearity", "xor", "writeup", "infobahn"]
featured: false
mood: "practical"
---

write up infobanhn linearity

## 1 — Problem statement 

a vector V = [v0, v1, v2, v3, v4]

a list C of integers (one per character of the secret FLAG)

the SHA-256 hex of the flag

The challenge generator used roughly the following code:

from random import randint
from hashlib import sha256
from secret import FLAG

V = [randint(0, 100) for i in range(5)]
M = [[V[i] * randint(0, 100) for i in range(5)] for i in range(5)]
C = [M[i // 5 % 5][i % 5] ^ ord(FLAG[i]) for i in range(len(FLAG))]

print(f"{V = }")
print(f"{C = }")
print(sha256(FLAG.encode()).digest().hex())


Example :

V = [14, 38, 56, 76, 51]

C = [1357, 2854, 1102, 1723, 4416, 283, 344, 4566, ... , 3825] (37 values)

SHA256(flag) = e256693b7b7d07e11f2f83f452f04969ea327261d56406d2d657da1066cefa17

Goal: recover FLAG.

## 2 — How encryption works (quick math)

For each matrix index (r,c) with r,c ∈ [0..4] the code builds M[r][c] = V[c] * k where k is an integer between 0 and 100. The ciphertext is produced per character:

C[i] = M[i // 5 % 5][i % 5] ^ ord(FLAG[i])


Important observations:

The matrix M has size 5×5 and the indexing used for C traverses columns first then rows (i.e. i % 5 picks column c, i // 5 % 5 picks row r), producing 25 unique mask values before repeating.

Each mask value used, call it m, is a multiple of one of the five V[c]: m = V[c] * k with k ∈ [0..100].

Because XOR is used: ord(FLAG[i]) = C[i] ^ m. If you can guess m, you can test candidate plaintext bytes.

In the given instance the flag length is 37: first 25 positions cover all 25 M entries once, then positions 25–36 repeat the first 12 entries (period = 25).

## 3 — Attack idea (practical)

We can brute-force each character independently but greatly reduce the search space by using the structure:

For position i:

Column index: c = i % 5 → we know V[c].

For any candidate plaintext character ch (from a reasonable alphabet), compute m_candidate = C[i] ^ ord(ch).

Accept ch only if m_candidate % V[c] == 0 and 0 <= m_candidate // V[c] <= 100 — i.e. m_candidate is a valid multiple of V[c] with quotient in the allowed range.

This filter removes almost all candidates. For indices that have a paired position later (i.e. i and i+25 when i+25 < len(C)), the same matrix cell must have produced the mask, so the m_candidate for both positions must be identical. That allows pairing: keep only pairs of characters for (i, i+25) that produce the same m. That further reduces possibilities to a tiny set per group.

Finally, when a small set of full strings remains, verify which one matches the provided SHA-256.

## 4 — Minimal solver (Python)

Below is a minimal solver that implements the above logic. It is directly reproducible.

import string, hashlib

V = [14, 38, 56, 76, 51]
C = [1357, 2854, 1102, 1723, 4416, 283, 344, 4566, 5023, 1798, 477, 3833, 1839, 5416, 4017, 1066, 161, 415, 5637, 1696, 1058, 3025, 5286, 5141, 3818, 1373, 2839, 1102, 1764, 4432, 313, 322, 4545, 5012, 1835, 477, 3825]
target = "e256693b7b7d07e11f2f83f452f04969ea327261d56406d2d657da1066cefa17"

alphabet = string.ascii_letters + string.digits + "{}_"
n = len(C)

# groups of positions that must share the same mask (i and i+25 when present)
groups = [[i] if i+25 >= n else [i, i+25] for i in range(25)]

def candidates(i):
    v = V[i % 5]
    out = []
    for ch in alphabet:
        x = ord(ch)
        m = C[i] ^ x
        if m % v == 0 and 0 <= m // v <= 100:
            out.append((x, m))
    return out

opts = []
for g in groups:
    if len(g) == 1:
        i = g[0]
        opts.append([([x], m) for x, m in candidates(i)])
    else:
        i, j = g
        Ci = candidates(i)
        Cj = candidates(j)
        by_m = {}
        for x, m in Cj:
            by_m.setdefault(m, []).append(x)
        pair = []
        for xi, mi in Ci:
            for xj in by_m.get(mi, []):
                pair.append(([xi, xj], mi))
        opts.append(pair)

res = ['?'] * n
ans = None

def dfs(p=0):
    global ans
    if p == len(opts):
        s = ''.join(res)
        if hashlib.sha256(s.encode()).hexdigest() == target:
            ans = s
        return
    for xs, m in opts[p]:
        for k, idx in enumerate(groups[p]):
            res[idx] = chr(xs[k])
        dfs(p+1)
        if ans: return

dfs()
print(ans)


Running this yields:

infobahn{You_HAVE_Aff1niTy_f0rCrypto}


and its SHA-256 matches the provided target.

## 5 — Full validation: reconstructing M and quotients

From the recovered flag we can recompute m = C[i] ^ ord(FLAG[i]) for the first 25 positions and fill the 5×5 matrix M. Dividing each column of M by the corresponding V[c] gives the integer quotients k (all in 0..100) used to generate the instance.

Example reconstructed M (rows shown):

[ [1316, 2888, 1064, 1748, 4386],
  [ 378,  304, 4536, 5092, 1887],
  [ 434, 3724, 1904, 5472, 4080],
  [1148,  228,  448, 5700, 1734],
  [1092, 3040, 5320, 5244, 3774] ]


Quotients R = M ⊘ V (per column) are integers within [0..100], confirming the expected structure and the analysis.

## 6 — Why this design fails

Two structural weaknesses make the challenge trivial:

Short periodicity (25): reusing the same small matrix over the whole flag creates strong cross-position constraints (pairs of indices must share the same mask).

Low-entropy masks: each mask is V[c] * k with k ∈ [0..100] and V[c] chosen from a small range — this produces masks with strong divisibility properties that eliminate most plaintext candidates.

Combined, these properties turn the decryption into a light filtering problem plus a small combinatorial search — easily solved with a DFS and a final SHA-256 check.

## 7 — Mitigations & lessons

If the goal is to produce a secure per-character mask, consider:

Avoid short periodic masks. Use per-byte randomness or a stream cipher (e.g. ChaCha20) with a sufficiently long period.

Avoid masks that are low-entropy or structured (multiples of a small known set). Use a PRNG/KDF to generate masks with full 8-bit entropy.

Use authenticated encryption (AEAD) instead of per-character XOR with predictable masks.

If you must reuse structure, ensure it cannot be exploited to filter the plaintext alphabet (i.e., masks should not expose simple mathematical invariants).

By N3akz
