import fs from 'node:fs';
import assert from 'node:assert/strict';
import {validateContentPack,buildPackManifest} from '../authoring/content-pack-validator.mjs';

const pack=JSON.parse(fs.readFileSync(new URL('../content/fixtures/content-pack.v1.json',import.meta.url),'utf8'));
const knownCompetencies=['COMP-RU-LISTEN','COMP-RU-INTERACT'];
const knownRefs=['FIXTURE:DAI-MYACH'];

const valid=validateContentPack(pack,{knownCompetencies,knownRefs});
assert.equal(valid.ok,true,valid.errors.join('; '));
assert.equal(valid.itemCount,1);

const manifest=buildPackManifest(pack);
assert.equal(manifest.packId,'fixture-core-grounded');
assert.equal(manifest.itemCount,1);
assert.deepEqual(manifest.competencies,['COMP-RU-INTERACT','COMP-RU-LISTEN']);

const badTranslation=structuredClone(pack);
badTranslation.items[0].translationPolicy.defaultVisible=true;
assert.equal(validateContentPack(badTranslation,{knownCompetencies,knownRefs}).ok,false);

const badGenerated=structuredClone(pack);
badGenerated.items[0].provenance.status='GENERATED_UNREVIEWED';
badGenerated.items[0].canonical=true;
assert.equal(validateContentPack(badGenerated,{knownCompetencies,knownRefs}).ok,false);

const badCommercial=structuredClone(pack);
badCommercial.commercial=true;
badCommercial.items[0].media[0].commercialUseAllowed=false;
const commercialCheck=validateContentPack(badCommercial,{knownCompetencies,knownRefs});
assert.equal(commercialCheck.ok,false);
assert(commercialCheck.errors.some(x=>x.includes('commercial-use permission')));

const badRef=structuredClone(pack);
badRef.items[0].linguisticRefs=['UNKNOWN'];
assert.equal(validateContentPack(badRef,{knownCompetencies,knownRefs}).ok,false);

console.log(JSON.stringify({
 ok:true,
 translationLeakBlocked:true,
 unreviewedCanonicalBlocked:true,
 commercialRightsRequired:true,
 unknownRefsBlocked:true,
 featureCodeRequiredForNewPack:false
}));
