# DB03 — RELATIONAL REASONING · SQL · SCHEMA DESIGN · ASSESSMENT
## Semantic grading · Query equivalence · Normalization · Error models

Mode:

`SEMANTIC-FIRST · MULTIPLE-VALID-QUERY-AWARE · DIFFERENTIAL-FIXTURE-TESTED · EVIDENCE-BASED`

---

# 0. ENTRY

Requires DB02.

---

# 1. MISSION

Define how learners reason about schemas/data/queries and how the system assesses Database/SQL competence without source-string matching.

---

# 2. REASONING LOOP

`Requirement`

→ `Data model`

→ `Relations/constraints`

→ `Relational reasoning`

→ `SQL strategy`

→ `Query`

→ `Result semantics`

→ `Integrity/performance check`

→ `Alternative`

→ `Transfer`.

---

# 3. SQL TEXT ≠ SQL MEANING

Different queries may be semantically equivalent.

Same query may behave differently across dialect/version.

Assessment binds to canonical task + engine profile.

---

# 4. ONE DATASET IS NOT ENOUGH

A wrong query can accidentally match expected output on one fixture.

Use discriminating fixtures.

---

# 5. DIFFERENTIAL FIXTURE DESIGN

Fixtures should distinguish likely wrong solutions.

Examples:

- duplicates;
- NULL;
- missing related rows;
- multiple matches;
- zero matches;
- ties;
- empty tables;
- boundary dates/values.

---

# 6. ORDERING

If task does not require order:

compare unordered result semantics.

If task requires order:

verify ordering keys/direction/ties.

---

# 7. DUPLICATE POLICY

Task declares whether duplicates are meaningful.

---

# 8. NULL POLICY

Fixture includes NULL where concept relevant.

---

# 9. TYPE/FORMAT POLICY

Avoid rejecting semantically correct values solely due irrelevant display formatting.

---

# 10. COLUMN CONTRACT

Task can require:

- values;
- aliases;
- order of columns

when pedagogically relevant.

---

# 11. ROW CONTRACT

Compare rows with bag/set semantics according task.

---

# 12. QUERY SAFETY

Assessment runner executes only in isolated learner DB.

---

# 13. SELECT ASSESSMENT

Test:

- projection;
- predicate;
- NULL;
- duplicates;
- order.

---

# 14. JOIN ASSESSMENT

Test cardinality and missing-side behavior.

---

# 15. OUTER JOIN

Include unmatched rows in fixtures.

---

# 16. SELF JOIN

Use distinct aliases/roles.

---

# 17. AGGREGATION

Test:

- empty groups;
- NULL values;
- duplicates;
- HAVING.

---

# 18. COUNT

Golden fixtures distinguish:

`COUNT(*)`

from:

`COUNT(nullable_column)`.

---

# 19. DISTINCT

Test cases where it changes result and where it does not.

---

# 20. SUBQUERY

Test correlated vs uncorrelated semantics.

---

# 21. EXISTS vs IN

NULL interactions can differ.

Do not teach as blindly interchangeable.

---

# 22. NOT IN NULL TRAP

Golden misconception fixture if in scope.

---

# 23. CTE

Assess semantics, not stylistic preference unless structure is objective.

---

# 24. WINDOW FUNCTIONS

If scope includes:

partition/order/frame semantics must be explicit.

---

# 25. DML ASSESSMENT

Compare resulting database state/constraints, not merely command text.

---

# 26. DDL ASSESSMENT

Validate resulting schema in isolated DB.

---

# 27. CONSTRAINT ASSESSMENT

Learner may need to:

- identify needed constraints;
- create them;
- explain integrity effect;
- demonstrate violation.

---

# 28. KEY ASSESSMENT

Candidate/composite keys require reasoning from constraints/FDs, not “first ID-like column”.

---

# 29. FD ASSESSMENT

Test implication/closure where in scope.

---

# 30. NORMALIZATION ASSESSMENT

Evidence dimensions:

- identify dependency;
- identify violation;
- decompose;
- justify normal form;
- lossless;
- dependency preservation if required.

---

# 31. MULTIPLE VALID DECOMPOSITIONS

Grader/rubric should accept valid alternatives where theory permits.

---

# 32. ER-TO-RELATIONAL ASSESSMENT

Check mapping semantics, keys/cardinality/constraints.

---

# 33. TRANSACTION ASSESSMENT

Learner reasons about schedules and visibility.

---

# 34. ANOMALY ASSESSMENT

Present interleavings that distinguish:

- dirty read;
- non-repeatable;
- phantom;
- lost update;
- write skew

as in scope.

---

# 35. ISOLATION ENGINE CONTEXT

Question names theoretical model or engine/profile.

Avoid ambiguous claims.

---

# 36. SERIALIZABILITY

If in scope:

precedence/conflict reasoning may be assessed.

---

# 37. INDEX SELECTION ASSESSMENT

Learner considers:

- predicate;
- join;
- ordering;
- selectivity;
- write cost;
- composite order.

---

# 38. INDEX ≠ AUTOMATIC SPEED

Task can ask counterexample where index is not chosen/helpful.

---

# 39. QUERY PLAN ASSESSMENT

Learner interprets:

