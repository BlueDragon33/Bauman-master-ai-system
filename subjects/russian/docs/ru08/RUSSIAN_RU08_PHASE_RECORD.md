# Russian RU08 Phase Record

State: **PASS**

Baseline: `main@a3cd3ecddbd19398691e0c52af778172e0658eb8`  
Validated RU08 head before seal: `fda8ea54507ca49f33fcf43450fa10a744b3a35d`.

RU08 is the final Russian-specific integration module.

## Authoring
The former P12 candidate-governance idea is reimplemented under RU08 rather than merging the stale topology:
- guided Russian authoring editor;
- schema-aware staged candidate;
- deterministic content hash;
- metadata-only Content Review envelope;
- canonical write only through reviewed repository patch;
- provenance/source requirements;
- staging-only bulk policy;
- rollback/diff metadata;
- generated content cannot self-promote.

## Integration
The subject manifest registers active RU02–RU08 contracts, required capabilities, lazy/offline policy and compatibility strategy.

## Acceptance evidence
On RU08 implementation head `fda8ea54507ca49f33fcf43450fa10a744b3a35d`:
- Universal Constitution Compliance run `36812607590`: **SUCCESS**;
- Development Fast CI run `36812607085`: **SUCCESS**;
- Russian Reference UI Gate run `36812607096`: **SUCCESS**;
- Future Interface System CI run `36812607069`: **SUCCESS**;
- Whole System Integration Gate run `36812607076`: **SUCCESS**;
- direct Russian RU08 authoring browser acceptance: **PASS**;
- packaged Russian RU08 authoring browser acceptance: **PASS**;
- existing Russian source/package/offline/handwriting/mastery/Future UI regressions: **PASS**.

## Exit
RU02–RU07 are merged/current. RU08 authoring, integration, compatibility, failure matrix and RC handoff are complete with no scoped blocker/critical.

The final sealed head must rerun its affected CI before merge. Production is still outside RU08 and must use the shared exact-revision preview → production workflows after merge.

**RU08 STATE: PASS. RUSSIAN SUBJECT RC READY AFTER FINAL-HEAD GATES.**
