import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  validateContract,
  validatePlan,
  validateCompatibility,
  validateLearnerRuntime,
  validateNoDestructiveReset
} from '../scripts/validate-russian-migration-freeze.mjs';

const read=p=>fs.readFileSync(p,'utf8');
const contract=JSON.parse(read('subjects/russian/contracts/migration-freeze-contract.v1.json'));
const bundle={
  core:read('subjects/russian/assets/core.js'),
  adapter:read('subjects/russian/assets/subject-adapter.js'),
  hostBridge:read('subjects/shared/host-bridge.js'),
  manifest:read('subjects/russian/subject-manifest.json'),
  cleanup:read('subjects/russian/assets/ui-cleanup-contract.js'),
  contentContract:read('subjects/russian/assets/content-contract.js'),
  srs:read('subjects/russian/assets/vocab-srs.js'),
  visual:read('subjects/russian/assets/visual-vocabulary-runtime.js'),
  dialogue:read('subjects/russian/assets/dialogue-scaffold.js'),
  aiDirect:read('subjects/russian/assets/ai-direct-explanation.js'),
  aiGuard:read('subjects/russian/assets/ai-mentor-guard.js'),
  cursive:read('subjects/russian/assets/cursive-glyphs.js'),
  repair:read('subjects/russian/assets/weakness-repair-router.js'),
  skillGate:read('subjects/russian/assets/skill-gated-assessment.js'),
  runtime:read('subjects/russian/assets/runtime-optimizer.js'),
  capability:read('subjects/russian/assets/browser-capabilities.js'),
  index:read('subjects/russian/index.html')
};
const plan=read('subjects/russian/RUSSIAN_DEVELOPMENT_PLAN.md');
const copy=()=>structuredClone(contract);

assert.equal(validateContract(copy()),true);
assert.equal(validatePlan(plan),true);
assert.equal(validateCompatibility(bundle),true);
assert.equal(validateLearnerRuntime(bundle),true);
assert.equal(validateNoDestructiveReset({core:bundle.core,repair:bundle.repair}),true);

{const x=copy();x.promotion.mergeToMainAutomatic=true;assert.throws(()=>validateContract(x),/Promotion safety weakened/)}
{const x=copy();x.compatibility.legacySavedStateFieldsMayExecuteTranslationUI=true;assert.throws(()=>validateContract(x),/Legacy translation state regained/)}
{const x=copy();x.runtimeFreeze.learnerFacingExportFilenamesVersionFree=false;assert.throws(()=>validateContract(x),/Learner export\/version compatibility boundary/)}
{const x=copy();x.runtimeFreeze.translationFreeVocabularySearchFrozen=false;assert.throws(()=>validateContract(x),/Vocabulary search\/SRS semantic freeze/)}
assert.throws(()=>validateLearnerRuntime({...bundle,contentContract:bundle.contentContract.replace('v.meaningRu,v.example','v.meaningVi,v.english,v.meaningRu,v.example')}),/Vocabulary search regained translation fields/);
assert.throws(()=>validateLearnerRuntime({...bundle,srs:bundle.srs.replace("title:russian(item.title_ru||item.context_title_ru)||clean(item.id||item.source_id||'')","title:clean(item.context_title_vi||item.title_ru||item.id)")}),/Vietnamese title fallback/);
assert.throws(()=>validateCompatibility({...bundle,core:bundle.core.replace("exportJson('russian_route_plan.json'","exportJson('russian_route_plan_v99.json'")}),/export filenames must be version-free|Versioned learner export filename/);
assert.throws(()=>validatePlan(plan.replace('| 23 | Browser/package/accessibility/performance QA | GREEN |','| 23 | Browser/package/accessibility/performance QA | ACTIVE |')),/Turn 23 is not GREEN/);
assert.throws(()=>validateCompatibility({...bundle,core:bundle.core+"\nfunction toggleActiveHideVi(){}"}),/Dead translation toggle/);
assert.throws(()=>validateCompatibility({...bundle,hostBridge:bundle.hostBridge.replace(/BAUMAN_SUBJECT_BRIDGE_V1/g,'BAUMAN_SUBJECT_BRIDGE_V2')}),/BAUMAN_SUBJECT_BRIDGE_V1/);
assert.throws(()=>validateCompatibility({...bundle,manifest:bundle.manifest.replace('"title": "Tiếng Nga Bauman"','"title": "Tiếng Nga Bauman V99"')}),/Manifest display title/);
assert.throws(()=>validateLearnerRuntime({...bundle,visual:bundle.visual+"\nconst meaning_vi='legacy';"}),/translation field/);
assert.throws(()=>validateLearnerRuntime({...bundle,core:bundle.core.replace("dialogueTitle:dialogueDirectTitle(dialogue)||''","dialogueTitle:dialogue?.context_title_vi||dialogueDirectTitle(dialogue)||''")}),/AI context regained translation semantic field/);
assert.throws(()=>validateLearnerRuntime({...bundle,core:bundle.core.replace("unit?.unit_title_ru","unit?.unit_title_vi||unit?.unit_title_ru")}),/Learner dialogue surface regained translation path/);
assert.throws(()=>validateLearnerRuntime({...bundle,core:bundle.core.replace("unit.scenario_ru||''","unit.scenario_ru||unit.domain||''")}),/generic-language domain fallback/);
assert.throws(()=>validateLearnerRuntime({...bundle,core:bundle.core.replace("u.scenario_ru||''","u.domain||''")}),/generic-language metadata fallback/);
assert.throws(()=>validateLearnerRuntime({...bundle,index:bundle.index.replace('<script src="assets/cursive-glyphs.js"></script>','').replace('<script src="assets/cyrillic-literacy.js"></script>','<script src="assets/cyrillic-literacy.js"></script>\n<script src="assets/cursive-glyphs.js"></script>')}),/load order invalid/);
assert.throws(()=>validateNoDestructiveReset({core:bundle.core+"\nlocalStorage.clear();"}),/Destructive localStorage.clear/);

console.log('RUSSIAN_MIGRATION_FREEZE_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:14},null,2));
