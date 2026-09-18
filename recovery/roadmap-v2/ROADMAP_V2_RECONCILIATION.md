# Roadmap V2 — Recovery and Reconciliation Plan

## Decision

Roadmap V2 is not being restarted and is not being downgraded to Foundation L10.

The historical Roadmap V2 line reached **Lượt 27 / Bước 108** with its production boundary intentionally disconnected. That work was validated on the old repository baseline `e383912354673bdce7a0059d6b9a23799d74e689`.

The current runtime has since advanced substantially. The recovery lane therefore starts from the green current Russian/runtime candidate `146d8f672975f46b36164cbd795e837801e50c97`, which already contains current `main@1a6dfa3f822a9b6c662bf01cad48b12334ab3aae`.

A direct merge of the historical L27 branch is forbidden because the branch is hundreds of commits behind current `main` and contains 148 changed files, including runtime-facing assets.

## Quality policy

The project now uses **stability-first sequencing**:

1. An issue discovered during a round creates an explicit repair/recovery round.
2. No repair is hidden inside the next feature round.
3. Every round receives a machine-readable contract, validator and CI gate.
4. A failed gate blocks all later rounds.
5. Production wiring remains disconnected until a dedicated activation round proves rollback, offline and packaged-runtime behavior.
6. Historical PASS evidence is preserved, but it is not automatically treated as PASS on the modern baseline.
7. Foundation L10 remains a separate draft line until this recovery lane explicitly admits it.

## Recovery rounds

### Lượt 27R1 — Baseline freeze and source-of-truth recovery

Purpose: eliminate branch ambiguity.

Required invariants:

- current runtime candidate is an ancestor of the recovery branch;
- current Foundation V2 L9 main is an ancestor;
- Foundation identity runtime is present;
- current Russian capability/evidence/offline runtime is present;
- Foundation L10 content registry is not silently mixed into the lane;
- Roadmap V2 has not yet been transplanted;
- historical terminal state remains L27/B108, not L22 or L10.

### Lượt 27R2 — Non-runtime Roadmap transplant

Transplant only the isolated Roadmap V2 surfaces first:

- `roadmap_v2/**`;
- Roadmap-specific build/validation scripts;
- Roadmap tests;
- acceptance/evidence documents;
- dedicated Roadmap workflow.

Do **not** transplant historical modifications to `index.html`, current Hub JS/CSS or current Russian runtime during this round.

### Lượt 27R3 — Modern-baseline regeneration and drift audit

Regenerate the Roadmap against the modern repository and compare:

- lesson/source inventories;
- canonical and legacy IDs;
- fingerprints/checksums;
- prerequisite graph;
- mapping coverage;
- dynamic/unmapped/quarantined records;
- deterministic manifests.

Any drift is classified and resolved explicitly. Old baseline fingerprints are evidence, not authority over modern source files.

### Lượt 27R4 — Foundation and Russian compatibility bridge

Create explicit adapters rather than implicit coupling:

- Roadmap IDs ↔ Foundation canonical IDs;
- mastery/readiness evidence ↔ current Russian evidence flow;
- scheduler/readiness semantics ↔ current capability progression;
- no duplicate authority for learner state.

### Lượt 27R5 — Offline, package and failure-mode hardening

Required tests include:

- online → reload → offline;
- cold offline where supported;
- stale/corrupt cache;
- missing/tampered Roadmap artifacts;
- package materialization;
- ChatGPT Site packaged runtime;
- rollback to pre-Roadmap runtime;
- no silent storage migration.

### Lượt 27R6 — Full promotion gate

The reconciled line may be frozen only after all of these pass together:

- Roadmap V2 L19–L27 validators on the modern baseline;
- Foundation Domain Model;
- Russian Reference UI;
- Windows checkout safety;
- Whole System Integration;
- Hub/Math browser acceptance;
- Russian capability/evidence/offline browser acceptance;
- packaged ChatGPT Site acceptance;
- recovery-specific provenance and production-boundary checks.

Only then may **Lượt 28 / Bước 109** begin.

## Branch policy

The recovery branch is:

`stabilization/roadmap-v2-reconcile-current-runtime`

Historical branches remain reference evidence and must not be force-updated. Foundation L10 remains on its own draft branch and is not part of the recovery baseline at L27R1.
