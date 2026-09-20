# Roadmap V2 — Recovery and Reconciliation Plan

## Source of truth

Roadmap V2 historically reached **Lượt 27 / Bước 108** and passed its gates on baseline `e383912354673bdce7a0059d6b9a23799d74e689`.

The modern recovery lane starts from the fully green runtime candidate `146d8f672975f46b36164cbd795e837801e50c97`, which contains Foundation V2 L9 on current `main`.

Direct merging of the historical L27 branch is forbidden.

## Quality policy

Every discovered problem becomes an explicit recovery round or sub-round. No feature round may absorb unverified repair work. Historical PASS evidence is preserved, but modern PASS must be re-proven.

## Sequence

### L27R1 — Baseline freeze — PASS

All six gates passed: reconciliation, Foundation, Windows checkout, Russian UI, preview boundary and Whole System browser/package acceptance.

The fingerprint audit found 30/40 protected paths unchanged and 10 changed. The durable theory overlay remains 18 records but increased from 300 to 306 slides.

### L27R2A — Historical evidence archive

Archive L19–L27 state, acceptance and syllabus evidence byte-for-byte under `recovery/roadmap-v2/historical-l27/**`.

This sub-round does **not** create canonical `roadmap_v2/**` runtime/tooling paths.

### L27R2B — Static contract/schema transplant

After R2A passes, transplant only Roadmap contracts and schemas to their canonical isolated paths. No engines, generated data, UI or production entrypoints.

### L27R2C — Toolchain/data/test transplant

After R2B passes, transplant executable Roadmap builders, validators, tests and generated sidecar data. Run them in disconnected mode first.

### L27R3 — Modern-baseline regeneration

Rebuild inventories/fingerprints against the modern Math/runtime source, classify every drift and regenerate deterministic Roadmap artifacts. Never revert modern source merely to satisfy an old hash.

### L27R4 — Foundation/Russian compatibility bridge

Introduce explicit adapters for Roadmap identity/evidence to Foundation V2 L9 and the current Russian capability/evidence flow. No duplicate learner-state authority.

### L27R5 — Offline/package/failure-mode hardening

Exercise online/reload/offline, corrupted cache/artifacts, packaged ChatGPT Site, rollback and no-silent-migration invariants.

### L27R6 — Full promotion gate

Run Roadmap L19–L27, Foundation, Russian, Math, Hub, offline, preview and packaged browser gates together. Freeze only when all are green.

Only then may **Lượt 28 / Bước 109** begin.

## Separate work

Foundation L10 / PR #52 remains a separate draft line and is not admitted into this recovery lane yet.
