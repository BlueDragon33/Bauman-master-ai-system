# PYTHON01 RUNTIME / TOOLCHAIN INVENTORY

Base: `fd9cf24fefc85cfbbc152a7784e043c7fe1b19af`

## Current execution surfaces

| Surface | Reality | Authority |
|---|---|---|
| `subjects/programming/index.html` | Generic subject learning shell | presentation/runtime shell |
| `assets/core.js` | Browser JS renderer/state/quiz/data manager | UI + local state |
| 8 simulation HTML files | JS slider/parameter demonstrations | pedagogical visualization only |
| `editor.html` | Link back to index/data management | not a code editor |
| Python interpreter | Not present | none |
| Python sandbox | Not present | none |
| REPL/notebook executor | Not present | none |
| test runner/debugger | Not present | none |

## Version truth

No learner Python interpreter version can be declared because no learner interpreter is present.

No subject dependency/environment owner was found:
- no `pyproject.toml`;
- no `requirements*.txt`;
- no Pipfile;
- no Poetry lock;
- no Conda/environment YAML.

The repository-wide `.py` scan found only `scripts/normalize_prompt_archives.py`, which is repository tooling.

## Security/sandbox truth

Because there is no Python executor, there is currently no Python sandbox boundary, CPU/memory timeout, filesystem policy, stdin/stdout capture or network policy to audit.

This is a **missing capability**, not evidence that execution is safe.

## PYTHON02/PYTHON04 routing

PYTHON02 must define the supported-version learning boundary without inventing a version.
PYTHON04 must own any future interpreter/sandbox/provider contract.
No direct `eval`/ungoverned runner may be added to lesson UI.
