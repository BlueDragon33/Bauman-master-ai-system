import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const ROOT=path.resolve('.');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const fail=m=>{throw new Error('RUSSIAN_MIGRATION_FREEZE_GATE=FAIL\n'+m)};
const assert=(v,m)=>{if(!v)fail(m)};

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_MIGRATION_FREEZE_CONTRACT_V1','Unexpected migration-freeze contract');
  assert(c.turn===24,'Freeze contract must belong to Turn 24');
  assert(c.freezeScope?.learnerRuntime===true&&c.freezeScope?.packageLoadOrder===true&&c.freezeScope?.offlineInventory===true&&c.freezeScope?.storageCompatibility===true&&c.freezeScope?.bridgeCompatibility===true,'Freeze scope incomplete');
  assert(c.compatibility?.preservePrimaryStorageKey==='bauman_russian_survival_master_v11_clean_skeleton','Primary storage key drifted');
  assert(Array.isArray(c.compatibility?.preserveLegacySavedStateFields)&&c.compatibility.preserveLegacySavedStateFields.includes('dialogueHideVi')&&c.compatibility.preserveLegacySavedStateFields.includes('practiceHideVi'),'Legacy saved-state compatibility fields missing');
  assert(c.compatibility?.legacySavedStateFieldsMayExecuteTranslationUI===false,'Legacy translation state regained runtime authority');
  assert(c.compatibility?.sourceTranslationFieldsMayRemainForMigration===true&&c.compatibility?.sourceTranslationFieldsAreLearnerSemanticAuthority===false,'Source migration/semantic boundary drifted');
  assert(c.compatibility?.preserveBridgeContract==='BAUMAN_SUBJECT_BRIDGE_V1','Host bridge contract drifted');
  assert(c.compatibility?.preservePlanningProtocol==='BAUMAN_PLANNING_BRIDGE_V3_ROUTE_CARDS','Planning protocol drifted');
  assert(c.runtimeFreeze?.directSemanticVocabularyRequired===true&&c.runtimeFreeze?.translationFreeDialogueRequired===true&&c.runtimeFreeze?.aiDirectSemanticRequired===true,'Direct-semantic runtime freeze weakened');
  assert(c.runtimeFreeze?.deadTranslationToggleForbidden===true&&c.runtimeFreeze?.cursiveExplicitVectorRequired===true&&c.runtimeFreeze?.weaknessRepairEvidenceGated===true&&c.runtimeFreeze?.offlineReadinessVerified===true&&c.runtimeFreeze?.browserCapabilityFallbackRequired===true,'Turn 20-23 freeze responsibilities incomplete');
  assert(c.authority?.masteryOwner==='RUSSIAN_LEARNING_STATE_V1'&&c.authority?.reviewQueueOwner==='RUSSIAN_LEARNING_STATE_V1'&&c.authority?.schedulerOwner==='RUSSIAN_VOCAB_SRS_V1','Learning authority owners drifted');
  assert(c.authority?.skillGateAdvisoryOnly===true&&c.authority?.repairStoreAdditiveOnly===true&&c.authority?.aiReadOnly===true,'Derived/helper authority escaped freeze');
  assert(c.promotion?.allTurnsMustBeGreen===true&&c.promotion?.openDeferredObligationsAllowed===false&&c.promotion?.destructiveStorageResetAllowed===false&&c.promotion?.mergeToMainAutomatic===false&&c.promotion?.promotionDecisionRequired===true,'Promotion safety weakened');
  return true;
}

