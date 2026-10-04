# PYTHON04 INPUT CONTRACT
## Runtime · toolchain · data · AI capability handoff

Status: **READY AFTER PYTHON03 PASS**

PYTHON04 receives:
- accepted `PYTHON_P2_CANONICAL_MODEL.json`;
- `PYTHON_COMPETENCY_GRAPH.json` and prerequisite DAG;
- `PYTHON_P3_ASSESSMENT_MODEL.json`;
- debugging taxonomy and golden fixtures;
- coding/test/partial-credit/transfer contracts.

## Runtime responsibilities

PYTHON04 may bind the supported Python minor version, interpreter/provider, sandbox/isolation, REPL/notebook/lab, test runner, debugger/static-analysis providers, package/environment behavior and optional NumPy/Pandas bridge. It must not redefine curriculum or mastery truth.

## Untrusted-code requirements

Learner code is untrusted. Before executable assessment exists, PYTHON04 must define isolation boundary, resource/time limits, filesystem/network policy, package policy, deterministic input/output capture, secret protection, process cleanup and failure reporting. Hidden official tests/solutions must never be exposed to learner or AI surfaces.

## Evidence protocol

Runtime providers emit structured evidence compatible with PYTHON03 result states and preserve immutable first-attempt history plus append-only retries through the canonical learner-state owner. Provider output is evidence, not automatic mastery.

## Determinism/reproducibility

The runtime contract must bind interpreter/package versions where required, support controlled randomness, declare file/data inputs and make notebook restart/run-all reproducibility testable.

## Stop rule

If a safe sandbox/runtime owner cannot be proven, PYTHON04 must stop before enabling executable learner code. Do not fall back to browser `eval` or an ungoverned runner.

