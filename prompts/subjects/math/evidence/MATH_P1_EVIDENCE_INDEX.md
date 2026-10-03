# MATH01 EVIDENCE INDEX

Status: GATE_READY  
PR: #227  
Base main: `b2b62fe610aa34229581d3d00f9fbc4cdb6d9b9b`

## Canonical artifacts

| Evidence | Purpose | Status |
|---|---|---|
| `MATH_P1_EXECUTIVE_SUMMARY.md` | Human-readable forensic conclusions, root causes and gate state | GATE_READY |
| `MATH_P1_BASELINE.json` | Machine-readable runtime/content/owner/state baseline | GATE_READY |
| `MATH_P2_INPUT_CONTRACT.md` | Evidence-based downstream contract for canonical Math model | READY |
| `tests/math-p1-forensic-browser.mjs` | Browser probe for responsive/accessibility/performance baseline | PASS · run 37096211260 |

## Source evidence inspected

### Governance / authority
- `prompts/subjects/math/PROJECT_STATE.json`
- `prompts/subjects/math/SOURCE_STATUS.md`
- `prompts/subjects/math/README.md`
- `prompts/subjects/math/MATH_MASTER_PROMPT.md`
- `prompts/subjects/math/MATH01_FORENSIC_BASELINE.md`
- `prompts/subjects/math/MATH_CONSTITUTION_ROUTER.json`
- `prompts/CONSTITUTION.md`
- C1/C2/C3/C4 routed constitution files
- `.blueprint/constitution-adoption.json`

### Runtime entry / owners
- `subjects/math/index.html`
- `subjects/math/subject-manifest.json`
- `subjects/math/assets/subject-adapter.js`
- `subjects/math/assets/math-navigation.js`
- `subjects/math/assets/math-learning-flow.js`
- `subjects/math/assets/math-activity-studio.js`
- `subjects/math/assets/math-activity-mastery.js`
- `subjects/math/assets/math-study-command-center.js`
- `subjects/math/assets/math-workspace.js`
- `subjects/math/assets/math-formula-library.js`
- `subjects/math/assets/math-simulation-source.js`
- `subjects/math/assets/math-professor-drill.js`
- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/theory_skin/theory-content-source-E240.js`
- `subjects/math/assets/theory_skin/theory-artifact-registry-E244.js`
- `subjects/math/assets/theory_skin/theory-artifact-authoritative-route-E245.js`
- `subjects/math/assets/theory_skin/theory-artifact-reader-E241.js`
- `subjects/math/assets/theory_skin/theory-slideshow-reader-formula-accuracy-E224.js`
- `subjects/math/assets/theory_skin/theory-formula-typeset-E234.js`
- `subjects/math/assets/theory_skin/theory-formula-fraction-align-E235.js`
- `subjects/math/sw.js`
- `subjects/shared/host-bridge.js`

### Curriculum / data
- `subjects/math/data/curriculum.json`
- `subjects/math/data/chapter_spine.json`
- `subjects/math/data/discipline_spine.json`
- `subjects/math/data/content_vault_manifest.json`
- `subjects/math/data/content-manifest.json`
- `subjects/math/data/theory_lecture_frame.json`
- audited `*_content.json` sidecars for formula, exercise, application, simulation, professor QA, review pack and question bank.

### Tests / CI
- `tests/math-learning-journey-browser.mjs`
- `tests/math-study-command-center-browser.mjs`
- `.github/workflows/math-learning-app-gate.yml`
- `.github/workflows/system-integration-ci.yml`

## Existing runtime-equivalent CI evidence

Whole System Integration Gate:
- run: `37094380012`
- SHA: `db747b1e6c65e5eb2a28cfd7ea2aeee8e3f9872c`
- conclusion: SUCCESS
- browser-system acceptance:
  - Math Study Command Center: SUCCESS
  - Math learner journey: SUCCESS

The later base main `b2b62fe...` changes only prompt/hub governance files relative to that runtime SHA, so this is accepted as runtime-equivalent evidence, not as exact final PR-head evidence.

## PR #227 browser evidence

First executable probe head `7b3ff9bb3dc36df94db3c463ad175f033bf11432`:
- Math Learning App Gate run `37096211260`: SUCCESS;
- MATH01 forensic browser probe: `PASS_BASELINE_CAPTURED`;
- artifact: `math-browser-evidence`, artifact id `11263908216`;
- Whole System Integration Gate run `37096211257`: SUCCESS;
- Universal Constitution Compliance run `37096211675`: SUCCESS;
- Development Fast CI run `37096211293`: SUCCESS.

Measured findings are persisted in `MATH_P1_BASELINE.json`. Later evidence/state commits must still pass the exact final PR-head gates before merge.

## Known evidence boundaries

- Theory whole-file record count is not asserted because the connector truncates the large source; executable validation is required for a total.
- Current browser journeys do not prove symbolic equivalence, proof grading or CAS behavior.
- Existing AI Mentor shell text does not prove a Math AI provider.
- Existing Activity Mastery UI is not accepted as canonical mastery evidence.
- Performance values in the baseline come from the GitHub Actions browser probe and are environment-specific baselines, not production SLAs.
