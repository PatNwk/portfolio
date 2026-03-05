title: six seven again 
— write-up subtitle: "RSA Factorization with Structured Primes via Coppersmith's Attack" 
date: 2026-02-17T09:30:00Z 
tags: ["cryptography", "RSA", "coppersmith", "sagemath", "factorization"] 
featured: true mood: "analytical"
six seven again — write-up

# Goal

The objective is to factorize a large RSA modulus $n$ provided by the challenge service to decrypt a ciphertext $c$. The vulnerability lies in the highly structured nature of one of the prime factors ($p$), which allows for a partial-key exposure attack.

---

## Code Analysis

The source code `chall.py` reveals that the prime $p$ is generated using a very specific pattern of digits:

- **First 67 digits**: All "6"s.  
- **Middle 67 digits**: A random mix of "6"s and "7"s.  
- **Last 67 digits**: All "7"s.  

Mathematically, $p$ can be represented as:  
$$p = A \cdot 10^{134} + x \cdot 10^{67} + B$$  
Where $A$ and $B$ are the known sequences of 6s and 7s, and $x < 10^{67}$ is the unknown middle part.

---

## Vulnerability: Coppersmith's Attack

RSA security depends on primes being entirely random. In this case, over 66% of the digits of $p$ are known (the MSB and LSB).  

Because $p$ is a factor of $n$ ($p \mid n$), we can define a polynomial:  
$$f(x) = A \cdot 10^{134} + x \cdot 10^{67} + B \equiv 0 \pmod n$$  

Since the unknown $x$ is relatively small ($x < 10^{67}$ and $x < n^{0.25}$), Coppersmith's theorem can find this small root efficiently.

---

## Reproducible Script (SageMath)

To use SageMath's `small_roots()` function, the polynomial must be monic (the leading coefficient must be 1). This is achieved by multiplying the entire polynomial by the inverse of $10^{67}$ modulo $n`.

```python
# solve.sage
# Modulus and ciphertext provided by the challenge
n = 1855747521290803529974710045825011747036000231545865530180574282518464714751602670132337826800276897021777060312304304646978656263930949494034065810402030742642647442095920479156687243701377136824533578230491696633951411509491781906626966459032923807908932123804497319601281142949485531669041216847016555213264074536991556653577613542623809204249506709860061625352602334054379258051064141947329201890753
c = 153930862577494919459202576843936390007313216601195762171263521891635911266039836002625516336548866707320125971897027028813037049184824199380023975477118885055790049615199963452899324919204190950684297414035636083979449253633666694015005670027574067184771817005624852069010727776739238332667444011688266341157831937736856654758282517045264841733324996319532583331502095249286319840607666520960325830720
e = 65537

# Known parts
A = Integer(int("6"*67))
B = Integer(int("7"*67))
BASE1 = Integer(10)^134
BASE2 = Integer(10)^67

# Polynomial ring
PR.<x> = PolynomialRing(Zmod(n))
f = A*BASE1 + x*BASE2 + B

# Make monic
invBASE2 = inverse_mod(BASE2, n)
g = f * invBASE2

# Bound
X = Integer(10)^67

print("[*] Running Coppersmith...")
roots = g.small_roots(X=X, beta=0.4)

if roots:
    x0 = Integer(roots[0])
    # Recover p
    p = A*BASE1 + x0*BASE2 + B
    q = n // p
    
    # RSA
    phi = (p-1)*(q-1)
    d = inverse_mod(e, phi)
    m = power_mod(c, d, n)
    
    flag = Integer(m).to_bytes((m.nbits()+7)//8, "big")
    print(flag.decode())
else:
    print("No root found")
```

---

## Vulnerability Summary

| **Problem**            | **Impact**       |
|-------------------------|------------------|
| Structured Prime        | Critical         |
| Known MSB/LSB           | Critical         |
| RSA without OAEP        | Severe           |

**Flag**: `lactf{n_h4s_1337_b1ts_b3c4us3_667+670=1337}`  
By **N3akz**
