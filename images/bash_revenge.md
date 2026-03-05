---
title: "Bash revenge — Use-after-free in Bash 4.3"
subtitle: "CVE-2016-9401 via popd index mishandling"
date: 2025-11-10T12:41:50Z
tags: ["pwn", "uaf", "bash", "cve-2016-9401", "sandbox-escape"]
featured: true
mood: "focused"
---

![bash-revenge.png](bash-revenge.png)

We’re given a **minimal chroot service** exposing an old **Bash 4.3**. The goal: exploit a known **use-after-free** in `popd` argument parsing (**CVE-2016-9401**) to get a usable shell inside the chroot and read the flag.

## 1) Context & provided material

- `chroot/` with:
  - `/bin/bash` (statically linked)
  - base dirs `/lib`, `/lib64`, `/proc`
- `share/` with `flag` (unreadable), `run.sh`, and `xinetd` service
- `docker-compose.yml` runs the chrooted Bash over a network socket

> The service reproduces server behavior locally.

## 2) Local reproduction

Create a minimal chroot that matches the remote:

```bash
sudo mkdir -p chroot/tmp chroot/home
sudo chroot chroot /bin/bash --norc --noprofile
```

## 3) Exploit attempt (CVE-2016-9401)

According to public PoCs, the bug can be triggered via a malformed `popd` index (directory stack logic). The common sequence:

```bash
pushd /tmp
pushd /home
popd + -1
```

Expected behavior on a **vulnerable** Bash 4.3:
- invalid index → freed wrong stack entry → re-use of freed memory → crash or controllable UAF.

**Observed here:** Bash prints `popd: +: invalid number` and keeps running. No crash/UAF, which suggests a **patched** 4.3 build or backported guards in argument parsing.

## 4) Debugging with GDB (local build of 4.3)

Rebuild Bash 4.3 with symbols and without `bash-malloc` for saner backtraces:

```bash
wget https://ftp.gnu.org/gnu/bash/bash-4.3.tar.gz
tar xzf bash-4.3.tar.gz && cd bash-4.3
./configure --enable-debug --without-bash-malloc
make -j"$(nproc)"
gdb ./bash
```

Run and try to trigger:

```gdb
run --norc --noprofile
# inside bash
pushd /
pushd /
popd + -1
```

**Result:** no crash; still defensive behavior, likely due to distro/backport differences in the 4.3 series.

## 5) Root cause recap (what is CVE‑2016‑9401)

The bug sits in `popd_builtin()` handling of the directory stack (`dirs_stack`). A malformed index like `+ -1` slips through validation, leading to removal of an out-of-bounds entry. That sequence causes a **free()** on the wrong pointer and later **use-after-free** when the structure is re-accessed.

Potential exploitation paths (typical UAF playbook):

- **Heap feng shui** to reallocate a controlled object where the freed node was.
- Corrupt internal structures (function pointers, FILE*, environment records).
- In ideal conditions, pivot to **arbitrary code execution** (e.g., redirect to `system("/bin/sh")`).

In a **chroot** service, this would yield a reliable shell within the jail and access to the flag file.

## 6) Why it didn’t pop here

- The shipped `/bin/bash` appears to be **hardened or patched** against the trivial `popd + -1` trigger.
- Static build + toolchain hardening may further reduce determinism of heap layouts.
- Without the exact vulnerable revision and build flags, the canonical PoC won’t reproduce.

## 7) Takeaways

- Reproducing historical memory bugs requires **pinpointing the exact vulnerable commit**, not just “version 4.3”.
- Build knobs matter: `--without-bash-malloc`, static vs dynamic, and distro backports change behavior.
- Even when exploitation fails, the process sharpens skills: **chroot workflow**, **heap/UAF reasoning**, and **GDB triage** on real-world userland targets.

## 8) Notes & commands

```bash
# chroot bootstrap
sudo mkdir -p chroot/tmp chroot/home
sudo chroot chroot /bin/bash --norc --noprofile

# bash-4.3 debug build
wget https://ftp.gnu.org/gnu/bash/bash-4.3.tar.gz
tar xzf bash-4.3.tar.gz && cd bash-4.3
./configure --enable-debug --without-bash-malloc && make -j"$(nproc)"
gdb ./bash
```

## 9) Flag

Not recovered on this hardened build. On a truly vulnerable 4.3, the UAF path should enable code exec and reveal the flag located under the provided chroot.

---

**What I learned:** chroot replication, Bash internals around the directory stack, hands-on UAF analysis, and PoC-reproduction pitfalls across minor revisions.
