import fs from 'node:fs';
import assert from 'node:assert/strict';
import {validateGroundedSceneCatalogV2} from '../content/scene-schema-v2.mjs';
import {selectNextGroundedScene} from '../adaptive/scene-selector.mjs';

const catalog=JSON.parse(fs.readFileSync(new URL('../content/fixtures/real-life-scenes.v1.json',import.meta.url),'utf8'));
const validation=validateGroundedSceneCatalogV2(catalog);
assert.equal(validation.ok,true,validation.errors.join('; '));
assert.equal(validation.sceneCount,15);
assert.deepEqual(validation.settings,['dorm','metro','room','shop','university']);
assert.equal(catalog.scenes.every(x=>x.status==='FIXTURE_NONCANONICAL_PENDING_RU03'),true);
assert.equal(catalog.scenes.every(x=>x.supportPolicy.translationDefault==='hidden'),true);

const caps={audio:true,visual:true};
const fresh=selectNextGroundedScene({scenes:catalog.scenes,capabilities:caps,desiredSetting:'shop'});
assert.equal(fresh.reason,'new-in-setting');
assert.equal(fresh.scene.setting,'shop');

const source=catalog.scenes.find(x=>x.transferGroup==='objects-basic');
const transfer=selectNextGroundedScene({
 scenes:catalog.scenes,
 completedSceneIds:[source.sceneId],
 recentObservations:[{sceneId:source.sceneId,success:true,supportLevel:0}],
 capabilities:caps
});
assert.equal(transfer.reason,'unseen-transfer');
assert.equal(transfer.scene.transferGroup,source.transferGroup);
assert.notEqual(transfer.scene.sceneId,source.sceneId);

const food=catalog.scenes.find(x=>x.setting==='shop'&&x.semanticTargets.includes('locate-object'));
const remediation=selectNextGroundedScene({
 scenes:catalog.scenes,
 completedSceneIds:[food.sceneId],
 recentObservations:[{sceneId:food.sceneId,success:false,supportLevel:0}],
 capabilities:caps
});
assert.equal(remediation.reason,'remediation');
assert(remediation.scene.semanticTargets.includes('locate-object'));

const highSupport=selectNextGroundedScene({
 scenes:catalog.scenes,
 recentObservations:[{sceneId:food.sceneId,success:true,supportLevel:6}],
 capabilities:caps
});
assert.equal(highSupport.reason,'remediation');

const none=selectNextGroundedScene({scenes:catalog.scenes,capabilities:{audio:true,visual:false}});
assert.equal(none.scene,null);
assert.equal(none.reason,'no-capability-compatible-scene');

console.log(JSON.stringify({
 ok:true,
 scenes:validation.sceneCount,
 settings:validation.settings.length,
 transfer:true,
 remediation:true,
 capabilityFailClosed:true,
 canonicalPromotion:false
}));
