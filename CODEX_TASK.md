# CODEX_TASK

Task: `BAUMAN_POST_L10_ARCHITECTURE_AUDIT`
Mode: `CURRENT_MAIN_FIRST / ADDITIVE / FAIL_CLOSED`

## Mandatory sequence

1. Treat `docs/roadmap_v2/CURRENT_EXECUTION_STATE.md` as authoritative for Roadmap status: **Roadmap V2 is complete; no L36 is open.**
2. Preserve the accepted Russian promotion from PR #57 and its R-P5 post-merge evidence.
3. Preserve the promoted Foundation L10 registry from PR #58 plus H4 PR #59.
4. Audit remaining open candidates against the current `main`; never treat their historical PASS evidence as current promotion evidence.
5. Close candidates whose responsibility is already superseded.
6. For a still-needed responsibility, reconstruct a minimal branch directly from current `main` and transplant only that responsibility slice.
7. Run the responsibility-specific gate and all cross-system/package gates required by its contract.
8. Merge only after the same candidate head is green, then run post-merge verification.

## Current defect rule

Project-state contradiction is itself a blocking defect.

If a control file says an already-completed Roadmap round is active, or points to a superseded promotion PR, repair the marker before starting new implementation work.

Never resolve a stale-branch conflict by choosing the old branch wholesale.

## Candidate audit priorities

- PR #38 — Academic Phase 2 promotion candidate: inspect whether its 45-path responsibility slice is still missing from current `main`; rebuild if needed.
- PR #43 — registry identity / per-app automation fix: inspect current-main gap before any transplant.
- PR #55 — Russian source/history: superseded by PR #57; history only.
- PR #27 and PR #21 — historical lesson-factory/adaptive-learning candidates; do not merge directly.

This order is an audit order, not authorization to merge.

## Protected contracts

- Roadmap V2 terminal receipt-only boundary.
- Foundation L9 Identity & Domain Model.
- Foundation L10 Content, Asset & Provenance Registry.
- Russian Learning Flow/State V2, handwriting fail-closed authority, Review Queue and offline/package behavior.
- Hub, Math, Device Gate and current subject runtimes.
- Existing production/deployment safety boundaries.

## Forbidden shortcuts

- reopening historical Roadmap rounds;
- merging a stale PR because it once passed CI;
- reverting current runtime to satisfy a historical validator;
- destructive source/storage migration;
- hidden production/runtime activation;
- weakening tests or gates only to obtain green CI.
