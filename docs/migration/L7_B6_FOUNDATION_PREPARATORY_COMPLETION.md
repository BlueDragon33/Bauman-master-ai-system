# L7-B6 · Foundation Preparatory Completion

Status: implementation gate. A local PASS is not a remote CI PASS.

## Completion meaning

B6 completes the **structural preparatory bridge**, not the learner's course and
not the academic review of the current Foundation text. Every current
preparatory module and lesson must belong to exactly one of three required
tracks, expose explicit evidence targets and keep its later-subject handoff
non-mastery and fail-closed.

The following claims remain forbidden in B6:

- learner completion or Master-ready;
- academic-content or assessment-quality approval;
- automatic expansion of the one B11 runtime reference;
- inferred equivalence between a Foundation lesson and a Russian, Math,
  Programming, Signal or Systems lesson;
- source, learner-state, route, offline or specialist-engine mutation.

## Audited source truth

| Source | Preparatory evidence | B6 interpretation |
|---|---:|---|
| `curriculum.json` | 5 modules | Current authoritative module order |
| `lessons.json` | 15 lessons | 3 lessons per module: theory, practice, application |
| `exercises.json` | 15 records | Supporting templates; not mastery-qualified |
| `tests.json` | 22 questions | Supporting templates; not assessment-approved |
| `simulations.json` | 1 observation + 1 practice | Preparatory scenarios; not full simulation coverage |
| B11 activation | 1 enabled lesson | Exact reference remains only `f_s01_l1` |

The content audit also found that all 15 preparatory lessons currently share
one `keyPoints` set, one `coreTheory` set and one `masteryCriteria` set. The 22
preparatory questions reduce to 10 distinct bodies. B6 therefore records
structural coverage but deliberately leaves pedagogical/content acceptance to
B8 and Master-ready evidence qualification to B7.

## Three required tracks

| Track | Modules | Exact lesson count | Boundary |
|---|---|---:|---|
| Classroom Russian | `f_s01` | 3 | Russian specialist is reference-only; B11 speech remains exact to `f_s01_l1` |
| Math/science transition | `f_s02`, `f_s03`, `f_s04` | 9 | Later Math/Programming/Signal/Systems routes are support refs, not equivalent lessons |
| Study-method bridge | `f_s05` | 3 | Roadmap is reference-only; no schedule or progress write |

Each track defines three capability checkpoints. Their evidence status is
`target-defined-not-collected`, and every checkpoint has
`masteryEffect=none-until-L7-B7`.

## Runtime and rollback boundary

`foundation-preparatory-bridge-v1.js` is a pure read-only resolver. It projects
source locators, titles, kinds, Factory lesson types, evidence targets and
handoff boundaries; it does not load in `subjects/foundation/index.html`.

Unknown or look-alike lesson/track IDs fail closed. B6 preserves the existing
Foundation route, the site-root Service Worker, the `light-core-explicit`
offline policy and the exact B11 activation. Rollback is removal of the B6
bridge artifacts and workflow gate; Foundation source/runtime/state remains
unchanged.

## Open findings routed forward

- `FOUNDATION_TEMPLATE_CONTENT_REVIEW_REQUIRED` → L7-B8.
- `FOUNDATION_ASSESSMENT_NOT_MASTERY_QUALIFIED` → L7-B7/L7-B8.
- `FOUNDATION_SIMULATION_STAGE_DRIFT` → L7-B8.
- `FOUNDATION_B11_SINGLE_REFERENCE_SCOPE` → L7-B8.

These findings block broader claims, not the narrow B6 structural bridge gate.

## Gate

```sh
node --check assets/js/platform/universal-lesson/foundation-preparatory-bridge-v1.js
node --check scripts/academic/l7-b6-foundation-preparatory-completion-regression.cjs
node scripts/academic/l7-b6-foundation-preparatory-completion-regression.cjs
git diff --exit-code -- docs/migration/L7_B6_FOUNDATION_PREPARATORY_COMPLETION.generated.json
```

Full L7/L6 deterministic regression and L5 browser/offline regression remain
mandatory before the B6 checkpoint can be recorded as remotely verified.
