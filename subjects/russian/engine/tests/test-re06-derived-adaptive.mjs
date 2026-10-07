import assert from 'node:assert/strict';
import {SCHEMAS} from '../public/contracts.mjs';
import {deriveLearnerSnapshot,explainWeakDimensions} from '../learner/derived-model.mjs';
import {recommendNextAction} from '../adaptive/next-action.mjs';

const evidence=[
 {schemaVersion:SCHEMAS.evidence,evidenceId:'E1',attemptId:'A1',experienceId:'X1',competencyIds:['COMP-RU-LISTEN'],observationType:'grounded-semantic-comprehension',result:{success:true},provider:{kind:'deterministic'},supportLevel:0,authoritative:false},
 {schemaVersion:SCHEMAS.evidence,evidenceId:'E2',attemptId:'A2',experienceId:'X2',competencyIds:['COMP-RU-LISTEN'],observationType:'grounded-semantic-comprehension',result:{success:true},provider:{kind:'deterministic'},supportLevel:6,authoritative:false},
 {schemaVersion:SCHEMAS.evidence,evidenceId:'E3',attemptId:'A3',experienceId:'X3',competencyIds:['COMP-RU-SPEAK'],observationType:'speech-recognition-observation',result:{recognized:false},provider:{kind:'browser-asr'},supportLevel:2,authoritative:false}
];

const snapshot=deriveLearnerSnapshot({profileId:'p1',evidence,reviewDue:[],internalLevel:12});
assert.equal(snapshot.profileId,'p1');
assert.equal(snapshot.progression.internalLevel,12);
assert(snapshot.capabilities.semanticComprehension.estimate>snapshot.capabilities.speakingSignal.estimate);
assert(snapshot.capabilities.semanticComprehension.supportDependency>0);
assert.equal(snapshot.capabilities.speakingSignal.successRate,0);

const weak=explainWeakDimensions(snapshot,{threshold:.7});
assert.equal(weak[0].dimension,'speakingSignal');

const remediation=recommendNextAction({snapshot,availableExperiences:[{experienceId:'NEXT'}]});
assert.equal(remediation.kind,'remediate');
assert.equal(remediation.dimension,'speakingSignal');

const reviewSnapshot={...snapshot,reviewDue:[{id:'R1'}]};
assert.equal(recommendNextAction({snapshot:reviewSnapshot}).kind,'review');

const strong={...snapshot,capabilities:{listening:{estimate:.9,evidenceCount:5,supportDependency:.1}}};
assert.equal(recommendNextAction({snapshot:strong,milestone:true}).kind,'transfer');

const introduce=recommendNextAction({snapshot:strong,availableExperiences:[{experienceId:'NEXT'}]});
assert.equal(introduce.kind,'introduce');
assert.equal(introduce.experienceId,'NEXT');

assert.equal(Object.hasOwn(snapshot,'mastery'),false);

console.log(JSON.stringify({
 ok:true,
 dimensions:Object.keys(snapshot.capabilities),
 weakest:weak[0].dimension,
 masteryWritten:false
}));
