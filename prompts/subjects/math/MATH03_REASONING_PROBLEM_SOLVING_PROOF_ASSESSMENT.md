# MATH03 — REASONING · PROBLEM SOLVING · PROOF · ASSESSMENT · MASTERY SPECIALIZATION
## From mathematical truth to trustworthy learner evidence

Mode:

`REASONING-FIRST · STEP-AWARE · EQUIVALENCE-AWARE · EVIDENCE-FIRST · NO-FAKE-MASTERY`

---

# 0. MISSION

Build the Math learning engine that can distinguish:

- understanding;
- procedure;
- reasoning;
- proof/justification;
- final answer;
- transfer.

Do not reduce Mathematics to answer-string matching.

Do not reduce mastery to completion.

---

# 1. CONSTITUTION ROUTING

Load:

- C1: storage/event/capability contracts where needed;
- C2: problem workspace, contextual feedback, accessibility/error state only as needed;
- C3: assessment, persistence, idempotency, concurrency, regression;
- C4: evidence, mastery, spaced retrieval, error notebook, adaptive boundary, transfer.

---

# 2. FUNDAMENTAL SEPARATION

Keep separate:

`MATHEMATICAL TRUTH`

`PROBLEM SPECIFICATION`

`LEARNER RESPONSE`

`EVALUATION`

`FEEDBACK`

`MASTERY STATE`

`PRESENTATION`.

Presentation does not own official scoring.

---

# 3. PROBLEM CONTRACT

A problem should be able to declare:

- problem ID;
- target competencies;
- concepts/prerequisites;
- givens;
- unknown(s);
- domain/assumptions;
- units if relevant;
- allowed representations;
- response schema;
- acceptable solution families;
- answer/equivalence policy;
- hint policy;
- verification method;
- remediation mapping;
- evidence type.

---

# 4. PROBLEM-SOLVING CHAIN

Canonical pedagogical chain:

`UNDERSTAND`
→ `EXTRACT GIVEN/UNKNOWN`
→ `REPRESENT`
→ `CHOOSE STRATEGY`
→ `EXECUTE STEPS`
→ `JUSTIFY`
→ `OBTAIN RESULT`
→ `VERIFY`
→ `INTERPRET`
→ `TRANSFER`.

Not every problem requires every visible stage, but the engine must not assume result alone proves the chain.

---

# 5. SOLUTION STEP MODEL

A step may contain:

- expression/state before;
- operation/transformation;
- expression/state after;
- justification;
- referenced theorem/rule;
- learner confidence/hint metadata;
- evaluator result;
- error classification.

Step IDs must survive rerender/retry where evidence references them.

---

# 6. STEP VALIDITY

Distinguish:

`VALID_EQUIVALENT_TRANSFORMATION`

`VALID_IMPLICATION_ONLY`

`VALID_UNDER_CONDITION`

`INVALID_TRANSFORMATION`

`ARITHMETIC_ERROR`

`ALGEBRA_ERROR`

`DOMAIN_ERROR`

`UNJUSTIFIED`

`UNKNOWN`.

Do not falsely claim equivalence when a step only implies one direction.

---

# 7. FINAL ANSWER ≠ VALID REASONING

Cases:

- correct result from invalid reasoning;
- incorrect result after mostly valid strategy;
- correct method with arithmetic slip;
- alternative valid method;
- correct numerical approximation but missing required exact form.

Assessment must preserve these distinctions when task intent requires reasoning.

---

# 8. MATHEMATICAL EQUIVALENCE CLASSES

Evaluation policy must distinguish problem type.

Possible classes:

- exact scalar;
- rational/algebraic expression;
- equation solution set;
- inequality/interval;
- vector;
- matrix;
- function;
- set;
- geometric object;
- unit-bearing quantity;
- numeric approximation;
- proof/reasoning rubric;
- open modeling answer.

One normalization algorithm cannot safely handle all classes.

---

# 9. ALGEBRAIC EQUIVALENCE

Examples that may be equivalent subject to domain:

`x+x` and `2x`

`(x-1)(x+1)` and `x^2-1`.

But equivalence may fail if transformations change domain.

Evaluator must preserve assumptions and excluded values.

---

# 10. NUMERICAL EQUIVALENCE

Define policy for:

- absolute tolerance;
- relative tolerance;
- significant figures;
- rounding;
- exact-required tasks;
- floating-point behavior.

Do not use one global magic epsilon.

---

# 11. SET / INTERVAL ANSWERS

