# Bauman Foundation — Identity & Domain Model — Step 9 — Promotion / Freeze Audit

## Goal

Freeze the complete L9 Universal Identity & Domain Foundation as a promotion-ready, additive compatibility layer without starting a destructive migration.

Step 9 is a release-readiness audit. It does not introduce a new runtime authority and does not migrate Russian mastery, Review Queue, SRS, resume, routes, or legacy storage.

## Diff review against current `main`

Promotion review base:

- base: `d51c84c7fc200c7cbd177150a49d9f93884cc21b`
- reviewed head before final promotion marker: `585fe39e6adacb12b3c4e366ddbc79a4d03c1713`
- ahead: 76 commits
- behind: 0 commits
- changed files: 47

The diff is dominated by new Foundation contracts, adapters, audits, validators, and browser acceptance tests.

Existing runtime files changed only where required for additive integration:

- `subjects/russian/index.html` — loads the Foundation dependency chain;
- `subjects/russian/assets/ai-mentor-guard.js` — reads additive immutable canonical context while preserving existing Review Queue/mastery behavior;
- runtime materializers — package and verify Foundation dependencies;
- CI workflows — enforce source and packaged acceptance;
- `assets/js/hub-safe-shell.js` — readiness contract fix discovered by packaged acceptance, unrelated to academic authority.

No legacy storage key is renamed or deleted.

## Frozen compatibility boundary

L9 promotion requires all of the following to remain true:

- compatibility strategy is additive;
- existing Russian runtime remains authoritative;
- canonical identity is an overlay/read projection, not a replacement store;
- legacy IDs remain unchanged;
- legacy storage bytes are not rewritten by Foundation;
- Host Bridge remains `BAUMAN_SUBJECT_BRIDGE_V1`;
- Russian learning state remains `RUSSIAN_LEARNING_STATE_V1`;
- Russian content contract remains `RUSSIAN_CONTENT_CONTRACT_V1`;
- canonical mapping is deterministic and idempotent;
- corrupt overlay fails closed;
- durable projection requires checksum agreement;
- canonical context is immutable/read-only;
- AI cannot modify mastery or complete protected learning decisions;
- unknown extension data survives round trips;
- destructive global storage reset is forbidden;
- packaged runtime must contain the same Foundation dependency chain as source runtime.

## Promotion artifact

`BAUMAN_FOUNDATION_L9_PROMOTION_V1` is the machine-readable freeze manifest.

At Step 9 it moves from `promotion_candidate` to `promotion_ready` only after Steps 1–8 have passed and the promotion validator proves the frozen invariants above.

The manifest is not a runtime version badge and must not appear in learner-visible UI.

## Required audits

Promotion requires all nine step audits:

1. `AUDIT_L9_STEP1.md`
2. `AUDIT_L9_STEP2.md`
3. `AUDIT_L9_STEP3.md`
4. `AUDIT_L9_STEP4.md`
5. `AUDIT_L9_STEP5.md`
6. `AUDIT_L9_STEP6.md`
7. `AUDIT_L9_STEP7.md`
8. `AUDIT_L9_STEP8.md`
9. `AUDIT_L9_STEP9.md`

## Final gate expectations

The promotion head must pass:

- Foundation Domain Model Gate;
- Russian Reference UI Gate;
- Windows checkout safety;
- Bauman Cloudflare Preview CI;
- Whole System Integration Gate;
- normal and packaged Foundation persistence acceptance;
- normal and packaged canonical projection acceptance;
- normal and packaged canonical context acceptance;
- normal and packaged Hub responsive acceptance.

## Promotion policy

Passing Step 9 makes PR #51 ready for review/promotion. It does **not** by itself authorize a destructive migration and does not require one.

No merge to `main` is performed by the Step 9 runtime gate itself.

## Step 9 checkpoint

The checkpoint is considered PASS only after the final promotion-marker commit receives all required green CI results.
