# Russian Engine RE24 — Phase 4 Browser Acceptance

State: VALIDATING

## Source browser requirements

Feature OFF:
- no grounded mount;
- no Engine RU04 write;
- passive bridge remains stable.

Feature ON:
- grounded slice mounts;
- learner selection creates Engine observation;
- live owner adapter writes attempt/evidence to RussianAssessmentMastery;
- evidence remains non-authoritative;
- mastery is not granted;
- planner compatibility surface is available;
- planner owner methods remain unpatched.

## Packaged / offline

The new live owner integration browser module is included in the Russian service-worker shell cache under the narrow RE24 allowlist.

The cache revision is bumped to prevent stale bootstrap dependency graphs.

## Cross-boundary allowlist

Only:
`subjects/russian/sw.js`

Allowed edits:
- cache revision bump;
- precache `./engine/integration/live-owner-integration.js`.

No other general Russian app write is authorized.

## Exit

PASS when source + packaged browser acceptance and offline shell prove parity without default-on behavior.
