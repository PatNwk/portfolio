# Events Never Lie

- Category: `forensics`
- Flag: `HTB{P0w3rSh3ll_s0m3t1m3s_l13_th0ugh!_529ea3586f165213292cc38c43f37513}`

## Challenge summary

This challenge provided Windows event logs from a compromised workstation and required answering several questions posed by a remote validator. The premise suggested that the attacker had physical access while the system was running, so the investigation had to rely on accurate event chronology rather than on assumptions about normal remote-only compromise patterns.

The most important evidence came from PowerShell and Windows Defender operational logs.

## Relevant log sources

The two key files were:

- `Microsoft-Windows-PowerShell%4Operational.evtx`
- `Microsoft-Windows-Windows Defender%4Operational.evtx`

These logs were enough to reconstruct both the malicious scripting activity and the related defensive changes on the system.

## Investigation approach

The challenge is well suited for a tool like Chainsaw because:

- event IDs can be filtered quickly,
- timestamps are easy to correlate,
- provider names and event counts become much easier to extract at scale.

The solve focused on:

1. identifying suspicious PowerShell execution,
2. recovering the relevant script block logging event,
3. correlating it with Defender activity,
4. extracting the exact timestamps and metadata requested by the validator.

## Key findings

The correct answers recovered from the logs were:

- `2024-04-17_14:27:08`
- `2024-04-17_14:28:00`
- `Microsoft-Windows-PowerShell`
- `35`

These values matched the remote validator and yielded the flag.

## Why the PowerShell log mattered

The PowerShell operational log, especially event `4104`, was crucial because it records script block contents. That means even if the attacker tried to hide behind PowerShell, the executed logic itself could still be reconstructed.

This made it possible to tie the suspicious activity to:

- the correct event provider,
- the right timestamp,
- the right execution count or related numeric answer expected by the service.

## Why the Defender log mattered

The Windows Defender operational log provided the complementary forensic context:

- protection changes,
- tampering clues,
- timeline anchors around the malicious execution.

Together, the two logs were enough to answer all challenge questions confidently.

## Flag

```text
HTB{P0w3rSh3ll_s0m3t1m3s_l13_th0ugh!_529ea3586f165213292cc38c43f37513}
```

## Takeaway

This challenge is a great example of why event logs remain one of the strongest forensic sources on Windows systems. Even when an attacker uses built-in tools like PowerShell, detailed operational logging can preserve the story.
