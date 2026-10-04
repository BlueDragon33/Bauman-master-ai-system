# PYTHON01 CURRENT ARCHITECTURE MAP

Base: `fd9cf24fefc85cfbbc152a7784e043c7fe1b19af`

## Runtime path

`Hub / study-plan route → subjects/programming/index.html → subject-adapter.js → core.js → data/*.json`

There is no separate `subjects/python/` runtime.

## Current owners

| Concern | Current owner / path | Forensic conclusion |
|---|---|---|
| Subject identity / capability declaration | `subject-manifest.json`, `subject-adapter.js` | mixed Programming package, not Python-only |
| Curriculum stages/modules | `data/curriculum.json` | 6-stage roadmap |
| Lessons | `data/lessons.json` | 48 records, 8 per stage |
| Practice prompts | `data/exercises.json` | 144 records; no executor |
| Quiz bank | `data/tests.json` | 384 MCQ records / 192 unique texts |
| Simulations | `data/simulations.json` + `simulations/*.html` | JS pedagogical simulation only |
| Learner state | `assets/core.js` + localStorage | browser-local generic state |
| Data overlay/editor | `assets/core.js` + localStorage `*_db` | JSON content management |
| Python interpreter | none | missing |
| Code runner/sandbox | none | missing |
| Code editor | none | `editor.html` is not an IDE |
| AI Mentor | `aiGenerate()` in `assets/core.js` | deterministic local template |
| Programming-specific QA | none before PYTHON01 | gap; PYTHON01 adds static gate |

## Data flow

1. `subject-adapter.js` declares required/lazy data files and Programming storage key.
2. `core.js` loads JSON sources with `fetch`.
3. Runtime renders theory, exercises, generic practice/application, review, exam, dialogue, writing/simulation, vocabulary/workflow and data-manager views.
4. Learner/UI state is persisted to localStorage.
5. Edited/imported data is held in a localStorage DB overlay.
6. No learner source code is sent to or executed by a Python runtime.

## Academic-boundary map

### KEEP_PYTHON
Python syntax/semantics, functions/modules, exceptions/debugging, files/data I/O, Python-specific OOP, package/module organization, pytest/tooling usage.

### KEEP_AS_PYTHON_IMPLEMENTATION_CONTEXT
NumPy/Pandas usage, DB client usage, FastAPI, research scripts, telemetry processing, reproducibility workflows.

### ROUTE TO OTHER SUBJECT OWNER
- Algorithms: complexity, algorithm theory, data-structure theory.
- Database: relational/SQL/index/schema theory.
- ML/AI: model/training/metric theory.
- Software Engineering: requirements, architecture patterns as general theory, CI/release/process theory.

PYTHON02 must make these routes canonical while preserving current IDs and compatibility until receiving subjects are ready.

## Architecture risks

The active package is a cloned/generalized learning shell. The core still carries a Math-era version label and Russian-era fallback storage key. These are implementation-history artifacts, not evidence that Math/Russian own Programming.

No deletion or runtime migration is authorized by PYTHON01.
