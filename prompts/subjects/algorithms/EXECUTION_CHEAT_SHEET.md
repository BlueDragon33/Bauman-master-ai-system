# EXECUTION CHEAT SHEET — ALGORITHMS & DATA STRUCTURES

## Default work loop

1. Read `STATUS.md`.
2. Read only the active `ALGxx` prompt.
3. Read `ALG_CONSTITUTION_ROUTER.json`.
4. Load only routed constitution clauses.
5. Inspect current-main diff / affected files.
6. Execute root-cause work.
7. Run targeted tests first.
8. Run required regression/gates.
9. Write evidence.
10. Mark PASS only when exit gate is actually met.

## Sequence

`ALG01 → ALG02 → ALG03 → ALG04 → ALG05 → ALG06 → shared release`

## Do not do

- do not reread every constitution every turn;
- do not make Python syntax the owner of algorithm truth;
- do not use benchmark timing as proof of Big-O;
- do not source-string-grade code;
- do not require one exact valid graph output when alternatives exist;
- do not let visualizer logic diverge from canonical trace;
- do not let AI write official mastery;
- do not build a second generic code runtime if Python capability already exists.

## Highest-risk invariants

- ADT ≠ representation;
- correct sample output ≠ proof of correctness;
- Big-O ≠ benchmark;
- average ≠ amortized;
- graph preconditions are explicit;
- multiple valid outputs are accepted when contract permits;
- hidden tests stay hidden;
- trace and visualizer agree;
- complexity constraints are graded separately from functionality.
