# DB Differential Fixture Policy

A fixture exists to distinguish likely wrong semantics, not merely provide sample data.

Required families when relevant:
- duplicates;
- NULL;
- missing related rows;
- multiple matches;
- zero matches/empty relation;
- boundary values;
- ties;
- nullable foreign keys;
- many-to-many cardinality.

For every known wrong query:

`wrong query → expected error taxonomy → fixture(s) making error observable`

A wrong query with no discriminating fixture is an incomplete test-of-tests case.

Public developer canaries may live in the repo. Official hidden grading payloads must be isolated by DB04/DB06 and excluded from learner and AI-tutor packages.
