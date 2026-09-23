# E16R · m_p07 recovery after false E15 completion

## Repository truth

E15 was not a valid completed-content checkpoint. The repository proves that:

- the VN physical chapter spine contains C01-C06 only; there is no physical `MATH-VN-LA-C07`;
- `m_p07` exists in `theory-framework.json` as an 8-part logical learning module;
- the modern theory store had reusable anchors but was missing a complete covariance/correlation/PCA learning path;
- the legacy sidecar exports were empty, so the historical E15 counts were not durable repository evidence.

## Corrected architecture

E16R keeps `m_p07` logical and maps its learning content onto valid physical chapters:

- C01/C02: data matrix, eigen structure, PCA, reconstruction;
- C04: covariance as a random-variable concept;
- C05: centering/scaling, Pearson correlation and covariance matrix.

No physical `MATH-VN-LA-C07` is created.

## Completed recovery sequence

### E16R-B1 · architecture/source-map recovery — PASS

Created:

- `subjects/math/data/mp07-source-map-e16r.json`
- `scripts/validate-math-mp07-recovery-e16r.mjs`

The source map resolves all eight logical lessons and forbids the invalid physical C07 assumption.

### E16R-B2 · missing theory cores — PASS

Authored and imported four previously missing logical cores:

- `m_p07_t02` centering / standardization;
- `m_p07_t03` covariance;
- `m_p07_t04` Pearson correlation;
- `m_p07_t05` covariance matrix.

Bundle: `subjects/math/content_bundles/theory/e16r_mp07_missing_cores_bundle.json`

Total new theory content: **4 records / 40 slides**.

### E16R-B3 · PCA depth upgrade — PASS

Reused the existing C02-L06 modern lesson and expanded it from **16 to 22 slides** instead of creating duplicate theory.

Added explicit coverage for:

- covariance eigen structure;
- principal-axis ordering;
- explained variance ratio / cumulative explained variance;
- PCA projection and reconstruction;
- Frobenius reconstruction error;
- a multi-evidence gate for selecting k.

Bundle: `subjects/math/content_bundles/theory/e16r_mp07_pca_anchor_upgrade_bundle.json`

### E16R-C · sidecar recovery — PASS

Generated, audited, then imported into modern Content Vault stores:

| Store | m_p07 records |
|---|---:|
| formula_content | 24 |
| exercise_content | 64 |
| application_content | 16 |
| simulation_content | 16 |
| professor_qa_content | 8 |
| question_bank_content | 48 |
| review_pack_content | 8 |

Every record contains `logicalModuleId=m_p07`, `logicalLessonId`, valid physical `chapterId`, theory `lessonId`, and source anchors. Each logical lesson receives exactly **3 formulas / 8 exercises / 2 applications / 2 simulations / 1 professor Q&A / 6 questions / 1 review pack**.

Bundle: `subjects/math/content_bundles/e16r_mp07_sidecar_recovery_bundle.json`

### E16R-D · prerequisite and link integrity — PASS

The fail-closed DAG is:

`t01 → t02 → t03 → t04/t05 → t06 → t07 → t08`

with t05 requiring both covariance and Pearson foundations before covariance-eigen/PCA work.

Validation also requires:

- every logical lesson to resolve to at least one real theory lesson;
- every sidecar distribution to resolve by `logicalLessonId`;
- every question to resolve to an existing review pack;
- no hidden fallback to the nonexistent physical C07.

Validator: `scripts/validate-math-mp07-post-import-e16r.mjs`

A validator defect that previously allowed an empty resolved-target list to pass was found during this round and fixed. The gate now fails when any logical lesson has no theory target.

## Legacy mastery/index status

`mastery-map.json` and `content-index.json` remain empty intentionally.

The current activity mastery implementation is local runtime state, not `mastery-map.json`. Re-populating legacy files only to reproduce the old E15 count would create orphan data and another false completion signal.

E16R therefore uses runtime-active Content Vault sources and explicit link/provenance gates as completion evidence.

## E16R-E · runtime / CI gate

Static runtime audit confirms:

- Theory E129 uses `theory_lecture_content.json` as primary source with `lessons.json` only as compatibility fallback;
- Activity Studio uses `exercise_content`, `application_content`, `simulation_content`, `review_pack_content`, `question_bank_content`, and `professor_qa_content`;
- simulation source marks `simulation_content.json` canonical;
- professor drill reads canonical professor/question stores.

Dedicated CI:

`.github/workflows/math-mp07-e16r-gate.yml`

runs:

1. architecture/provenance gate;
2. academic bundle structural gate;
3. post-import DAG/link gate;
4. runtime routing/active-store gate.

## Current status

**Recovery branch content is complete and ready for CI/PR verification.**

Branch:

`fix/math-e16r-mp07-recovery-20260923`

Production deployment: **not performed**.

Direct merge to `main`: **not performed**.

E17 · time-series introduction remains blocked until the PR CI confirms E16R-E PASS.
