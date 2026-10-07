import fs from 'node:fs';
import assert from 'node:assert/strict';
import {compileContentPack,createPackRegistry} from '../authoring/pack-compiler.mjs';

const base=JSON.parse(fs.readFileSync(new URL('../content/fixtures/content-pack.v1.json',import.meta.url),'utf8'));
const knownCompetencies=['COMP-RU-LISTEN','COMP-RU-INTERACT'];
const knownRefs=['FIXTURE:DAI-MYACH'];

const m1=compileContentPack(base,{knownCompetencies,knownRefs});
assert.equal(m1.packId,'fixture-core-grounded');
assert.equal(m1.revision,'r1');
assert.equal(m1.itemCount,1);
assert.equal(m1.commercialEligible,false);
assert.match(m1.contentHash,/^fnv1a32-/);

const r2=structuredClone(base);
r2.revision='r2';
r2.items[0].semanticTargets=['SEM-REQUEST-OBJECT','SEM-ACTION-CONSEQUENCE'];
const m2=compileContentPack(r2,{knownCompetencies,knownRefs});
assert.notEqual(m1.contentHash,m2.contentHash);

const registry=createPackRegistry();
assert.equal(registry.install(m1).installed,true);
assert.equal(registry.install(m1).installed,false);
assert.equal(registry.install(m2).installed,true);
assert.deepEqual(registry.revisions(base.packId),['r1','r2']);

registry.activate(base.packId,'r2');
assert.equal(registry.getActive(base.packId).revision,'r2');
registry.rollback(base.packId,'r1');
assert.equal(registry.getActive(base.packId).revision,'r1');
assert(registry.events().some(x=>x.type==='rollback'));

const conflict={...m1,contentHash:'fnv1a32-deadbeef'};
assert.throws(()=>registry.install(conflict),/hash conflict/);
assert.equal(registry.get(base.packId,'r2').contentHash,m2.contentHash);

const commercial=structuredClone(base);
commercial.packId='commercial-test';
commercial.revision='r1';
commercial.commercial=true;
commercial.items[0].provenance.status='RU03_APPROVED';
commercial.items[0].media[0].commercialUseAllowed=true;
const cm=compileContentPack(commercial,{knownCompetencies,knownRefs});
assert.equal(cm.commercialEligible,true);

const untrusted=structuredClone(commercial);
untrusted.packId='commercial-untrusted';
untrusted.items[0].provenance.status='GENERATED_UNREVIEWED';
const um=compileContentPack(untrusted,{knownCompetencies,knownRefs});
assert.equal(um.commercialEligible,false);

console.log(JSON.stringify({
 ok:true,
 immutableManifest:true,
 multipleRevisions:true,
 deterministicRollback:true,
 revisionHashConflictBlocked:true,
 commercialEligibilityTruthful:true,
 uiCodeRequired:false
}));
