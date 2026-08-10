# Lượt 19 · Bước 73–76 — Acceptance

Status: `PASS — source architecture reconciled`

## Outcome

Lượt 19 converts the corrected Lượt 18 syllabus into machine-readable sidecars
without changing the Math runtime or any legacy academic ID.

| Step | Result | Evidence |
|---|---|---|
| 73 | PASS | Physical baseline `main@e383912…`; 347 lessons/5,552 slides, 18 overlays/300 slides, 40 source chapters/41 content groups, source roles resolved |
| 74 | PASS | Canonical registry: 10 courses, 85 chapters, 304 numbered lessons, 8 dynamic chapters, 1 logical legacy composite with 5 verified physical refs |
| 75 | PASS | Canonical graph: 85 chapter nodes, 304 lesson nodes, 185 prerequisite edges, 15 external-gate nodes, 0 unresolved refs, 0 self refs, 0 cycles |
| 76 | PASS | Contract-only migration: 5 exact source-lesson → logical-composite refs, 0 exact target-lesson mappings ready, 0 eligible Priority records, 0 source mutations |

## Defect handled before continuation

The historical handoff claimed that E15 was a physical source version whose chapter
7 contained covariance/correlation/PCA and synchronized formula/exercise/simulation/test
data. Direct repository and Library inspection disproved this. The correction is now
encoded in the syllabus, baseline inventory, registry mapping and migration contract.

The academic content is preserved through five verified legacy lessons in C05/C10/C15.
The separate `theory-framework` node `m_p07` and its eight sub-lessons are preserved as
secondary outline candidates but quarantined from runtime. Standalone formula, exercise,
application and simulation sources are correctly marked as gaps; `tests.json` has four
levels and zero questions.

## Regression boundary

- Runtime/UI files changed: 0.
- Protected baseline files changed: 0.
- Legacy IDs renamed or deleted: 0.
- Canonical Roadmap artifacts: `roadmap_v2/registry`, `roadmap_v2/graph`,
  `roadmap_v2/migration` and `roadmap_v2/reports`.
- `docs/roadmap_v2` JSON remains an archived compact compatibility snapshot and is not
  a canonical loader input.
- Deterministic generators and validators: `roadmap_v2/tools`.

## Validation commands

```bash
node roadmap_v2/tools/validate-baseline-inventory.mjs
node roadmap_v2/tools/build-registry.mjs
node roadmap_v2/tools/validate-registry.mjs
node roadmap_v2/tools/build-prerequisite-graph.mjs
node roadmap_v2/tools/build-migration-contract.mjs
node roadmap_v2/tools/validate-roadmap-v2.mjs
```

All commands must pass twice consecutively with no diff in generated JSON before Lượt
20 begins.

## Next sequential point

`Lượt 20 · Bước 77`: implement the repository-wide validator and run a migration dry
run against a synthetic copy. Do not connect the sidecars to runtime before the dry-run
and protected-fingerprint gates pass.
