# PYTHON01 EVIDENCE INDEX

Status: PASS_BASELINE_CAPTURED
Base main: `fd9cf24fefc85cfbbc152a7784e043c7fe1b19af`

## Canonical evidence

- `PYTHON_P1_EXECUTIVE_SUMMARY.md`
- `PYTHON_CONTENT_INVENTORY.json`
- `PYTHON_RUNTIME_TOOLCHAIN_INVENTORY.md`
- `PYTHON_ASSESSMENT_STATE_AUDIT.md`
- `PYTHON_LEGACY_DUPLICATE_MAP.md`
- `PYTHON_RISK_REGISTER.json`
- `PYTHON_P2_INPUT_CONTRACT.md`
- `tests/python-p1-forensic-static.mjs`

## Runtime/content sources inspected

- `subjects/programming/README.md`
- `subjects/programming/index.html`
- `subjects/programming/editor.html`
- `subjects/programming/subject-manifest.json`
- `subjects/programming/subject-manifest.js`
- `subjects/programming/assets/core.js`
- `subjects/programming/assets/subject-adapter.js`
- `subjects/programming/data/curriculum.json`
- `subjects/programming/data/lessons.json`
- `subjects/programming/data/exercises.json`
- `subjects/programming/data/tests.json`
- `subjects/programming/data/simulations.json`
- all eight `subjects/programming/simulations/*.html`
- recursive repository scan for Python toolchain/dependency files.

## QA evidence boundary

Before this audit there was no Python/Programming-specific test. Inspected generic Subjects reference and Study-plan integration tests do not mention `programming`.

PYTHON01 adds a static forensic gate. It is intentionally a baseline/revalidation trigger, not a permanent assertion that Python must never gain a runtime.

## Release context

The repository production release at the audit base is closed successfully:
- SHA `fd9cf24fefc85cfbbc152a7784e043c7fe1b19af`
- Production workflow run `37188119300`, attempt 3: SUCCESS
- Russian production browser acceptance: PASS
- Math production smoke: PASS
- Release Annex closure: PASS

PYTHON01 itself changes no production runtime/content.
