# Phase 2 · Pass 14D — Grade Control Ledger

Status: `GRADE_CONTROL_LEDGER_VALIDATED_BROWSER_PASS`

Branch: `phase2/official-course-learning-architecture`

## Purpose

Pass14D adds an explicit, evidence-backed ledger for real assessment results after Pass14C event readiness. It does not turn rehearsal/readiness evidence into an official result and it does not infer transcript/diploma-supplement entries.

## Locked Bauman grading policy

Source: `https://mf.bmstu.ru/assets/info/uu/ot/educontrol/docs/Pologhenie_o_tekuschem_KU_i_PAO_2024.pdf`

Document identity recorded by the Hub:

- order: `27.02.2024 № 02.01-02/106`
- document: `01-01-ПЛ-003 01-2024`
- relevant grading table: section 7.1, Table 3

Locked scale:

- 85–100 → `отлично` / 5 / `зачет`
- 71–84 → `хорошо` / 4 / `зачет`
- 60–70 → `удовлетворительно` / 3 / `зачет`
- 0–59 → `неудовлетворительно / не аттестован` / 2 / `незачет`

The Hub target `90` remains an internal safety target for graded assessment preparation/results. It is not a new official BMSTU grade boundary.

## Result-entry safety rules

A result can be stored only when:

- the user explicitly confirms that it is an actual assessment result,
- a result source is recorded,
- the assessment timing is resolved in the locked course architecture,
- and the entered score/grade is structurally valid.

For graded events:

- numeric score must be 0–100 when entered,
- official grade must be 2/3/4/5 when entered,
- if numeric score and official grade are both entered, they must agree with the locked BMSTU rating scale.

For pure `Зчт`:

- result is pass/fail,
- no fabricated numeric target is required.

## Result-state semantics

- `RESULT_UNRECORDED`
- `RESULT_TIMING_LOCKED`
- `CREDIT_PASSED` / `CREDIT_FAILED`
- `RESULT_TARGET_MET`
- `RESULT_EXCELLENT_BELOW_TARGET`
- `RESULT_EXCELLENT_GRADE_ONLY`
- `RESULT_GOOD`
- `RESULT_SATISFACTORY`
- `RESULT_FAILED`

Example boundary behavior locked by validator/browser tests:

- 92 → official grade band 5 and internal target 90 met
- 89 → official grade band 5 but below internal target 90
- 84 → grade 4
- 70 → grade 3
- 59 → failed band

## Hard boundaries

- Dedicated user-scoped result store: `bauman_academic_2026_grade_results_v1`.
- No scheduler mutation.
- No automatic course completion.
- No automatic assessment completion state.
- No red-diploma percentage calculation from assessment-event rows.
- Stored rows explicitly keep `supplementEntryVerified:false` and `supplementEntryCounted:null`.
- d01/d15/p02 assessment results whose timing is unresolved remain blocked.

A future diploma/red-diploma ledger must first verify what constitutes a grade entry in the official diploma supplement. Pass14D deliberately does not guess this.

## Browser acceptance

The Browser gate verifies:

- unconfirmed actual-result entry is rejected,
- missing result source is rejected,
- score 89 and 92 are distinguished correctly,
- inconsistent score/official-grade pairs are rejected,
- pure d02 `Зчт` can be recorded as pass,
- unresolved d15 result entry is rejected,
- supplement-entry flags remain unverified/un-counted,
- scheduler entries are unchanged,
- course lifecycle is unchanged,
- grade results are isolated by current user,
- results persist across reload,
- mobile UI has no horizontal overflow,
- prior Pass14B and Pass14C Browser suites continue to pass.

## CI history and final evidence

Initial Pass14D run `34664812750` stopped before Browser because JavaScript syntax check caught an unescaped backtick around explanatory text `derivedGrade`. All semantic validators, including the Grade Control validator, had already passed. The template text was corrected before proceeding.

Final workflow:

- Run: `34664930698`
- Validated head: `9c93120c8087ce70520b07996d0680a091f0a24f`
- Pass14A-R architecture: SUCCESS
- Academic registry: SUCCESS
- P0 integrity: SUCCESS
- semester-safe risk engine: SUCCESS
- Phase2 source boundaries: SUCCESS
- Pass14B validator: SUCCESS
- Pass14C validator: SUCCESS
- Pass14D Grade Control validator: SUCCESS
- JavaScript/test syntax: SUCCESS
- Pass14B Browser regression: SUCCESS
- Pass14C Browser regression: SUCCESS
- Pass14D Browser acceptance: SUCCESS
- Browser artifact upload: SUCCESS

The final workflow concluded `success`.

## Main synchronization

At closure, compare `main...phase2/official-course-learning-architecture` returned:

- status: `ahead`
- `behind_by: 0`
- base/main commit: `309530b3214a334f381e4dc80ec7638d62615f30`

`main` remains unmodified by Pass14D.
