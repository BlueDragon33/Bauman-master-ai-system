# RE17 — RU04 EVIDENCE BRIDGE

Canonical owner: RU04 + C4

Mission: convert Russian Engine observation events into RU04-compatible evidence candidates without granting mastery or overwriting attempts.

## Bridge rules
Input:
- Engine observation evidence;
- attempt identity;
- content revision;
- mode;
- support/hint metadata;
- competency IDs;
- provider limitations.

Output:
- RU04 evidence candidate only.

The bridge must never:
- set mastery=true;
- write official score;
- unlock stage/level;
- overwrite first attempt;
- collapse practice and assessment histories.

## Attempt integrity
Stable attempt ID + immutable first attempt.
Retries append with parent/root attempt relation.

## Failure separation
Infrastructure/provider failures remain non-learner evidence.
Unsupported capability cannot become learner error.

## Exit
PASS when mapping is deterministic/idempotent, first attempt identity is preserved, retry is append-only, practice/assessment modes remain explicit, and mastery fields are impossible.
