---
title: "HACKDAY – The Roughness of Vigenère"
subtitle: "Measure of Roughness → Key Length Recovery → Frequency Analysis"
date: 2026-01-31
tags: ["crypto", "vigenere", "classical-cipher", "writeup"]
difficulty: "easy"
---

# HACKDAY – The Roughness of Vigenère

In this crypto challenge, the objective was to **recover the secret key** used to encrypt a plaintext with a **Vigenère cipher**. 

The only information provided was the **ciphertext** and a crucial hint:

> *The key is huge.*

The author claimed that a sufficiently long Vigenère key would be unbreakable.  
Our mission? **Prove them wrong.**

---

## Challenge Information

- **Ciphertext File**: `mr_cipher.txt`
- **Hash**:  
    `sha256 = be874b902796b2b9bf8218b582ebc1994622044b6106bd14176d8276f3f7b1dd`
- **Flag Format**:  
    `HACKDAY{sha256(key)}`

---

## 1 – Why Key Length Matters

A classical frequency analysis on a Vigenère cipher **only works if the key length is known**. 

Given the large ciphertext, statistical attacks are feasible — but first, we must determine the **key length**. This is achieved using the **Measure of Roughness (MR)** technique.

---

## 2 – Measure of Roughness (MR)

The **Measure of Roughness** helps identify the key length by analyzing statistical deviations in the ciphertext.

### 2.1 – Relative Frequency per Group

For each subgroup `i` and letter `j`, the relative frequency is calculated as:

\[
P_{i,j} = \frac{f_{i,j}}{N_i}
\]

Where:
- \( f_{i,j} \): Frequency of letter `j` in group `i`
- \( N_i \): Size of subgroup `i`

---

### 2.2 – Measure of Roughness for a Group

For each subgroup `i`, the roughness is computed as:

\[
MR_i = \sum_{j=0}^{n-1} (P_{i,j} - G_j)^2
\]

Where:
- \( G_j \): **Global frequency** of letter `j` in the ciphertext

---

### 2.3 – Mean Measure of Roughness

For a given key length `L`, the final score is:

\[
Score(L) = \frac{1}{L} \sum_{i=0}^{L-1} MR_i
\]

The key length with the **highest score** is the most likely one.

---

## 3 – Finding the Key Length

The Measure of Roughness was computed for key sizes up to **700**:

```bash
python3 mr_solv.py mr_cipher.txt
```

**Result**:  
- Max MR = 0.036362  
- Key length = 372  

If the maximum tested length had been 100, the highest peak would have been \( 2 \times 372 = 744 \), further confirming the result.

**Key length identified**: 372

---

## 4 – Recovering the Key

Once the key length is known, the ciphertext can be split into 372 subgroups. Each subgroup corresponds to a Caesar cipher, allowing classical frequency analysis to recover the key.

```bash
python3 solv_key.py
```

**Recovered Key** (length = 372):  
`FGWUIREUYSTZQGHCMILKIPJUYVMEHLRQDKXBOXUDPCTUGAYDDWCDLTKRVJXCQZVVCXGEXIKUORLSGAOHBDSWYYPWGXFGEFTUHJBLWZJDUOSLXERJOBOFJRACQTPEJBQLDFJPJDJTRZMYDRTTMXJOPYLVJYTJKYDJTMYNYMOJAHMQFLILUOFRNWRPCVXHAUEGJNCHNBFPYHGNRLBISOQPUBUEBLPTFSBUOTTEJWWGIWJORTTUOZXOHAJDNPSFUFRESFYVFMXUTPUNYZNSFSUHADZUTIRIGHBCPLQMIDCJNNXFFCXPKGGNGWKYIFOXVZRFYZKDAYGNKSGHACNLERHSFRYXUZQISJJFUPYPKRZADOLNZOTJBXNM`

---

## 5 – Computing the Flag

The flag is the SHA-256 hash of the recovered key, in uppercase.

```bash
echo -n 'FGWUIREUYSTZQGHCMILKIPJUYVMEHLRQDKXBOXUDPCTUGAYDDWCDLTKRVJXCQZVVCXGEXIKUORLSGAOHBDSWYYPWGXFGEFTUHJBLWZJDUOSLXERJOBOFJRACQTPEJBQLDFJPJDJTRZMYDRTTMXJOPYLVJYTJKYDJTMYNYMOJAHMQFLILUOFRNWRPCVXHAUEGJNCHNBFPYHGNRLBISOQPUBUEBLPTFSBUOTTEJWWGIWJORTTUOZXOHAJDNPSFUFRESFYVFMXUTPUNYZNSFSUHADZUTIRIGHBCPLQMIDCJNNXFFCXPKGGNGWKYIFOXVZRFYZKDAYGNKSGHACNLERHSFRYXUZQISJJFUPYPKRZADOLNZOTJBXNM' | sha256sum
```

**Output**:  
`a3ee1f2b7797cc2aa80a610155868523f6c0202eae82d7e048281891b88d8ff4`

---

## 6 – Final Flag

The final flag is:

```
HACKDAY{a3ee1f2b7797cc2aa80a610155868523f6c0202eae82d7e048281891b88d8ff4}
```