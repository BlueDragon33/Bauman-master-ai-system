# PYTHON06 EVIDENCE INDEX

Status: **PENDING P6 EXACT-HEAD CI**

Required evidence:
- PYTHON06_ACCEPTANCE_MATRIX.md
- PYTHON_LANGUAGE_RUNTIME_REGRESSION.md
- PYTHON_ASSESSMENT_TEST_OF_TESTS_REPORT.md
- PYTHON_SANDBOX_SECURITY_REPORT.md
- PYTHON_OFFLINE_PERFORMANCE_REPORT.md
- PYTHON_AI_TUTOR_ACCEPTANCE.md
- PYTHON_UX_ACCESSIBILITY_ACCEPTANCE.md
- PYTHON_LEGACY_RETIREMENT_MAP.md
- PYTHON_RC_MANIFEST.json
- PYTHON_PRODUCTION_SMOKE_PROFILE.md
- tests/python-p6-rc-contract.mjs
- tests/python-p6-provider-live.mjs
- tests/python-p6-browser.mjs
- .github/workflows/python-p6-rc-ci.yml

Terminal PASS metadata must only be written after the exact PR head passes P6 plus preserved P4/P5 gates.
