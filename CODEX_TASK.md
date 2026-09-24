# CODEX_TASK

Task: `BAUMAN_PROFESSIONAL_UX_REPORTING_QA_POST_MERGE_RECONCILIATION`
Mode: `CHAT_FIRST / CURRENT_MAIN / FAIL_CLOSED`

## Current objective

Keep future work aligned with the true current-main baseline after PR #111 promoted the professional UX/reporting QA hardening as merge commit `cbdba1a5cee8703f6ceed2c94e070909d7014a93`. Preserve meaningful-evidence reporting, destructive-data confirmation and the new Academic Reporting UX QA regression gate.

Roadmap V2 is complete through L35. Russian Listen+Write, Academic Phase2 A1→A6, Device Contract v6, Content Review API v1, Deep Study Journal v1, its packaged-readiness Fx #88, Current-Main Control-State Gate v1.1, Russian Future Reference UI, Russian Future UI idempotence Fx #95, Russian Future UI package-readiness Fx #97, Russian Vocabulary Visual Immersion v1 #99, Production Publish Gate v1 #102, Russian UX/UI refactor PASS 1→10, and Professional UX/reporting QA hardening #111 are promoted.

## Mandatory sequence

1. Use current `main` at or after `cbdba1a5cee8703f6ceed2c94e070909d7014a93` as the baseline.
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
12. Preserve Current-Main Control-State Gate v1.1 and ensure future CODEX_STATE/CODEX_TASK reconciliations pass promoted-SHA ancestry validation.
13. Preserve the Russian Future Reference UI geometry and packaging invariants: 220px desktop sidebar, wide main canvas, no fixed right rail, no horizontal overflow, and direct + packaged browser acceptance.
14. Preserve Russian Future UI idempotence: a settled repeated `RUSSIAN_FUTURE_UI.upgrade()` must not create child/class mutations or self-trigger MutationObserver churn.
15. Preserve Russian Future UI package readiness: ChatGPT Site and Cloudflare preview materializers must require the Future UI CSS/JS and verify packaged Russian HTML references them.
16. Preserve Russian vocabulary visual immersion: visible vocabulary learning must use visual cues plus Russian contextual explanation/practice, must not prefer Vietnamese/English translation fields, and must keep the direct + packaged browser regression.
17. Preserve Production Publish Gate v1: production must remain manual-only, exact-preview-revision-first, isolated from preview/local D1, protected by the `bauman-production` environment, and fully dry-run before any remote production mutation.
18. Preserve the promoted Russian UX/UI PASS 1→10 learner-first architecture and its direct + packaged regression matrix.
19. Treat PR #109 as stale duplicate work from pre-#108 main; do not merge or reuse it.
20. Preserve PR #111 report truthfulness: storage initialization timestamps alone are not learner evidence; report state may advance only from meaningful learning activity or Stage Check evidence.
21. Preserve explicit confirmation before destructive grade/transcript evidence deletion and keep cancel as a no-op.
22. Keep Academic Reporting UX QA active for A3/A4/A5 report and destructive-data regression.

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
- CODEX_STATE/CODEX_TASK divergence and stale/non-ancestor promoted SHAs must fail closed through Current-Main Control-State Gate v1.1.
- Russian Future Reference UI must preserve existing Russian routes/data/state ownership and direct + packaged offline/runtime behavior.
- Russian Future UI presentation upgrades must remain DOM-idempotent and observer-safe.
- Russian Future UI CSS/JS package assets and HTML references must fail closed during materialization.
- Russian vocabulary source data remains preserved while the visible learning projection stays visual-first and Russian-context only; no Vietnamese/English translation fallback or raw metadata translation clue may re-enter the card surface.
- Production Publish Gate v1 remains outside Roadmap V2, manual-only and fail-closed: no push-triggered production deploy, no preview/production D1 reuse, no promotion from a different revision, and no bypass of production environment confirmation.
- Russian UX/UI PASS 1→10 learner-first behavior from PR #108 remains promoted; stale duplicate PR #109 must not be promoted.
- PR #111 professional reporting must remain evidence-truthful, learner-facing and non-authoritative; it must not silently alter mastery, scheduler, completion or honors eligibility.
- Destructive grade/transcript evidence actions must remain confirmation-guarded and cancel-safe.

## Completion condition

- control-state records PR #82 / Content Review v1, Deep Study Journal v1 and PR #88 packaged-readiness hardening as promoted;
- Issues #81 and #84 are completed/promoted;
- application-management contract v7 has no explicit `missing` readiness capability;
- post-merge current-main Whole System, Cloudflare Preview and Windows checkout gates for PR #88 are recorded as SUCCESS;
- Current-Main Control-State Gate v1 (PR #90) and v1.1 hardening (PR #93) are promoted;
- Russian Future Reference UI (PR #92) is promoted and its pre-merge + post-merge Whole System/direct/packaged gates are recorded as SUCCESS;
- Russian Future UI idempotence Fx (PR #95) is promoted as `06e3c56308d71ff3ce8f8b3cedf12242c2b0c1f9`, with Russian Reference UI, Cloudflare Preview, Windows checkout and Whole System direct + packaged Future UI gates recorded as SUCCESS;
- Russian Future UI package-readiness Fx (PR #97) is promoted as `00605feb7dbdfbb9c6f1e5399d75c1af96211af4`, with fail-fast ChatGPT Site/Cloudflare package checks and Whole System packaged Future UI acceptance recorded as SUCCESS;
- Russian Vocabulary Visual Immersion v1 (PR #99) is promoted as `e8108f25d6e3dd686116c6f13589ddc913c95e68`, with Russian Reference UI, Cloudflare Preview, Windows checkout and Whole System direct + packaged Russian Future UI gates recorded as SUCCESS;
- Production Publish Gate v1 (PR #102) is promoted as `51138b9e9f9a60c47d91a354446532e8064a545f`, with Production Publish Gate CI, Cloudflare Preview, Control Service, Runtime Device Gate and Windows checkout recorded as SUCCESS on the tested PR head;
- Russian UX/UI refactor PASS 2→10 (PR #108) is promoted as `59d4bc3bad24c20eac09376fe27f564d9dc9a87e`; PR head `86887d287d8922b3d14c0bf636b11b628919972d` passed Russian Reference UI, Windows checkout, Production Publish Gate CI, Cloudflare Preview, Whole System Integration, and Foundation Domain Model gates;
- Professional UX and reporting QA hardening (PR #111) is promoted as `cbdba1a5cee8703f6ceed2c94e070909d7014a93`; its post-merge Academic Reporting UX QA, Academic prerequisite, Russian Reference UI, Cloudflare Preview, Production Publish Gate CI, Windows checkout and Whole System direct + packaged gates are SUCCESS;
- future work resumes from current `main` only when a concrete defect, missing capability or explicit feature request exists.
