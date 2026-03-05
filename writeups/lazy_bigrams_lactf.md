title: lazy-bigrams — write-up
subtitle: "Bigram Substitution & Double Phonetic Encoding"
date: 2026-02-17T09:15:00Z
tags: ["cryptography", "substitution", "dfs", "phonetic-encoding", "python"]
featured: true
mood: "practical"
lazy-bigrams — write-up

## Goal

The objective is to recover the original flag, which has undergone two layers of phonetic encoding (NATO-like alphabet) followed by a fixed, random bigram substitution.

---

## Mechanism Analysis

The encryption process follows this chain:

1. **Flag (lowercase letters)**  
2. **PT1**: Phonetic encoding of the flag (e.g., 'l' → 'LIMA').  
3. **PT2**: A second phonetic encoding applied to PT1.  
4. **CT**: PT2 is split into bigrams (2-letter pairs), and a random substitution is applied.

### Key Points:
- **Phonetic Mapping**: Public, deterministic, and reversible.  
- **Secret**: The fixed bigram substitution mapping used throughout the message.

---

## Attack Strategy

### Anchor Point:
The flag format (`lactf{...}`) provides a strong starting point for learning the bigram mapping.

### Key Observations:
1. **Consistent Substitution**: The mapping is bijective and fixed. For example, if "AB" → "QX", it will always hold.  
2. **Structure Stability**: Double encoding ensures predictable, large blocks in PT2 for each flag character.  
3. **Incremental Mapping**: Partial knowledge of the flag allows step-by-step construction of the plaintext_bigram ↔ cipher_bigram dictionary.

---

## DFS with Pruning

The flag is reconstructed character by character using Depth-First Search (DFS).

### Steps:
1. **Prefix Expansion**: Add a character to the prefix and calculate its PT2.  
2. **Constraint Check**: Validate new bigrams. If a conflict arises (e.g., a plaintext bigram already mapped differently), prune the branch.  
3. **Efficiency**: Each character generates ~20 bigrams. Over-constrained systems ensure incorrect branches are pruned quickly, reducing the search space significantly.

---

## Result

The DFS converges to the only valid flag:

**Flag**: `lactf{n0t_r34lly_4_b1gr4m_su8st1tu7ion_bu7_1_w1ll_tak3_1t_f0r_n0w}`

---

## Notes & Tips

- **Padding**: Handle odd-length padding ("X") at the end of the search to avoid corrupting mappings during DFS.  
- **Bijection**: Maintain two dictionaries (Clear → Cipher and Cipher → Clear) to ensure valid substitutions.  
- **Phonetic Expansion**: The large, predictable blocks from phonetic encoding provide constraints that weaken the cipher.

---

by N3akz
