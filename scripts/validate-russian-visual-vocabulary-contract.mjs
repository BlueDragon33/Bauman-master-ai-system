import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

const fail=m=>{throw new Error(`RUSSIAN_VISUAL_VOCAB_CONTRACT_GATE=FAIL\n${m}`)};
const assert=(v,m)=>{if(!v)fail(m)};
const arr=v=>Array.isArray(v)?v:[];
const has=(o,keys)=>keys.some(k=>{
  const v=o?.[k];
  return Array.isArray(v)?v.length>0:(v!==undefined&&v!==null&&String(v).trim()!=='');
});

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_VISUAL_VOCABULARY_CONTRACT_V1','Unexpected visual vocabulary contract schema');
  assert(c.authority?.target==='direct_semantic_descriptor','Direct semantic descriptor must be target authority');
  assert(c.authority?.authoritySwitch===false&&c.authority?.authoritySwitchTurn===13,'Turn 10 must not silently switch runtime authority');
  assert(c.russianIdentity?.required?.includes('term_ru'),'Russian term identity is required');
  const allowed=new Set(c.semanticChannels?.allowed||[]);
  for(const ch of ['image','illustration','pictogram','emoji','scene','gesture','contrast','category_examples','audio_context','simple_russian_definition']){
    assert(allowed.has(ch),`Missing allowed direct semantic channel: ${ch}`);
  }
  assert(c.semanticChannels?.minimumDirectChannels===1,'At least one direct semantic channel must be required');
  const prohibited=new Set(c.learnerFacingProhibitedAnswerFields||[]);
  for(const f of ['meaning_vi','vi','clue_en','en'])assert(prohibited.has(f),`Prohibited translation field missing: ${f}`);
  assert(c.legacyCompatibility?.sourceFieldsMayRemain===true,'Legacy translation fields must remain readable during migration');
  assert(c.legacyCompatibility?.legacyTranslationAuthority==='migration_and_authoring_diagnostics_only','Legacy translation authority is too broad');
  assert(c.missingSemanticEvidence?.explicitStateRequired===true,'Missing semantic evidence must be explicit');
  assert(c.missingSemanticEvidence?.fallbackToVietnamese===false&&c.missingSemanticEvidence?.fallbackToEnglish===false,'Translation fallback must fail closed');
  assert(c.missingSemanticEvidence?.fallbackToUnverifiedGeneratedMeaning===false,'Unverified generated-meaning fallback must be forbidden');
  assert(c.invariants?.translationIsNotMeaningAuthority===true&&c.invariants?.englishIsNotDefaultBridge===true,'Direct-semantic invariants missing');
  assert(c.invariants?.learnerStateAuthority===false&&c.invariants?.masteryMutation===false,'Vocabulary semantic contract may not own mastery');
  return true;
}

export function auditVocabulary(vocab,core){
  const visualKeys=['image','image_url','picture','image_emoji','emoji','illustration','illustration_url','illustration_label_ru','visual_label','semantic_label','scene','scene_id','pictogram','gesture'];
  const audioKeys=['audio','audio_url','voice','voice_url','voice_text','pronunciation','pron','transcription'];
  const contextKeys=['example','example_ru','voice_text','usage_note','when_use','context','context_ru','illustration_label_ru','tags'];
  const legacyVi=['meaning_vi','vi_vi','translation_vi','gloss_vi','definition_vi','vi'];
  const legacyEn=['clue_en','meaning_en','translation_en','definition_en','en'];
  const rows=arr(vocab);
  const count=pred=>rows.reduce((n,x)=>n+(pred(x)?1:0),0);
  const result={
    total:rows.length,
    withVisualEvidence:count(x=>has(x,visualKeys)),
    withAudioEvidence:count(x=>has(x,audioKeys)),
    withContextEvidence:count(x=>has(x,contextKeys)),
    withLegacyVietnamese:count(x=>has(x,legacyVi)),
    withLegacyEnglish:count(x=>has(x,legacyEn)),
    runtimeDebt:{
      translationFallback:Boolean(core.includes("meaningVi||english||meaningRu")||core.includes("displayMeaning||info.meaningVi||info.english")),
      flipMeaningLabel:core.includes('Lật nghĩa'),
      vietnamVisualInference:/['"](?:thời điểm|cảm ơn|xin lỗi|xác nhận|câu hỏi|học thuật|đồ học tập|ký túc xá|giấy tờ|di chuyển|mua sắm|ăn uống|sức khỏe|liên lạc|công nghệ|nghiên cứu)['"]/.test(core)
    }
  };
  assert(result.total===8000,`Vocabulary corpus size drifted: ${result.total}`);
  assert(result.withAudioEvidence>0,'Vocabulary corpus has no audio/pronunciation evidence');
  assert(result.withContextEvidence>0,'Vocabulary corpus has no context evidence');
  return result;
}

export function loadAndValidate(){
  const contract=JSON.parse(fs.readFileSync('subjects/russian/contracts/visual-vocabulary-contract.v1.json','utf8'));
  validateContract(contract);
  const audit=auditVocabulary(
    JSON.parse(fs.readFileSync('subjects/russian/data/vocab.json','utf8')),
    fs.readFileSync('subjects/russian/assets/core.js','utf8')
  );
  return {contract,audit};
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  const {audit}=loadAndValidate();
  console.log('RUSSIAN_VISUAL_VOCAB_CONTRACT_GATE=PASS');
  console.log('RUSSIAN_VISUAL_VOCAB_CONTRACT_AUDIT='+JSON.stringify(audit));
}
