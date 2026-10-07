import assert from 'node:assert/strict';
import {createLiveOwnerIntegration} from '../integration/live-owner-integration.js';

let manualOverrideCalls=0;
const buildPlan=()=>({tasks:[]});
const explain=()=>({});
const planner={
  schema:'RUSSIAN_ADAPTIVE_PLANNER_V1',
  reasons:{
    DUE_REVIEW:'due_review',
    VOCAB_DUE:'vocabulary_due',
    WEAKNESS_REPAIR:'weakness_repair',
    SKILL_BALANCE:'skill_balance',
    CONTINUE_PATH:'continue_path',
    MANUAL_OVERRIDE:'manual_override'
  },
  buildPlan,
  explain,
  setManualOverride(){manualOverrideCalls++;}
};

const live=createLiveOwnerIntegration({RussianAdaptivePlanner:planner});
assert.equal(live.plannerStatus().ok,true);

const input={
  snapshot:{reviewDue:[{experienceId:'EXP-A',skill:'listening'},{experienceId:'EXP-A',skill:'listening'}]},
  recommendation:{kind:'introduce',experienceId:'EXP-B'},
  experiences:[
    {experienceId:'EXP-A',label:'Ôn nghe',skill:'listening',route:{view:'media'}},
    {experienceId:'EXP-B',label:'Tiếp tục',skill:'interaction',route:{view:'dialogue'},requiredCapabilities:['audio']}
  ],
  capabilities:{audio:true},
  revision:'r1'
};
const first=live.plannerCandidates(input);
const second=live.plannerCandidates(input);
assert.equal(first.ok,true);
assert.deepEqual(first,second);
assert.equal(new Set(first.candidates.map(x=>x.id)).size,first.candidates.length);
assert(first.candidates.every(x=>x.source==='russian-engine'));
assert.equal(manualOverrideCalls,0);
assert.equal(planner.buildPlan,buildPlan);
assert.equal(planner.explain,explain);

const incompatible=createLiveOwnerIntegration({RussianAdaptivePlanner:{schema:'WRONG'}});
const fail=incompatible.plannerCandidates(input);
assert.equal(fail.ok,false);
assert.deepEqual(fail.candidates,[]);
assert(fail.errors.length>0);

console.log(JSON.stringify({
  ok:true,
  livePlannerCompatible:true,
  deterministicCandidates:true,
  duplicateCollapse:true,
  plannerPatched:false,
  manualOverrideCalls
}));
