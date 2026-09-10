# Prerequisite Assurance · Pass 09 · P10 Scientific/Data Python

Date: 2026-09-10
Branch: `temp/bauman-master-hub-prereq-2026`
Status: `P10_PACK_IMPLEMENTED_GATE_PENDING`

## Goal

Build the compact scientific/data-Python readiness layer required by the locked IU5 2026 curriculum, with semester-1 priority on `d04 · Многомерный анализ данных в системах искусственного интеллекта`.

P10 is a competency prerequisite inferred by Bauman Master Hub. It is not an administrative prerequisite declared by Bauman.

## Reuse before rebuild

Pass 09 reuses existing Programming lessons instead of creating another generic Python/data course:

- PR04 · NumPy và vector hóa dữ liệu;
- PR05 · Pandas và làm sạch bảng dữ liệu;
- PR08 · Notebook thực nghiệm và README tái lập;
- PR12 · File, JSON, CSV và dữ liệu học tập;
- PR25 · Pipeline dữ liệu cho ML;
- PR26 · Scikit-learn baseline và metric.

The new route fills only audited readiness gaps: shape/dtype discipline, merge/schema safety, SciPy essentials, diagnostic plotting, leakage-safe splitting, Pipeline/ColumnTransformer, preprocessing discipline, cross-validation and dataset contracts.

## New P10 pack

Added `assets/data/prerequisite-packs/p10-scientific-data-python.json` with 11 nodes:

1. NumPy shape/dtype/axis/vectorization.
2. pandas schema/index/missing values/merge cardinality.
3. CSV/JSON ingestion and dtype locking.
4. Minimal SciPy for numerical verification.
5. Matplotlib for diagnostic visualization.
6. Train/validation/test discipline and leakage prevention.
7. scikit-learn Pipeline and ColumnTransformer.
8. Imputation/scaling/encoding without leakage.
9. Cross-validation, baseline and metric workflow.
10. Reproducible notebook/preprocessing artifacts.
11. Dataset contract/schema validation and bridge into d04/NIR.

## Official-course mapping

P10 maps as a competency prerequisite/bridge to:

- d04 Multivariate Data Analysis — primary, semester 1;
- d08 Machine Learning Methods — semester 2;
- d11 Neural Systems Development — semester 2;
- d12 Time Series Analysis — semester 3;
- d13 AI in Business Analytics — semester 3;
- d16 NIR on Data Processing and Analysis — semester 3.

The official curriculum file remains the source of truth for course identity and timing. P10 does not replace P2 Linear Algebra or P3 Probability/Statistics for d04.

## Diagnostic design

Global mastery formula remains:

`M = 0.25*D0 + 0.50*D1 + 0.25*D2`

P10 target is 90, D1 application minimum is 85, and zero critical misconceptions are allowed. Broad P10 study stops at MASTERED (`>=95`, D1 `>=90`, zero critical misconceptions).

Pack contents:

- D0: 18 recall items;
- D1: 12 application tasks;
- D2: 8 bilingual VI/RU oral prompts;
- 11 critical misconceptions;
- 8 targeted repair routes.

D1 focuses on actual data-work competence: shape compatibility, merge cardinality, dtype locking, residual checks, diagnostic plots, train-only preprocessing statistics, temporal leakage, Pipeline/ColumnTransformer design, encoding/scaling placement, metric choice, reproducible notebooks and schema validation.

## Scope guard

P10 explicitly excludes deep MLOps, Kubernetes/Kubeflow, Airflow administration, Spark internals, CUDA optimization, distributed training, feature-store platform work, LLM frameworks and robotics-telemetry specialization from the default prerequisite route.

SciPy is a focused numerical tool here, not a replacement for mathematics and not mandatory for every task.

## Validator and CI

Added `scripts/validate-p10-scientific-data-python.js` and wired it into `.github/workflows/academic-2026-prerequisite-gate.yml`.

The validator checks registry integrity, exact official-course identities, actual existence and identity of all six reused lessons, 11 unique ordered acyclic nodes, diagnostic/misconception/repair-route references, Russian oral prompts, scope guards and independent sanity invariants for matrix-vector shape compatibility, train-only preprocessing statistics versus leaked full-data statistics, and dataset-schema/dtype/category validation.

CI run for the workflow-wiring commit is pending at the time this file is first written. This status must be updated only after the run completes.

## Runtime policy

Pass 09 does not write diagnostic scores, mutate the adaptive scheduler, overwrite existing Programming lessons, create a new top-level subject, require MLOps for READY or merge into `main`.

## Next pass after CI

Pass 10: `P11 · Research Foundation`. Preserve literature → question → baseline → experiment → metrics → reproducibility → NIR/VKR, but remove UGV/USV as the default research direction and keep topic selection neutral until supervisor/NIR direction is known.
