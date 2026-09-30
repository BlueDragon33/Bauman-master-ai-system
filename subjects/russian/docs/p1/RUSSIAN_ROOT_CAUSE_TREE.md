# Russian P1 Root Cause Tree

Base SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`

## RC-01 — Presentation ownership accumulated instead of being retired
Evidence:
- `core.css` ≈ 735 KB, 10,452 `!important`, 237 media queries, ~1,426 duplicated selector names by static forensic parser.
- `.app`, `.main`, `.sidebar`, `.panel` and many version-specific selectors are redefined repeatedly.
- Future UI adds another presentation layer after core CSS.
Effect: layout bugs can be cascade/ownership bugs rather than isolated spacing bugs.

## RC-02 — Core runtime remains a broad legacy owner
`core.js` still touches routes, assessment, speaking state, storage, rendering, review, stage gates and integrations while specialized runtimes also exist.
Effect: multiple-touch responsibilities and difficult root-cause isolation.

## RC-03 — Content volume grew faster than canonical linguistic structure
8,000 vocab items exist, but stress/POS/forms/lesson-link fields are absent in the current audit.
Effect: content quantity cannot safely power pronunciation, grammar government, morphology or concept-level mastery.

## RC-04 — Evidence semantics are inconsistent between old core and newer guard layers
Newer `speaking-coach.js` explicitly says ASR is not pronunciation scoring.
Legacy `core.js` still computes transcript similarity percentages, gates an “ok” state and supports manual score=100.
Effect: learner-facing signals can overstate speaking evidence.

## RC-05 — State protection predates current constitutional requirements
Current state loading has fallbacks, but oversize canonical localStorage may be removed without backup.
Effect: migration/refactor could expose learner-data-loss risk.

## RC-06 — CI browser coverage existed but was not coupled to Russian-only diffs
The whole-system browser suite included Russian tests, but the workflow PR path filter did not include `subjects/russian/**`.
P1 audit branch fixes the trigger only; production runtime behavior is unchanged.
Effect: static gates could give false confidence about browser regressions.

## RC-07 — Large optional datasets require packaging/runtime indirection
Dialogue + Deep Speaking source datasets exceed 60 MB combined.
Existing packaging already chunks them; direct source and packaged runtime therefore must be tested separately.
