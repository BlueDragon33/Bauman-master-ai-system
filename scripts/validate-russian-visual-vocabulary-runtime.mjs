import fs from 'node:fs';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';

const fail=m=>{throw new Error(`RUSSIAN_VISUAL_VOCAB_RUNTIME_GATE=FAIL\n${m}`)};
const assert=(v,m)=>{if(!v)fail(m)};

function functionSlice(src,name,nextName){
  const start=src.indexOf('function '+name+'(');
  assert(start>=0,`Missing function ${name}`);
  const end=nextName?src.indexOf('function '+nextName+'(',start+1):-1;
  return src.slice(start,end>=0?end:src.length);
}

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_VISUAL_VOCABULARY_RUNTIME_CONTRACT_V1','Unexpected visual vocabulary runtime contract');
  assert(c.authority?.authoritySwitch===true,'Turn 13 must explicitly switch learner-facing semantic authority');
  assert(c.authority?.learnerFacingSemanticAuthority==='RUSSIAN_VISUAL_VOCABULARY_RUNTIME_V1','Unexpected learner-facing semantic authority');
  assert(c.authority?.srsSchedulingAuthorityUnchanged===true&&c.authority?.masteryAuthorityUnchanged===true,'Turn 13 must not take SRS/mastery authority');
  assert(c.learnerSurface?.contextRevealReplacesMeaningFlip===true,'Context reveal must replace translation-style flip');
  assert(c.learnerSurface?.explicitMissingState===true,'Missing semantic state must remain explicit');
  assert(c.invariants?.noVietnameseSemanticAnswer===true&&c.invariants?.noEnglishSemanticAnswer===true,'Translation answers are still permitted');
  assert(c.learnerSurface?.translationFreeSearch===true&&c.invariants?.translationFieldsExcludedFromSearch===true,'Vocabulary search must exclude translation fields');
  assert(c.invariants?.sentenceMiningRequiresCyrillicContext===true&&c.invariants?.speakingLinkTitlesRussianOnly===true,'SRS semantic links must remain Russian-only');
  const image=c.imageEnrichment||{};
  assert(image.provider==='wikimedia_commons'&&image.mode==='on_demand','Verified image provider contract missing');
  assert(image.queryLanguage==='ru'&&image.usesRussianSemanticContext===true&&image.translationQueryForbidden===true,'Image lookup must remain Russian-semantic only');
  assert(image.requiresRelevanceGate===true&&image.attributionRequired===true,'Image lookup relevance/attribution safeguards missing');
  assert(image.offlineLookup===false&&image.saveDataLookup===false,'Image lookup must not run offline or under Save-Data');
  assert(image.cancelStaleLookup===true,'Stale image lookup cancellation is required');
  assert(image.artistAttributionWhenAvailable===true,'Commons artist attribution must be preserved when available');
  assert(image.learnerStateAuthority===false&&image.srsAuthority===false,'Image enrichment must not gain learner/SRS authority');
  return true;
}

export function loadRuntimeHelper(js){
  const sandbox={globalThis:{},URLSearchParams,AbortController};
  sandbox.window=sandbox.globalThis;
  vm.createContext(sandbox);
  vm.runInContext(js,sandbox);
  return sandbox.globalThis.RussianVisualVocabularyRuntime;
}

export function validateHelper(js){
  for(const token of ['meaning_vi','vi_vi','translation_vi','clue_en','meaning_en','translation_en']){
    assert(!js.includes(token),`Runtime helper references prohibited translation field: ${token}`);
  }
  const api=loadRuntimeHelper(js);
  assert(api?.schema==='RUSSIAN_VISUAL_VOCABULARY_RUNTIME_V1','Visual vocabulary runtime API missing');
  const d=api.describe({
    ru:'книга',
    meaning_vi:'sách',
    clue_en:'book',
    image_emoji:'📘',
    illustration_label_ru:'книга',
    meaning_ru:'печатное издание',
    example_ru:'Я читаю книгу.'
  });
  assert(d.term_ru==='книга'&&d.semantic_status==='ready','Direct semantic descriptor failed');
  const payload=JSON.stringify(d);
  assert(!payload.includes('sách')&&!payload.includes('book'),'Translation leaked into learner-facing descriptor');
  assert(payload.includes('печатное издание')&&payload.includes('Я читаю книгу.'),'Russian direct semantics missing');
  assert(api.buildImageQuery?.({ru:'книга',meaning_ru:'печатное издание',tags:['чтение']})==='книга','Image query must use the Russian term');
  const ranked=api.rankCommonsPages?.([
    {title:'File:Книга в библиотеке.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/book.jpg',descriptionurl:'https://commons.wikimedia.org/wiki/File:Book.jpg',extmetadata:{ImageDescription:{value:'Книга в университетской библиотеке'},LicenseShortName:{value:'CC BY-SA 4.0'}}}]},
    {title:'File:Автомобиль.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/car.jpg',descriptionurl:'https://commons.wikimedia.org/wiki/File:Car.jpg',extmetadata:{ImageDescription:{value:'Автомобиль на дороге'},LicenseShortName:{value:'CC BY-SA 4.0'}}}]}
  ],{ru:'книга',meaning_ru:'печатное издание для чтения',tags:['библиотека']});
  assert(Array.isArray(ranked)&&ranked.length===1&&ranked[0].title.includes('Книга'),'Image relevance gate did not reject unrelated Commons candidate');
  assert(js.includes("navigator.onLine!==false")&&js.includes("navigator.connection?.saveData"),'Image enrichment must honor offline and Save-Data state');
  assert(js.includes("Wikimedia Commons · "),'Image enrichment attribution UI missing');
  assert(js.includes('activeHydrationController')&&js.includes('.abort()'),'Stale image lookup cancellation missing');
  assert(js.includes("result.artist||''"),'Artist attribution path missing');
  assert(js.includes("upload\\.wikimedia\\.org")&&js.includes("commons\\.wikimedia\\.org"),'Trusted Wikimedia host allowlist missing');
  const loadListener=js.indexOf("img.addEventListener('load'");
  const srcAssign=js.indexOf('img.src=result.thumb_url');
  assert(loadListener>=0&&srcAssign>loadListener,'Image load/error listeners must be attached before assigning src');
  return true;
}

