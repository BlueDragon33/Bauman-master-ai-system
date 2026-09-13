# CODEX_STATE

Current task: `THEORY_C01_L06_SELECTION_ROUTE_SYNC_PASS_18`

Status: `PASS_17_MULTI_LESSON_READER_RICHNESS_STATIC_VERIFY_PASS`

Date: 2026-09-13
Branch: `main`

## Execution policy
- Academic work for §1.6 is complete and accepted.
- Runtime integration has begun from the immutable approved import candidate; the durable merge is statically accepted.
- Prefer one bounded runtime pass at a time with explicit static/browser gates.
- Keep non-target lessons unchanged.
- When handed to ChatGPT Work, the mandatory project order is: GitHub reconciliation first, then §1.6 runtime completion, then whole-system comprehensive work, then whole-system QA, and only then ChatGPT Site publication.
- Work must not publish an intermediate/debug build or skip directly from the current state to publication.

## Work handoff checkpoint policy
Before Work changes code, it must reconcile GitHub `main` and actual accepted artifacts/CI with this recorded state. If GitHub evidence disagrees with this file, record and resolve the discrepancy first.

After reconciliation:
1. finish §1.6 runtime Pass 15–19 with gate-by-gate verification;
2. perform a repository/system-wide architecture, integration, UI/runtime-contract and regression review;
3. repair and clean the system comprehensively while preserving accepted contracts;
4. run whole-system static/integration/browser QA;
5. publish to ChatGPT Site only after the whole-system gate passes, then verify the live result.

Publishing remains blocked until the comprehensive system QA gate is PASS.

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
1. Pass 15 · Durable merge + static verification — PASS (`subjects/math/THEORY_C01_L06_RUNTIME_PASS15.json`).
2. Pass 16 · Runtime source registration — PASS (`subjects/math/THEORY_C01_L06_RUNTIME_PASS16.json`).
3. Pass 17 · Multi-lesson Reader/Reader Pro richness integration and static verification — PASS (`subjects/math/THEORY_C01_L06_RUNTIME_PASS17.json`).
4. Pass 18 · Selection/route/identity synchronization verification.
5. Pass 19 · Chromium/browser revalidation and final runtime acceptance.

Runtime progress: `3/5` complete.

## Current task requirements
`THEORY_C01_L06_SELECTION_ROUTE_SYNC_PASS_18`

Pass 18 must:
- read the Pass 17 report and the existing selection, canonical identity and presenter route bridges;
- verify §1.6 selection resolves to the durable L06 record and opens the existing Reader/Reader Pro deck with the exact canonical lesson ID/title;
- verify E210, E243, E244, E241 and E242 agree on the active L06 identity, without stale fallback or cross-lesson leakage;
- preserve the accepted §1.4/§1.5 identity behavior and all Pass 17 richness counts;
- change route/identity code only if deterministic verification exposes a defect;
- verify §1.6 remains `22/22`, one-to-one and `compression: false`, with E235 unchanged and E236/E237/E238 disabled;
- write a Pass 18 synchronization report;
- advance only to Chromium/browser Pass 19 after all selection/route/identity checks pass.
