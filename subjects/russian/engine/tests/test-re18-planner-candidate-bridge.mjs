import assert from 'node:assert/strict';
import {buildPlannerCandidates,validatePlannerCompatibility,EXISTING_PLANNER_REASONS} from '../integration/planner-candidate-bridge.mjs';

const owner={
 schema:'RUSSIAN_ADAPTIVE_PLANNER_V1',
 reasons:{
  DUE_REVIEW:'due_review',VOCAB_DUE:'vocabulary_due',WEAKNESS_REPAIR:'weakness_repair',
  SKILL_BALANCE:'skill_balance',CONTINUE_PATH:'continue_path',MANUAL_OVERRIDE:'manual_override'
 },
 buildPlan(){return {tasks:[]}},
 explain(){return {}}
};
assert.equal(validatePlannerCompatibility(owner).ok,true);

const experiences=[
 {experienceId:'EXP-A',label:'Nghe và làm',skill:'listening',route:{view:'media'},requiredCapabilities:['audio']},
 {experienceId:'EXP-T',label:'Transfer',skill:'interaction',route:{view:'dialogue'},transfer:true}
];
const snapshot={reviewDue:[{experienceId:'EXP-A',skill:'listening'},{experienceId:'EXP-A',skill:'listening'}]};
const candidates=buildPlannerCandidates({
 snapshot,
 recommendation:{kind:'remediate',dimension:'speaking'},
 experiences,
 capabilities:{audio:true},
 revision:'r2'
});
assert.equal(candidates.filter(x=>x.reason===EXISTING_PLANNER_REASONS.DUE_REVIEW).length,1);
assert.equal(candidates.some(x=>x.reason===EXISTING_PLANNER_REASONS.WEAKNESS_REPAIR),true);
assert.equal(new Set(candidates.map(x=>x.id)).size,candidates.length);

const again=buildPlannerCandidates({snapshot,recommendation:{kind:'remediate',dimension:'speaking'},experiences,capabilities:{audio:true},revision:'r2'});
assert.deepEqual(again,candidates);

const introduce=buildPlannerCandidates({
 snapshot:{reviewDue:[]},
 recommendation:{kind:'introduce',experienceId:'EXP-A'},
 experiences,capabilities:{audio:true},revision:'r2'
});
assert.equal(introduce.length,1);
assert.equal(introduce[0].reason,'continue_path');

const unavailable=buildPlannerCandidates({
 snapshot:{reviewDue:[]},
 recommendation:{kind:'introduce',experienceId:'EXP-A'},
 experiences,capabilities:{audio:false},revision:'r2'
});
assert.equal(unavailable.length,0);

const transfer=buildPlannerCandidates({
 snapshot:{reviewDue:[]},
 recommendation:{kind:'transfer'},
 experiences,capabilities:{audio:true},revision:'r2'
});
assert.equal(transfer.length,1);
assert.equal(transfer[0].reason,'skill_balance');

assert.equal(typeof owner.setManualOverride,'undefined');

console.log(JSON.stringify({
 ok:true,
 deterministic:true,
 duplicateCollapse:true,
 unavailableCapabilityFailsClosed:true,
 plannerAuthorityExternal:true,
 manualOverrideNotUsed:true
}));
