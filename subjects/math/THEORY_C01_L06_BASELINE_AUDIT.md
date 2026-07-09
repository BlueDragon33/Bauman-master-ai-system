# §1.6 · Baseline Audit

- Status: `PASS_01_BASELINE_AUDIT_COMPLETE`
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`
- Runtime record index: `5` of `18` records
- Previous: `MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140`
- Next: `MATH-VN-C02-ma_tran_va_phep_bien_oi_-L01-matrix-as-data-and-transform-e142`
- Current runtime slides: `16`
- Canonical record hash: `f8156ac9c4c0bde6657f802cc035fc3daff1a9c2142fba94e3e70118c33b5f6c`

## Current runtime inventory

- Roles: `{'problem_framing': 1, 'deep_essence': 1, 'counter_intuition': 1, 'real_bridge': 1, 'notation': 1, 'core_formula': 1, 'assumption_gate': 1, 'mini_case': 1, 'interpretation': 1, 'simulation': 1, 'common_mistakes': 1, 'application': 1, 'practice': 1, 'professor_qa': 1, 'bridge': 1, 'takeaway': 1}`
- Block types: `{'text': 36, 'qa': 18, 'formula': 7, 'code': 3}`
- Formula references: `0`
- Formula blocks: `7`
- Code blocks: `3`
- Q&A blocks: `18`
- Integration metadata present: `False`

## Specialist artifact inventory

- case: `missing` · `subjects/math/data/theory_case/theory_case_c01_l06.json`
- core: `missing` · `subjects/math/data/theory_core/theory_core_c01_l06.json`
- workedExamples: `missing` · `subjects/math/data/theory_worked_examples/theory_worked_examples_c01_l06.json`
- lab: `missing` · `subjects/math/data/theory_lab/theory_lab_c01_l06.json`
- assessment: `missing` · `subjects/math/data/theory_assessment/theory_assessment_c01_l06.json`
- reference: `missing` · `subjects/math/data/theory_reference/theory_reference_c01_l06.json`
- fullView: `missing` · `subjects/math/data/theory_full_view/theory_full_view_c01_l06.json`
- normalization: `missing` · `subjects/math/data/theory_normalization/theory_normalization_c01_l06.json`
- slideshow: `missing` · `subjects/math/data/theory_slideshow/theory_slideshow_c01_l06.json`
- integrationImport: `missing` · `subjects/math/data/theory_integration/theory_lecture_content_c01_l06_import.json`
- integrationApproval: `missing` · `subjects/math/data/theory_integration/theory_lecture_content_c01_l06_approval.json`

## Findings

- **F01 · INFO**: Durable lesson exists once at record index 5 of 18.
- **F02 · INFO**: Current runtime deck contains 16 slides. The project contract treats 16 as a minimum, not a target maximum.
- **F03 · WARNING**: The current deck is a legacy/general baseline and has not passed the lesson-scoped 14-pass academic workflow.
- **F04 · WARNING**: 11 of 11 specialist lesson artifacts are absent: case, core, workedExamples, lab, assessment, reference, fullView, normalization, slideshow, integrationImport, integrationApproval.
- **F05 · WARNING**: Canonical formula references on runtime slides: 0; raw formula blocks: 7.
- **F06 · INFO**: Code blocks: 3; Q&A blocks: 18.
- **F07 · INFO**: Empty/incomplete slide positions: none.
- **F08 · INFO**: Duplicate slide titles: none.
- **F09 · INFO**: §1.6 is the bridge from individual vectors to a data matrix; Pass 2 must lock orientation, shape semantics, sample/feature contracts and the boundary with later rank/SVD content before expansion.
- **F10 · WARNING**: No §1.6 academic acceptance or browser acceptance exists yet. Existing runtime content must not be promoted as approved source of truth.

## Scope hazards to lock before expansion

- Rows-as-samples versus columns-as-samples can silently transpose every later formula.
- Sample count, feature count, channel order and units must be explicit before matrix operations.
- A data matrix is not automatically centred, standardized, full-rank or covariance-ready.
- Stacking vectors requires compatible dimension, schema, units and acquisition contract.
- Matrix shape alone does not prove semantic compatibility.
- PCA/SVD/rank should be previewed only as downstream bridges, not allowed to swallow the core lesson.
- Batch, time-window, channel and trajectory matrices are distinct orientations and must not be conflated.
- Code examples must assert shapes and metadata rather than only produce numeric output.

## Pass 2 requirements

- Lock prerequisite gates inherited from §1.1–§1.5.
- Define the canonical data contract: observations, features, shape m×n, row/column semantics, units and ordering.
- Separate vector stacking, matrix notation, indexing, slicing, transpose and batch interpretation.
- Define learning outcomes and mastery evidence before formulas or slides are expanded.
- Choose one deterministic engineering dataset for later passes without importing PCA/SVD conclusions prematurely.
- Lock explicit misconceptions around transpose, shape compatibility, centering and sample/feature orientation.

## Runtime decision

- No durable content, reader, manifest or E235 modification was performed.
- Existing runtime content remains baseline only, not approved source of truth.
- Next task: `THEORY_C01_L06_LEARNING_CONTRACT_PASS_02`.
