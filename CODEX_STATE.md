# CODEX_STATE

Current task: `CHATGPT_SITE_PUBLICATION_W4`

Status: `WHOLE_SYSTEM_W3_PASS_W4_READY`

Date: 2026-09-14
Branch: `main`

## Gate state
- W0 GitHub reconciliation: PASS.
- W1 §1.6 runtime Pass 15–19: PASS.
- W2 whole-system audit and repair: PASS.
- W3 whole-system QA: PASS (`WHOLE_SYSTEM_W3_QA_REPORT.json`).
- W4 ChatGPT Site publication: READY, not yet claimed complete.

Final W3 runtime tested commit: `1a5969b38a49f88c24e98a87c044dd3f616a05c3`.
W3 acceptance report commit: `aded176683f3cc21dc553416c5e0690e9686f766`.

Final W3 evidence:
- Whole System Integration Gate run `34856746521`: PASS, including Chromium whole-system acceptance and Math Study Command Center acceptance.
- Cloudflare Preview CI run `34856746410`: PASS.
- Windows checkout safety run `34856746465`: PASS.
- Browser evidence artifact: `whole-system-browser-34856746521`, SHA-256 `1c3f1d3ba24fde7042785f1f4ac57d6ba242de2c2a3a8cd5bf5d333f89cb54ba`.
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
