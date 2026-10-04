# PYTHON01 FORENSIC BASELINE — EXECUTIVE SUMMARY

Status: PASS_BASELINE_CAPTURED
Base main: `fd9cf24fefc85cfbbc152a7784e043c7fe1b19af`
Production baseline: same SHA, production run `37188119300` attempt 3 SUCCESS.

## 1. Actual subject scope

There is no `subjects/python/` runtime. The current Python learning implementation is `subjects/programming/`.

That package is not Python-only. Its own manifest declares **Python + Databases + Software Engineering**, and the 48-lesson roadmap also embeds algorithms/data structures, ML tooling, Git/CI/Docker and research-software workflow. PYTHON02 must preserve useful Python implementation context while routing adjacent theory to its canonical subject owner.

## 2. Current content inventory

- 6 stages / 6 modules;
- 48 lessons, exactly 8 per stage;
- 144 exercises, all tagged `programming-practice`, split 48 easy / 48 medium / 48 hard;
- 96 simulation records: 48 theory + 48 application;
- 384 test-bank records.

The 384 tests are all multiple choice and contain only **192 unique question texts**. There are 192 exact duplicate lesson+level+question+answer signatures, each repeated twice. The declared 384 count is therefore not 384 distinct assessment prompts.

## 3. Runtime/toolchain reality

No executable Python learner runtime is proven.

The current subject has:
- no Pyodide, Skulpt or Brython;
- no Python code-runner adapter;
- no terminal/stdin/stdout/traceback execution surface;
- no Web Worker Python sandbox;
- no subject `.py` files;
- no `pyproject.toml`, `requirements*.txt`, Pipfile/Poetry/Conda environment file.

The only repository `.py` file found is `scripts/normalize_prompt_archives.py`, which is repository prompt tooling, not learner execution.

The eight standalone “lab” HTML files are JavaScript parameter simulations. For example, the Python environment lab varies project size and documentation/test quality to visualize risk/reproducibility; it does not execute Python.

## 4. Editor / authoring reality

`subjects/programming/editor.html` is not a code editor. It only tells the user to open `index.html` to manage subject data.

The subject does have JSON import/export/data-manager behavior through the generic core and a local DB overlay. That is content authoring/data management, not a Python IDE.

## 5. Assessment reality

Current assessment authority is quiz/data driven:
- 384/384 questions are multiple choice;
- no hidden/public code tests are proven;
- no runtime behavioral grading is proven;
- no semantic source-code equivalence is proven;
- no trace/debugging evidence evaluator is proven;
- no code submission history is proven.

Therefore current quiz completion/score must not be interpreted as demonstrated Python programming mastery.

## 6. Learner state reality

Normal runtime uses adapter storage key `bauman_programming_roadmap_v1_same_ui` and browser `localStorage`.

The inherited core still contains stale fallback key `bauman_russian_v11_clean_skeleton`; it is normally overridden by the adapter but proves template ancestry.

State contains review/exam/test/dialogue/writing and other generic-shell fields. No Python-owned backend submission store or IndexedDB execution ledger was proven.

## 7. AI reality

The visible “AI Mentor” is a local deterministic template generator:
- `renderAiMentor()` calls `aiGenerate(...)`;
- `aiGenerate` builds HTML from current lesson/stage/context;
- no model/provider/API call is used for the mentor.

It is therefore a contextual helper surface, not AI model inference, Python runtime truth, grading or mastery authority.

## 8. Legacy / duplicate reality

The active `assets/core.js` still identifies itself as `Math Survival Master V13.33 · Route Grammar Mind Check`, showing inherited template code inside the Programming package.

Concrete byte-for-byte duplicate:
- `data/grammar.json`
- `data/grammar-path.json`
- identical blob SHA `f9777703778cf029a3e3bd3f6448908391854773`.

These are not deleted in PYTHON01. They are classified for later ownership/migration work.

## 9. QA reality

No Programming/Python-specific test file exists in the current test suite, and the inspected generic Subjects reference / Study-plan integration tests do not mention `programming`.

PYTHON01 adds `tests/python-p1-forensic-static.mjs` to lock the observed baseline in Development Fast CI. Later Python modules must update/revalidate this baseline deliberately when canonical ownership or runtime capability changes.

## 10. PYTHON01 gate

1. Actual scope proven — PASS
2. Content inventory known — PASS
3. Runtime/toolchain proven — PASS (no learner Python runtime currently)
4. Assessment paths mapped — PASS
5. State ownership mapped — PASS
6. AI/tooling mapped — PASS
7. Platform/UI/QA/learning gaps mapped — PASS
8. Legacy/duplicate candidates classified — PASS
9. Major risks recorded — PASS
10. PYTHON02 input prepared — PASS

PYTHON01 is a forensic PASS. It authorizes PYTHON02 canonical-model work, not production mutation or a speculative runtime rewrite.
