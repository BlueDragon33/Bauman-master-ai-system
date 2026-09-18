# L24/B93 — Mastery / Evidence Contract Acceptance

Status: `PENDING_GATE`

## Purpose

B93 modernizes the Mastery/Evidence contract against the accepted current Consumer Blueprint and Diagnostic V2 boundary.

No event is persisted and no runtime feature is activated in B93.

## Locked invariants

- Knowledge states: 6.
- Evidence types: 8.
- Diagnostic pass `existing_competency_verified` maps only to `dat_prerequisite`.
- Diagnostic pass never grants `master_ready`.
- Diagnostic results consumed by Mastery must remain non-persistable and `masterReady: false`.
- Chapter assessment threshold: 80%.
- Critical prerequisite floor: 70%.
- Exercise threshold: 80%.
- Retention: 14–21 days, 75%.
- GD2/GD3 Russian technical terms: 5–10 when applicable.
- Master-ready requires all applicable evidence dimensions.
- Recommended/contextual edges remain non-blocking.
- External gates remain explicit.
- Persistence, Priority Engine, scheduler and runtime writes remain disabled.
- Production integration remains disconnected.
- Historical Consumer/Diagnostic manifests, V1 Diagnostic result and old baseline hashes are forbidden dependencies.

## B93 gate

B93 is PASS only when the contract/schema/upstream boundary is internally consistent and the complete six project gates are green on the same head.

B94 remains blocked until B93 passes.
