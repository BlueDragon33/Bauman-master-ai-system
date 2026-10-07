import assert from 'node:assert/strict';
import {buildRu04EvidenceBundle,applyRu04EvidenceBundle} from '../integration/ru04-evidence-bridge.mjs';

function mockOwner(){
  const attempts=new Map(),evidence=new Map(),firstByAssessment=new Map();
  return {
    state:{attempts,evidence,firstByAssessment,masteryWrites:0},
    recordAssessmentAttempt(input){
      if(attempts.has(input.attemptId))return {created:false,attempt:attempts.get(input.attemptId)};
      const first=!firstByAssessment.has(input.assessmentId);
      const row={...input,firstAttempt:first};
      attempts.set(input.attemptId,row);
      if(first)firstByAssessment.set(input.assessmentId,input.attemptId);
      return {created:true,attempt:row};
    },
    recordEvidence(input){
      if(input.authoritative===true)this.state.masteryWrites++;
      if(evidence.has(input.evidenceId))return {created:false,evidence:evidence.get(input.evidenceId)};
      evidence.set(input.evidenceId,{...input});
      return {created:true,evidence:input};
    }
  };
}

const observation={
 evidenceId:'ENG-E1',
 attemptId:'ATT-1',
 experienceId:'EXP-1',
 competencyIds:['COMP-RU-LISTEN','COMP-RU-INTERACT'],
 observationType:'grounded-semantic-comprehension',
 result:{success:true,selectedObjectId:'ball'},
 provider:{kind:'deterministic',infrastructureFailure:false},
 supportLevel:0,
 authoritative:false
};

const bundle=buildRu04EvidenceBundle({observation,contentRevision:'r1',mode:'practice'});
assert.equal(bundle.masteryMutation,false);
assert.equal(bundle.attemptCandidate.assessmentId,'ENGINE::EXP-1');
assert.equal(bundle.attemptCandidate.mode,'practice');
assert.equal(bundle.evidenceCandidates.length,2);
assert(bundle.evidenceCandidates.every(x=>x.authoritative===false));
assert.equal(new Set(bundle.evidenceCandidates.map(x=>x.evidenceId)).size,2);

const owner=mockOwner();
const first=applyRu04EvidenceBundle(owner,bundle);
assert.equal(first.attemptResult.created,true);
assert.equal(first.evidenceResults.every(x=>x.created),true);

const duplicate=applyRu04EvidenceBundle(owner,bundle);
assert.equal(duplicate.attemptResult.created,false);
assert.equal(duplicate.evidenceResults.every(x=>x.created===false),true);
assert.equal(owner.state.masteryWrites,0);
assert.equal(owner.state.firstByAssessment.get('ENGINE::EXP-1'),'ATT-1');

const retryObs={...observation,evidenceId:'ENG-E2',attemptId:'ATT-2',result:{success:false,selectedObjectId:'book'}};
const retryBundle=buildRu04EvidenceBundle({observation:retryObs,contentRevision:'r1',mode:'practice',rootAttemptId:'ATT-1'});
const retry=applyRu04EvidenceBundle(owner,retryBundle);
assert.equal(retry.attemptResult.created,true);
assert.equal(retry.attemptResult.attempt.firstAttempt,false);
assert.equal(owner.state.firstByAssessment.get('ENGINE::EXP-1'),'ATT-1');
assert.equal(retryBundle.attemptCandidate.evaluation.rootAttemptId,'ATT-1');

const infraObs={...observation,evidenceId:'ENG-E3',attemptId:'ATT-3',provider:{infrastructureFailure:true},result:{success:false}};
const infra=buildRu04EvidenceBundle({observation:infraObs,mode:'assessment'});
assert.equal(infra.attemptCandidate.mode,'assessment');
assert.equal(infra.evidenceCandidates[0].evidenceType,'infrastructure-observation');
assert.equal(infra.evidenceCandidates[0].result.learnerImpact,false);

assert.throws(()=>buildRu04EvidenceBundle({observation:{...observation,authoritative:true}}),/authoritative/);

console.log(JSON.stringify({
 ok:true,
 idempotent:true,
 firstAttemptImmutable:true,
 retryAppendOnly:true,
 practiceAssessmentSeparated:true,
 infrastructureNotLearnerFailure:true,
 masteryWrites:owner.state.masteryWrites
}));
