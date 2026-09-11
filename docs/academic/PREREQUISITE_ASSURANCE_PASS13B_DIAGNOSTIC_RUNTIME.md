# Prerequisite Assurance · Pass 13B · Diagnostic Runtime

Date: 2026-09-11
Branch: `temp/bauman-master-hub-prereq-2026`
Status: `DIAGNOSTIC_RUNTIME_13B_VALIDATED_CI_PASS`
Validated SHA: `d7ed6857175c7e6696b11316db354665156d836a`
CI run: `34549094198`

## Goal

Turn the Academic 2026 overlay from a read-only readiness viewer into an honest persisted diagnostic engine without allowing it to mutate the adaptive schedule yet.

The runtime must answer four things safely: whether a gate has actually been assessed, what state the evidence supports, whether a critical official course is ready, and whether repair routing has enough failed-node evidence to choose a route.

## New reuse diagnostic packs

Four gates that already had substantial reusable content now have explicit diagnostic packs instead of duplicate theory courses:

- P1 Calculus Foundation: reuse `calculus_multivariable` and `MATH-VN-C03-ham_so_ao_ham_va_gradien`;
- P2 Linear Algebra: reuse `linear_algebra_data_space`, Math VN chapters 1-2 and prep chapter 10;
- P3 Probability & Statistics: reuse `probability_statistics_inference`, Math VN chapter 4 and prep chapter 16;
- P5 Python & OOP: reuse Programming lessons PR03, PR13, PR14 and PR17.

Each reuse pack has 8 competency nodes, D0=16, D1=10, D2=6, critical misconceptions and repair routes with explicit stop conditions. `reuseOnly=true` and `duplicatesExistingTheory=false` are enforced by CI.

## Pack manifest

Added `assets/data/prerequisite-packs/manifest-2026.json`.

Pass13B runtime loads 13 currently implemented packs: P0-P11 except P12, plus J1. P12 and J2/J3/J4 remain deferred until their planned rolling/JIT stages.

## Honest persisted state

Diagnostic data is stored under a dedicated key:

`bauman_academic_2026_diagnostics_v1`

The store is scoped by current local user. It can import a legacy `academic2026.gateDiagnostics` object once if such state exists, but it no longer depends on the non-global lexical `state` variable in `main.js`.

A gate remains `UNASSESSED / Chưa chẩn đoán` unless D0, D1, D2 and the critical-misconception count are all explicitly present and valid. Critical misconception is never silently defaulted to zero.

## State semantics locked in Pass13B

Weighted score:

`M = 0.25*D0 + 0.50*D1 + 0.25*D2`

Runtime state:

- missing/incomplete diagnostic → UNASSESSED;
- M < 60 → REBUILD;
- 60 <= M < 80 → REPAIR;
- 80 <= M < 90 → BRIDGE;
- M >= 90 + D1 >= 85 + zero critical misconceptions → READY;
- M >= 95 + D1 >= 90 + zero critical misconceptions → MASTERED;
- any critical misconception → REPAIR;
- M >= 90 but D1 < 85 → REPAIR.

This resolves the earlier ambiguity around local gate targets such as P7=85/P8=88/J1=85. Those local targets may indicate that the pack-specific competence target was met, but they do not override the global `READY >= 90` safety rule. The UI explains this when a local target is below 90.

## Course readiness

Critical prerequisite gates use a worst-gate rule, never an average. If any critical gate is unassessed, the course is `Chưa chẩn đoán đủ`. A course becomes READY only when every critical gate is READY or MASTERED. It becomes MASTERED only when every critical gate is MASTERED.

This prevents a high score in one prerequisite from hiding a weak prerequisite in another.

## Repair routing

The runtime now exposes `repairRoutesForGate(gateId)`.

If diagnostic evidence contains `failedNodeIds`, only repair routes intersecting those failed nodes are selected. If a gate is weak but no failed-node evidence exists, the engine returns `await_node_evidence` and explicitly refuses to guess which route should be assigned.

## STOP rule

`shouldStopGate(gateId)` returns true only for MASTERED. The current Pass13B does not mutate the scheduler; it only exposes the STOP decision for the next integration pass.

## UI

Gate modals now support persisted D0/D1/D2/critical-misconception results and optional failed-node IDs. Inputs must be complete and valid before saving. Home readiness cards update from the persisted diagnostic evidence.

The UI explicitly states that Academic 2026 still does not mutate the scheduler in Pass13B.

## Validator and CI

Added `scripts/validate-diagnostic-runtime-13b.js` and wired it into `.github/workflows/academic-2026-prerequisite-gate.yml`.

The validator checks pack manifest integrity; P1/P2/P3/P5 reuse references; diagnostic node/item counts; Russian D2 prompts; misconception and stop-route integrity; dedicated persisted storage; no `window.state` dependency; no schedule mutation; global READY and MASTERED thresholds; D1 floor; critical-misconception override; and independent worst-gate course-readiness invariants.

CI run `34549094198` passed the full Academic 2026 regression chain, including the new Pass13B validator, runtime JavaScript syntax and Device Gate coexistence checks.

## Not done yet

Pass13B does not claim browser acceptance, backup/restore integration, scheduler mutation, grade-risk priority, or final synchronization/merge with the newer `main` branch. Those remain for Pass13C-F/G.

## Next

Pass13C should connect diagnostic evidence to deterministic active-repair/STOP decisions and course-risk priority while keeping schedule mutation behind a feature gate. Only after those decisions pass regression should Pass13D/E wire the adaptive scheduler.