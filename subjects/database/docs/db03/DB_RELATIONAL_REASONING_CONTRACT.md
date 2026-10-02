# DB Relational Reasoning Contract

Owner: **DB03**

Foundation: DB02 locked semantic contracts.

## Reasoning loop

`Requirement → data model → relations/constraints → relational algebra → SQL strategy → query → result semantics → integrity/performance check → alternative → transfer`

Assessment records evidence at meaningful steps rather than grading only the final query string.

## Dimensions

- model/relation selection;
- keys/constraints;
- projection/predicate;
- join type/cardinality;
- grouping/aggregation;
- NULL/three-valued logic;
- duplicate/bag policy;
- ordering contract;
- subquery correlation/scope;
- normalization rationale;
- transaction/isolation context;
- index/plan reasoning when asked.

## Evidence

- first attempt is immutable;
- retries append evidence;
- hints used are recorded;
- C4/shared mastery owns official mastery aggregation;
- AI coaching is advisory, not grading authority.

## Transfer

Change domain story/names/data while preserving relational structure. Memorizing one example is not transfer.
