---
title: nitwit – Cypto bctf2025
subtitle: "Winternitz gone sideways"
date: 2025-03-25T10:00:00Z
tags: ["crypto", "signature", "winternitz", "hash-chain", "wots"]
featured: true
mood: "focus"
---

![nitwit_banner.jpg](nitwit_banner.jpg)

This is a **crypto** challenge with a network service implementing a custom  
**Winternitz one-time signature** (WOTS).  

Goal: obtain a **valid signature** on a message that contains `admin`…  
even though the server never signs such a message for us.

The remote service:

ncat --ssl nitwit.challs.pwnoh.io 1337
Behavior:

The server generates a WOTS key pair (public key + secret key).

It shows us the public key.

It lets us choose a first message in hex (without admin), signs it, and returns the signature.

Then we must send a new message (this time including admin) + a supposedly valid signature.

If the signature verifies and the message contains admin → we get the flag.

In a correct WOTS scheme, having one valid signature should not allow forging another one for a different message.
Here, a subtle bug in the checksum breaks this property.

## 1. The Winternitz scheme used
Key parameters (simplified from the source):

v = 256           # irrelevant detail for the exploit
hash_size = 32    # SHA-256 output size
d = 15            # depth / base - 1 => base = 16
n0 = 64           # number of “message digits”
n1 = int(log(n0, d + 1)) + 1  # = 2 (checksum digits)
n  = n0 + n1      # = 66 total digits
Basic functions:

def get_hash(x): 
    return hashlib.sha256(x).digest()

def hash_chain(x: bytes, k: int) -> bytes:
    for _ in range(k):
        x = get_hash(x)
    return x
Message encoding with checksum:

def int_to_vec(m: int, vec_len: int, base: int) -> list[int]:
    digits = [0] * vec_len
    i = len(digits) - 1
    while m > 0:
        digits[i] = m % base
        m //= base
        i -= 1
    return digits

def domination_free_function(m: int) -> list[int]:
    m_vec = int_to_vec(m, n0, d + 1)   # 64 digits in base 16
    c = (d * n0) - sum(m_vec)          # checksum
    c_vec = int_to_vec(c, n1, d + 1)   # 2 digits in base 16
    return m_vec + c_vec               # vector s(m) of length 66
Key generation:

Secrets: xs[i] random (66 blocks).

Public key: ys[i] = hash_chain(xs[i], d) then a final hash of all ys.

Signing a message m:

s = domination_free_function(int(m))  # s[i] ∈ [0..15]
sig[i] = hash_chain(xs[i], s[i])
Verification for a message m':

s'   = domination_free_function(int(m'))
ys'[i] = hash_chain(sig[i], d - s'[i])
# if hash(ys') == pk -> signature is valid
Intuition: for each block i, s[i] tells how many times we hashed the secret x_i.
If we know H^{s[i]}(x_i), we can only move forward (more hashes), never backward.
The domination_free_function is designed so that for any two different messages,
you cannot have one message whose vector is component-wise bigger or equal to another.
That’s what’s supposed to prevent reusing a signature.

## 2. Where it breaks: checksum too short
Look at the checksum:

c = d * n0 - sum(m_vec)
# d = 15, n0 = 64 => c ∈ [0, 15 * 64] = [0, 960]
Then they encode c on 2 base-16 digits:

c_vec = int_to_vec(c, 2, 16)   # range representable: 0..255
Two issues:

With 2 hex digits, you can only represent 0..255, but c can go up to 960.

int_to_vec never checks if i becomes negative. In Python, negative indices wrap around from the end,
so it silently overwrites entries in a weird way.

Example with c = 960:

960 in hex is 0x3C0.

Simulating int_to_vec(960, 2, 16):

digits = [0, 0]
i = 1

1) digits[1] = 960 % 16 = 0   → digits = [0, 0], m = 60, i = 0
2) digits[0] = 60 % 16 = 12   → digits = [12, 0], m = 3,  i = -1
3) digits[-1] = 3 % 16 = 3    → digits[1] = 3,  m = 0
Final result: digits = [12, 3].

