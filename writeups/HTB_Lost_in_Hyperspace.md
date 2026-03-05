---
title: Lost in Hyperspace — write-up
subtitle: "High-dimensional embeddings → projection reveal"
date: 2025-11-11T12:50:00Z
tags: ["ml","forensics","embeddings","pca","visualization"]
featured: false
mood: "analytical"
---

# Lost in Hyperspace

**Goal.**  
The challenge hides a flag inside a set of token embeddings: each character is represented as a 512-dimensional vector. The task is to project that high-dimensional space to 2D and visually inspect the result to recover the flag.

---

## 1 — Files & reconnaissance

The archive contains `token_embeddings.npz` (a NumPy archive). Inspecting it shows:

- `tokens`: array of ~110 one-character tokens (each token is a single letter).
- `embeddings`: matrix of shape (110, 512) — each token has a 512-dimensional embedding vector.

This confirms the flag is encoded by the spatial arrangement of character embeddings rather than stored as plain text.

---

## 2 — Approach

Projection of high-dimensional data to 2D is the natural way to reveal spatial patterns. I used a simple, robust pipeline:

1. Load embeddings with NumPy.
2. Standardize (center + scale) the vectors.
3. Apply PCA to extract the first two principal components.
4. Scatter the 2D points and annotate each point with its token.

PCA is appropriate here because it preserves the directions of largest variance and produced a clean, readable projection. t-SNE was tested but PCA was sufficient and clearer for this instance.

---

## 3 — Reproducible script

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

data = np.load("token_embeddings.npz", allow_pickle=True)
tokens = data["tokens"]         # array of single-character tokens
embeddings = data["embeddings"] # shape (n_tokens, 512)

# Standardize
scaler = StandardScaler()
embeddings_scaled = scaler.fit_transform(embeddings)

# PCA → 2D
pca = PCA(n_components=2)
embeddings_2d = pca.fit_transform(embeddings_scaled)

# Plot
plt.figure(figsize=(18, 12))
plt.scatter(embeddings_2d[:, 0], embeddings_2d[:, 1], s=8, alpha=0.4)
for i, token in enumerate(tokens):
    label = token.decode() if isinstance(token, (bytes, bytearray)) else str(token)
    x, y = embeddings_2d[i]
    plt.text(x, y, label, fontsize=10, ha='center', va='center')
plt.title("PCA projection of token embeddings")
plt.axis('equal')
plt.grid(True)
plt.tight_layout()
plt.show()


## 4 — Result

The 2D scatter with annotated tokens clearly forms readable shapes: the letters are arranged to draw the flag text. Viewing the plotted tokens reveals the flag string laid out spatially, readable by eye.


By N3akz
