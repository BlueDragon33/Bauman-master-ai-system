# PYTHON01 ASSESSMENT & STATE AUDIT

Base: `fd9cf24fefc85cfbbc152a7784e043c7fe1b19af`

## Assessment

`data/tests.json` contains 384 records, all `multiple_choice` and all tagged `programming-reasoning`.

Measured:
- 96 easy;
- 96 medium;
- 96 hard;
- 96 expert;
- 64 records per stage;
- 192 unique question texts;
- 192 exact duplicate lesson+level+question+answer groups, each repeated twice.

No current evidence proves:
- execution-based coding tasks;
- hidden/public Python tests;
- stdout/stderr behavioral evaluation;
- source/AST equivalence;
- trace/state reasoning assessment;
- debugger diagnosis evidence;
- code-submission artifacts.

The 144 exercise records are labeled `programming-practice`, but without an execution provider they are content/practice prompts, not runtime-validated programs.

## State

Normal subject key:
`bauman_programming_roadmap_v1_same_ui`.

Current persistence:
- browser `localStorage` for learner state;
- localStorage DB overlay for edited/imported JSON;
- review/exam/test state, history and remedial-plan structures in the generic core.

Not proven:
- IndexedDB Python workspace;
- server-side code submission ledger;
- immutable first-attempt coding evidence;
- project artifact history;
- runtime trace/test result persistence.

## Authority conclusion

Current quiz score/progress may be treated as interaction/progress evidence only. It must not be promoted to Python programming mastery until PYTHON03 defines code/reasoning evidence and C4 authority is satisfied.