So 960 is encoded as [12, 3] (= `0xC3 = 195) → information loss.

Conclusion:

For many messages, the checksum c is effectively folded modulo 256.

The “domination-free” property is no longer guaranteed: we can find messages m_user and m_admin such that

∀ i,  s_admin[i] ≥ s_user[i]
Given a valid signature on m_user, we can then extend each chain of hashes
to forge a valid signature on m_admin.

## 3. Attack strategy
We want:

A simple m_user (without admin) that the server is willing to sign.

A crafted m_admin containing admin, such that:

s_user  = domination_free_function(int(m_user))
s_admin = domination_free_function(int(m_admin))

and  ∀i, s_admin[i] ≥ s_user[i]
If the server gives us a signature sig_user for m_user:

sig_user[i] = H^{s_user[i]}(x_i)
we can build a forged signature for m_admin:

delta_i      = s_admin[i] - s_user[i] ≥ 0
sig_admin[i] = hash_chain(sig_user[i], delta_i)
             = H^{s_admin[i]}(x_i)
So sig_admin is a valid signature for m_admin.
The server sees admin in the message, the verification passes → flag.

The hard part is choosing two messages such that s_admin dominates s_user.

## 4. Concrete message choices
4.1 User message (signed by the server)
Pick the simplest possible message:

m_user = b"\x00" * 32
m_user_hex = "00" * 32
It doesn’t contain admin → allowed.

In base 16, its digit vector m_vec_user is all zeros:

m_vec_user = [0] * 64
Then:

c_user = 15 * 64 - 0 = 960
c_vec_user = int_to_vec(960, 2, 16)  # gives [12, 3] due to the bug
s_user = [0, 0, ..., 0, 12, 3]       # 64 zeros + [12, 3]
4.2 Admin message (crafted)
We now want a message that:

Contains admin (ASCII hex: 61 64 6d 69 6e).

Has a vector s_admin with s_admin[i] ≥ s_user[i] for all i.

Example 32-byte hex:

m_admin_hex = "61646d696e000000000004ffffffffffffffffffffffffffffffffffffffffff"
m_admin = bytes.fromhex(m_admin_hex)
Idea:

Place 61 64 6d 69 6e at the beginning to literally have "admin".

Tune the remaining bytes so that the sum of digits in m_vec_admin makes the checksum c_admin satisfy:

c_admin = 960 - sum(m_vec_admin) = 255
Now 255 is perfectly representable on 2 base-16 digits:

c_vec_admin = int_to_vec(255, 2, 16)  # → [15, 15]
So:

For the first 64 digits (message part), m_vec_admin is ≥ the all-zero vector (trivial).

The last two digits go from [12, 3] to [15, 15] → increasing both checksum components.

Check locally:

s_user  = domination_free_function(int.from_bytes(m_user, "big"))
s_admin = domination_free_function(int.from_bytes(m_admin, "big"))

assert all(a <= b for a, b in zip(s_user, s_admin))
The assertion holds → s_admin[i] ≥ s_user[i] for all i.
We now have a pair of messages suitable for the chain-extension attack.

## 5. Exploit flow
Full plan:

Connect to the service.

Send m_user_hex (32 bytes of 0x00) and get back sig_user.

Recompute s_user and s_admin locally using the same functions.

For each block i, move forward in the hash chain:

forged[i] = hash_chain(sig_user[i], s_admin[i] - s_user[i])
Send m_admin_hex and the forged signature to the server.

Receive the flag.

## 6. Exploit script (condensed)

from pwn import *
import ast, hashlib, math

HOST, PORT = "nitwit.challs.pwnoh.io", 1337

v, hash_size, d = 256, 32, 15
n0 = 64
n1 = int(math.log(n0, d + 1)) + 1
n  = n0 + n1

def get_hash(x):
    return hashlib.sha256(x).digest()

def hash_chain(x, k):
    for _ in range(k):
        x = get_hash(x)
    return x

def int_to_vec(m, vec_len, base):
    digits = [0] * vec_len
    i = len(digits) - 1
    while m > 0:
        digits[i] = m % base
        m //= base
        i -= 1
    return digits

def domination_free_function(m):
    m_vec = int_to_vec(m, n0, d + 1)
    c = (d * n0) - sum(m_vec)
    c_vec = int_to_vec(c, n1, d + 1)
    return m_vec + c_vec

# 1) User message (signed by server)
m_user = b"\x00" * 32
m_user_hex = m_user.hex()

# 2) Crafted admin message
m_admin_hex = "61646d696e000000000004ffffffffffffffffffffffffffffffffffffffffff"
m_admin = bytes.fromhex(m_admin_hex)

# 3) Compute s_user and s_admin
s_user  = domination_free_function(int.from_bytes(m_user, "big"))
s_admin = domination_free_function(int.from_bytes(m_admin, "big"))

assert all(a <= b for a, b in zip(s_user, s_admin))

# 4) Talk to the service
io = remote(HOST, PORT, ssl=True)

io.recvuntil(b">>> ")
io.sendline(m_user_hex.encode())

io.recvuntil(b"Your signature is:\n")
sig = ast.literal_eval(io.recvline().strip().decode())

# 5) Forge signature for m_admin
forged = []
for su, sa, block in zip(s_user, s_admin, sig):
    forged.append(hash_chain(block, sa - su))

# 6) Send forged signature
io.recvuntil(b"Enter a new message to sign as a hex string:\n")
io.recvuntil(b">>> ")
io.sendline(m_admin_hex.encode())

io.recvuntil(b"Enter signature:\n")
io.recvuntil(b">>> ")
io.sendline(repr(forged).encode())

print(io.recvall().decode(errors="ignore"))
This prints the final server response, including the flag 

## 7. Takeaways
This challenge is a great example of how a tiny parameter bug can break an entire signature scheme:

The mapping function is meant to be “domination-free”…

…but encoding a checksum up to 960 into just 2 hex digits causes a modulo-like wraparound.

The bug in int_to_vec with negative indices makes it even worse.

Result: we can find two messages m_user and m_admin with s_admin ≥ s_user, and turn one valid signature into another.

Key lessons:

With hash-based signatures (like WOTS), the mapping from message to exponents must be carefully designed and dimensioned.

A small off-by-a-few-bits error in a checksum can completely destroy security.

Perfect warm-up for hash-based signatures and a good motivation to look deeper into more advanced post-quantum signature schemes. 💪

By N3akz
