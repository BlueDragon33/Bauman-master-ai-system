# Lượt 19 · Bước 73–76 — Acceptance

Status: `PASS`

## Outcome

Lượt 19 converts the corrected Lượt 18 syllabus into machine-readable sidecars
without changing the Math runtime or any legacy academic ID.

| Step | Result | Evidence |
|---|---|---|
| 73 | PASS | Physical baseline `main@e383912…`, immutable Git blob inventory, E15/C07 discrepancy resolved |
| 74 | PASS | Registry: 10 subjects, 85 nodes, 304 numbered lessons, 8 dynamic nodes, 1 verified legacy composite |
| 75 | PASS | Graph: 170 required edges, 2 recommended edges, 13 external gates, 0 unresolved internal refs, 0 cycles |
| 76 | PASS | Sidecar-only migration contract and mapping report cover all 85 nodes; migration not executed |

## Defect handled before continuation

The historical handoff claimed that E15 was a physical source version whose chapter
7 contained covariance/correlation/PCA and synchronized formula/exercise/simulation/test
data. Direct repository and Library inspection disproved this. The correction is now
encoded in the syllabus, baseline inventory, registry mapping and migration contract.

The academic content is preserved through verified legacy lessons in C05/C10/C15.
Standalone formula, exercise and simulation sources are correctly marked as gaps rather
than silently treated as reusable content.

## Regression boundary

- Runtime/UI files changed: 0.
- Protected baseline files changed: 0.
- Legacy IDs renamed or deleted: 0.
- Roadmap registry files added: yes, under `docs/roadmap_v2`.
- Deterministic generators and validators added: yes, under `scripts`.

## Validation commands

```bash
node scripts/generate-roadmap-registry.mjs
node scripts/validate-roadmap-v2.mjs
node scripts/generate-prerequisite-graph.mjs
node scripts/validate-prerequisite-graph.mjs
node scripts/generate-migration-contract.mjs
node scripts/validate-migration-contract.mjs
```

All commands must pass twice consecutively with no diff in generated JSON before Lượt
20 begins.

## Next sequential point

`Lượt 20 · Bước 77`: implement the repository-wide validator and run a migration dry
run against a synthetic copy. Do not connect the sidecars to runtime before the dry-run
and protected-fingerprint gates pass.

