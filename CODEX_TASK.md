# CODEX_TASK

Task: `BAUMAN_PROJECT_STATE_POST_CONTROL_STATE_GATE_V1_RECONCILIATION`
Mode: `CHAT_FIRST / CURRENT_MAIN / FAIL_CLOSED`

## Current objective

Keep future work aligned with the true current-main baseline after Deep Study Journal v1, packaged-readiness Fx #88 and Current-Main Control-State Gate v1.

Roadmap V2 is complete through L35. Russian Listen+Write, Academic Phase2 A1→A6, Device Contract v6, Content Review API v1, Deep Study Journal v1, its packaged-readiness Fx #88 and Current-Main Control-State Gate v1 are promoted.

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
7. Treat Issue #81 and Issue #84 as completed/promoted current-main capability history.
8. Preserve Deep Study Journal as reflection-only learner state; no mastery/diagnostic/prerequisite/scheduler/progress mutation, and preserve the packaged readiness/asset invariants promoted by PR #88.
9. Do not invent a next round merely to continue numbering. Audit first.
10. For a real defect, create a scoped Fx hardening step.
11. For a genuinely missing capability, create a separately named current-main track.
12. Preserve Current-Main Control-State Gate v1 and ensure future CODEX_STATE/CODEX_TASK reconciliations pass it.

## Protected contracts

- Hub, Math, Russian, Foundation and subject runtime behavior.
- Device Gate and offline/package acceptance.
- Academic Phase2 A1→A6 boundaries.
- Device Contract v6 ownership and server-side enforcement.
- Content Review API v1 metadata-only boundary.
- Deep Study Journal v1 non-authoritative reflection boundary.
- Roadmap V2 terminal no-execution production boundary.
- No destructive migration.
- No implicit production deploy/publish.
- No automatic stale-branch promotion.
- CODEX_STATE/CODEX_TASK divergence must fail closed through Current-Main Control-State Gate v1.

## Completion condition

- control-state records PR #82 / Content Review v1, Deep Study Journal v1 and PR #88 packaged-readiness hardening as promoted;
- Issues #81 and #84 are completed/promoted;
- application-management contract v7 has no explicit `missing` readiness capability;
- post-merge current-main Whole System, Cloudflare Preview and Windows checkout gates for PR #88 are recorded as SUCCESS;
- Current-Main Control-State Gate v1 (PR #90) is promoted and its post-merge control-state + Windows gates are recorded as SUCCESS;
- future work resumes from current `main` only when a concrete defect, missing capability or explicit feature request exists.
