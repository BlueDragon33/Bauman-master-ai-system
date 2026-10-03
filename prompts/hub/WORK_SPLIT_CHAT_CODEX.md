# HUB WORK SPLIT — CHAT / CODEX / USER

## Class A — Chat owns
Chat handles clear, low-risk Hub work that is normally confined to one or two files and can be verified by static inspection or diff: architecture audit, UX/data-truth audit, ownership/source-of-truth mapping, copy, metadata, prompt/state, acceptance criteria, test design and small root-cause fixes that do not require runtime debugging.

Loop: inspect → understand root cause → smallest safe edit → reread → diff/invariant check → continue.

## Class B — Codex owns
Use Codex for tightly coupled runtime changes across 3+ files, deep refactors, normalized shared adapters/read models, migration/backward compatibility, browser/E2E/responsive verification, build/CI/PWA/offline/auth/security/performance work, or repeated implement→run→debug→retest loops.

When Class B is found, Chat must record defect/evidence/invariants in one CURRENT_WORK_PACKET.json, continue every independent Class A task, and hand off only after Chat scope is exhausted.

## Class C — real external blocker
Only an external requirement can stop the whole flow: OAuth/user interaction, unavailable credentials/secrets, missing release authority, destructive action requiring explicit approval, unavailable external capability, a Constitution prohibition, or a Hub↔Subject boundary violation.

A Class C blocker in one branch of work does not block independent Class A work.

## Merge/release
Compilation alone is not PASS. Runtime Class B work must pass targeted static + browser regression before merge. Production publication remains a separate explicit release gate.