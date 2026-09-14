# CODEX_TASK

Task: `WHOLE_SYSTEM_COMPREHENSIVE_AUDIT_W2`
Mode: repository-wide architecture, integration, runtime and maintainability work; no publication.

## Gate status

- W0 GitHub reconciliation: PASS (`W0_GITHUB_RECONCILIATION_2026-09-13.md`).
- W1 §1.6 runtime Pass 15–19: PASS (`subjects/math/THEORY_C01_L06_RUNTIME_PASS15.json` through `THEORY_C01_L06_RUNTIME_PASS19.json`).
- Current gate: W2 whole-system comprehensive work.
- W3 and W4 have not started.
- Publication remains blocked until W2 and W3 pass.

## Required W2 scope

Audit the repository as one active Bauman system, then make only evidence-backed repairs needed for a clean, unified and maintainable runtime:

1. Bauman Master Hub and every active Subject Web App.
2. Math and Russian subject integration and data contracts.
3. Hub-to-subject and subject-to-Hub JSON/API handshake.
4. Navigation, canonical identity, session/state/progress synchronization and recovery.
5. Desktop, tablet and mobile behavior.
6. Existing offline/PWA behavior, runtime packaging and asset loading.
7. Error handling, route protection and missing-route recovery.
8. Existing administration, device and access flows in this repository.
9. UI/content/runtime consistency and accepted-contract regression safety.
10. Stale, duplicate, temporary or obsolete paths/versions: remove or quarantine only when evidence proves it is safe.

## Protected contracts

- Preserve all accepted §1.4, §1.5 and §1.6 academic/runtime behavior.
- Preserve §1.6 source/runtime count `22/22`, one-to-one identity and `compression: false`.
- Do not create a slideshow engine.
- Keep E235 unchanged and active.
- Keep E236, E237 and E238 disabled.
- Preserve `UGV_TELEMETRY_8X6 / CASE_C01_L06_V1_LOCKED` and every locked field/value.
- Do not invent scale vectors, numerical-rank tolerance/rank, SVD singular values, PCA components, retained dimension, anomaly thresholds, physical mode counts or fault diagnoses.
- Do not publish during W2.

## Working method

- Inventory active entry points, route surfaces, manifests, workflows, data contracts and runtime dependencies before editing.
- Compare implementation with documented contracts and current-main evidence.
- Classify findings as BLOCKER, MAJOR, MINOR or NON-BLOCKING.
- For each BLOCKER/MAJOR in scope, make the smallest coherent repair and verify it before continuing.
- Preserve accepted behavior and unrelated user work.
- Prefer `main`; do not create extra branches or versions.
- Record exact commits, changed files, commands/checks and remaining limitations in `WHOLE_SYSTEM_W2_REPORT.json`.

## W2 acceptance

W2 passes only when:

- active Hub and subject architecture/contracts are internally consistent;
- critical navigation/state/progress/runtime packaging defects found by the audit are repaired;
- no W2 BLOCKER or unresolved main-function MAJOR remains;
- §1.4–§1.6 protected contracts remain intact;
- focused static/integration/browser verification for each repair passes;
- `WHOLE_SYSTEM_W2_REPORT.json` is committed and `CODEX_STATE.md` advances to `WHOLE_SYSTEM_QA_W3`.

Do not start W3 until this gate passes, and do not publish.
