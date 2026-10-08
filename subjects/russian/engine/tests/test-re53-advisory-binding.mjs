import assert from 'node:assert/strict';
import {buildRe48Candidate} from '../review/re48-linguistic-redteam.mjs';
import {buildRe49Advisory,buildRe49ReviewInventory} from '../review/re49-review-packets-r4.mjs';
import {fingerprint} from '../review/re45-review-core.mjs';

const candidate=buildRe48Candidate();
const advisory=buildRe49Advisory({candidate});
const inventory=buildRe49ReviewInventory({candidate,advisory});
assert.equal(inventory.itemCount,43);
assert.equal(inventory.canonicalPublicationReady,false);

const stale=structuredClone(advisory);
stale.sourceCandidate.candidateFingerprint='a'.repeat(64);
assert.throws(()=>buildRe49ReviewInventory({candidate,advisory:stale}),/source candidate fingerprint mismatch/);

const differentRevision=structuredClone(advisory);
differentRevision.sourceCandidate.dialogueRevision='obsolete-r3';
assert.throws(()=>buildRe49ReviewInventory({candidate,advisory:differentRevision}),/source candidate fingerprint mismatch/);

const wrongRussian=structuredClone(advisory);
wrongRussian.dialogues['repair-dorm-shower'].turns.reply.acceptedDraft='Душевая слева.';
assert.throws(()=>buildRe49ReviewInventory({candidate,advisory:wrongRussian}),/accepted draft does not match candidate text/);

const wrongNotebook=structuredClone(advisory);
wrongNotebook.spatial['rl-15-university'].acceptedDraft='Дай тетрадь.';
assert.throws(()=>buildRe49ReviewInventory({candidate,advisory:wrongNotebook}),/accepted draft does not match candidate text/);

const regenerated=buildRe49ReviewInventory({candidate,advisory:buildRe49Advisory({candidate})});
assert.equal(fingerprint(regenerated.items.map(x=>x.reviewFingerprint)),fingerprint(inventory.items.map(x=>x.reviewFingerprint)));
console.log(JSON.stringify({ok:true,items:43,staleAdvisoryBlocked:true,crossRevisionBlocked:true,wrongRussianAdvisoryBlocked:true,wrongNotebookAdvisoryBlocked:true,productionPromotion:false}));
