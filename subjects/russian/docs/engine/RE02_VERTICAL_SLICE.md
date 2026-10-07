# Russian Engine RE02 — Grounded Semantic Immersion Vertical Slice

State: **PASS**

## Purpose

Prove the smallest useful Russian-first acquisition loop without changing the general Russian App.

Target loop:

`RUSSIAN AUDIO → SCENE → LEARNER ACTION → WORLD CONSEQUENCE → OBSERVATION EVIDENCE → SUPPORT OR TRANSFER`

## Fixture

The first fixture contains two related scenes.

Scene A:
- Russian stimulus: `Дай мяч.`
- visible objects: ball, book, cup;
- learner selects an object;
- correct action changes the world state: requester receives ball.

Transfer Scene B:
- Russian stimulus: `Дай книгу.`
- object positions/order differ;
- learner must apply the same semantic relation to a different object.

The fixture is explicitly marked:

`FIXTURE_NONCANONICAL_PENDING_RU03`

It is architecture/test content and does not promote itself into canonical Russian curriculum.

## Translation behavior

Default:
`hidden`

Support ladder:
0. none
1. replay
2. visual focus
3. slower replay
4. gesture/animation
5. semantic contrast
6. simpler Russian
7. known-Russian paraphrase
8. partial model
9. explicit explanation
10. native-language translation becomes available

The runtime exposes support intent only. UI rendering is deferred to RE09 integration.

## Evidence behavior

The runtime emits:
`grounded-semantic-comprehension`

Evidence records:
- selected object;
- expected object;
- success/failure;
- semantic relation;
- support level;
- deterministic provider confidence.

It cannot grant mastery.

RU04/C4 remain learning-judgment authority.

## Failure semantics

Wrong selection:
- does not mutate world into success state;
- emits real failure observation evidence;
- raises support by one bounded step;
- does not immediately reveal translation.

Infrastructure/provider failure is outside this deterministic fixture and must remain separate from learner failure in future provider-backed experiences.

## Transfer

Successful Scene A returns a different scene from the same transfer group.

This prevents the first proof from being only exact sentence memorization.

## Integration boundary

No existing:
- index.html;
- core.js;
- assessment/mastery;
- learning state;
- speech adapter;
- UI

is modified.

No `APP_INTEGRATION_REQUIRED` action is executed in RE02.

## Files

- `subjects/russian/engine/content/fixtures/grounded-scenes.v1.json`
- `subjects/russian/engine/acquisition/grounded-scene-runtime.mjs`
- `subjects/russian/engine/tests/test-re02-grounded-scene.mjs`

## Validation

Executed against the branch implementation: **11/11 checks PASS**.

Proven:
- Russian-only default stimulus;
- meaningful object action;
- wrong action does not create success mutation;
- observation evidence records failure/success honestly;
- bounded support escalation;
- translation remains hidden until support level 10;
- successful Scene A yields a changed transfer Scene B;
- transfer can succeed independently at support level 0;
- Engine evidence remains non-authoritative.

## Exit

**RE02 PASS.**
