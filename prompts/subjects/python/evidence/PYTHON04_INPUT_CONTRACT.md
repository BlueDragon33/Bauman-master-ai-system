# PYTHON04 INPUT CONTRACT
## Stable handoff from PYTHON03

Status: READY AFTER PYTHON03 PASS
Runtime activation authorized: **PYTHON04 ONLY**

PYTHON04 must consume:
- PYTHON02 canonical competency/entity/prerequisite contracts;
- `PYTHON_CODE_REASONING_CONTRACT.md`;
- `PYTHON_DEBUGGING_ERROR_TAXONOMY.json`;
- `PYTHON_CODING_ASSESSMENT_CONTRACT.md`;
- `PYTHON_TEST_QUALITY_POLICY.md`;
- `PYTHON_PARTIAL_CREDIT_RUBRIC.md`;
- `PYTHON_ERROR_NOTEBOOK_MAPPING.md`;
- `PYTHON_TRANSFER_TASK_POLICY.md`;
- `PYTHON_P3_GOLDEN_FIXTURES.json`.

## Provider requirements

A runtime/test/debug provider must emit evidence that can represent syntax/runtime/test/partial/correct/reproducibility outcomes, preserve attempt order, identify runtime/version context, separate public from hidden evidence, and never expose protected tests/solutions.

Execution is untrusted. PYTHON04 owns sandboxing, resource limits, interpreter/environment/package providers and failure isolation.

PYTHON04 must not create a second mastery engine. It emits evidence to the canonical C4 authority.
