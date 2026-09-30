# RU01 Evidence Index

Baseline: `main@1c722fd7dd7525e960f2d8bb0fb36312705448be`

## Reused forensic evidence
- `subjects/russian/docs/p1/RUSSIAN_P1_EXECUTIVE_SUMMARY.md`
- `subjects/russian/docs/p1/RUSSIAN_FILE_INVENTORY.json`
- `subjects/russian/docs/p1/RUSSIAN_ENGINE_OWNERSHIP_MATRIX.md`
- `subjects/russian/docs/p1/RUSSIAN_ROUTE_MAP.md`
- `subjects/russian/docs/p1/RUSSIAN_STORAGE_STATE_MAP.md`
- `subjects/russian/docs/p1/RUSSIAN_DATA_ARCHITECTURE.md`
- `subjects/russian/docs/p1/RUSSIAN_CURRENT_ARCHITECTURE.md`
- `subjects/russian/docs/p1/RUSSIAN_TEST_COVERAGE_MATRIX.md`
- `subjects/russian/docs/p1/RUSSIAN_P1_PERFORMANCE_BASELINE.md`
- `subjects/russian/docs/p1/RUSSIAN_ACCESSIBILITY_BASELINE.md`
- `subjects/russian/docs/p1/RUSSIAN_SECURITY_DATA_SAFETY_AUDIT.md`
- `subjects/russian/docs/p1/RUSSIAN_ROOT_CAUSE_TREE.md`
- `subjects/russian/docs/p1/RUSSIAN_KEEP_REFACTOR_MATRIX.md`

## Delta evidence
Comparison:
`1252f7c46694cb40466ff0d483ccad92439cde7b...1c722fd7dd7525e960f2d8bb0fb36312705448be`

Result:
- current main is 152 commits ahead;
- no reverse divergence;
- P2–P11 added/changed the canonical owner contracts enumerated in the RU01 baseline.

Phase records used:
- P4 assessment/mastery;
- P5 adaptive/SRS;
- P6 listening/speaking/audio;
- P7 linguistic authority;
- P8 academic/technical;
- P9 reading/writing/research;
- P10 AI mentor;
- P11 scenario/dialogue.

## Exact-current-main evidence
At `1c722fd7dd7525e960f2d8bb0fb36312705448be`:
- Universal Constitution Compliance `36732090235`: SUCCESS;
- Development Fast CI `36732088811`: SUCCESS;
- Russian Reference UI Gate `36732088730`: SUCCESS.

P11 PR #179 was merged to this exact main SHA after:
- P11 validator PASS;
- Russian source + packaged browser acceptance PASS;
- whole-system source + packaged browser acceptance PASS.

## Evidence caveat
Exact-main push did not rerun every historical browser job. RU01 accepts the validated P11 branch tree plus exact-main static/reference gates because RU01 makes no product change. Any RU02+ product/runtime change must rerun its targeted browser/user journey and affected subsystem regressions.

**RU01 EVIDENCE SUFFICIENT: YES.**
