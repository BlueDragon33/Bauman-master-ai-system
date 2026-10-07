import assert from 'node:assert/strict';
import {createLiveOwnerIntegration} from '../integration/live-owner-integration.js';

function makeOwner(){
  const attempts=new Map(),evidence=new Map();
  return {
    schema:'RUSSIAN_ASSESSMENT_MASTERY_STATE_V1',
    masteryWrites:0,
    stageGateWrites:0,
    attempts,evidence,
    recordAssessmentAttempt(row){
      if(attempts.has(row.attemptId))return {created:false,attempt:attempts.get(row.attemptId)};
      attempts.set(row.attemptId,structuredClone(row));
      return {created:true,attempt:structuredClone(row)};
    },
    recordEvidence(row){
      if(row.authoritative===true)this.masteryWrites++;
      if(evidence.has(row.evidenceId))return {created:false,evidence:evidence.get(row.evidenceId)};
      evidence.set(row.evidenceId,structuredClone(row));
      return {created:true,evidence:structuredClone(row)};
    },
    recordStageGate(){this.stageGateWrites++;throw new Error('must not be called');}
  };
}

const owner=makeOwner();
const fakeWindow={RussianAssessmentMastery:owner};
const live=createLiveOwnerIntegration(fakeWindow);
const observation={
  schemaVersion:'RUSSIAN_ENGINE_BROWSER_OBSERVATION_V1',
  evidenceId:'E-1',
  attemptId:'A-1',
  experienceId:'EXP-1',
  competencyIds:['RU-COMP-SEMANTIC-GROUNDING'],
  observationType:'grounded-semantic-comprehension',
  result:{success:true,selectedObjectId:'ball'},
  supportLevel:0,
  authoritative:false,
  masteryMutation:false
};

const first=live.applyObservation({observation,contentRevision:'re02-fixture-r1',mode:'practice'});
assert.equal(first.ok,true);
assert.equal(first.applied,true);
assert.equal(first.evidenceCount,1);
assert.equal(owner.attempts.size,1);
assert.equal(owner.evidence.size,1);
assert.equal([...owner.evidence.values()][0].authoritative,false);
assert.equal(owner.masteryWrites,0);
assert.equal(owner.stageGateWrites,0);

const duplicate=live.applyObservation({observation,contentRevision:'re02-fixture-r1',mode:'practice'});
assert.equal(duplicate.ok,true);
assert.equal(duplicate.duplicate,true);
assert.equal(owner.attempts.size,1);
assert.equal(owner.evidence.size,1);

const missing=createLiveOwnerIntegration({});
const soft=missing.applyObservation({observation});
assert.equal(soft.ok,false);
assert.equal(soft.reason,'ru04-owner-unavailable');
assert.equal(missing.status().ownerUnavailable,1);

const forbidden=createLiveOwnerIntegration({RussianAssessmentMastery:owner});
const bad=forbidden.applyObservation({observation:{...observation,evidenceId:'E-2',attemptId:'A-2',authoritative:true}});
assert.equal(bad.ok,false);
assert.equal(owner.masteryWrites,0);

console.log(JSON.stringify({
  ok:true,
  liveRu04Write:true,
  nonAuthoritativeOnly:true,
  duplicateSafe:true,
  stageGateWrite:false,
  missingOwnerFailsSoft:true,
  masteryWrites:owner.masteryWrites
}));
