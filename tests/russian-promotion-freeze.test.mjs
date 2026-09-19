import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const contract=JSON.parse(read('subjects/russian/contracts/migration-freeze-contract.v1.json'));
const core=read('subjects/russian/assets/core.js');
const adapter=read('subjects/russian/assets/subject-adapter.js');
const hostBridge=read('subjects/shared/host-bridge.js');
const visual=read('subjects/russian/assets/visual-vocabulary-runtime.js');
const dialogue=read('subjects/russian/assets/dialogue-scaffold.js');
const ai=read('subjects/russian/assets/ai-direct-explanation.js');
const repair=read('subjects/russian/assets/weakness-repair-router.js');
const skill=read('subjects/russian/assets/skill-gated-assessment.js');
const cursive=read('subjects/russian/assets/cursive-glyphs.js');
const index=read('subjects/russian/index.html');

const fail=m=>{throw new Error(m)};
const need=(src,token,msg)=>{if(!src.includes(token))fail(msg)};
const forbid=(src,token,msg)=>{if(src.includes(token))fail(msg)};

function validateFreeze({contract,core,adapter,hostBridge,visual,dialogue,ai,repair,skill,cursive,index}){
  if(contract?.schema!=='RUSSIAN_MIGRATION_FREEZE_CONTRACT_V1')fail('freeze schema');
  if(contract.promotion?.mergeToMainAutomatic!==false)fail('automatic main merge');
  if(contract.promotion?.promotionDecisionRequired!==true)fail('promotion decision');
  if(contract.promotion?.openDeferredObligationsAllowed!==false)fail('deferred obligations');
  if(contract.promotion?.destructiveStorageResetAllowed!==false)fail('destructive storage reset');
  if(contract.compatibility?.preservePrimaryStorageKey!=='bauman_russian_survival_master_v11_clean_skeleton')fail('primary storage key');
  if(contract.compatibility?.preserveBridgeContract!=='BAUMAN_SUBJECT_BRIDGE_V1')fail('bridge contract');
  if(contract.compatibility?.preservePlanningProtocol!=='BAUMAN_PLANNING_BRIDGE_V3_ROUTE_CARDS')fail('planning protocol');
  if(contract.compatibility?.legacySavedStateFieldsMayExecuteTranslationUI!==false)fail('legacy translation UI');
  if(contract.compatibility?.sourceTranslationFieldsAreLearnerSemanticAuthority!==false)fail('translation semantic authority');

  need(adapter,"storageKey: 'bauman_russian_survival_master_v11_clean_skeleton'",'adapter storage key');
  need(adapter,"protocol: 'BAUMAN_PLANNING_BRIDGE_V3_ROUTE_CARDS'",'adapter planning protocol');
  need(hostBridge,"contract:'BAUMAN_SUBJECT_BRIDGE_V1'",'host bridge contract');

  forbid(core,'toggleActiveHideVi','dead translation toggle');
  forbid(core,"act==='toggle-vi'",'dead translation action');
  forbid(core,'V ẩn/hiện nghĩa','stale translation shortcut');
  for(const helper of ['dialogueVi','makeVietnamVocabDisplay','inferVocabVisual','vocabMeaningNoteText','vocabApplicationText','vocabDialogueExampleLines','vocabDialogueExampleHtml','vocabVisualHtml'])forbid(core,helper,'dead translation-era helper');
  forbid(core,'localStorage.clear(','destructive storage wipe');
  need(core,"modal.setAttribute('aria-hidden','false')",'modal open aria lifecycle');
  need(core,"modal.setAttribute('aria-hidden','true')",'modal close aria lifecycle');

  need(visual,'RUSSIAN_VISUAL_VOCABULARY_RUNTIME_V1','visual semantic runtime');
  forbid(visual,'meaning_vi','visual Vietnamese fallback');
  forbid(visual,'.english','visual English fallback');

  need(dialogue,'RUSSIAN_DIALOGUE_SCAFFOLD_V1','dialogue scaffold');
  forbid(dialogue,'vi_turns','dialogue Vietnamese semantic runtime');

  need(ai,'RUSSIAN_AI_DIRECT_EXPLANATION_V1','AI direct semantic runtime');
  need(ai,'translationSemanticAuthority:false','AI translation authority');

  need(repair,'RUSSIAN_WEAKNESS_REPAIR_ROUTER_V1','repair router');
  need(repair,'repair_evidence_present','repair evidence gate');
  need(skill,'advisoryOnly:true','skill advisory semantics');
  need(skill,'crossSkillInference:false','cross-skill inference disabled');

  need(cursive,'RUSSIAN_CURSIVE_GLYPH_SHAPES_V2','cursive V2 shapes');
  need(cursive,'function glyphCoverage(){return Object.keys(UPPER).length+Object.keys(LOWER).length;}','66 glyph coverage implementation');

  forbid(index,'PASS','gate status leaked into learner UI');
  forbid(index,'DEBUG','debug status leaked into learner UI');
  return true;
}

