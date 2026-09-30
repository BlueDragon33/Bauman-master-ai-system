# Russian P1 Executive Summary

Audit date: 2026-09-30
Base main SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`
Audit branch: `audit/russian-p1-forensic-foundation-20260930`
Status: **VALIDATING**

## Current reality
Russian is a large, functioning learning system with 305 subject files, R01–R26 lessons, substantial academic content, 8,000 vocab items, 1,220 basic speaking items, 4,164 dialogues and 1,140 Deep Speaking tasks.

The main architectural problem is not lack of content. It is accumulated ownership:
- broad `core.js`;
- very large legacy `core.css`;
- multiple specialized overlays;
- learner-state responsibilities spread across runtimes;
- newer truthful evidence guards coexisting with older score semantics.

## Main P1 findings
1. P1 CI blind spot found and fixed in audit tooling: Russian diffs now trigger whole-system browser acceptance.
2. CSS debt is extreme and measurable; bulk deletion is unsafe.
3. Existing R01–R26 content should be preserved and normalized, not regenerated.
4. Vocabulary needs linguistic enrichment, especially canonical stress, morphology/POS and links.
5. ASR speaking-score semantics conflict with newer truthful speaking guardrails.
6. Learner-state oversize fallback can delete local data without backup.
7. Offline large-data strategy is comparatively strong and should be preserved.
8. Handwriting authority is fail-closed and has strong existing gates.
9. AI mentor boundary is currently read-only with respect to canonical mastery.
10. Browser/runtime evidence is still required before P1 can be marked PASS.

## P2 readiness
`NOT READY — WAITING FOR P1 BROWSER EVIDENCE AND FINAL OWNERSHIP CLOSURE`.

Production: **UNCHANGED**.
