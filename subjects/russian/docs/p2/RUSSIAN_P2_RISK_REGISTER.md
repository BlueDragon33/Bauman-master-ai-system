# Russian P2 Risk Register

| ID | Severity | Risk | P2 control | Owner after P2 |
|---|---|---|---|---|
| P2-R001 | BLOCKER | Changing R01–R26 IDs would break existing references/state | IDs are immutable; target map preserves all 26 | P3 migration |
| P2-R002 | CRITICAL | Treating curriculum redesign as learner-state rewrite | P2 runtime mutation is forbidden | P4 |
| P2-R003 | CRITICAL | Fabricating stress/morphology/government to fill lexical fields | `noFabrication=true`; fields remain unfilled until authoritative validation | P3/P7 |
| P2-R004 | HIGH | Deleting useful legacy lesson material because target title changed | migration action is normalize/re-home, deletion false | P3/P12/P16 |
| P2-R005 | HIGH | Collapsing all skills into one CEFR/progress number | four simultaneous curriculum layers are required | P4/P5 |
| P2-R006 | HIGH | Generating more records before normalizing existing datasets | preserve-before-replace sequence enforced | P2/P3 |
| P2-R007 | HIGH | Blurring basic speaking, contextual dialogue and deep speaking | owners remain separate | P3/P6 |
| P2-R008 | MEDIUM | Overclaiming topic absence from title-level audit | gap report explicitly limits claims to responsibility alignment | P2 |
| P2-R009 | MEDIUM | Target docs become accidental second runtime source of truth | P2 files are marked design authority / runtimeCanonical=false | P3 |

## Exit rule

P2 may PASS when the target curriculum, migration map and skill architecture are internally consistent, preserve all current IDs, pass contract validation, and provide P3 with explicit schema/migration inputs without mutating runtime learner state.
