# Lượt 27 — Current Plan · Bước 105–108

Status: `PASS_B105 · PASS_L27_F1_H1 · B106_IN_PROGRESS`

Prerequisite: L26/B104 documentation/final-state head `999dd9910c4d2d87c7e947aa5d9b8d04b60f2555` passed the complete six-gate set.

Historical L27 is design evidence only. Current L27 must rebuild/revalidate readiness against the current Consumer Blueprint V1, Mastery V2 and Scheduler current overlay. Production/runtime/UI integration remains disconnected.

## B105 — Current readiness contract

Revalidate RAG readiness semantics on the modern baseline.

Locked rules:

- missing evidence fails closed to red/unknown;
- green requires a real `master_ready` state and passed Master-ready evidence gate;
- blocking prerequisites must be satisfied;
- recommended/contextual edges remain advisory;
- required external gates must be explicit, verified and satisfied;
- Critical focus targets must be covered by the current weekly projection;
- caller-supplied scheduler results/readiness colors are rejected;
- no persistence, dashboard render, runtime activation or notification writes.

## B106 — Read-only readiness projector

**ACTIVE.** Build an in-memory projector that recomputes current Scheduler coverage and evaluates current Mastery prerequisite semantics. No manual colors/results.

B105/F1/H1 accepted head: `f87d6a1e528c764c432981750030a5adc9d35466` (6/6 gates PASS).

## B107 — Adversarial readiness validation

Validate forged Master-ready claims, missing evidence, external gates, advisory edges, Critical schedule coverage, aggregation, duplicate/malformed input and fail-closed behavior.

## B108 — Full-system closeout

Compose B105–B107 and run the complete six-gate set.

L28 remains blocked until B108 and its documentation/final-state closeout are green.

## L27-F1 — stale manifest boundary

The frozen historical readiness contract references Consumer/Mastery/Scheduler manifests from the historical package. Those identities are not valid execution dependencies on the current track.

## L27-H1 — additive readiness overlay

Do not mutate the frozen historical readiness contract. Introduce `roadmap_v2/readiness/current-contract.json` as the only current L27 contract overlay and validate the static historical blob separately from the current boundary.
