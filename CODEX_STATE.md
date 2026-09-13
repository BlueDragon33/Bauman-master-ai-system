# CODEX_STATE

Current task: `THEORY_C01_L06_DURABLE_MERGE_RUNTIME_PASS_15`

Status: `PASS_14_ACADEMIC_ACCEPTANCE_COMPLETE`

Date: 2026-09-13
Branch: `main`

## Execution policy
- Academic work for §1.6 is complete and accepted.
- Runtime integration may now begin from the immutable approved import candidate.
- Prefer one bounded runtime pass at a time with explicit static/browser gates.
- Keep non-target lessons unchanged.

## Protected constraints
- Minimum 16 slides, no maximum; accepted source/runtime count is `22/22`.
- Preserve one source slide to one runtime slide; `compression: false`.
- Do not create a new slideshow engine.
- Keep E235 unchanged.
- Keep E236, E237 and E238 disabled.

## Accepted prior lessons
- §1.4: academic `14/14`, runtime `6/6`, browser accepted, `22/22` slides.
- §1.5: academic `14/14`, runtime `5/5`, browser accepted, `22/22` slides.

## §1.6 · Từ vector sang ma trận dữ liệu
Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`

Academic state:
- passes: `14/14` COMPLETE;
- acceptance: `subjects/math/THEORY_C01_L06_ACADEMIC_ACCEPTANCE.json`;
- acceptance version: `ACADEMIC_ACCEPTANCE_C01_L06_V1`;
- final academic state: `ACADEMIC_14_OF_14_PASS_RUNTIME_NOT_STARTED`;
- academic acceptance commit: `6adcb923a3c9e48e40f1007989051c767901c59a`.

Approved slideshow/import candidate:
- slideshow: `subjects/math/data/theory_slideshow/theory_slideshow_c01_l06.json`;
- slideshow version: `SLIDESHOW_C01_L06_V1_PASS13`;
- import candidate: `subjects/math/data/theory_integration/theory_lecture_content_c01_l06_import.json`;
- import version: `C01_L06_E129_IMPORT_V1_22_SLIDES_CANDIDATE`;
- source slides: `22` (`SL01–SL22`);
- runtime-import slides: `22` (`MATH-VN-C01-L06-S01–S22`);
- one-to-one mapping: true;
- compression: false;
- import package approved academically: true.

Locked case:
- `UGV_TELEMETRY_8X6` / `CASE_C01_L06_V1_LOCKED`;
- shape `8 x 6`, observations as rows;
- features: `omega_left`, `omega_right`, `a_long`, `a_lat`, `yaw_rate`, `battery_current`;
- units: `rad/s`, `rad/s`, `m/s^2`, `m/s^2`, `rad/s`, `A`;
- IDs `UGV-W01–UGV-W08`, 250 ms timestamps;
- mean `(8.5, 8.55, 0.03125, 0.02375, 0.01, 12.1625)`;
- `X_raw[2,4]=0.08 rad/s`, UGV-W03 yaw_rate.

Deferred boundaries remain locked:
- no scale vector;
- no numerical-rank tolerance/rank;
- no SVD singular values;
- no PCA components;
- no retained dimension/energy choice;
- no anomaly threshold;
- no physical mode count;
- no fault diagnosis.

## Runtime workflow remaining
Following the accepted §1.5 runtime pattern, §1.6 should use five runtime passes:
1. Pass 15 · Durable merge + static verification.
2. Pass 16 · Runtime source registration.
3. Pass 17 · Multi-lesson Reader/Reader Pro richness integration and static verification.
4. Pass 18 · Selection/route/identity synchronization verification.
5. Pass 19 · Chromium/browser revalidation and final runtime acceptance.

Runtime progress: `0/5` complete.

## Current task requirements
`THEORY_C01_L06_DURABLE_MERGE_RUNTIME_PASS_15`

Pass 15 must:
- read the academic acceptance and immutable approved import candidate;
- verify package/version/lesson ID/22-slide one-to-one mapping before merge;
- replace only the existing §1.6 record in durable `theory_lecture_content` using the accepted E129 merge contract;
- keep record count and non-target records unchanged;
- preserve lesson neighbors/order and zero duplicate lesson IDs;
- verify all `22` runtime slide IDs and `F01–F18` coverage;
- preserve locked UGV values and deferred boundaries;
- write a Pass 15 runtime merge report;
- do not modify runtime readers, manifest, Reader Pro, E235, E236/E237/E238;
- advance only to runtime source registration Pass 16 after static verification passes.
