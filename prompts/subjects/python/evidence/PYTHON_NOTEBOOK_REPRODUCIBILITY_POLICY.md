# PYTHON NOTEBOOK REPRODUCIBILITY POLICY

Notebook/REPL state is exploratory session state, not automatic official evidence.

A notebook can contribute official evidence only after a reproducibility run:
1. start from a clean runtime/workspace;
2. execute cells in declared order from top to bottom;
3. use declared dataset/package/environment IDs;
4. reject hidden dependencies on stale kernel state;
5. capture code, relevant outputs and environment identity.

The system must expose restart/run-all semantics and surface out-of-order/stale-state risk.

A persistent exploratory sandbox may retain files/state only within its learner/session scope. Official assessment must use a fresh or reset environment according to the task contract.

Offline notebook/execution must never be claimed unless an offline provider has separately passed the same reproducibility and security acceptance.
