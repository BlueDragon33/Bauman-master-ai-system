import assert from 'node:assert/strict';
import {projectLearnerModel,deriveReviewCandidates} from '../learner/learner-projector.mjs';
import {buildAdaptiveRecommendation} from '../learner/adaptive-recommender.mjs';

const evidence=[
  {
    evidenceId:'E1',profileId:'A',experienceId:'X1',
    competencyIds:['COMP-RU-LISTEN'],
    observationType:'grounded-semantic-comprehension',
    result:{success:true,responseMs:900},
    supportLevel:0,observedAtMs:100
  },
  {
    evidenceId:'E2',profileId:'A',experienceId:'X2',
    competencyIds:['COMP-RU-LISTEN'],
    observationType:'grounded-semantic-comprehension',
    result:{success:false,responseMs:1500},
    supportLevel:1,observedAtMs:200
  },
  {
    evidenceId:'E3',profileId:'A',experienceId:'X3',
    competencyIds:['COMP-RU-SPEAK'],
    observationType:'asr-transcript-signal',
    result:{providerSignalAvailable:false,pronunciationEvaluated:false},
    provider:{infrastructureFailure:true},
    supportLevel:0,observedAtMs:300
  },
  {
    evidenceId:'E4',profileId:'A',experienceId:'X4',
    competencyIds:['COMP-RU-SPEAK'],
    observationType:'guided-answer',
    result:{success:true,responseMs:1800},
    supportLevel:7,observedAtMs:400
  },
  {
    evidenceId:'E5',profileId:'B',experienceId:'OTHER',
    competencyIds:['COMP-RU-LISTEN'],
    observationType:'grounded-semantic-comprehension',
    result:{success:true,responseMs:500},
    supportLevel:0,observedAtMs:500
  }
];

const review=deriveReviewCandidates({profileId:'A',evidence});
assert.equal(review.length,2);
assert(review.some(x=>x.sourceEvidenceId==='E2'&&x.reason==='observed-failure'));
assert(review.some(x=>x.sourceEvidenceId==='E4'&&x.reason==='high-support-dependency'));
assert(!review.some(x=>x.sourceEvidenceId==='E3'),'provider outage must not become review debt');

const learner=projectLearnerModel({
  profileId:'A',
  evidence,
  reviewItems:review,
  currentLevelId:'RL040'
});

assert.equal(learner.evidenceCount,4,'profile B evidence must be isolated');
assert.equal(learner.capabilities['COMP-RU-LISTEN'].observations,2);
assert.equal(learner.capabilities['COMP-RU-LISTEN'].independentSuccesses,1);
assert.equal(learner.capabilities['COMP-RU-LISTEN'].failures,1);
assert.equal(learner.capabilities['COMP-RU-SPEAK'].observations,2);
assert.equal(learner.supportDependency.highSupportEvidence,1);
assert.equal(learner.supportDependency.independentEvidence,2);

const remediation=buildAdaptiveRecommendation({
  learner,
  level:{
    id:'RL040',
    targetCompetencies:['COMP-RU-LISTEN','COMP-RU-SPEAK'],
    progression:{transferGate:true}
  },
  reviewCandidates:review,
  availableExperienceRefs:[{id:'scene-repair'}]
});
assert.equal(remediation.action,'remediate');
assert.equal(remediation.masteryMutation,false);

const cleanEvidence=[
  {evidenceId:'C1',profileId:'A',experienceId:'1',competencyIds:['COMP-RU-LISTEN'],observationType:'x',result:{success:true},supportLevel:0},
  {evidenceId:'C2',profileId:'A',experienceId:'2',competencyIds:['COMP-RU-LISTEN'],observationType:'x',result:{success:true},supportLevel:0},
  {evidenceId:'C3',profileId:'A',experienceId:'3',competencyIds:['COMP-RU-SPEAK'],observationType:'x',result:{success:true},supportLevel:1},
  {evidenceId:'C4',profileId:'A',experienceId:'4',competencyIds:['COMP-RU-SPEAK'],observationType:'x',result:{success:true},supportLevel:1}
];
const cleanLearner=projectLearnerModel({profileId:'A',evidence:cleanEvidence,currentLevelId:'RL040'});
const transfer=buildAdaptiveRecommendation({
  learner:cleanLearner,
  level:{id:'RL040',targetCompetencies:['COMP-RU-LISTEN','COMP-RU-SPEAK'],progression:{transferGate:true}},
  reviewCandidates:[],
  availableExperienceRefs:[{id:'unseen-transfer-scene'}]
});
assert.equal(transfer.action,'transfer-probe');
assert.equal(transfer.reason,'milestone-transfer-evidence-needed');
assert.equal(transfer.masteryMutation,false);

const diagnostic=buildAdaptiveRecommendation({
  learner:cleanLearner,
  level:null,
  reviewCandidates:[],
  availableExperienceRefs:[]
});
assert.equal(diagnostic.action,'diagnostic-probe');

console.log(JSON.stringify({
  ok:true,
  profileIsolation:true,
  providerFailureCreatesReviewDebt:false,
  adaptiveActions:['remediate','transfer-probe','diagnostic-probe'],
  masteryMutation:false
}));
