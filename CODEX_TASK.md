# CODEX_TASK

Task: `CHATGPT_SITE_PUBLICATION_W4`
Mode: publish the revalidated owner-private build, then live revalidate before acceptance.

## Gate status
- W0 GitHub reconciliation: PASS.
- W1 §1.6 runtime Pass 15–19: PASS.
- W2 whole-system audit and repair: PASS.
- W3 whole-system QA: PASS after ChatGPT Site package/access revalidation (`WHOLE_SYSTEM_W3_QA_REPORT.json`).
- Current gate: W4 ChatGPT Site publication; no Site version has been published yet.

## Closed blocker and verified repair
1. The registered ChatGPT Site is owner-private and has no published version.
2. The verified Cloudflare runtime fails closed without its separate Control Service, as designed.
3. No live `bauman-preview` Environment/deployment exists on GitHub, so publishing the unchanged static root would lock the whole UI.
4. The build-time owner-private Sites access boundary was added without weakening or replacing Device Gate v4 in the Cloudflare runtime.
5. Source and packaged static/browser/academic/integration gates passed locally and in all seven GitHub checks on `d75f887ad9b16a0d64d056d7e8e0f9170e3a16b1`.
6. W4 may resume with that exact verified runtime/package lineage.

Verified runtime commit: `d75f887ad9b16a0d64d056d7e8e0f9170e3a16b1`.
W3 report commit: `18fd4eaba6d6fd1abc49eed5d2d63a7bb5b774fa`.
Publication manifest: `W4_PUBLICATION_MANIFEST.json`.
Live acceptance checklist: `W4_LIVE_PUBLICATION_CHECKLIST.md`.

## Mandatory pre-publish reconciliation
1. Compare current `main` to the verified runtime commit.
2. Classify every post-runtime change. Only documentation/state/report/manifest or CI-verified QA-only test/audit changes may remain outside the verified runtime lineage.
3. If any runtime asset/code/data changed after the verified runtime commit, stop publication and re-run the relevant W3 gates first. Current QA-only HEAD `60631ca409ddff8b84c91f706e4aaa8c1bd851da` passed integration/browser run `34916354239` and Windows run `34916354249`.
4. Publish the verified runtime lineage, never an older/intermediate/debug build.

## W4 procedure
1. Publish the verified system lineage to ChatGPT Site.
2. Record live site identity/URL, publication time and deployed source/build identity when available.
3. Execute every item in `W4_LIVE_PUBLICATION_CHECKLIST.md`.
4. Verify Hub and canonical subject entry points.
5. Verify Math §1.4–§1.6, including §1.6 `22/22`, one-to-one and `compression: false`.
6. Verify E186 lesson/activity identity and route synchronization.
7. Verify Activity Studio, mastery, notes/session, Formula, Simulation, Professor Drill and Study Command Center.
8. Verify Russian app and optional-data chunks.
9. Verify Hub↔subject identity/task/progress handshake.
10. Verify desktop/tablet/mobile responsive smoke.
11. Verify no blocking console/page/network/HTTP errors.
12. If any publication blocker appears, repair, rerun relevant local/CI gates, republish and revalidate.
13. Only after live checks PASS, create `WHOLE_SYSTEM_W4_PUBLICATION_REPORT.json` and advance `CODEX_STATE.md` / `CODEX_TASK.md` to final accepted state.

## Stop policy
- Do not claim publication from CI dry-run or preview packaging alone.
- Do not claim W4 PASS without live-site evidence.
- Do not publish an older/intermediate/debug build.
- Do not bypass a failed live check.
- Do not silently include post-W3 runtime changes.

## Protected contracts
- Preserve accepted §1.4, §1.5 and §1.6 academic/runtime behavior.
- Preserve §1.6 `22` source slides → `22` runtime slides, one-to-one, `compression: false`.
- No new slideshow engine.
- E235 unchanged; E236/E237/E238 disabled.
- Preserve `UGV_TELEMETRY_8X6 / CASE_C01_L06_V1_LOCKED`.
- Do not invent deferred scale/rank/SVD/PCA/anomaly/fault results.
