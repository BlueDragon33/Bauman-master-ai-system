import assert from 'node:assert/strict';
import {evaluatePhase3Rc,requestRolloutTransition,PHASE3_REQUIRED} from '../quality/phase3-rc-gate.mjs';

const packages=Object.fromEntries(PHASE3_REQUIRED.packages.map(x=>[x,'PASS']));
const workflows=Object.fromEntries(PHASE3_REQUIRED.workflows.map(x=>[x,'PASS']));
const browser=Object.fromEntries(PHASE3_REQUIRED.browser.map(x=>[x,'PASS']));

const rc=evaluatePhase3Rc({
 packages,
 workflows:{...workflows,futureInterface:'NOT_REQUIRED'},
 browser,
 scopeProof:{futureInterface:'No UI or browser-loaded runtime changed in Phase 3.'},
 rollout:{state:'OPT_IN_FLAG',productAuthorization:false,releaseAnnexPass:false}
});
assert.equal(rc.ok,true);
assert.equal(rc.rcReady,true);
assert.equal(rc.productionClaim,false);
assert.equal(rc.defaultOnClaim,false);

const missingScopeProof=evaluatePhase3Rc({
 packages,
 workflows:{...workflows,futureInterface:'NOT_REQUIRED'},
 browser,
 rollout:{state:'OPT_IN_FLAG'}
});
assert.equal(missingScopeProof.ok,false);
assert(missingScopeProof.errors.some(x=>x.includes('futureInterface')));

const missing=evaluatePhase3Rc({
 packages:{...packages,RE17:'FAIL'},workflows,browser,
 rollout:{state:'OPT_IN_FLAG'}
});
assert.equal(missing.ok,false);
assert(missing.errors.some(x=>x.includes('RE17')));

const noAuth=evaluatePhase3Rc({
 packages,workflows,browser,
 rollout:{state:'INTERNAL_BETA',productAuthorization:false}
});
assert.equal(noAuth.ok,false);
assert(noAuth.errors.some(x=>x.includes('product authorization')));

assert.deepEqual(
 requestRolloutTransition({from:'OFF',to:'OPT_IN_FLAG'}),
 {allowed:true,from:'OFF',to:'OPT_IN_FLAG',reason:'authorized-transition'}
);
assert.equal(requestRolloutTransition({from:'OPT_IN_FLAG',to:'INTERNAL_BETA'}).allowed,false);
assert.equal(requestRolloutTransition({from:'OPT_IN_FLAG',to:'INTERNAL_BETA',productAuthorization:true}).allowed,true);
assert.throws(()=>requestRolloutTransition({from:'OFF',to:'DEFAULT_ON_CANDIDATE',productAuthorization:true}),/one step/);
assert.equal(requestRolloutTransition({
 from:'DEFAULT_ON_CANDIDATE',to:'DEFAULT_ON',productAuthorization:true,releaseAnnexPass:false
}).allowed,false);
assert.equal(requestRolloutTransition({
 from:'DEFAULT_ON_CANDIDATE',to:'DEFAULT_ON',productAuthorization:true,releaseAnnexPass:true
}).allowed,true);
assert.equal(requestRolloutTransition({from:'INTERNAL_BETA',to:'OPT_IN_FLAG'}).reason,'rollback');

console.log(JSON.stringify({
 ok:true,
 rcReadyAtOptIn:true,
 productAuthorizationRequiredBeyondOptIn:true,
 releaseAnnexRequiredForDefaultOn:true,
 rollbackAlwaysAvailable:true,
 productionClaim:false
}));
