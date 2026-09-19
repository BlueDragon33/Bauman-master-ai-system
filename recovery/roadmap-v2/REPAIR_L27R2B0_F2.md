# L27R2B0-F2 — Remove later-phase canonical-path coupling

## Trigger

R2B legitimately begins admitting static contracts and schemas to canonical `roadmap_v2/**` paths.

The R2B0 hygiene validator still contained a temporary diff whitelist that rejected any canonical Roadmap path. That rule was correct only while R2B0 itself was the active phase; once R2B begins, keeping it would create a false regression.

## Root cause

The R2B0 validator mixed:

1. timeless hygiene invariants; and
2. a phase-local mutation boundary.

This is the same class of gate-design defect previously fixed in R2A.

## Fix

R2B0 now permanently verifies only:

- the historical invalid consumer provenance path is documented;
- the corrected consumer candidate changes only that approved path;
- the historical migration contract remains pinned to the old baseline;
- the old migration contract is not admitted to canonical `roadmap_v2/migration/**`.

R2B's own validator now owns canonical-path admission and mutation-boundary checks.

## Safety

No runtime, Math, Russian, Hub, Foundation, storage, offline or package behavior is changed by this repair.
