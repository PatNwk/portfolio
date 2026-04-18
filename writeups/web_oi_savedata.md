# OI SaveData

- Category: `web`
- Flag: `HTB{s4v3d_4nd_imp0r73d_s0m3_w4rm_s0ck5_3c189ed297bddd3a0a452c5c6fbb1346}`

## Challenge summary

This was a multi-stage web exploitation challenge centered around a profile management application. The exposed interface allowed profile updates and imports, and the final goal was to break out of normal profile handling and gain code execution inside the application stack.

The final exploit chain combined:

- arbitrary file write,
- SSRF with `gopher://`,
- internal `uWSGI` interaction,
- execution of attacker-controlled Python code,
- flag retrieval through a readable profile object.

## Step 1: arbitrary profile write

The first key issue was the profile update endpoint:

```text
POST /profiles/<id>/update
```

This allowed controlled data to be written to files of the form:

```text
/app/profiles/<id>.json
```

That means the attacker could create or overwrite a profile file with chosen content.

At this stage, that alone is already powerful. Even if the application thinks it is storing JSON, a later component might interpret the file differently.

## Step 2: broken import validation

The second issue was in the import endpoint:

```text
POST /profiles/import
```

Its URL validation was flawed, and it was possible to pass a `gopher://` URL.

That matters because `gopher://` is extremely useful for SSRF when you need to send raw bytes to an internal service rather than just fetch an HTTP response.

## Step 3: reaching internal uWSGI

Inside the container or application environment, `uWSGI` was listening on:

```text
127.0.0.1:5000
```

This service was not directly exposed to the outside world, but SSRF through the import endpoint made it reachable indirectly.

By crafting a `gopher://` payload that encoded a raw `uwsgi` packet, it was possible to talk to that internal listener directly.

## Step 4: make uWSGI execute our file

The raw `uwsgi` packet set:

```text
UWSGI_FILE=/app/profiles/IOI-655321.json
```

That is the crucial pivot.

The application had written a file that was nominally a profile, but `uWSGI` was tricked into treating it as executable Python code instead.

So the “JSON profile” became a Python payload.

## Step 5: execute code and exfiltrate the flag

Once `uWSGI` loaded the attacker-controlled file as Python, the payload executed `/readflag` and wrote the result into another profile that could be read back through the web application.

The readable output was stored under:

```text
/profiles/IOI-655322
```

This gave a clean exfiltration channel without needing an interactive shell.

## Why the chain is interesting

This challenge is a strong example of exploit chaining:

- one bug gives file write,
- another bug gives SSRF,
- the SSRF reaches an internal binary protocol,
- the protocol feature causes code execution,
- the application itself is then used to retrieve the result.

No single step alone gives the flag, but together they form a complete attack path.

## Flag

```text
HTB{s4v3d_4nd_imp0r73d_s0m3_w4rm_s0ck5_3c189ed297bddd3a0a452c5c6fbb1346}
```

## Takeaway

This challenge highlights how dangerous it is to combine:

- file creation primitives,
- weak SSRF protections,
- internal services that trust environment or protocol-controlled file paths.

It is also a good reminder that internal-only services are not safe if the web layer can be abused as a transport.