export function validatePlan(plan){
  for(let turn=1;turn<=23;turn++){
    const re=new RegExp('\\|\\s*'+turn+'\\s*\\|[^\\n]*\\|\\s*GREEN\\s*\\|');
    assert(re.test(plan),'Turn '+turn+' is not GREEN before freeze');
  }
  assert(/\|\s*24\s*\|[^\n]*\|\s*(ACTIVE|GREEN)\s*\|/.test(plan),'Turn 24 must be active/green during freeze');
  assert(plan.includes('RUS-CURSIVE-VISUAL-001 — CLOSED'),'Deferred cursive obligation is not closed');
  assert(!/###\s+RUS-[^\n]+\n[\s\S]{0,500}?Blocks Turn 24:\s*yes/i.test(plan),'Open deferred obligation still blocks Turn 24');
  return true;
}

function countToken(src,token){return src.split(token).length-1}

export function validateCompatibility({core,adapter,hostBridge,manifest,cleanup}){
  assert(core.includes('dialogueHideVi:false')&&core.includes('practiceHideVi:false'),'Legacy saved-state fields no longer load compatibly');
  assert(!core.includes('toggleActiveHideVi'),'Dead translation toggle function remains executable');
  assert(!core.includes("data-act=\"toggle-vi\"")&&!core.includes("act==='toggle-vi'"),'Dead translation toggle action remains executable');
  assert(countToken(core,'dialogueHideVi')===1&&countToken(core,'practiceHideVi')===1,'Legacy saved-state fields are referenced outside inert compatibility defaults');
  assert(adapter.includes("storageKey: 'bauman_russian_survival_master_v11_clean_skeleton'"),'Primary Russian storage key changed');
  assert(hostBridge.includes("contract:'BAUMAN_SUBJECT_BRIDGE_V1'"),'BAUMAN_SUBJECT_BRIDGE_V1 no longer emitted by host bridge');
  assert(adapter.includes("protocol: 'BAUMAN_PLANNING_BRIDGE_V3_ROUTE_CARDS'"),'Planning bridge protocol changed');
  assert(manifest.includes('"bridgeProtocol": "BAUMAN_PLANNING_BRIDGE_V3_ROUTE_CARDS"'),'Manifest planning protocol drifted');
  const manifestJson=JSON.parse(manifest);
  assert(manifestJson.title==='Tiếng Nga Bauman','Manifest display title must remain version-free');
  assert(manifestJson.ui?.coreLabel==='TIẾNG NGA BAUMAN'&&manifestJson.ui?.hideVersionLabels===true,'Manifest display UI must hide legacy version labels');
  assert(cleanup.includes('hideLegacyVersionLabels:true')&&cleanup.includes('preserveInternalStorageAndBridgeIds:true'),'UI cleanup compatibility contract weakened');
  return true;
}

function slice(src,startToken,endToken){
  const a=src.indexOf(startToken);assert(a>=0,'Missing slice start '+startToken);
  const b=src.indexOf(endToken,a+startToken.length);assert(b>a,'Missing slice end '+endToken);
  return src.slice(a,b);
}

export function validateLearnerRuntime({core,visual,dialogue,aiDirect,aiGuard,cursive,repair,skillGate,runtime,capability,index}){
  assert(visual.includes("RUSSIAN_VISUAL_VOCABULARY_RUNTIME_V1"),'Direct-semantic vocabulary runtime missing');
  for(const token of ['meaning_vi','translation_vi','meaning_en','translation_en','.english']){
    assert(!visual.includes(token),'Visual vocabulary runtime reads translation field: '+token);
  }
  assert(dialogue.includes("RUSSIAN_DIALOGUE_SCAFFOLD_V1"),'Translation-free dialogue scaffold missing');
  assert(!dialogue.includes('vi_turns')&&!dialogue.includes('meaningVi'),'Dialogue scaffold reads learner translation fields');
  assert(aiDirect.includes("RUSSIAN_AI_DIRECT_EXPLANATION_V1")&&aiDirect.includes('translationSemanticAuthority:false'),'AI direct-semantic runtime missing/fallback enabled');
  assert(aiGuard.includes('canonicalStateReadOnly:true')&&aiGuard.includes('translationSemanticAuthority:false')&&aiGuard.includes('aiMayModifyMastery:false'),'AI guard freeze weakened');

  const vocabSlice=slice(core,'function renderVocab()','function grammarLevelOrder(');
  for(const token of ['meaningVi','displayMeaning','English equivalent','.english']){
    assert(!vocabSlice.includes(token),'Learner vocabulary surface regained translation path: '+token);
  }
  const dialogueSlice=slice(core,'function renderDialogue()','function handwritingText(');
  assert(!dialogueSlice.includes('vi_turns')&&!dialogueSlice.includes('toggle-vi'),'Learner dialogue surface regained translation UI');

  assert(cursive.includes("RUSSIAN_CURSIVE_GLYPH_SHAPES_V1"),'Explicit cursive vector runtime missing');
  assert(repair.includes("RUSSIAN_WEAKNESS_REPAIR_ROUTER_V1"),'Weakness repair router missing');
  assert(repair.includes('repair_evidence_present')&&repair.includes('resolved'),'Repair lifecycle evidence gate missing');
  assert(skillGate.includes('advisoryOnly:true')&&skillGate.includes('crossSkillInference:false'),'Skill-gate advisory/isolation freeze weakened');
  assert(runtime.includes('verified&&shellPrepared>=SHELL_REQUIRED.length&&prepared>=CORE_DATA.length'),'Offline verified readiness freeze weakened');
  assert(capability.includes("RUSSIAN_BROWSER_CAPABILITY_V1")&&capability.includes('speechReady'),'Browser capability fallback missing');

  const order=['assets/visual-vocabulary-runtime.js','assets/ai-direct-explanation.js','assets/dialogue-scaffold.js','assets/browser-capabilities.js','assets/core.js','assets/cursive-glyphs.js','assets/cyrillic-literacy.js','assets/weakness-repair-router.js','assets/runtime-optimizer.js'];
  let prev=-1;
  for(const item of order){const pos=index.indexOf(item);assert(pos>=0,'Frozen runtime missing from entry: '+item);assert(pos>prev,'Frozen runtime load order invalid at '+item);prev=pos;}
  return true;
}

export function validateNoDestructiveReset(files){
  for(const [name,src] of Object.entries(files)){
    assert(!src.includes('localStorage.clear('),'Destructive localStorage.clear found in '+name);
  }
  return true;
}

export function loadAndValidate(){
  const contract=JSON.parse(read('subjects/russian/contracts/migration-freeze-contract.v1.json'));
  const plan=read('subjects/russian/RUSSIAN_DEVELOPMENT_PLAN.md');
  const bundle={
    core:read('subjects/russian/assets/core.js'),
    adapter:read('subjects/russian/assets/subject-adapter.js'),
    hostBridge:read('subjects/shared/host-bridge.js'),
    manifest:read('subjects/russian/subject-manifest.json'),
    cleanup:read('subjects/russian/assets/ui-cleanup-contract.js'),
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
  validateContract(contract);
  validatePlan(plan);
  validateCompatibility(bundle);
  validateLearnerRuntime(bundle);
  validateNoDestructiveReset({
    core:bundle.core,
    learning:read('subjects/russian/assets/learning-state.js'),
    srs:read('subjects/russian/assets/vocab-srs.js'),
    repair:bundle.repair,
    ai:bundle.aiGuard
  });
  return {turnsGreenBeforeFreeze:23,deferredOpen:0,bridge:'BAUMAN_SUBJECT_BRIDGE_V1',storage:'preserved'};
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  const result=loadAndValidate();
  console.log('RUSSIAN_MIGRATION_FREEZE_GATE=PASS');
  console.log(JSON.stringify(result,null,2));
}
