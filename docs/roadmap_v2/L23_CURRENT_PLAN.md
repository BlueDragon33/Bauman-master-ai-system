# Lượt 23 — Current Plan · Bước 89–92

Status: `READY_TO_START_B89`

Prerequisite: L22/B88 + L22-H1 PASS.

Historical L23 is used as design evidence only. Nothing is inherited as current PASS without revalidation against the modern runtime.

## B89 — Diagnostic contract

Rebuild/revalidate the Diagnostic contract and schemas against the current L22 consumer contract.

Required invariants:

- 20-question diagnostic session contract;
- difficulty/coverage allocation preserved only if still internally consistent;
- pass threshold 80%;
- critical-domain floor 70%;
- `existing_competency_verified` remains distinct from `master_ready`;
- no mastery, scheduler, priority or learner-state writes;
- production integration remains disconnected.

## B90 — Diagnostic catalog

Regenerate the diagnostic catalog from the current accepted consumer blueprint.

Rules:

- derive targets from current canonical consumer metadata, never from stale generated artifacts;
- block dynamic/unresolved targets;
- do not fabricate item banks or questions;
- no executable production plan unless a reviewed item bank exists;
- deterministic output required.

## B91 — Diagnostic harness

Bring the historical validation harness forward only after dependency review.

It must verify:

- no answer leakage during an active session;
- deterministic scoring;
- separate outcomes for existing competency, critical gap and general gap;
- no persistence;
- no `master_ready` output;
- malformed/missing/tampered inputs fail closed.

## B92 — Full gate

Run the complete current gate set:

- Roadmap V2;
- Foundation;
- Windows checkout;
- Russian Reference UI;
- Preview/package;
- Whole System browser/offline acceptance.

L24 remains blocked until B92 is fully green.

## Quality rule

Any issue found in B89–B92 creates an `L23-Fx` or `L23-Hx` sub-round. The next main step does not open until that sub-round and the complete current gate are green.
