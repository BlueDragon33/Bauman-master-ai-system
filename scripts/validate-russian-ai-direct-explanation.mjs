import fs from 'node:fs';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';

const fail=m=>{throw new Error('RUSSIAN_AI_DIRECT_EXPLANATION_GATE=FAIL\n'+m)};
const assert=(v,m)=>{if(!v)fail(m)};
const ORDER=['visual_or_scene','russian_definition','russian_context','contrast_or_analogy','optional_meta_help'];

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_AI_DIRECT_EXPLANATION_CONTRACT_V1','Unexpected AI direct-explanation contract');
  assert(JSON.stringify(c.explanationOrder)===JSON.stringify(ORDER),'AI explanation order drifted');
  assert(c.semanticAuthority?.vocabularyRuntime==='RUSSIAN_VISUAL_VOCABULARY_RUNTIME_V1','AI must reuse visual vocabulary semantic authority');
  assert(c.semanticAuthority?.russianFirst===true&&c.semanticAuthority?.visualContextFirst===true,'Russian/visual-first policy disabled');
  assert(c.semanticAuthority?.translationSemanticAuthority===false&&c.semanticAuthority?.englishBridgeDefault===false,'Translation bridge regained semantic authority');
  assert(c.semanticAuthority?.metaLanguageSecondaryOnly===true,'Meta-language must remain secondary');
  assert(c.learnerSurface?.allowVietnameseVocabularyMeaningAnswer===false&&c.learnerSurface?.allowEnglishVocabularyMeaningAnswer===false,'Translation meaning answer is permitted');
  assert(c.learnerSurface?.dialogueTranslationFreeByDefault===true,'Dialogue must remain translation-free by default');
  assert(c.authority?.canonicalStateReadOnly===true&&c.authority?.masteryReadOnly===true&&c.authority?.reviewQueueReadOnly===true&&c.authority?.schedulerReadOnly===true,'AI authority must remain read-only');
  assert(c.authority?.aiMayModifyMastery===false&&c.authority?.aiMayModifyCompletion===false&&c.authority?.aiMayModifyReviewQueue===false&&c.authority?.aiMayModifyDueDate===false,'AI mutation authority forbidden');
  assert(c.invariants?.noMeaningViFallback===true&&c.invariants?.noEnglishFallback===true&&c.invariants?.noSilentSemanticGuess===true,'Translation/silent fallback invariant weakened');
  return true;
}

export function loadHelper(js){
  const sandbox={console,JSON,Object,String};
  sandbox.globalThis=sandbox;
  vm.createContext(sandbox);
  vm.runInContext(js,sandbox,{filename:'ai-direct-explanation.js'});
  return sandbox.RussianAIDirectExplanation;
}

export function validateHelper(js){
  for(const token of ['meaningVi','meaning_vi','translation_vi','meaningEn','meaning_en','translation_en','.english','displayMeaning']){
    assert(!js.includes(token),'AI helper references prohibited translation field: '+token);
  }
  for(const token of ['localStorage.setItem','localStorage.removeItem','RussianLearningState','addReview','dueAt=','mastered=','completed=']){
    assert(!js.includes(token),'AI helper contains forbidden state mutation/reference: '+token);
  }
  const api=loadHelper(js);
  assert(api?.schema==='RUSSIAN_AI_DIRECT_EXPLANATION_V1','AI direct-explanation runtime API missing');
  assert(JSON.stringify(Array.from(api.explanationOrder||[]))===JSON.stringify(ORDER),'Runtime explanation order drifted');

  const context={
    vocab:{
      term:'яблоко',
      semanticStatus:'ready',
      emoji:'🍎',
      visualLabelRu:'красный фрукт',
      definitionRu:'съедобный фрукт',
      contextRu:'Я ем яблоко.',
      meaningVi:'táo',
      english:'apple',
      displayMeaning:'quả táo'
    }
  };
  const plan=api.build('vocab',context,'');
  assert(plan.semanticAuthority==='direct_semantic'&&plan.translationSemanticAuthority===false,'Direct semantic authority missing');
  assert(plan.steps.map(x=>x.kind).join('|')===ORDER.join('|'),'Plan step order drifted');
  const payload=JSON.stringify(plan);
  assert(payload.includes('яблоко')&&payload.includes('съедобный фрукт')&&payload.includes('Я ем яблоко.'),'Russian direct semantics missing');
  assert(!payload.includes('táo')&&!payload.includes('apple')&&!payload.includes('quả táo'),'Legacy translation leaked into AI plan');

  const missing=api.build('vocab',{vocab:{term:'абстракция',semanticStatus:'missing_visual_semantics',meaningVi:'trừu tượng',english:'abstraction'}},'');
  const missingPayload=JSON.stringify(missing);
  assert(missing.status==='missing_visual_semantics','Missing semantic state was silently guessed');
  assert(!missingPayload.includes('trừu tượng')&&!missingPayload.includes('abstraction'),'Missing semantic state fell back to translation');
  return true;
}

