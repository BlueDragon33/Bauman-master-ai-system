import assert from 'node:assert/strict';
import {runBaumanRe66Offline} from '../review/re66-bauman-rue-cli.mjs';
const head='9d7340e3994d659a5a3941f0bb426e9443b21001';
const fake=(status)=>(_cmd,args)=>{
 assert.equal(_cmd,'git');
 if(args[0]==='rev-parse')return head+'\n';
 if(args[0]==='status')return status;
 throw Error('unexpected Git op');
};
assert.throws(()=>runBaumanRe66Offline({
 expectedHead:'0'.repeat(40),git:fake('')
}),/HEAD mismatch/);
assert.throws(()=>runBaumanRe66Offline({
 expectedHead:head,git:fake('?? tests/unsigned-test.mjs\n')
}),/uncommitted or untracked/);
assert.throws(()=>runBaumanRe66Offline({
 expectedHead:head,git:fake(' M subjects/russian/engine/review/re61-r02-r04-source-review-handoff.mjs\n')
}),/uncommitted or untracked/);
console.log('RUSSIAN_RE66_EXACT_SHA_CLEAN_GATE_TEST_PASS',JSON.stringify({
 negativeCases:3,changedWorkingTreeRejected:true,
 realBaumanCheckoutNotAvailable:true,
 humanRu03Approved:false
}));
