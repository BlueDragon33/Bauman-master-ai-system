# DB04 Fixture & Reset Contract

## Fixture identity

Every executable task binds to:

`fixtureId + fixtureRevision + schemaRevision + engineProfileId`

A display title is never fixture identity.

## Public vs hidden

Public learning fixtures may be bundled with content.

Hidden grading fixtures:
- are trusted test/grader assets;
- never ship in learner content;
- never enter AI tutor context;
- never appear in execution responses.

## Reset invariant

Given the same fixture revision and engine profile, reset must restore the same logical schema/data state.

## Attempt isolation

Default:
- each grading attempt starts from clean fixture state;
- DDL/DML mutations are discarded after attempt;
- transaction exercises explicitly control begin/commit/rollback state.

## Failure

If reset fails:
- fail closed;
- do not grade;
- record reset failure;
- never silently continue on contaminated state.
