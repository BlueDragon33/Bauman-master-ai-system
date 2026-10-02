# DB04 AI Tutor Contract

Capability: `db.ai.tutor`

Modes:
- DATA_MODEL_COACH
- SQL_QUERY_COACH
- JOIN_COACH
- NULL_COACH
- NORMALIZATION_COACH
- TRANSACTION_COACH
- INDEX_COACH
- QUERY_PLAN_COACH

## Allowed context

AI may receive:
- canonical DB02 concepts;
- DB03 public assessment contract;
- public schema/fixture;
- learner query/result;
- verified engine profile;
- allowed hint level.

## Forbidden

AI must not receive:
- hidden grading fixtures;
- official hidden solutions;
- production/control credentials;
- unrestricted DB access.

AI cannot:
- write official mastery;
- be the sole official grader;
- invent query-plan output;
- claim an index will improve performance without evidence;
- make isolation claims without model/profile context.

## Hint ladder

Prefer:
requirement clarification → relations/keys → join/group/null clue → relational shape → partial SQL → full solution only when policy permits.

## Provider failure

Fallback to canonical lesson, deterministic public fixtures and static hints. Failure must not block access to core learning content.
