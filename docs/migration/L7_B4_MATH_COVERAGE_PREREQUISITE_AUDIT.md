# L7-B4 · Mathematics Coverage and Prerequisite Audit

Status: implementation gate. PASS means the audit and review-candidate graph
are complete; it does not mean every external Math content bank is populated.

## Baseline preserved

- 347 stable legacy lessons across six stages and 41 chapter IDs.
- Every legacy lesson retains exactly 16 semantic slides, including theory,
  formula, worked/practice, simulation, application and professor-Q&A roles.
- 18 reviewed theory-overlay records cover three chapters and contain 16–22
  slides each (300 total). They retain runtime precedence where explicitly
  resolved, but they are not counted as full 347-lesson coverage.

L7-B4 is read-only. It does not edit the 347 lessons, the 18 overlays, runtime,
progress, storage or assessment state.

## Findings retained as work

1. `THEORY_OVERLAY_PARTIAL`: 18/347 lessons and 3/41 legacy chapters have the
   reviewed overlay path. L7-B5 must preserve fallback to legacy source.
2. `EXTERNAL_BANKS_EMPTY`: exercise, simulation and assessment bank records are
   currently empty. Embedded lesson roles still provide existing functionality,
   but L7-B5/L7-B7 must not misreport these banks as complete.
3. `PREREQUISITES_SYSTEM_DERIVED`: the current lesson source has no reviewed
   explicit prerequisite graph. B4 emits a non-blocking review candidate from
   unchanged within-stage source order; every edge requires later review.

## ИУ-5 downstream bridge

The policy maps all current Math departments to twelve explicit domains and
only to stable downstream lesson IDs in AI/Data, Signal/Telemetry, Systems,
Programming/Database, Research, Foundation and Russian. These are `supports`
references. They cannot block assessment, alter Master-ready, write learner
state or be promoted by AI until a reviewed objective binding exists.

Official-source code remains `09.04.01`; personalized learner context remains
`ИУ-5 · 09.04.01/11`.

## Gate

```sh
node --check scripts/academic/l7-b4-math-coverage-prerequisite-audit.cjs
node scripts/academic/l7-b4-math-coverage-prerequisite-audit.cjs
git diff --exit-code -- assets/data/lesson/math-prerequisite-graph-v1.generated.json
git diff --exit-code -- docs/migration/L7_B4_MATH_COVERAGE_PREREQUISITE_AUDIT.generated.json
```
