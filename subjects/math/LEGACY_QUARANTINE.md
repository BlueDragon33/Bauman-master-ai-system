# Math legacy runtime quarantine

The active Math entry point is the accepted Reader runtime declared directly in
`index.html`. The following compatibility files remain in the repository for
historical recovery, but are not loaded or shipped as an active runtime contract:

- `assets/core-subject.js`
- `assets/planning-bridge.js`
- `assets/theory_skin/theory-formula-mini-lesson-E236.js`
- `assets/theory_skin/theory-formula-academic-E237.js`
- `assets/theory_skin/theory-formula-coverage-audit-E238.js`

`tools/validate-stage-gate.js` belongs to `core-subject.js`. It reports
`MATH_LEGACY_STAGE_GATE_QUARANTINED` while that core is absent from the active
entry point. It must become blocking again if the legacy core is ever explicitly
reactivated.

This quarantine does not modify the accepted §1.4, §1.5, or §1.6 data/runtime.
E235 remains active and unchanged; E236/E237/E238 remain disabled.
