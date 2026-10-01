# Russian RU08 Phase Record

State: **VALIDATING**

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

## Acceptance
RU08 adds direct + packaged browser acceptance for the guided authoring editor and validates Content Review metadata-only boundaries against the live control-service implementation.

Final state becomes PASS only after Russian Reference UI, Whole System source/package browser matrix and RC-readiness validation succeed. Production remains outside RU08 and must use the shared exact-revision production workflows.