function sliceBetween(src,startToken,endToken){
  const start=src.indexOf(startToken);
  assert(start>=0,'Missing source token: '+startToken);
  const end=src.indexOf(endToken,start+startToken.length);
  assert(end>start,'Missing end token: '+endToken);
  return src.slice(start,end);
}

export function validateCore(core){
  const ai=sliceBetween(core,'function aiContext()','function mediaForm(');
  assert(ai.includes('RussianAIDirectExplanation'),'Core AI surface does not delegate to direct-explanation runtime');
  assert(ai.includes('aiDirectHtml'),'Core AI renderer missing');
  for(const token of ['meaningVi','.english','English equivalent','nói lại bằng tiếng Việt','Ẩn nghĩa tiếng Việt ở vòng cuối','displayMeaning']){
    assert(!ai.includes(token),'Legacy translation-first AI path remains: '+token);
  }
  assert(!ai.includes('Nghĩa:'),'AI vocabulary surface still renders translation-style meaning label');
  return true;
}

export function validateGuard(guard){
  assert(guard.includes('russianFirst:true'),'AI guard missing Russian-first policy');
  assert(guard.includes('visualContextFirst:true'),'AI guard missing visual/context-first policy');
  assert(guard.includes('translationSemanticAuthority:false'),'AI guard still permits translation semantic authority');
  assert(guard.includes('englishBridgeDefault:false'),'AI guard still permits English as default bridge');
  assert(guard.includes('metaLanguageSecondaryOnly:true'),'AI guard missing secondary meta-language rule');
  assert(guard.includes('aiMayModifyMastery:false')&&guard.includes('aiMayCompleteTasks:false'),'AI guard lost mastery/completion protection');
  assert(!guard.includes('RussianLearningState?.set'),'AI guard must not mutate canonical state');
  assert(!guard.includes('.addReview'),'AI guard must not enqueue review');
  assert(guard.includes('RussianVocabSrs?.get'),'AI guard must read the real read-only vocab SRS API');
  assert(!guard.includes('RussianVocabSRS?.context'),'Legacy/nonexistent vocab SRS API reference remains');
  return true;
}

export function validateIndex(index){
  const direct=index.indexOf('assets/ai-direct-explanation.js');
  const core=index.indexOf('assets/core.js');
  const guard=index.indexOf('assets/ai-mentor-guard.js');
  assert(direct>=0&&direct<core,'AI direct-explanation runtime must load before core.js');
  assert(guard>core,'AI mentor guard must load after core.js');
  return true;
}

export function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/ai-direct-explanation-contract.v1.json','utf8'));
  const helper=fs.readFileSync('subjects/russian/assets/ai-direct-explanation.js','utf8');
  const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
  const guard=fs.readFileSync('subjects/russian/assets/ai-mentor-guard.js','utf8');
  const index=fs.readFileSync('subjects/russian/index.html','utf8');
  validateContract(c);
  validateHelper(helper);
  validateCore(core);
  validateGuard(guard);
  validateIndex(index);
  return c;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  loadAndValidate();
  console.log('RUSSIAN_AI_DIRECT_EXPLANATION_GATE=PASS');
  console.log(JSON.stringify({order:ORDER,russianFirst:true,translationSemanticAuthority:false,readOnly:true},null,2));
}
