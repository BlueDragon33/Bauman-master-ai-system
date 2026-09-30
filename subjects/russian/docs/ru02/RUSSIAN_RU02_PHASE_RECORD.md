# Russian RU02 Phase Record

| Field | Value |
|---|---|
| Module | RU02 — Curriculum · Competency · Canonical Russian Model |
| State | **VALIDATING** |
| Base main SHA | `9bfd57210e6d5c4593fe5dc116f12f513f99f5f6` |
| Change class | C/E — additive canonical data/schema + validation architecture |
| Runtime consumer switch | none |
| Learner-state migration | none |
| Stable macro identities | R01–R26 preserved |
| Unit / Micro-Lesson identities | 243 / 729 materialized from validated P2 target |
| Competencies | 13, machine-readable prerequisite DAG |
| Canonical entity families | 25 owners resolved |
| Production effect | none |
| Downstream | RU03 and RU04 may proceed after RU02 PASS |

## Mission result

RU02 does not regenerate the course. It reconciles validated P2/P3 design with current P7–P11 reality and materializes a structural authority that downstream modules can consume without rediscovering curriculum semantics.

## Important compatibility decision

- current `curriculum.json#modules` = six **StageBundle compatibility projections**, not canonical R01–R26 MacroModule authority;
- current `lessons.json` = R01–R26 **legacy presentation/content compatibility source**;
- new `canonical-model.json` = structural authority for Stage/MacroModule/Unit/MicroLesson/Competency/prerequisites;
- linguistic facts remain owned by declared content datasets and require RU03 truth validation.

No legacy runtime consumer is switched in RU02.

## Exit checks pending CI

RU02 becomes PASS only after:
1. RU02 validator passes;
2. existing P2/P3 and Russian Reference UI gates pass;
3. relevant browser/source/package regression passes because Russian data/workflow changed;
4. no blocker/critical remains;
5. evidence index is updated with final run IDs/head.

## Handoff

RU03 receives owner/truth/provenance boundaries.  
RU04 receives competency/evidence/mastery/remediation bindings.  
Neither may redefine RU02 stable IDs casually.

**RU02 STATE: VALIDATING**