Normalize safely:

- order where irrelevant;
- open/closed boundaries;
- union;
- duplicates;
- equivalent notation.

Do not accept different sets because strings look similar.

---

# 12. PLUS/MINUS / MULTIPLE SOLUTIONS

Tasks may have:

- one solution;
- multiple discrete solutions;
- parameterized solution;
- no solution;
- infinitely many solutions.

Response schema must reflect this explicitly.

---

# 13. EXTRANEOUS ROOTS

After transformations such as squaring/multiplying by variable expressions:

verification against the original problem may be required.

Learner evidence should capture failure to reject extraneous roots.

---

# 14. DOMAIN LOSS

Common critical error:

algebraic simplification hides excluded points.

Example classes include rational/log/root expressions.

Evaluator must not silently widen domain.

---

# 15. MATRIX / VECTOR ANSWERS

Validate:

- dimensions;
- order;
- element values;
- orientation where meaningful;
- equivalent basis/representation only when task allows.

Do not compare matrices as unordered sets.

---

# 16. UNIT-AWARE ANSWERS

For applied tasks:

- value;
- unit;
- dimension;
- conversion;
- tolerance.

Correct number + wrong dimension may be incorrect.

---

# 17. WORKED EXAMPLE CONTRACT

A worked example should teach strategy, not merely expose an answer.

Preferred structure:

- problem orientation;
- concept recognition;
- strategy decision;
- justified steps;
- verification;
- common mistake;
- transfer prompt.

Support fading should prevent permanent dependence on worked solutions.

---

# 18. HINT LADDER

Suggested Math hint levels:

`H0 — independent attempt`

`H1 — identify relevant concept`

`H2 — ask guiding question / representation`

`H3 — remind theorem/formula/strategy`

`H4 — reveal next step structure`

`H5 — show worked step / analogous example`

`H6 — full solution only when policy permits`.

Hint usage is evidence metadata, not automatic failure.

---

# 19. ERROR TAXONOMY

Classify when evidence supports it:

- concept misconception;
- prerequisite gap;
- notation misunderstanding;
- wrong strategy;
- algebraic transformation error;
- arithmetic error;
- sign error;
- domain/assumption error;
- unit error;
- graph interpretation error;
- proof gap;
- unjustified inference;
- numerical-method misuse;
- task misunderstanding.

Do not overdiagnose from one error.

---

# 20. REMEDIATION LOOP

`FAILURE`
→ `CLASSIFY`
→ `CHECK PREREQUISITE`
→ `CONTRAST / EXPLAIN`
→ `CONTROLLED REPAIR`
→ `NEW VARIANT`
→ `INDEPENDENT SOLUTION`
→ `TRANSFER CHECK`.

Do not route every failure to “redo whole lesson”.

---

# 21. PROOF / JUSTIFICATION MODEL

Proof tasks may require:

- statement/hypotheses;
- claim/subgoal;
- reason;
- dependency;
- conclusion;
- counterexample handling;
- rigor level.

The system may support structured proof, rubric-based proof or human/AI feedback.

Do not claim fully formal proof verification unless an actual formal verifier exists.

---

# 22. PROOF METHODS

Candidate proof patterns to represent when curriculum uses them:

- direct proof;
- contradiction;
- contrapositive;
- induction;
- construction;
- case analysis;
- existence/uniqueness;
- counterexample/disproof.

MATH02 validates curriculum relevance.

---

# 23. ALTERNATIVE VALID SOLUTIONS

A Math problem may admit multiple methods.

Official evaluation must not reject a valid method simply because it differs from the model solution.

For open reasoning tasks:

use rubric/criteria rather than exact text.

---

# 24. ASSESSMENT MODES

Separate:

- diagnostic;
- guided practice;
- independent practice;
- retrieval/review;
- checkpoint;
- exam;
- transfer task;
- project/application.

Reveal/hint/scoring rules differ by mode.

---

# 25. FIRST ATTEMPT INTEGRITY

Preserve:

- first response;
- first timestamp;
- first evaluation;
- content revision;
- mode;
- hint state if relevant.

Retry appends new evidence.

Never overwrite first attempt.

---

# 26. COMPLETION ≠ MASTERY

Distinguish:

`visited`

`started`

`completed`

`passed`

`mastered`

`retained`.

Opening a solved example is not mastery.

---

# 27. MATH MASTERY DIMENSIONS

Math-specific evidence may contribute separately to:

