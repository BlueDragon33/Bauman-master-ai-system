# Russian RU08 Phase Record

State: **VALIDATING**

Baseline: `main@f6aa11215dfcf24e2d646f7c9737733e66c642c8`.

RU08 integrates the already-PASS RU02–RU07 owners into one subject package and prepares an immutable release candidate without creating a Russian platform fork.

## Integration changes
- subject manifest upgraded from historical V13.42 metadata to current RU architecture;
- current provenance, technical/academic/research, scenario and AI policy datasets registered;
- capability requirements and offline/compatibility contracts made explicit;
- schema-aware authoring candidate lifecycle added on top of existing metadata-only Content Review service;
- ordinary authoring defaults to structured/schema-aware fields, not raw JSON;
- canonical content still changes only through reviewed repository patches.

## Safety
- no second content database;
- no direct candidate/import overwrite of canonical datasets;
- no learner-state reset;
- no duplicate router/auth/offline/design/release system;
- no production claim in RU08.

PASS requires RU08 validator + Russian Reference UI Gate + Whole System source/package browser acceptance + no blocker/critical in scope.
