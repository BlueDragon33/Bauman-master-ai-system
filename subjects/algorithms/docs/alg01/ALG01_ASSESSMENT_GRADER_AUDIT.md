# ALG01 ASSESSMENT / GRADER AUDIT

## Programming test bank

- Contract: `BAUMAN_PROGRAMMING_TEST_BANK_V1`
- Total questions: **384**
- Question type: **multiple_choice only**
- Unique prompt texts: **192**
- Exact duplicate prompt groups: **192**
- Every question text is duplicated exactly once.

Algorithm-related legacy subset:

| Lesson | Items | Unique prompt texts | Main evidence |
|---|---:|---:|---|
| PR02 complexity | 8 | 4 | generic “academic workflow” choice |
| PR10 pseudocode | 8 | 4 | generic “academic workflow” choice |
| PR11 data structures | 8 | 4 | generic “academic workflow” choice |
| **Total** | **24** | **12** | MCQ only |

The correct option in these items is largely the same template: identify input/output, use the lesson formula/workflow, add minimal test/log and save an artifact. This does not test algorithm selection, trace, invariant, correctness, edge behavior or complexity derivation.

## P4 diagnostic pack

P4 contains richer evidence prompts:

- D0 recall: 18
- D1 application: 12
- D2 oral/explain: 8
- critical misconceptions: 10
- targeted repair routes: at least 8

This is currently a diagnostic/prerequisite blueprint. ALG01 found no dedicated Algorithms grading runtime that scores these against canonical algorithm contracts.

## Grader capabilities found

Current Programming shell can:
- compare selected MCQ answer to the stored answer;
- record local review wrong/done/flagged state;
- calculate local exam score;
- create a local remedial plan;
- locally gate subsequent exam/stage behavior.

Current scope does **not** provide:
- code/property grading for Algorithms;
- hidden algorithm tests;
- trace comparison;
- invariant/correctness rubric;
- complexity-case/representation-aware grading;
- acceptance of multiple valid topological/MST/traversal outputs;
- test-of-tests for known correct vs known wrong algorithms.

## Conclusion

The current MCQ mechanism is a legacy review mechanism, not a trustworthy Algorithms mastery grader. ALG03 must own subject evidence semantics while C4 remains the official mastery/state authority.
