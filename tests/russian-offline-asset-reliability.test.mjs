import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  validateContract,
  validateInventory,
  validateServiceWorker,
  validateRuntime,
  validateRuntimeBehavior,
  validateMediaAndVisual,
  validateNetworkVisualEnrichment,
  validateAssetBehavior
} from '../scripts/validate-russian-offline-asset-reliability.mjs';

const root='subjects/russian';
const c=JSON.parse(fs.readFileSync(root+'/contracts/offline-asset-reliability-contract.v1.json','utf8'));
const html=fs.readFileSync(root+'/index.html','utf8');
const sw=fs.readFileSync(root+'/sw.js','utf8');
const runtime=fs.readFileSync(root+'/assets/runtime-optimizer.js','utf8');
const core=fs.readFileSync(root+'/assets/core.js','utf8');
const asset=fs.readFileSync(root+'/assets/asset-reliability.js','utf8');
const css=fs.readFileSync(root+'/assets/asset-reliability.css','utf8');
const visualRuntime=fs.readFileSync(root+'/assets/visual-vocabulary-runtime.js','utf8');
const copy=()=>structuredClone(c);

assert.equal(validateContract(copy()),true);
assert.equal(validateInventory(html,sw,runtime,c),true);
assert.equal(validateServiceWorker(sw,c),true);
assert.equal(validateRuntime(runtime),true);
assert.equal(await validateRuntimeBehavior(runtime),true);
assert.equal(validateMediaAndVisual(core,asset,css),true);
assert.equal(validateNetworkVisualEnrichment(visualRuntime),true);
assert.equal(validateAssetBehavior(asset),true);

{const x=copy();x.readiness.falseReadyForbidden=false;assert.throws(()=>validateContract(x),/False offline-ready/)}
{const x=copy();x.requiredData=x.requiredData.filter(v=>v!=='reading-bridge');assert.throws(()=>validateContract(x),/17 sources|reading-bridge/)}
assert.throws(()=>validateInventory(html,sw.replace("'./assets/weakness-repair-router.js',\n",''),runtime,c),/shell does not exactly match/);
assert.throws(()=>validateServiceWorker(sw.replace("if(req.mode==='navigate')","if(true)"),c),/navigation-only/);
assert.throws(()=>validateRuntime(runtime.replace("const ready=verified&&dataReady&&shellReady","const ready=dataReady&&shellReady")),/cache verification/);
assert.throws(()=>validateMediaAndVisual(core.replace("networkOnly&&navigator.onLine===false","false"),asset,css),/Offline external-media branch missing/);
assert.throws(()=>validateMediaAndVisual(core,asset+"\nconst meaningVi='fallback';",css),/translation field/);
assert.throws(()=>validateNetworkVisualEnrichment(visualRuntime.replace("navigator.onLine!==false","true")),/offline guard/);
assert.throws(()=>validateAssetBehavior(asset.replace("const FALLBACK='missing_visual_asset'","const FALLBACK='broken'")),/missing_visual_asset/);

console.log('RUSSIAN_OFFLINE_ASSET_RELIABILITY_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:9},null,2));
