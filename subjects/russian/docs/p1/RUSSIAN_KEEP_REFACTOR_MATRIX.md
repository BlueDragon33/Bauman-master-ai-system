# Russian P1 KEEP / REFACTOR Matrix

Base SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`

| Component | P1 classification | Reason |
|---|---|---|
| R01–R26 lesson identities | KEEP | 26 lessons present; academic audit covers all stages |
| `speaking.json` separation | KEEP | 1,220 items; all linked to known lessons |
| `dialogue-bauman-az.json` | KEEP | separate contextual dialogue owner candidate |
| `deep-speaking-bauman.json` | KEEP | separate advanced production owner candidate |
| `speaking-link-index.json` | KEEP / DERIVED-CANDIDATE | bridge dataset, no duplicate IDs in audit |
| Handwriting fail-closed authority | KEEP | current gates prove authority blocking/integrity controls |
| Offline optional-large policy | KEEP | current audit passes and avoids precaching giant optional files |
| AI mentor read-only boundary | KEEP | current static gate forbids mastery writes |
| `russian-future-ui.*` | KEEP + REFACTOR-INTEGRATION | canonical future presentation candidate but still overlays legacy DOM/CSS |
| `core.css` | REFACTOR | extreme cascade debt; do not delete in P1 |
| `core.js` | REFACTOR | broad multi-responsibility owner; preserve behavior until owner migration |
| 8,000 vocab bank | KEEP + ENRICH | valuable corpus; missing canonical stress/morphology/network fields |
| `simulations.json` speaking score semantics | REFACTOR | ASR percentage is presented as pass rule |
| Learner-state recovery | REFACTOR BEFORE MIGRATION | oversize state removal has no backup |
| Historical V12/V13 reports | ARCHIVE/REFERENCE | useful history, not runtime authority |
| Any unproven legacy CSS/JS | UNKNOWN | no delete without runtime/reference evidence |

No component is marked `DELETE_LATER` until dependents, replacement, migration, tests and rollback are all proven.