export function validateCore(core){
  const info=functionSlice(core,'vocabInfo','inferVocabVisual');
  const render=functionSlice(core,'renderVocab','grammarLevelOrder');
  assert(info.includes('RussianVisualVocabularyRuntime'),'vocabInfo does not use direct-semantic runtime authority');
  for(const token of ['meaningVi','english','makeVietnamVocabDisplay','inferVocabVisual'])assert(!info.includes(token),`vocabInfo still uses legacy semantic path: ${token}`);
  for(const token of ['meaningVi','english','Lật nghĩa','vocabMeaningNoteText','vocabApplicationText','vocabDialogueExampleHtml'])assert(!render.includes(token),`renderVocab still exposes legacy semantic path: ${token}`);
  assert(render.includes('Mở ngữ cảnh Nga'),'Russian context reveal control missing');
  assert(render.includes('missing_visual_semantics'),'Explicit missing-semantic state missing');
  assert(render.includes('definitionRu')&&render.includes('contextRu'),'Russian definition/context not rendered');
  assert(render.includes('data-ru-visual-lookup="1"')&&render.includes('data-definition-ru')&&render.includes('data-context-ru'),'Verified image lookup payload missing from vocab card');
  assert(core.includes("RussianVisualVocabularyRuntime?.hydrate?.(document)"),'Vocab render does not hydrate verified image enrichment');
  return true;
}

export function validateSrs(srs){
  assert(!srs.includes('Tự nhớ lại trước khi lật nghĩa'),'SRS still tells learner to flip meaning');
  assert(!srs.includes('n.meaningVi||n.english||n.meaningRu'),'Sentence Mining still prefers translation');
  assert(srs.includes('meaning:clean(n.meaningRu)'),'Sentence Mining must store Russian meaning only');
  return true;
}


export function validateSearchIsolation(contentContract,adapter,core,srs){
  assert(contentContract.includes('const meaningRu=russian(')&&contentContract.includes('const example=russian('),'Content contract Russian semantic filter missing');
  assert(!contentContract.includes('v.meaningVi,v.english'),'Content contract search still includes translation fields');
  assert(contentContract.includes('v.meaningRu,v.example'),'Content contract search lost Russian semantic fields');
  assert(!core.includes('A.vocabSearchText?.(x)||JSON.stringify(x)'),'Core vocabulary search can fall back to raw source JSON');
  assert(adapter.includes("vocabExample(item){ const v=item?.example_ru || item?.context_ru || item?.voice_text || item?.usage_ru || ''; return /[А-Яа-яЁё]/.test(String(v)) ? v : this.vocabTerm(item); }"),'Adapter vocabulary example is not Russian-filtered');
  assert(!srs.includes('context_title_vi'),'SRS speaking-link title reads Vietnamese metadata');
  assert(srs.includes("title:russian(item.title_ru||item.context_title_ru)||clean(item.id||item.source_id||'')"),'SRS speaking-link title is not Russian-only');
  assert(srs.includes('!cyr.test(sentence)'),'Sentence Mining does not reject non-Cyrillic source context');
  assert(srs.includes('meaningRu:russian(direct.definition_ru||item?.meaning_ru||item?.definition_ru)'),'SRS meaning fallback is not Russian-filtered');
  assert(srs.includes('contextRu:russian(direct.context_ru||item?.example_ru||item?.context_ru||item?.voice_text||item?.example)'),'SRS context fallback is not Russian-filtered');
  return true;
}

export function validateIndex(index){
  const helper=index.indexOf('assets/visual-vocabulary-runtime.js');
  const core=index.indexOf('assets/core.js');
  assert(helper>=0&&helper<core,'Visual vocabulary runtime must load before core.js');
  return true;
}

export function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/visual-vocabulary-runtime-contract.v1.json','utf8'));
  validateContract(c);
  validateHelper(fs.readFileSync('subjects/russian/assets/visual-vocabulary-runtime.js','utf8'));
  validateCore(fs.readFileSync('subjects/russian/assets/core.js','utf8'));
  const srs=fs.readFileSync('subjects/russian/assets/vocab-srs.js','utf8');
  validateSrs(srs);
  validateSearchIsolation(
    fs.readFileSync('subjects/russian/assets/content-contract.js','utf8'),
    fs.readFileSync('subjects/russian/assets/subject-adapter.js','utf8'),
    fs.readFileSync('subjects/russian/assets/core.js','utf8'),
    srs
  );
  validateIndex(fs.readFileSync('subjects/russian/index.html','utf8'));
  return c;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  loadAndValidate();
  console.log('RUSSIAN_VISUAL_VOCAB_RUNTIME_GATE=PASS');
  console.log(JSON.stringify({authority:'direct_semantic',translationAnswers:false,contextReveal:true,verifiedImageEnrichment:true,imageProvider:'wikimedia_commons',srsAuthorityUnchanged:true},null,2));
}
