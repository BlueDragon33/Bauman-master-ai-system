import assert from 'node:assert/strict';
import fs from 'node:fs';
import {describeGroundedSceneForBeginner} from '../integration/beginner-scene-guide.js';
import {evaluateGroundedSelection} from '../integration/grounded-browser-model.js';

const catalog=JSON.parse(fs.readFileSync(new URL('../content/fixtures/real-life-scenes.v1.json',import.meta.url),'utf8'));
assert.equal(catalog.scenes.length,15);
let locationPreviews=0;
let quarantined=0;
for(const scene of catalog.scenes){
  const guide=describeGroundedSceneForBeginner(scene);
  assert.ok(guide.settingLabel);
  assert.ok(guide.taskLabel);
  assert.ok(guide.explanation);
  assert.equal(guide.awaitingReview,true);
  if(guide.quarantineReason)quarantined++;
  const result=evaluateGroundedSelection({scene,selectedObjectId:scene.expectedAction.objectId,attemptId:'A0'});
  assert.equal(result.evidence.authoritative,false);
  assert.equal(result.evidence.masteryMutation,false);
  if(guide.locationRecognitionOnly){
    locationPreviews++;
    assert.equal(result.evidence.observationType,'visual-noun-association-preview');
    assert.deepEqual(result.evidence.competencyIds,[]);
    assert.ok(guide.explanation.includes('KHÔNG'));
  }else{
    assert.equal(result.evidence.observationType,'grounded-semantic-comprehension');
    assert.ok(result.evidence.competencyIds.length);
  }
}
assert.equal(locationPreviews,11);
assert.equal(quarantined,5);
const ids=catalog.scenes.filter(x=>describeGroundedSceneForBeginner(x).quarantineReason).map(x=>x.sceneId);
assert.deepEqual(ids,['rl-05-shop','rl-08-metro','rl-09-metro','rl-11-dorm','rl-13-university']);
const doorway=catalog.scenes.find(x=>x.sceneId==='rl-11-dorm');
assert.equal(doorway.expectedAction.objectId,'door');
assert.equal(describeGroundedSceneForBeginner(doorway).locationRecognitionOnly,true);
assert.equal(describeGroundedSceneForBeginner({setting:'room',expectedAction:{kind:'select-object',semanticRelation:'request-object'}}).awaitingReview,false);
console.log(JSON.stringify({ok:true,scenes:15,locationPreviewWithoutCompetencyEvidence:locationPreviews,noncanonical:true,translatedSentenceInvented:false}));
