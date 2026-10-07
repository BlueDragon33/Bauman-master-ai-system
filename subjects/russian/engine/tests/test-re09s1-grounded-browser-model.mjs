import assert from 'node:assert/strict';
import {
  GROUNDED_SUPPORT_STEPS,
  evaluateGroundedSelection,
  nextTransferScene,
  shouldEnableGroundedSlice
} from '../integration/grounded-browser-model.js';

const scenes=[
  {
    sceneId:'a',
    transferGroup:'g1',
    targetCompetencies:['COMP-RU-LISTEN'],
    expectedAction:{objectId:'ball'},
    successConsequence:{mutation:'requester-receives-object'}
  },
  {
    sceneId:'b',
    transferGroup:'g1',
    targetCompetencies:['COMP-RU-LISTEN'],
    expectedAction:{objectId:'book'},
    successConsequence:{mutation:'requester-receives-object'}
  }
];

assert.equal(GROUNDED_SUPPORT_STEPS.length,11);
assert.equal(shouldEnableGroundedSlice('https://example.test/?ruEngine=grounded-v1'),true);
assert.equal(shouldEnableGroundedSlice('https://example.test/'),false);

const wrong=evaluateGroundedSelection({scene:scenes[0],selectedObjectId:'book',supportLevel:0,attemptId:'A1'});
assert.equal(wrong.success,false);
assert.equal(wrong.supportLevelAfter,1);
assert.equal(wrong.supportStep,'replay');
assert.equal(wrong.translationVisible,false);
assert.equal(wrong.evidence.authoritative,false);
assert.equal(wrong.evidence.masteryMutation,false);
assert.equal(wrong.consequence.mutation,null);

const transcript=evaluateGroundedSelection({scene:scenes[0],selectedObjectId:'book',supportLevel:7,attemptId:'A2'});
assert.equal(transcript.supportLevelAfter,8);
assert.equal(transcript.transcriptVisible,true);
assert.equal(transcript.translationVisible,false);

const translation=evaluateGroundedSelection({scene:scenes[0],selectedObjectId:'book',supportLevel:9,attemptId:'A3'});
assert.equal(translation.supportLevelAfter,10);
assert.equal(translation.translationVisible,true);

const correct=evaluateGroundedSelection({scene:scenes[0],selectedObjectId:'ball',supportLevel:2,attemptId:'A4'});
assert.equal(correct.success,true);
assert.equal(correct.consequence.mutation,'requester-receives-object');
assert.equal(correct.supportLevelAfter,2);

assert.equal(nextTransferScene(scenes,scenes[0]).sceneId,'b');

console.log(JSON.stringify({
  ok:true,
  supportSteps:11,
  translationLast:true,
  transcriptLate:true,
  transfer:true,
  masteryMutation:false,
  featureFlagDefaultOff:true
}));
