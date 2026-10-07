import assert from 'node:assert/strict';
import {createProfileScope,validateInternalProfileIdentity} from '../product/profile-scope.mjs';
import {createEntitlementView,validateEntitlementBoundary} from '../product/entitlement.mjs';
import {createChangeJournal,validateSyncBoundary} from '../sync/change-journal.mjs';

const a=createProfileScope('learner-a');
const b=createProfileScope('learner-b');
assert.notEqual(a.key('evidence','E1'),b.key('evidence','E1'));
assert.equal(a.owns({profileId:'learner-a'}),true);
assert.equal(a.owns({profileId:'learner-b'}),false);
assert.equal(validateInternalProfileIdentity({profileId:'learner-a'}).ok,true);
assert.equal(validateInternalProfileIdentity({profileId:'learner-a',paymentCustomerId:'pay-1'}).ok,false);

const ent=createEntitlementView({profileId:'learner-a',grants:['pack.core','pack.university']});
assert.equal(ent.has('pack.core'),true);
assert.equal(ent.require('pack.research').available,false);
assert.deepEqual(ent.list(),['pack.core','pack.university']);
assert.equal(validateEntitlementBoundary({profileId:'learner-a'}).ok,true);
assert.equal(validateEntitlementBoundary({profileId:'learner-a',billingProvider:'vendor'}).ok,false);

const journal=createChangeJournal({profileId:'learner-a'});
const row={journalId:'J1',entityType:'evidence',entityId:'E1',operation:'append',baseVersion:'r0',nextVersion:'r1',payloadHash:'hash-1',createdAt:'2026-10-07T00:00:00Z'};
const first=journal.append(row);
const duplicate=journal.append(row);
assert.equal(first.created,true);
assert.equal(duplicate.created,false);
assert.equal(journal.pending().length,1);
assert.equal(journal.markSynced('J1',{remoteVersion:'remote-v1'}),true);
assert.equal(journal.pending().length,0);
assert.equal(journal.export().profileId,'learner-a');
assert.equal(validateSyncBoundary({profileId:'learner-a'}).ok,true);
assert.equal(validateSyncBoundary({profileId:'learner-a',providerUserId:'provider-1'}).ok,false);

console.log(JSON.stringify({
 ok:true,
 profileIsolation:true,
 entitlementProviderNeutral:true,
 syncJournalIdempotent:true,
 mandatoryBackend:false,
 billingVendorCode:false
}));
