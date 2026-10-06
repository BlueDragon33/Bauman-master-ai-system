import fs from 'node:fs';
import assert from 'node:assert/strict';
import {
  SCHEMAS,
  createAttemptId,
  createInteractionId
} from '../public/contracts.mjs';
import {
  SUPPORT_LADDER,
  createGroundedSceneRuntime
} from '../acquisition/grounded-scene-runtime.mjs';

const fixture = JSON.parse(fs.readFileSync(
  new URL('../content/fixtures/grounded-scenes.v1.json', import.meta.url),
  'utf8'
));

const runtime = createGroundedSceneRuntime({
  scenes: fixture.scenes,
  clock: () => 1700000000000
});

assert.equal(runtime.sceneCount, 2);
assert.equal(SUPPORT_LADDER.length, 11);

const first = runtime.getExperience('grounded-give-ball-a');
assert.equal(first.schemaVersion, SCHEMAS.experience);
assert.equal(first.type, 'listen-act');
assert.equal(first.stimulus.language, 'ru');
assert.equal(first.stimulus.audioText, 'Дай мяч.');
assert.equal(first.supportPolicy.currentLevel, 0);
assert.equal(first.supportPolicy.translationDefault, 'hidden');
assert.equal(first.supportPolicy.currentStep.kind, 'none');
assert.equal(first.action.availableObjectIds.length, 3);

const attemptId = createAttemptId(first.experienceId, () => 1000);

const wrong = runtime.submitInteraction({
  schemaVersion: SCHEMAS.interaction,
  interactionId: createInteractionId(attemptId, 1),
  attemptId,
  experienceId: first.experienceId,
  actionType: 'select-object',
  payload: {objectId:'book'},
  support: {level:0,replays:0,translationUsed:false},
  timing: {responseMs:900}
});

assert.equal(wrong.evidence[0].result.success, false);
assert.equal(wrong.evidence[0].authoritative, false);
assert.equal(wrong.consequence.kind, 'no-success-mutation');
assert.equal(wrong.nextHint.supportLevel, 1);
assert.equal(wrong.nextHint.step.kind, 'replay');
assert.equal(wrong.nextHint.translationVisible, false);

const nearTranslation = runtime.submitInteraction({
  schemaVersion: SCHEMAS.interaction,
  interactionId: createInteractionId(attemptId, 2),
  attemptId,
  experienceId: first.experienceId,
  actionType: 'select-object',
  payload: {objectId:'cup'},
  support: {level:9,replays:2,translationUsed:false},
  timing: {responseMs:2200}
});

assert.equal(nearTranslation.nextHint.supportLevel, 10);
assert.equal(nearTranslation.nextHint.step.kind, 'native-language-translation-available');
assert.equal(nearTranslation.nextHint.translationVisible, true);

const correct = runtime.submitInteraction({
  schemaVersion: SCHEMAS.interaction,
  interactionId: createInteractionId(attemptId, 3),
  attemptId,
  experienceId: first.experienceId,
  actionType: 'select-object',
  payload: {objectId:'ball'},
  support: {level:1,replays:1,translationUsed:false},
  timing: {responseMs:700}
});

assert.equal(correct.evidence[0].result.success, true);
assert.equal(correct.evidence[0].supportLevel, 1);
assert.equal(correct.consequence.mutation, 'requester-receives-object');
assert.equal(correct.transferSceneId, 'grounded-give-book-b');

const transfer = runtime.getExperience(correct.transferSceneId);
assert.equal(transfer.stimulus.audioText, 'Дай книгу.');
assert.notEqual(transfer.stimulus.scene.sceneId, first.stimulus.scene.sceneId);

const transferAttempt = createAttemptId(transfer.experienceId, () => 1001);
const transferResult = runtime.submitInteraction({
  schemaVersion: SCHEMAS.interaction,
  interactionId: createInteractionId(transferAttempt, 1),
  attemptId: transferAttempt,
  experienceId: transfer.experienceId,
  actionType: 'select-object',
  payload: {objectId:'book'},
  support: {level:0,replays:0,translationUsed:false},
  timing: {responseMs:800}
});

assert.equal(transferResult.evidence[0].result.success, true);
assert.equal(transferResult.evidence[0].supportLevel, 0);
assert.equal(transferResult.evidence[0].observationType, 'grounded-semantic-comprehension');

console.log(JSON.stringify({
  ok:true,
  runtime:runtime.schema,
  scenes:runtime.sceneCount,
  supportSteps:SUPPORT_LADDER.length,
  defaultTranslation:'hidden',
  transferProven:true,
  masteryAuthority:'RU04/C4'
}));
