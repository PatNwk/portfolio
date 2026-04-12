title: visual leak
— write-up subtitle: "Recovering an Exfiltrated Secret via RDP Cache Forensics and OpenSSL Payload Decryption"
date: 2026-04-12T00:00:00Z
tags: ["forensics", "pcap", "rdp", "incident-response", "openssl"]
featured: true
mood: "investigative"

visual leak — write-up

# Goal

The objective is to recover the secret exfiltrated by an attacker from a compromised administration server. We are given a noisy network capture, but the attacker intentionally polluted the traffic with random APIPA communications to make packet analysis impractical.

The key hint is that the attacker connected remotely and forgot to remove `master.key` from the `Documents` folder. This means the solution is not purely in the PCAP: we must also reconstruct what was visible on screen during the remote session.

---

## Challenge Analysis

The description gives three crucial clues:

- The network capture is intentionally flooded with fake traffic.
- The file `master.key` was left behind.
- The attack was performed through a remote session.

This strongly suggests a two-step approach:

1. Recover the real source IP from visual artifacts left by the remote desktop client.
2. Use that IP to filter the PCAP and decrypt the exfiltrated payload.

So instead of brute-forcing the traffic directly, the intended path is to pivot through RDP cache forensics.

---

## Artifact Analysis

After connecting to the provided container over SSH, the useful artifacts are:

- `master.key`
- the RDP client cache, especially `Cache0001.bin`

The most important file is `Cache0001.bin`. Remote Desktop clients store bitmap tiles from the session to improve rendering performance, and those tiles can leak fragments of what the attacker had on screen.

That is exactly what the challenge title and hint point toward: the network may lie, but the screen cache does not.

---

## Recovering the Attacker IP from the RDP Cache

The next step is to extract bitmap tiles from `Cache0001.bin`, discard uniform or empty tiles, and inspect the ones that contain visible text. Once reconstructed, the cache reveals fragments of a command prompt window.

Among the readable fragments, two commands clearly appear:

- `ipconfig`
- `ping`

Most importantly, one of the visible lines corresponds to the autoconfigured IPv4 address shown by `ipconfig`. From the reconstructed screen content, we recover the real source address used by the attacker:

$$\texttt{169.254.118.250}$$

This is the attacker's actual IP and the one we need to isolate from the fake APIPA noise.

---

## Filtering the PCAP

Once the real source IP is known, the traffic can be filtered cleanly.

Useful Wireshark / tshark filter:

```text
ip.src == 169.254.118.250
```

With this filter applied, the irrelevant traffic disappears and one packet becomes particularly interesting: frame `5770`.

For example:

```bash
tshark -r /Users/nowak/Documents/Playground\ 2/network_capture.pcap -Y "frame.number==5770"
```

This frame contains the exfiltrated payload.

---

## Payload Analysis and Decryption

The suspicious payloads all begin with:

```text
U2FsdGVkX1...
```

This is a well-known indicator of OpenSSL salted encryption, since `U2FsdGVkX1` is the Base64 encoding of:

```text
Salted__
```

At that point, the remaining task is to derive the correct decryption key.

The file `master.key` provides the base secret:

```text
SuperSecretKey_Admin_123!
```

The final decryption key is obtained by appending the recovered attacker IP:

```text
SuperSecretKey_Admin_123!169.254.118.250
```

Testing this key against the encrypted payloads shows that exactly one decrypts into valid plaintext: the payload from frame `5770`.

---

## Reproducible Commands

```bash
# Filter the real attacker traffic
tshark -r /Users/nowak/Documents/Playground\ 2/network_capture.pcap \
  -Y "ip.src == 169.254.118.250"

# Inspect the interesting frame
tshark -r /Users/nowak/Documents/Playground\ 2/network_capture.pcap \
  -Y "frame.number==5770"

# Decrypt the payload with the recovered key
echo 'U2FsdGVkX1...' | base64 -d | \
openssl enc -d -aes-256-cbc -salt \
  -pass pass:'SuperSecretKey_Admin_123!169.254.118.250'
```

---

## Vulnerability Summary

| **Problem** | **Impact** |
|-------------------------|------------------|
| Noisy traffic as decoy | Medium |
| RDP cache leakage | Critical |
| Secret derivation tied to visible IP | Critical |
| OpenSSL-encrypted exfiltration recoverable post-forensics | Severe |

**IP Source**: `169.254.118.250`
**Interesting Frame**: `5770`
**Decryption Key**: `SuperSecretKey_Admin_123!169.254.118.250`
**Flag**: `HNx05{B3_Careful_RDP_C4che}`

By **N3akz**
