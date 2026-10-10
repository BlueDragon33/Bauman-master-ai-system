# RE57 — LAST ~5% WORK HANDOFF (CLOUD BROWSER / HUMAN UX / RELEASE GATE)

**Status:** PREPARED FOR WORK; NOT EXECUTED IN WORK; NOT A PRODUCTION APPROVAL.
**Repository:** `BlueDragon33/Bauman-master-ai-system`
**Last verified merged engineering baseline:** `main e81d6b20ac7221224ac16ce7804e47ede3822361` (RE56, PR #325).
**Constitution:** repository adoption `1.2.0` remains enforced. Blueprint-Hub [PR #98](https://github.com/BlueDragon33/Software-Blueprint-Hub/pull/98) is an **unratified draft** Constitution 1.3.0. K1–K5 are observation-only pilots; do not claim constitutional enforcement, change adoption, or fabricate passing signals.
**Time/credit budget:** chat/GitHub for ~95% of routine coding, audit, regression, branch/PR and CI work. Use Work for only the final ~5% requiring authenticated, real-browser interaction/UX evidence. **This is a workflow allocation heuristic, NOT a claim the product is 95% completed.**

## PRE-WORK G0 — TRUE SOURCE & AUTHORITY (Chat, $0 Work)

1. Resolve current GitHub main HEAD and the exact preview/site revision. Never assume this recorded baseline is still HEAD.
2. Fetch actual CI statuses for exact SHA (Development Fast CI, Russian Reference UI, Universal Constitution Compliance, Whole System Integration Gate with source+packaged browser jobs). A merged PR or old green check is not sufficient for a NEW revision.
3. Run `node subjects/russian/engine/review/re57-continuation-readiness.mjs` for a read-only, truthful 43-item readiness report. Verify empty reviewer registry separately. No review decisions may be fabricated.
4. Record necessary URL(s) from actual live Preview/Site, account context, build manifest, screenshots and browser console. If unresolvable, STOP as `LIVE_PREVIEW_UNAVAILABLE`, don't invent addresses or preview codes.
5. Ensure no irreversible changes, new services, payment, account policies, identity/email changes, credential sharing, or arbitrary repo-wide scans.

## WORK W1 — AUTHENTICATED LIVE PREVIEW CHECK

Work mode only when a real logged-in preview is accessible. Start with minimal browser steps; avoid duplicating CI screenshots. Verify actual build/commit identity before proceeding. Capture desktop (at least one) and mobile-sized viewport (at least one). Test the DEFAULT app is still unaffected by the experimental candidate. Verify opt-in gates individually:

- No flags -> candidate absent.
- `?ruEngine=grounded-v1&ruWorld=spatial-r2-candidate` -> spatial preview only.
- `?ruEngine=grounded-v1&ruWorld=spatial-r2-candidate&ruDialog=repair-v1` -> dialogue preview.
- Russian text hidden initially, Vietnamese assistance on demand, TTS labeled as machine/unreviewed, RU04 mastery unchanged.

For each tested scene capture actual URL, build SHA, chosen viewport, expected, observed, console errors, screenshot references and PASS/FAIL; no trust based on badges alone.

## WORK W2 — ZERO-RUSSIAN STUDENT UX E2E

Walk through at least one full interaction per setting: room, shop, metro, dorm, university, then all four repair-dialogue scenarios. Assess:
- Audio replay and slow rate, rapid tap/reentrant and unavailable audio; do not certify pronunciation by listening yourself.
- Map semantics (metro entrance vs route map vs ticket machine; room #12 vs auditorium #12; shower room vs showerhead; library).
- Actual physical action, wrong/right feedback, asking strangers to repeat/slower, optional Russian script and VI support.
- Basic touch/keyboard/focus and small viewport; no clipped controls; clear single-task hierarchy; no new UI clutter.
- After reload/offline, clear truthful state; no fake mastery/evidence or unsaved changes. Reconnect if needed.
- Text source in Preview matches the revised notebook sentence and shower-room Russian+Vietnamese hint, with status explicitly AI_DRAFT_PENDING_RU03.

If UX tests find a bug, capture one minimal reproduction, affected source owner and evidence; return to Chat/GitHub to FIX + 4 exact-head gates. Re-test only impacted routes in Work rather than rerunning every workflow unnecessarily.

## WORK W3 — PRODUCT ACCEPTANCE RECEIPT

Produce a compact PASS/FAIL/BLOCKED table with fields:
`scenario | viewport | exact_SHA | preview_URL | expected | observed | screenshots/logs | severity | owner | follow-up`.
Separately include asset caching/SW version, error logs, state-change evidence, script accessibility, and actual TTS support/provider notes. Unverified cases are BLOCKED, never PASS. Do NOT publish production just because browser tests pass.

## WORK W4 — HUMAN RU03 REVIEW (separate EXTERNAL authority, not a Work automation)

Current 43-item review packets and the empty `ru03-reviewers.v1.json` registry make the linguistic and immutable audio promotion gate BLOCKED. Qualified independent HUMAN_RU03 text/audio reviewer(s) must be actually authorized with independently verified credentials. Their exact decisions must match item fingerprints and real immutable audio hash. A learner, AI, Work agent or self-labeled reviewer cannot substitute. Work can help navigate a properly connected review interface, but cannot invent reviewers, signatures or approvals.

**STOP** as `HUMAN_RU03_EXTERNAL_REVIEW_REQUIRED` if no qualified reviewer and approved audio are available. Continue harmless engineering only in the Chat workspace. Do not make this an obstacle to testing general app UX, but do not activate unapproved lessons as canonical.

## WORK W5 — PRODUCTION-ONLY AFTER SEPARATE EXPLICIT APPROVAL

If and only if authorized reviews, exact-head tests, live acceptance, migrations/rollback and independent release-owner approval ALL exist, follow `prompts/constitution/C3_RELEASE_ANNEX_SHARED.md`. Release the already-existing Site, never create a duplicate. Verify deployed revision/hash, service worker freshness, real navigation, saved state, console, rollback ability and post-release monitoring. Otherwise **STOP: `PRODUCTION_NOT_AUTHORIZED`**. Never imply a new publication.

## DRAFT 1.3 K1–K5 (NOT YET APPROVED)

Use observation-only sampling with recorded date/SHA/cohort and provenance; do not manufacture an initial baseline:
- **K1** regressions introduced per change: classify critical/high/medium and exact introduced commit; target zero severe regressions.
- **K2** first-fix success: ratio of verified closed issues not requiring another code attempt; do not infer from PR number.
- **K3** newly duplicated canonical logic: targeted diff on the actual owner; target zero.
- **K4** actual app load/response distribution under the same device/network/browser; compare to a measured baseline, not synthetic promises.
- **K5** reopened resolved defects at 14/30-day cohorts; requires real issue history and attribution.

No hard constitutional PASS/FAIL thresholds from draft metrics before ratification and calibrated live pilots.

## WORK COPY-PASTE TASK

You are a Production QA / Russian Pre-A0 UX tester operating ONLY inside ChatGPT Work's authenticated Cloud Browser. Repository BlueDragon33/Bauman-master-ai-system. First read `subjects/russian/docs/engine/RE57_WORK_LAST_5_PERCENT_HANDOFF.md` from the CURRENT main HEAD, not chat recollection. Verify actual committed SHA, four CI gates and existing Preview URL, never guess codes or issue false PASS. Use minimal Work browser interactions to execute W1–W3, capture per-step screenshots and logs with exact SHA, explicitly label defects and blocked cases. Do NOT modify Constitution adoption, authorize reviewer RU03, auto-grade speaking, publish Production or create another site. Stop and request user action only for credentials/authentication, genuine HUMAN_RU03 external review or separate release approval. If issues found, return precise reproducible bugs to Chat for code fix; after exact-head gates, re-test impacted scenario only. Save a compact evidence-backed acceptance receipt and report remaining blockers. Production and canonical publication remain blocked until all independent authorities clear.
