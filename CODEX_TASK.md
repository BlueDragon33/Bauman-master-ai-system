# CODEX_TASK

Task: `BAUMAN_PROJECT_STATE_RECONCILIATION`
Mode: `CHAT_FIRST / CURRENT_MAIN / FAIL_CLOSED`

## Current objective

Keep project control-state aligned with the repository that is actually promoted to `main`.

Roadmap V2 is complete through L35. Russian Listen+Write has been promoted. There is no active Roadmap B101→B104 sequence and no L36 requirement in the accepted Roadmap architecture.

## Mandatory sequence

1. Use current `main` as the baseline for all new work.
2. Treat `docs/roadmap_v2/CURRENT_EXECUTION_STATE.md` as the only authoritative Roadmap progress/history marker.
3. Do not reopen completed Roadmap rounds from stale branches, docs, PR descriptions, or historical PASS artifacts.
4. Audit open PRs before reuse:
   - compare them with current `main`;
   - reject scope contamination and behind-main candidates;
   - reconstruct a clean promotion branch when responsibility boundaries are mixed.
5. Preserve the promoted Russian Listen+Write runtime/data/offline/package behavior.
6. When a new defect is found, create a scoped Fx hardening step and run the relevant current gates.
7. When a genuinely missing architecture capability is found, create a new named track/round rather than extending Roadmap V2 past its terminal boundary by default.

## Protected contracts

- Preserve Hub, Math, Russian, Foundation and subject runtime behavior.
- Preserve Device Gate and offline/package acceptance.
- Preserve Roadmap V2 terminal receipt-only/no-execution production boundary.
- No destructive source migration.
- No implicit production deploy/publish.
- No automatic promotion of stale historical PRs.

## Completion condition for this hardening

The control files no longer identify L26/B102 as active, no historical Roadmap sequence is presented as current work, and future sessions are directed to current `main` plus an explicit scoped task.
