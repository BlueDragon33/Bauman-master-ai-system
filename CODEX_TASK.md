# CODEX_TASK

Task: `WHOLE_SYSTEM_QA_W3`
Mode: strongest available whole-system verification; no publication until this gate passes.

## Gate status

- W0 GitHub reconciliation: PASS (`W0_GITHUB_RECONCILIATION_2026-09-13.md`).
- W1 §1.6 runtime Pass 15–19: PASS (`subjects/math/THEORY_C01_L06_RUNTIME_PASS15.json` through `THEORY_C01_L06_RUNTIME_PASS19.json`).
- W2 whole-system audit and repair: PASS (`WHOLE_SYSTEM_W2_REPORT.json`, implementation commit `41daa39a9fcd99c8a887bb23912ca87e2c69a392`).
- Current gate: W3 whole-system QA.
- W4 publication has not started.
- Publication remains blocked until this W3 gate is committed and PASS.

## Required W3 verification

Run the strongest available coverage for:

1. Static validation and JSON/schema integrity.
2. Build and runtime-package reproducibility.
3. Hub, control service and subject integration.
4. Every canonical subject entry point and route.
5. Hub → subject task/identity delivery and subject → Hub state/progress reporting.
6. Session, route protection, device/access and recovery behavior.
7. Chromium browser behavior, desktop smoke, tablet and mobile responsive smoke.
8. Console errors, page errors, failed local HTTP/network requests and HTTP error responses.
9. Math and Russian runtime assets and UI contracts.
10. Regression of accepted §1.4, §1.5 and §1.6 runtime/academic packages.
11. §1.6 `22/22` slide count, one-to-one identities and `compression: false`.
12. Runtime source registration and lesson selection/route/identity synchronization.

## Classification and stop policy

- Classify every finding as BLOCKER, MAJOR, MINOR or NON-BLOCKING.
- Stop, repair and rerun the failing gate before continuing when a BLOCKER or functional MAJOR appears.
- Do not suppress console, page, request, HTTP, schema, packaging or contract failures.
- Do not publish if a BLOCKER remains or any primary function is broken.
- Keep remote historical/work branches outside the runtime gate; do not delete independent work without separate evidence and authority.

## Protected contracts

- Preserve all accepted §1.4, §1.5 and §1.6 academic/runtime behavior.
- Preserve §1.6 `22` source slides → `22` runtime slides, one-to-one, `compression: false`.
- Do not create a slideshow engine.
- Keep E235 unchanged and active; keep E236, E237 and E238 disabled.
- Preserve `UGV_TELEMETRY_8X6 / CASE_C01_L06_V1_LOCKED` and every locked field/value.
- Do not invent scale vectors, numerical-rank tolerance/rank, SVD singular values, PCA components, retained dimension, anomaly thresholds, physical mode counts or fault diagnoses.

## W3 evidence and acceptance

- Store the consolidated result in `WHOLE_SYSTEM_W3_QA_REPORT.json`.
- Record the exact tested commit, test commands/suites, artifact/report paths, results and finding counts.
- W3 passes only when all required gates pass, open BLOCKER count is zero and no main-function MAJOR remains.
- Advance `CODEX_STATE.md` and `CODEX_TASK.md` to W4 only after the W3 report is committed on `main`.
- Do not publish before that transition.
