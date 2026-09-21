# CODEX_TASK

Task: `BAUMAN_PROJECT_STATE_POST_CONTENT_REVIEW_RECONCILIATION`
Mode: `CHAT_FIRST / CURRENT_MAIN / FAIL_CLOSED`

## Current objective

Keep future work aligned with the true current-main baseline after Content Review API v1 promotion.

Roadmap V2 is complete through L35. Russian Listen+Write, Academic Phase2 A1→A6, Device Contract v6 and Content Review API v1 are promoted.

## Mandatory sequence

1. Use current `main` as the baseline.
2. Do not reopen historical Roadmap rounds or stale candidate branches as current work.
3. Preserve Russian Listen+Write, Academic Phase2, Device Contract v6 and Content Review API v1.
4. Preserve fail-closed learning-gate layering; the base worker must not advertise the learning gate as live before deployment/preview readiness.
5. Preserve Content Review ownership:
   - review DB stores metadata/reference/hash only;
   - Application Management does not store or edit learning-content bodies;
   - reviewer may approve/reject;
   - publish requires publisher/owner;
   - mutations remain idempotent and expected-state protected.
6. Treat Issue #28 as completed.
7. Close Issue #81 after this reconciliation is promoted.
8. Do not invent a next round merely to continue numbering. Audit first.
9. For a real defect, create a scoped Fx hardening step.
10. For a genuinely missing capability, create a separately named current-main track.

## Protected contracts

- Hub, Math, Russian, Foundation and subject runtime behavior.
- Device Gate and offline/package acceptance.
- Academic Phase2 A1→A6 boundaries.
- Device Contract v6 ownership and server-side enforcement.
- Content Review API v1 metadata-only boundary.
- Roadmap V2 terminal no-execution production boundary.
- No destructive migration.
- No implicit production deploy/publish.
- No automatic stale-branch promotion.

## Completion condition

- control-state records PR #82 / Content Review v1 as promoted;
- Issue #81 can be closed as completed;
- application-management contract v7 has no explicit `missing` readiness capability;
- future work resumes from current `main` only when a concrete defect, missing capability or explicit feature request exists.
