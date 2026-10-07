# RE20 — PHASE 3 RC / ROLLOUT GATE

Canonical owners: RU08 + C3 Release Annex + C4

Mission: prove Phase 3 canonicalization and bridge contracts are release-candidate ready while keeping production/default rollout gated.

## Required evidence
- RE16 promotion safety PASS;
- RE17 RU04 bridge PASS;
- RE18 planner bridge PASS;
- RE19 pack compiler/registry PASS;
- Engine isolated suite PASS;
- Russian reference UI regression PASS;
- whole-system regression PASS;
- source + packaged grounded slice PASS;
- offline shell PASS.

## Rollout states
OFF
→ OPT_IN_FLAG
→ INTERNAL_BETA
→ DEFAULT_ON_CANDIDATE
→ DEFAULT_ON.

Moving beyond OPT_IN_FLAG requires explicit product authorization plus C3 release evidence.

## No silent rollout
Phase 3 completion must not enable Russian Engine by default.

## Exit
PASS means RC-ready contracts only.
It does not mean production or default-on.
