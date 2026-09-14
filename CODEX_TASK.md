# CODEX_TASK

Task: `CHATGPT_SITE_PUBLICATION_W4`
Mode: publish verified build only, then live revalidate before acceptance.

## Gate status
- W0 GitHub reconciliation: PASS.
- W1 §1.6 runtime Pass 15–19: PASS.
- W2 whole-system audit and repair: PASS.
- W3 whole-system QA: PASS (`WHOLE_SYSTEM_W3_QA_REPORT.json`).
- Current gate: W4 ChatGPT Site publication.

Verified runtime commit: `1a5969b38a49f88c24e98a87c044dd3f616a05c3`.
W3 report commit: `aded176683f3cc21dc553416c5e0690e9686f766`.

## W4 procedure
1. Reconcile current `main` before publication. Documentation/state-only commits after the verified runtime are allowed; do not silently publish runtime changes that were not covered by W3.
2. Publish the verified system lineage to ChatGPT Site.
3. Record publication evidence: live site identity/URL, publication time, deployed source commit/build identity when available.
4. Run live post-publication checks:
   - Hub and canonical subject entry points;
   - Math §1.4–§1.6;
   - §1.6 `22/22`, one-to-one, `compression: false`;
   - E186 lesson/activity identity and route synchronization;
   - Activity Studio, mastery, notes/session;
   - Formula, Simulation, Professor Drill, Study Command Center;
   - Russian app and optional-data chunks;
   - Hub↔subject identity/task/progress handshake;
   - desktop/tablet/mobile responsive smoke;
   - console/page/network/HTTP blocking errors.
5. If any publication blocker appears, repair, rerun the relevant local/CI gate, republish and revalidate.
6. Only after live checks PASS, create `WHOLE_SYSTEM_W4_PUBLICATION_REPORT.json` and advance `CODEX_STATE.md` / `CODEX_TASK.md` to final accepted state.

## Stop policy
- Do not claim publication from CI dry-run or preview packaging alone.
- Do not claim W4 PASS without live-site evidence.
- Do not publish an older/intermediate/debug build.
- Do not bypass a failed live check.

## Protected contracts
- Preserve accepted §1.4, §1.5 and §1.6 academic/runtime behavior.
- Preserve §1.6 `22` source slides → `22` runtime slides, one-to-one, `compression: false`.
- No new slideshow engine.
- E235 unchanged; E236/E237/E238 disabled.
- Preserve `UGV_TELEMETRY_8X6 / CASE_C01_L06_V1_LOCKED`.
- Do not invent deferred scale/rank/SVD/PCA/anomaly/fault results.
