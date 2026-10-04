# PYTHON PARTIAL CREDIT RUBRIC

PYTHON03 uses an ordinal evidence rubric by default to avoid fake precision. A task may define numeric weights only when the task contract justifies them and the total is explicit.

| Dimension | Insufficient | Emerging | Competent | Strong |
|---|---|---|---|---|
| Requirement understanding | misses core behavior | captures part of contract | captures required behavior/cases | anticipates important edge constraints |
| Decomposition | no usable structure | partial split with coupling | clear functions/modules | decomposition improves testability/reuse |
| Core logic | mostly incorrect/hard-coded | partially correct | correct for documented behavior | correct plus well-justified invariant reasoning |
| Edge handling | ignores boundaries | handles some | handles declared edge cases | adds justified regression/property cases |
| Test quality | absent/misleading | basic samples only | normal + edge coverage | tests reveal invariants and regressions |
| Debugging evidence | random edits | identifies symptom | isolates root cause + regression | explains causal chain and prevents recurrence |
| Clarity/robustness | opaque/fragile | understandable with issues | clear and maintainable | clarity supports transfer/reuse |
| Final behavior | fails contract | partial behavior | satisfies contract | satisfies contract across transfer/generalization cases |

Correct final output cannot erase weak or fabricated reasoning evidence when the task explicitly assesses reasoning/debugging/testing. Support/hints are recorded separately rather than treated automatically as failure.

