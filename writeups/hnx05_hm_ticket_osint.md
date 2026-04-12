title: h&m ticket osint
— write-up subtitle: "Recovering a Product Identity from a Receipt, Historic Review Metadata, and Supplier Disclosure"
date: 2026-04-12T00:00:00Z
tags: ["osint", "web", "retail", "metadata", "investigation"]
featured: true
mood: "investigative"

h&m ticket osint — write-up

# Goal

The objective is to recover the product referenced on a receipt, identify the exact colour and size from a specific historical review dated **17 October 2020**, and then determine the country of the material suppliers associated with that product.

The final flag format is:

```text
HNx05{PaysCouleurTaille}
```

---

## Challenge Analysis

The statement gives three important constraints:

- We must start from a purchase ticket.
- We must use the **review from 17 October 2020**, not the current purchase variant.
- We must recover the **supplier country** for that same product.

This means the challenge is not just about reading the receipt. The receipt only provides the initial pivot.

The intended path is:

1. Extract the product reference from the ticket.
2. Find the corresponding H&M product page.
3. Locate the review from **17 October 2020**.
4. Keep the **colour** and **size** mentioned in that review.
5. Open the supplier information panel for that product.
6. Recover the supplier country.

So the challenge is essentially a small OSINT chain using product metadata and archived review context.

---

## Artifact Analysis

The receipt provides the critical starting point.

The useful line is:

```text
0795243032    M    Marron Foncé
```

From this, we immediately obtain:

- the article reference: `0795243032`
- the purchased colour: `Marron Foncé`

However, this is also the trap in the challenge.

The statement explicitly says that the colour and size to keep are **the ones from the review dated 17 October 2020**, not the ones from the receipt itself.

So `Marron Foncé` is only useful as a lookup pivot, not as a final answer component.

---

## Finding the Product Page

Using the article number `0795243032`, we can identify the product on the H&M website.

From the product family and variant data, the product corresponds to:

```text
Slim Fit Waffled jersey top
```

At this stage, the reference confirms we are on the correct product page and can now inspect the reviews.

---

## Recovering the Correct Review Metadata

Among the product reviews, the important one is the review dated:

```text
17 oct. 2020
```

That review contains the exact information required by the statement:

```text
Blanc    S
```

So the values to retain are:

- colour: `Blanc`
- size: `S`

This is the key reasoning step in the challenge: the receipt points to one variant, but the flag must be built from the historical review metadata instead.

---

## Recovering the Supplier Country

The next step is to inspect the supplier information panel for the same product.

Opening **Informations sur le fournisseur** reveals the supplier entries and their country. The visible supplier records are listed under:

```text
BANGLADESH
```

Examples shown on the page include:

- `MEGHNA KNIT COMPOSITE LTD`
- `SAIHAM KNIT COMPOSITE LTD.`

Both are listed under the same country heading, which gives the supplier country we need:

$$\texttt{Bangladesh}$$

---

## Flag Construction

We now have all three required values:

- country: `Bangladesh`
- colour: `Blanc`
- size: `S`

Applying the requested format:

```text
HNx05{BangladeshBlancS}
```

---

## Reproducible Method

```text
1. Read the receipt and extract the article number: 0795243032
2. Search the article number on H&M
3. Open the product page
4. Locate the review dated 17 October 2020
5. Extract the review metadata: Blanc / S
6. Open the supplier information modal
7. Recover the supplier country: Bangladesh
8. Build the flag: HNx05{BangladeshBlancS}
```

---

## Summary

| **Step** | **Recovered Data** |
|--------------------------|---------------------------|
| Receipt lookup | `0795243032` |
| Product identification | `Slim Fit Waffled jersey top` |
| Historical review | `17 October 2020` |
| Review colour | `Blanc` |
| Review size | `S` |
| Supplier country | `Bangladesh` |
| Final flag | `HNx05{BangladeshBlancS}` |

By **N3akz**
