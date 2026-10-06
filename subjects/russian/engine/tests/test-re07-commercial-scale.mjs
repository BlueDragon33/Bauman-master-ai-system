import assert from 'node:assert/strict';
import {createProfileScope,validateInternalProfileIdentity} from '../product/profile-scope.mjs';
import {createEntitlementPort} from '../product/entitlement-port.mjs';
import {createChangeJournal,validateSyncBoundary} from '../sync/change-journal.mjs';

const a=createProfileScope('A');
const b=createProfileScope('B');
assert.notEqual(a.key('evidence','E1'),b.key('evidence','E1'));
assert.equal(a.owns({profileId:'A'}),true);
assert.equal(a.owns({profileId:'B'}),false);
assert.throws(()=>a.assertOwn({profileId:'B'}),/isolation/);

assert.equal(validateInternalProfileIdentity({profileId:'A'}).ok,true);
assert.equal(validateInternalProfileIdentity({profileId:'A',paymentCustomerId:'stripe-123'}).ok,false);

const entitlements={
 A:{packs:['core-foundation','university-life'],capabilities:['speech.local']},
 B:{packs:['core-foundation'],capabilities:[]}
};
const port=createEntitlementPort({
 isAvailable:async({profileId,id})=>[...(entitlements[profileId]?.packs||[]),...(entitlements[profileId]?.capabilities||[])].includes(id),
 snapshot:async profileId=>({...entitlements[profileId],source:'test-platform-adapter'})
});
assert.equal(await port.isAvailable({profileId:'A',id:'university-life'}),true);
assert.equal(await port.isAvailable({profileId:'B',id:'university-life'}),false);
assert.deepEqual((await port.snapshot('A')).packs,['core-foundation','university-life']);

const journalA=createChangeJournal({profileId:'A'});
const first=journalA.append({
 journalId:'J1',entityType:'learner-evidence',entityId:'E1',operation:'append',
 baseVersion:'1',nextVersion:'2',payloadHash:'abc',createdAt:'2026-10-07T00:00:00Z'
});
assert.equal(first.created,true);
assert.equal(journalA.pending().length,1);
const duplicate=journalA.append({
 journalId:'J1',entityType:'learner-evidence',entityId:'E1',operation:'append',
 baseVersion:'1',nextVersion:'2',payloadHash:'abc',createdAt:'2026-10-07T00:00:00Z'
});
assert.equal(duplicate.created,false,'idempotent duplicate must not duplicate evidence');
assert.equal(journalA.markConflict('J1',{remoteVersion:'3'}),true);
assert.equal(journalA.pending().length,0);
assert.equal(journalA.export().records[0].syncState,'CONFLICT');

const journalB=createChangeJournal({profileId:'B'});
journalB.append({journalId:'J1',entityType:'learner-evidence',entityId:'E1',operation:'append'});
assert.equal(journalB.export().profileId,'B');
assert.equal(journalA.export().profileId,'A');

assert.equal(validateSyncBoundary({profileId:'A'}).ok,true);
assert.equal(validateSyncBoundary({profileId:'A',providerUserId:'google-abc'}).ok,false);

console.log(JSON.stringify({
 ok:true,
 profileIsolation:true,
 entitlementProviderIndependent:true,
 idempotentJournal:true,
 conflictDetection:true,
 billingInsideEngine:false,
 mandatoryBackend:false
}));
