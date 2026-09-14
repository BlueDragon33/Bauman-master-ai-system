# Math inactive runtime quarantine

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

## Unregistered enhancement candidates

The following files arrived on `main` after the W2 implementation commit, but
were not registered by `subjects/math/index.html` or another active loader at
the reconciliation point `3dff93a`. They remain inactive candidates until a
separate integration change registers and browser-verifies them:

- `assets/math-activity-studio.css`
- `assets/math-activity-studio.js`
- `assets/math-formula-library.css`
- `assets/math-formula-library.js`
- `assets/math-integration-sync.js`
- `assets/math-regression-gate.css`
- `assets/math-regression-gate.js`
- `assets/math-simulation-source.css`
- `assets/math-simulation-source.js`

Their presence does not change the accepted runtime while they remain
unregistered. The whole-system gate verifies this boundary explicitly.
