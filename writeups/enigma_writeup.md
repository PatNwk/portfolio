title: enigma
— write-up subtitle: "Recovering a Custom Enigma Configuration from PCAP Noise and Solving the Cipher"
date: 2026-04-13T00:00:00Z
tags: ["forensics", "pcap", "crypto", "enigma", "tshark"]
featured: true
mood: "investigative"

enigma — write-up

# Goal

The objective is to decrypt the challenge cipher:

```text
fy1hPd1cpgGtzrt0zk0
```

We are given two constraints:

- the plaintext inside the flag starts with `th`
- format is `HNx05{th...}`

A PCAP is provided, so the intended path is to recover the Enigma parameters from captured traffic, then decrypt the message.

---

## Challenge Analysis

The statement provides a ciphertext and only a tiny known plaintext hint (`th`).

That is not enough to uniquely brute-force Enigma settings directly because too many candidates can match a 2-letter prefix. The right approach is therefore:

1. Extract cryptographic configuration material from the PCAP.
2. Rebuild the Enigma machine from those artifacts.
3. Decrypt and validate against the expected flag format.

---

## PCAP Triage

The capture is large and noisy, so first we isolate useful HTTP responses:

```bash
tshark -r "capture (1).pcap" -Y "http.response" -T fields -e http.response.code | sort | uniq -c
```

Result:

- `404`: massive volume (noise/scanning)
- `200`: only **one** response

That unique `200 OK` is the pivot.

---

## Recovering Enigma Parameters

Locate and follow the TCP stream carrying the successful response:

```bash
tshark -r "capture (1).pcap" -Y "http.response.code==200" -T fields -e frame.number -e tcp.stream -e http.request.uri
tshark -r "capture (1).pcap" -q -z follow,tcp,ascii,176778
```

The recovered page (`/ragagame.html`) leaks full Enigma configuration:

- Rotor 1: `QGYRHWZVNKJALXICOMSPDUTEFB;K`
- Rotor 2: `HCPGZKOLYWXFQVRIBUMJDNASET;D`
- Rotor 3: `WFMHNBPOCXITQJRGKZSULYDVAE;Y`
- Reflector: `EJMZALYXVBWFCRQUONTSPIKHGD`
- Plugboard: `PO ML IU KJ NH YT GB VF RE DC`

So the core keying material is fully recoverable from traffic.

---

## Decryption Strategy

Using the recovered rotors/reflector/plugboard, we test plausible interpretations of ambiguous ciphertext symbols (`1` and `0` mixed with letters), and validate candidates against:

- known prefix `th`
- coherent challenge-style plaintext

The best valid decryption is:

```text
th1sEn1gmaChall0ng0
```

Which matches the expected flag format.

---

## Reproducible Commands

```bash
# 1) Find the only successful HTTP response
tshark -r "capture (1).pcap" -Y "http.response.code==200" \
  -T fields -e frame.number -e tcp.stream -e http.request.uri

# 2) Dump the stream containing Enigma parameters
tshark -r "capture (1).pcap" -q -z follow,tcp,ascii,176778

# 3) (Optional) confirm response code distribution
tshark -r "capture (1).pcap" -Y "http.response" \
  -T fields -e http.response.code | sort | uniq -c
```

---

## Vulnerability Summary

| **Problem** | **Impact** |
|-------------------------|------------------|
| Sensitive crypto setup exposed over clear HTTP page | Critical |
| High-noise PCAP as weak obfuscation | Medium |
| Single successful stream easy to isolate statistically | High |
| Cipher can be solved once rotor set is leaked | Critical |

**Cipher**: `fy1hPd1cpgGtzrt0zk0`  
**Recovered plaintext**: `th1sen1gmachall0ng0`  
**Flag**: `HNx05{th1sen1gmachall0ng0}`

By **N3akz**
