# CODEX_TASK

Task: `BAUMAN_PROJECT_STATE_POST_DEVICE_CONTRACT_RECONCILIATION`
Mode: `CHAT_FIRST / CURRENT_MAIN / FAIL_CLOSED`

## Current objective

Keep project control-state aligned with the repository that is actually promoted to `main`.

Roadmap V2 is complete through L35. Russian Listen+Write, Academic Phase2 A1→A6 and Device Contract v6 are promoted. There is no active historical Roadmap sequence and no need to reconstruct Device Contract Issue #28 from stale branches.

## Mandatory sequence

1. Use current `main` as the baseline for all new work.
2. Treat `docs/roadmap_v2/CURRENT_EXECUTION_STATE.md` as the only authoritative Roadmap progress/history marker.
3. Do not reopen completed Roadmap rounds from stale branches, docs, PR descriptions or historical PASS artifacts.
4. Preserve promoted Russian Listen+Write runtime/data/offline/package behavior.
5. Preserve promoted Academic Phase2 A1→A6 semantics and unresolved-evidence boundaries.
6. Preserve Device Contract v6 semantics from PR #79:
   - Bauman-owned isolated device registry;
   - P-256 challenge/proof;
   - revocable device sessions;
   - device type/platform/browser metadata;
   - approve/block/unblock/edit-permission commands with audit;
   - 16-character BM display code;
   - server-side protected learning-data gate in the Runtime Worker.
7. Preserve fail-closed capability layering: the base control worker does not advertise learning access as live until the deployment/preview wrapper verifies D1 + app-origin readiness.
8. Close Issue #28 after this state reconciliation is promoted.
9. Do not treat `contentReviewApi: missing` as part of Issue #28. If it is needed, create a separate current-main capability track with explicit ownership, permissions, API contract and tests.
10. When a new defect is found, create a scoped Fx hardening step and run the relevant current gates.
11. When a genuinely missing architecture capability is found, create a new named track rather than extending Roadmap V2 past L35 by default.

## Protected contracts

- Preserve Hub, Math, Russian, Foundation and subject runtime behavior.
- Preserve Device Gate and offline/package acceptance.
- Preserve Academic Phase2 A1→A6 current-main contracts.
- Preserve Roadmap V2 terminal receipt-only/no-execution production boundary.
- Preserve Device Contract v6 ownership and server-side enforcement.
- No destructive source migration.
- No implicit production deploy/publish.
- No automatic promotion of stale historical PRs.

## Completion condition for this reconciliation

- `CODEX_STATE.md` and `CODEX_TASK.md` record PR #79 / Device Contract v6 as promoted;
- future sessions do not reconstruct Issue #28;
- intentional fail-closed learning-gate layering is documented;
- Issue #28 can be closed as completed after promotion;
- `contentReviewApi` remains explicitly separated as a possible next capability track.