const bundle={contract,core,adapter,hostBridge,visual,dialogue,ai,repair,skill,cursive,index};
assert.equal(validateFreeze(bundle),true);

{const x=structuredClone(contract);x.promotion.mergeToMainAutomatic=true;assert.throws(()=>validateFreeze({...bundle,contract:x}),/automatic main merge/)}
{const x=structuredClone(contract);x.compatibility.legacySavedStateFieldsMayExecuteTranslationUI=true;assert.throws(()=>validateFreeze({...bundle,contract:x}),/legacy translation UI/)}
{const x=structuredClone(contract);x.compatibility.sourceTranslationFieldsAreLearnerSemanticAuthority=true;assert.throws(()=>validateFreeze({...bundle,contract:x}),/translation semantic authority/)}
{const x=structuredClone(contract);x.compatibility.preservePrimaryStorageKey='new_key';assert.throws(()=>validateFreeze({...bundle,contract:x}),/primary storage key/)}
assert.throws(()=>validateFreeze({...bundle,core:core+"\nfunction toggleActiveHideVi(){}"}),/dead translation toggle/);
assert.throws(()=>validateFreeze({...bundle,core:core+"\nconst shortcut='V ẩn/hiện nghĩa';"}),/stale translation shortcut/);
assert.throws(()=>validateFreeze({...bundle,core:core+"\nfunction makeVietnamVocabDisplay(){}"}),/dead translation-era helper/);
assert.throws(()=>validateFreeze({...bundle,core:core+"\nlocalStorage.clear();"}),/destructive storage wipe/);
assert.throws(()=>validateFreeze({...bundle,adapter:adapter.replace("protocol: 'BAUMAN_PLANNING_BRIDGE_V3_ROUTE_CARDS'","protocol: 'BROKEN'")}),/adapter planning protocol/);
assert.throws(()=>validateFreeze({...bundle,hostBridge:hostBridge.replace("contract:'BAUMAN_SUBJECT_BRIDGE_V1'","contract:'BROKEN'")}),/host bridge contract/);
assert.throws(()=>validateFreeze({...bundle,visual:visual+"\nconst meaning_vi='x';"}),/visual Vietnamese fallback/);
assert.throws(()=>validateFreeze({...bundle,dialogue:dialogue+"\nconst vi_turns=[];"}),/dialogue Vietnamese semantic runtime/);
assert.throws(()=>validateFreeze({...bundle,ai:ai.replace('translationSemanticAuthority:false','translationSemanticAuthority:true')}),/AI translation authority/);
assert.throws(()=>validateFreeze({...bundle,skill:skill.replace('crossSkillInference:false','crossSkillInference:true')}),/cross-skill inference disabled/);

console.log('RUSSIAN_PROMOTION_FREEZE_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:14,turn:'24.1'},null,2));
