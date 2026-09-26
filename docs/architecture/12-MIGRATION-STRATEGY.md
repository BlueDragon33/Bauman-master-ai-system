# 12 — Migration Strategy

## Strategy

Use an incremental **Strangler Pattern**, not a rewrite.

Existing subject applications remain operational while new platform abstractions progressively take ownership behind adapters.

## Migration phases

### M0 — Inventory and freeze semantics
Document current identities, stores, routes, package boundaries and protected behavior.

### M1 — Canonical read adapters
Project legacy data into canonical domain models without changing existing writes.

### M2 — Universal contracts
Introduce manifest/registry/resource/learning contracts beside legacy representations.

### M3 — Vertical slice
Select one real learning slice and implement the new path end-to-end.

Recommended first slice: a bounded Math/PCA learning unit because the repository already contains theory, formulas, exercises, applications, simulations and professor Q&A.

### M4 — Dual-read / controlled-write where necessary
Only after contract evidence exists. Avoid indefinite dual-write.

### M5 — Subject-by-subject adoption
Migrate capabilities based on dependency/value, not file count.

### M6 — Legacy quarantine
Stop new dependencies on superseded APIs; preserve compatibility adapters.

### M7 — Retirement
Remove legacy implementation only when:
- no supported package depends on it;
- data migration is proven;
- rollback/restore evidence exists;
- whole-system regression passes.

## No big-bang rules

Forbidden:

- rename every ID at once;
- rewrite all subject storage in one migration;
- replace Math/Russian UI and domain logic simultaneously;
- mix architecture migration with unrelated visual redesign;
- delete historical evidence after canonical import.

## Vertical slice acceptance

The first slice must prove:

`manifest → registry → lesson contract → resource adapter → practice → assessment/evidence → learner state → UI → offline/package → QA`.

If this slice needs repeated Core exceptions, the foundation design is not ready to scale.