- scan;
- index access;
- join;
- estimate;
- actual.

Do not require memorization of one engine's visual icon set unless relevant.

---

# 40. COST REASONING

Qualitative/relative unless engine-specific data provided.

---

# 41. PERFORMANCE TASK

Can compare candidate queries/plans on controlled engine/version/data.

Benchmark is supporting evidence, not universal theorem.

---

# 42. MULTIPLE VALID SQL

Critical policy.

Accept alternatives satisfying task semantics and restrictions.

---

# 43. FORBIDDEN CONSTRUCTS

Only ban syntax when objective specifically trains another construct or safety requires.

Do not reject correct SQL for stylistic preferences.

---

# 44. REQUIRED CONSTRUCTS

Likewise use only when pedagogy targets it.

---

# 45. STATIC SQL ANALYSIS

May supplement grading.

Cannot replace semantic execution for general SQL correctness.

---

# 46. QUERY RESULT GRADING

Use normalized rows/columns/bag/order semantics.

---

# 47. SCHEMA-STATE GRADING

For DDL/DML:

inspect schema/data state.

---

# 48. TRANSACTION GRADING

Use deterministic simulated schedule/engine fixture.

---

# 49. HIDDEN FIXTURES

Protected from learner and AI.

---

# 50. TEST-OF-TESTS

Known wrong queries must fail.

Known alternate-correct queries must pass.

---

# 51. WRONG QUERY LIBRARY

Include representative:

- missing join predicate;
- accidental inner join;
- wrong HAVING/WHERE;
- COUNT(column) mistake;
- NOT IN NULL trap;
- duplicate explosion;
- missing DISTINCT when required;
- wrong grouping;
- order assumption;
- correlated-subquery error.

---

# 52. ERROR TAXONOMY

At minimum:

`MODEL_ERROR`

`KEY_CONSTRAINT_ERROR`

`JOIN_ERROR`

`CARDINALITY_ERROR`

`NULL_ERROR`

`DUPLICATE_ERROR`

`ORDER_ERROR`

`AGGREGATION_ERROR`

`SUBQUERY_SCOPE_ERROR`

`NORMALIZATION_ERROR`

`TRANSACTION_ERROR`

`ISOLATION_ERROR`

`INDEX_SELECTION_ERROR`

`PLAN_INTERPRETATION_ERROR`

`DIALECT_ERROR`

`SECURITY_ERROR`.

---

# 53. PARTIAL CREDIT

Separate:

- modeling;
- SQL strategy;
- SQL semantics;
- integrity;
- performance reasoning.

C4 owns global mastery aggregation.

---

# 54. HINT LADDER

Possible:

H1 clarify requirement

H2 identify relation/keys

H3 identify join/grouping need

H4 point to NULL/duplicate edge

H5 suggest relational algebra shape

H6 reveal partial SQL

H7 full solution after policy allows.

---

# 55. AI BOUNDARY

AI may coach.

Cannot reveal hidden fixtures or write official mastery.

---

# 56. REMEDIATION

Map error to prerequisite:

e.g. outer-join mistake

→ join cardinality + missing-side semantics.

---

# 57. ADAPTIVE DIFFICULTY

Vary:

- number of tables;
- relationship complexity;
- NULL/duplicates;
- nesting;
- transaction concurrency;
- data size;
- performance requirement.

---

# 58. TRANSFER

Change schema/domain story while preserving relational structure.

---

# 59. ANTI-MEMORIZATION

Vary table/column names/data values/fixture structure.

---

# 60. FIRST ATTEMPT

Preserve.

---

# 61. RETRIES

Append evidence.

---

# 62. DELIVERABLES

Create:

`subjects/database/docs/db03/DB_RELATIONAL_REASONING_CONTRACT.md`

`DB_SQL_GRADER_CONTRACT.md`

`DB_RESULT_NORMALIZATION_CONTRACT.md`

`DB_DIFFERENTIAL_FIXTURE_POLICY.md`

`DB_SCHEMA_DESIGN_ASSESSMENT_CONTRACT.md`

`DB_NORMALIZATION_ASSESSMENT_CONTRACT.md`

`DB_TRANSACTION_ASSESSMENT_CONTRACT.md`

`DB_ERROR_TAXONOMY.json`

`DB_GOLDEN_CORRECT_QUERIES.json`

`DB_GOLDEN_WRONG_QUERIES.json`

`DB04_INPUT_CONTRACT.md`.

---

# 63. PASS

PASS when:

- grading is semantic;
- differential fixtures distinguish common wrong queries;
- NULL/duplicates/order handled;
- multi-valid SQL accepted;
- design/normalization assessment is rigorous;
- transaction/isolation tasks are contextual;
- test-of-tests passes;
- remediation and evidence contract exist.

---

# 64. FAIL

FAIL if:

- exact SQL string is primary truth;
- one fixture determines correctness;
- unordered results compared as ordered accidentally;
- NULL ignored;
- valid alternate SQL rejected systematically;
- AI sees hidden tests.

---

# 65. FINAL PRINCIPLE

**GRADE WHAT THE QUERY MEANS, NOT WHETHER IT LOOKS LIKE THE REFERENCE QUERY.**
