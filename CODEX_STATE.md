# CODEX_STATE

Current task: `CHATGPT_SITE_PUBLICATION_W4`

Status: `WHOLE_SYSTEM_W3_REVALIDATION_PASS_W4_PUBLICATION_LOCKED`

Date: 2026-09-15
Branch: `main`

## Gate state
- W0 GitHub reconciliation: PASS.
- W1 §1.6 runtime Pass 15–19: PASS.
- W2 whole-system audit and repair: PASS.
- W3 whole-system QA: PASS after ChatGPT Site package/access revalidation (`WHOLE_SYSTEM_W3_QA_REPORT.json`).
- W4 ChatGPT Site publication: READY; Site registered owner-private but no version has been published.

## Closed pre-publication blocker
- Site project `appgprj_6aa89ce658888191b08427f58a86d38b` is registered and remains unpublished.
- The Cloudflare runtime correctly fails closed without a separate Bauman Control Service origin.
- GitHub has no configured `bauman-preview` Environment and the manual preview deploy workflow has no runs, so there is no verified live control origin to inject into ChatGPT Site.
- Resolution: Device Gate v4 remains active for the Cloudflare channel; the ChatGPT Site package receives one explicit owner-private platform access marker at build time. Source runtime does not contain that marker.
- Revalidation: commit `d75f887ad9b16a0d64d056d7e8e0f9170e3a16b1`; all seven GitHub checks passed.

## Immutable W4 publication lineage
Verified runtime commit to publish: `d75f887ad9b16a0d64d056d7e8e0f9170e3a16b1`.
W3 acceptance report commit: `18fd4eaba6d6fd1abc49eed5d2d63a7bb5b774fa`.
Publication manifest: `W4_PUBLICATION_MANIFEST.json`.
Live checklist: `W4_LIVE_PUBLICATION_CHECKLIST.md`.

Current `main` may be ahead of the verified runtime only through this W3 report/state/manifest checkpoint. Do not publish any untested runtime delta. Reconcile this condition immediately before publication.

## Final W3 evidence
- Whole System Integration Gate run `34856746521`: PASS.
- Chromium whole-system acceptance: PASS.
- Math Study Command Center browser acceptance: PASS.
- Cloudflare Preview CI run `34856746410`: PASS.
- Windows checkout safety run `34856746465`: PASS.
- Post-acceptance QA-only HEAD `60631ca409ddff8b84c91f706e4aaa8c1bd851da`: PASS.
- Whole System Integration Gate run `34916354239`: PASS.
- Windows checkout safety run `34916354249`: PASS.
- Revalidated Whole System Integration Gate run `34917940460`: PASS, including source and packaged ChatGPT Site Chromium acceptance.
- Revalidated Academic 2026 Gate run `34917940471`: PASS.
- Revalidated Cloudflare Preview CI run `34917940496`: PASS.
- Revalidated Device Gate E2E run `34917940458`: PASS.
- Revalidated Windows checkout run `34917940466`: PASS.
- Browser evidence artifact: `whole-system-browser-34856746521`.
- Browser artifact SHA-256: `1c3f1d3ba24fde7042785f1f4ac57d6ba242de2c2a3a8cd5bf5d333f89cb54ba`.
- Open BLOCKER: `0`.
- Open functional MAJOR: `0`.

## W4 publication policy
Publish only the verified system lineage above to ChatGPT Site. Do not publish an older/intermediate/debug build. After publication, verify the live result before marking W4 complete:
1. Hub loads and canonical subject entry points work.
2. Math §1.4, §1.5, §1.6 open correctly.
3. §1.6 remains `22/22`, one-to-one, `compression: false`.
4. E186 lesson/activity identity, Activity Studio, Formula, Simulation, Professor Drill and Study Command Center work live.
5. Russian subject runtime and optional chunk loader work live.
6. Hub↔subject task/identity/progress handshake works.
7. No blocking console/page/network/HTTP errors.
8. Desktop/tablet/mobile responsive smoke passes.

Do not claim W4 PASS without live publication evidence.

## Protected constraints
- Minimum 16 slides, no maximum; §1.6 accepted count `22/22`.
- One source slide → one runtime slide; `compression: false`.
- No new slideshow engine.
- E235 unchanged.
- E236, E237, E238 disabled.
- Preserve `UGV_TELEMETRY_8X6 / CASE_C01_L06_V1_LOCKED`.
- Do not invent scale vector, numerical rank/tolerance, SVD/PCA results, retained dimension, anomaly threshold, physical mode count or fault diagnosis.

## Accepted lessons
- §1.4: academic `14/14`, runtime `6/6`, browser accepted, `22/22` slides.
- §1.5: academic `14/14`, runtime `5/5`, browser accepted, `22/22` slides.
- §1.6: academic `14/14`, runtime `5/5`, browser accepted, `22/22` slides.

## §1.6 identity
Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`
Case: `UGV_TELEMETRY_8X6 / CASE_C01_L06_V1_LOCKED`
Canonical orientation: observations as rows, features as columns.
