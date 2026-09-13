# CODEX_TASK

Task: `THEORY_C01_L06_DURABLE_MERGE_RUNTIME_PASS_15`
Mode: approved-import durable-merge-only, static verification first.

## Read only what is needed
1. `CODEX_STATE.md`
2. `subjects/math/THEORY_C01_L06_ACADEMIC_ACCEPTANCE.json`
3. `subjects/math/data/theory_integration/theory_lecture_content_c01_l06_import.json`
4. durable `theory_lecture_content` data file used by the existing E129 importer
5. `subjects/math/THEORY_C01_L05_RUNTIME_PASS15.json` only as structural precedent.

## Goal
Merge exactly the academically approved §1.6 import candidate into the existing durable `theory_lecture_content` record and statically prove that no non-target lesson changes.

## Preconditions
- Academic acceptance status is `PASS`.
- Academic passes are `14/14`.
- Approved import version is `C01_L06_E129_IMPORT_V1_22_SLIDES_CANDIDATE`.
- Target lesson ID is `MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`.
- Source/runtime slide counts are `22/22`.
- `compression: false` and mapping is one-to-one.

## Durable merge requirements
- Replace only the existing §1.6 record; do not append a duplicate.
- Preserve record count and target index/order unless the current durable contract explicitly requires otherwise.
- Preserve previous and next lesson identities.
- Keep every non-target record byte-equivalent or canonical-hash-equivalent.
- Runtime slide IDs must be exactly `MATH-VN-C01-L06-S01` through `S22`.
- Source mappings must be exactly `SL01` through `SL22` one-to-one.
- Preserve `F01–F18` references and locked UGV case language.
- Do not introduce deferred scale/rank/SVD/PCA/diagnosis results.

## Static verification
Create `subjects/math/THEORY_C01_L06_RUNTIME_PASS15.json` with a deterministic merge report covering:
- durable record count before/after;
- target occurrence exactly once before/after;
- target canonical hash before/after and target content changed;
- changed non-target records = zero;
- duplicate lesson IDs = zero;
- source/runtime slide counts `22/22`;
- runtime ID and source mapping continuity;
- formula coverage `F01–F18`;
- minimum 16/no maximum/compression false;
- locked case/deferred-boundary checks;
- written JSON reparses.

## Runtime protection
Do not modify during Pass 15:
- runtime readers;
- `subjects/math/index.html` unless the durable E129 contract itself requires it (expected: no);
- manifest;
- CSS/JavaScript presentation layers;
- Reader Pro;
- E235.

Keep E236, E237 and E238 disabled.

## Acceptance
Pass only when static merge verification is clean.
Then set status `PASS_15_DURABLE_MERGE_STATIC_VERIFY_PASS` and advance to `THEORY_C01_L06_RUNTIME_SOURCE_REGISTRATION_PASS_16`.
