import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {classifyVisualVocabulary,summarizeVisualCoverage} from '../subjects/russian/lib/visual-vocabulary-coverage.mjs';

const fail=m=>{throw new Error(`RUSSIAN_VISUAL_COVERAGE_GATE=FAIL\n${m}`)};
const assert=(v,m)=>{if(!v)fail(m)};

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_VISUAL_VOCABULARY_COVERAGE_CONTRACT_V1','Unexpected coverage contract schema');
  assert(c.corpusSize===8000,'Coverage contract must pin the 8,000-item corpus');
  assert(JSON.stringify(c.classification?.statuses)===JSON.stringify(['ready','partial','missing_visual_semantics']),'Coverage status set drifted');
  assert(c.rules?.explicitAssetIsReady===true&&c.rules?.russianContextWithoutAssetIsPartial===true,'Coverage classification rules missing');
  assert(c.rules?.translationOnlyIsMissing===true,'Translation-only vocabulary must classify as missing');
  assert(c.rules?.missingStateIsExplicit===true,'Missing visual semantics must be explicit');
  assert(c.rules?.syntheticEmojiFallbackIsNotSourceCoverage===true,'Synthetic fallback must not count as source coverage');
  assert(c.rules?.runtimeAuthoritySwitch===false,'Turn 11 must not switch runtime authority');
  for(const field of ['meaning_vi','vi','clue_en','en'])assert(c.classification?.translationFieldsIgnored?.includes(field),`Translation field not ignored: ${field}`);
  return true;
}

export function validateClassifier(contract){
  const translationOnly={ru:'тест',meaning_vi:'bài kiểm tra',clue_en:'test'};
  const a=classifyVisualVocabulary(translationOnly,contract);
  assert(a.semantic_status==='missing_visual_semantics'&&a.coverage_kind==='missing','Translation-only item did not fail closed');

  const contextual={ru:'лаборатория',illustration_label_ru:'лаборатория университета'};
  const b=classifyVisualVocabulary(contextual,contract);
  assert(b.semantic_status==='partial'&&b.coverage_kind==='russian_context_only','Russian context-only item must be partial');

  const explicit={ru:'книга',image_emoji:'📘',meaning_vi:'sách'};
  const d=classifyVisualVocabulary(explicit,contract);
  assert(d.semantic_status==='ready'&&d.source_field==='image_emoji','Explicit visual asset must be ready independently of translation');

  return true;
}

export function auditCoverage(vocab,contract){
  const summary=summarizeVisualCoverage(vocab,contract);
  assert(summary.total===contract.corpusSize,`Vocabulary corpus size drifted: ${summary.total}`);
  assert(summary.classified===summary.total,'Every vocabulary item must receive exactly one coverage class');
  return summary;
}

export function profileCorpus(vocab){
  const rows=Array.isArray(vocab)?vocab:[];
  const fields=['ru','word','phrase_ru','pos','part_of_speech','stage','level','topic','category','theme','meaning_ru','definition_ru','definition','example_ru','example','context_ru','usage_note','when_use','tags','image_emoji','emoji','image_url','image','illustration','illustration_url','audio','audio_url','pronunciation'];
  const fieldPresence={};
  for(const field of fields)fieldPresence[field]=rows.reduce((n,row)=>{
    const value=row?.[field];
    const present=Array.isArray(value)?value.length>0:(value!==undefined&&value!==null&&String(value).trim()!=='');
    return n+(present?1:0);
  },0);
  const samples=rows.slice(0,5).map(row=>({
    ru:row?.ru||row?.word||row?.phrase_ru||'',
    pos:row?.pos||row?.part_of_speech||'',
    stage:row?.stage||row?.level||'',
    topic:row?.topic||row?.category||row?.theme||'',
    meaning_ru:row?.meaning_ru||row?.definition_ru||row?.definition||'',
    example_ru:row?.example_ru||row?.context_ru||row?.example||'',
    image_emoji:row?.image_emoji||row?.emoji||''
  }));
  return {fieldPresence,samples};
}

export function loadAndValidate(){
  const contract=JSON.parse(fs.readFileSync('subjects/russian/contracts/visual-vocabulary-coverage-contract.v1.json','utf8'));
  validateContract(contract);
  validateClassifier(contract);
  const vocab=JSON.parse(fs.readFileSync('subjects/russian/data/vocab.json','utf8'));
  const summary=auditCoverage(vocab,contract);
  const profile=profileCorpus(vocab);
  return {contract,summary,profile};
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  const {summary,profile}=loadAndValidate();
  console.log('RUSSIAN_VISUAL_COVERAGE_GATE=PASS');
  console.log('RUSSIAN_VISUAL_COVERAGE_AUDIT='+JSON.stringify(summary));
  console.log('RUSSIAN_VISUAL_CORPUS_PROFILE='+JSON.stringify(profile));
}
