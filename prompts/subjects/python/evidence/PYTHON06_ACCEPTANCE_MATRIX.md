# PYTHON06 ACCEPTANCE MATRIX
Status: CANDIDATE — executable gates are defined in `python-p6-rc-ci.yml`.

| Gate | Contract | Acceptance evidence |
|---|---|---|
| A Curriculum/content | canonical PYTHON02 IDs, 48 legacy IDs preserved, public tasks reference real `py.comp.*` competencies | P6 static contract |
| B Language/runtime | CPython 3.14.8, stdlib profile, representative language edge matrix | P6 live provider |
| C Assessment | canonical + alternate correct PASS, known wrong FAIL, hidden material absent | P4/P6 live test-of-tests |
| D Runtime/sandbox | timeout, memory, output, path, env, network, subprocess confinement, unsafe deserialization | P4 + P6 live |
| E Toolchain/data | pinned image/runtime, stdlib-only release profile, no NumPy/Pandas claim | static + live identity |
| F AI Tutor | DEGRADED-SAFE: deterministic hints only; no learner-facing model provider, hidden tests, execution or mastery authority | AI acceptance report |
| G UX/accessibility | keyboard paths, labels/status, mobile/tablet/desktop, cancel/stale-result quarantine | P6 browser |
| H Offline/performance/migration | offline execution explicitly unavailable; draft survives locally; bounded output/run timeout; no learner-state migration | browser + provider |
| I Security | hidden-test boundary, no BAUMAN secrets, Internet deny, non-root learner UID, production smoke uses safe env probe only | live + production smoke |
| J Legacy/RC | legacy MCQ duplicates compatibility-only, governed facade is sole executable owner, exact RC materialization + production smoke ready | static + RC artifact |

PASS requires all executable P6 gates plus preserved P4/P5 regressions at one PR head.
