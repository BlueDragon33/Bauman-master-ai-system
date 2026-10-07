import assert from 'node:assert/strict';
import {
  SCHEMAS,
  RussianEngineContractError,
  validateExperience,
  validateInteraction,
  validateEvidence,
  validateLearnerSnapshot,
  createAttemptId,
  createInteractionId
} from '../public/contracts.mjs';
import {createRussianEngineFacade} from '../public/facade.mjs';

const experience = {
  schemaVersion: SCHEMAS.experience,
  experienceId: 'RE-EXP-BALL-001',
  type: 'listen-act',
  targetCompetencies: ['RU-COMP-SEMANTIC-GROUNDING'],
  contentRevision: 'fixture-r1',
  stimulus: {language:'ru',audioText:'Дай мяч.',sceneId:'scene-ball-001'},
  action: {kind:'select-object',validObjectIds:['ball']},
  supportPolicy: {maxLevel:10,translationDefault:'hidden'},
  evidencePolicy: {observation:'grounded-comprehension'},
  difficulty: {semanticNovelty:1,acousticRate:'careful-native'}
};

const attemptId = createAttemptId(experience.experienceId, () => 42);
const interaction = {
  schemaVersion: SCHEMAS.interaction,
  interactionId: createInteractionId(attemptId, 1),
  attemptId,
  experienceId: experience.experienceId,
  actionType: 'select-object',
  payload: {objectId:'ball'},
  support: {level:0,replays:0,translationUsed:false},
  timing: {responseMs:1400}
};

const evidence = {
  schemaVersion: SCHEMAS.evidence,
  evidenceId: 'RE-EVID-001',
  attemptId,
  experienceId: experience.experienceId,
  competencyIds: ['RU-COMP-SEMANTIC-GROUNDING'],
  observationType: 'grounded-comprehension',
  result: {success:true,selectedObjectId:'ball'},
  provider: {kind:'deterministic-scene-runtime',confidence:1},
  supportLevel: 0,
  authoritative: false
};

const learner = {
  schemaVersion: SCHEMAS.learnerSnapshot,
  profileId: 'local-default',
  capabilities: {
    semanticComprehension: {estimate:0.2,evidenceCount:1},
    listening: {estimate:0.1,evidenceCount:1}
  },
  reviewDue: [],
  progression: {internalLevel:1,band:1}
};

assert.equal(validateExperience(experience).experienceId, experience.experienceId);
assert.equal(validateInteraction(interaction).attemptId, attemptId);
assert.equal(validateEvidence(evidence).authoritative, false);
assert.equal(validateLearnerSnapshot(learner).progression.internalLevel, 1);

assert.throws(
  () => validateEvidence({...evidence,evidenceId:'BAD',masteryGranted:true}),
  error => error instanceof RussianEngineContractError && error.errors.some(x => /masteryGranted/.test(x))
);

assert.throws(
  () => validateExperience({...experience,supportPolicy:{maxLevel:11}}),
  error => error instanceof RussianEngineContractError && error.errors.some(x => /maxLevel/.test(x))
);

const facade = createRussianEngineFacade({
  experience: {next: async () => experience},
  interaction: {submit: async submitted => ({
    accepted: submitted.payload.objectId === 'ball',
    evidence: [evidence],
    consequence: {sceneMutation:'character-receives-ball'}
  })},
  learner: {snapshot: async () => learner},
  capabilities: {status: () => ({offline:true,aiRequired:false})}
});

const next = await facade.getNextExperience({profileId:'local-default'});
assert.equal(next.type,'listen-act');
const submitted = await facade.submitInteraction(interaction);
assert.equal(submitted.accepted,true);
assert.equal(submitted.evidence.length,1);
assert.equal(submitted.evidence[0].observationType,'grounded-comprehension');
assert.equal(submitted.consequence.sceneMutation,'character-receives-ball');
const snapshot = await facade.getLearnerSnapshot({profileId:'local-default'});
assert.equal(snapshot.profileId,'local-default');
assert.deepEqual(facade.getCapabilities(),{offline:true,aiRequired:false});

console.log(JSON.stringify({
  ok:true,
  apiVersion:facade.apiVersion,
  contracts:Object.values(SCHEMAS),
  masteryAuthority:'RU04/C4',
  verticalContract:'experience -> interaction -> evidence -> learner snapshot'
}));