- conceptual;
- symbolic/procedural;
- representation;
- reasoning;
- proof/justification;
- modeling/application;
- numerical/computational;
- interpretation/communication;
- transfer;
- retention.

C4 remains global mastery authority.

---

# 28. PARTIAL CREDIT

Partial credit must be criterion-based, not arbitrary percentages.

Possible evidence:

- correct setup;
- correct concept;
- valid major steps;
- localized arithmetic mistake;
- correct interpretation;
- correct verification.

Do not award official partial credit from opaque AI confidence alone.

---

# 29. GUESSING / ANSWER-ONLY EVIDENCE

A multiple-choice correct answer may be weak evidence compared with:

- generated response;
- justified steps;
- transfer problem.

Do not collapse them to identical mastery weight without rationale.

---

# 30. SPACED / INTERLEAVED PRACTICE

Math review should mix:

- prerequisite retrieval;
- concept recall;
- representative problems;
- interleaved problem families;
- delayed transfer.

Do not schedule every Math item like a vocabulary flashcard.

---

# 31. ADAPTIVE DIFFICULTY VECTOR

Difficulty can vary by:

- algebraic complexity;
- number of steps;
- abstraction;
- representation switching;
- parameterization;
- proof depth;
- context novelty;
- computational burden;
- hint availability;
- time pressure.

Do not equate difficulty solely with larger numbers.

---

# 32. PREREQUISITE REPAIR

If a calculus problem fails because algebra is weak:

route algebra repair rather than repeatedly giving harder calculus questions.

Adaptive system must trace prerequisite cause.

---

# 33. ANTI-MEMORIZATION

Repeated exposure to the exact same numeric problem weakens evidence.

Use controlled variants while preserving target competency.

Problem variation must not accidentally change the underlying difficulty/skill without metadata.

---

# 34. PROBLEM GENERATION

Generated variants require constraints:

- solvable;
- domain valid;
- answer verified;
- desired difficulty;
- no degenerate case unless intentional;
- reproducible seed where useful.

AI-generated answer key is not automatically authoritative.

---

# 35. EVIDENCE EVENT MODEL

Prefer explicit events such as:

- problem_started;
- step_submitted;
- hint_used;
- answer_submitted;
- answer_evaluated;
- verification_completed;
- remediation_started;
- transfer_task_completed.

Render itself is not an evidence event.

---

# 36. IDEMPOTENCY / CONCURRENCY

Ensure:

- double submit does not create two official attempts;
- reload does not duplicate score;
- multiple tabs do not silently overwrite the same long solution;
- stale evaluator response cannot overwrite newer learner work.

---

# 37. AI BOUNDARY

AI may:

- ask Socratic questions;
- explain a canonical concept;
- identify a possible misconception;
- suggest strategy;
- generate temporary practice;
- critique reasoning with uncertainty.

AI must not directly:

- rewrite theorem truth;
- set official mastery;
- alter answer key;
- award official proof score without validated process;
- reveal exam solution before policy allows.

---

# 38. REQUIRED OUTPUTS

Create/update:

- `MATH_PROBLEM_CONTRACT.json`
- `MATH_SOLUTION_STEP_SCHEMA.json`
- `MATH_EQUIVALENCE_POLICY.md`
- `MATH_PROOF_REASONING_POLICY.md`
- `MATH_ERROR_REMEDIATION_MAP.md`
- `MATH_ASSESSMENT_EVIDENCE_POLICY.md`
- `MATH_MASTERY_SPECIALIZATION.md`
- `MATH_ADAPTIVE_PROBLEM_POLICY.md`
- `MATH_FIRST_ATTEMPT_INTEGRITY_REPORT.md`
- `MATH_P4_INPUT_CONTRACT.md`.

---

# 39. EXIT GATE

MATH03 PASS only if:

1. problem contract exists;
2. final answer and reasoning are distinct;
3. equivalence policies are typed by answer class;
4. domains/assumptions survive evaluation;
5. exact vs approximate rules are explicit;
6. proof claims are honest about verifier capability;
7. alternative valid solutions are supported appropriately;
8. first attempt is immutable;
9. partial credit is criterion-based;
10. mastery evidence is multidimensional;
11. remediation is root-cause/prerequisite aware;
12. generated problems are validated;
13. writes are idempotent;
14. AI cannot become official truth/mastery owner;
15. golden edge-case tests pass.

At PASS:

`MATH REASONING & EVIDENCE CONTRACT LOCKED`.
