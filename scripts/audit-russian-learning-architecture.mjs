import fs from 'node:fs';

const readJson=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const read=path=>fs.readFileSync(path,'utf8');
const arr=v=>Array.isArray(v)?v:[];
const has=(o,keys)=>keys.some(k=>{
  const v=o?.[k];
  return Array.isArray(v)?v.length>0:(v!==undefined&&v!==null&&String(v).trim()!=='');
});
const count=(rows,pred)=>rows.reduce((n,row)=>n+(pred(row)?1:0),0);
const pct=(n,d)=>d?Math.round(n*10000/d)/100:0;

const vocab=arr(readJson('subjects/russian/data/vocab.json'));
const handwriting=arr(readJson('subjects/russian/data/handwriting.json'));
const speaking=arr(readJson('subjects/russian/data/speaking.json'));
const curriculum=readJson('subjects/russian/data/curriculum.json');
const lessons=arr(readJson('subjects/russian/data/lessons.json'));
const core=read('subjects/russian/assets/core.js');
const planning=read('subjects/russian/assets/planning-bridge.js');
const adapter=read('subjects/russian/assets/subject-adapter.js');
const referenceUi=read('subjects/russian/assets/russian-reference-ui.js');

const vietnameseKeys=['meaning_vi','vi_vi','translation_vi','gloss_vi','definition_vi','context_title_vi','prompt_vi'];
const broadLegacyViKeys=[...vietnameseKeys,'vi'];
const visualKeys=['image','image_url','picture','image_emoji','emoji','illustration','illustration_url','illustration_label_ru','visual_label','semantic_label','scene','scene_id','pictogram','gesture'];
const audioKeys=['audio','audio_url','voice','voice_url','voice_text','pronunciation','pron','transcription'];
const contextKeys=['example','voice_text','usage_note','when_use','context','context_ru','illustration_label_ru','tags'];

const vocabStats={
  total:vocab.length,
  withExplicitVietnameseFields:count(vocab,x=>has(x,vietnameseKeys)),
  withAnyLegacyViField:count(vocab,x=>has(x,broadLegacyViKeys)),
  withVisualEvidence:count(vocab,x=>has(x,visualKeys)),
  withAudioOrPronunciationEvidence:count(vocab,x=>has(x,audioKeys)),
  withContextEvidence:count(vocab,x=>has(x,contextKeys))
};
vocabStats.visualCoveragePercent=pct(vocabStats.withVisualEvidence,vocabStats.total);
vocabStats.explicitVietnameseFieldPercent=pct(vocabStats.withExplicitVietnameseFields,vocabStats.total);

const alphabetRows=handwriting.filter(x=>(x?.mode||'')==='alphabet');
const normalizePair=v=>String(v??'').replace(/\s+/g,' ').trim();
const handwritingStats={
  total:handwriting.length,
  alphabetRows:alphabetRows.length,
  withPrint:count(alphabetRows,x=>has(x,['print','text','letter','uppercase'])),
  withCursive:count(alphabetRows,x=>has(x,['cursive','handwriting','write'])),
  withStrokeData:count(alphabetRows,x=>Array.isArray(x?.strokes)&&x.strokes.length>0),
  cursiveTextDifferentFromPrint:count(alphabetRows,x=>{
    const p=normalizePair(x?.print||x?.text||x?.letter||x?.uppercase);
    const c=normalizePair(x?.cursive||x?.handwriting||x?.write);
    return Boolean(p&&c&&p!==c);
  })
};
handwritingStats.cursiveDifferentPercent=pct(handwritingStats.cursiveTextDifferentFromPrint,handwritingStats.alphabetRows);

const speakingStats={
  total:speaking.length,
  withRussianText:count(speaking,x=>has(x,['ru','text_ru','phrase_ru','utterances','turns','lines'])),
  withVietnameseScaffolding:count(speaking,x=>has(x,['vi','meaning_vi','context_title_vi','purpose_vi','communicative_functions_vi'])),
  withAudioEvidence:count(speaking,x=>has(x,['audio','audio_url','voice','voice_url','tts','voice_text'])),
  withVocabularySeed:count(speaking,x=>Array.isArray(x?.vocabulary_seed_ru)&&x.vocabulary_seed_ru.length>0)
};

const codeDebt={
  vietnamVocabDisplayFunction:core.includes('function makeVietnamVocabDisplay'),
  vocabDisplayMeaningFallback:core.includes('displayMeaning')&&core.includes('meaningVi'),
  vocabFlipMeaningLabel:core.includes('Lật nghĩa'),
  dialogueVietnameseGlossFunction:core.includes('function dialogueVi'),
  dialogueHideViState:core.includes('dialogueHideVi')||core.includes('practiceHideVi'),
  legacyTheoryDefault:core.includes("learnTab:'theory'"),
  planningListeningSpeakingPriority:/listening:0\.32[\s\S]*speaking:0\.30/.test(planning),
  referenceUiVocabBeforeListening:referenceUi.indexOf("['▣','Từ vựng'")>=0&&referenceUi.indexOf("['◍','Nghe hiểu'")>=0&&referenceUi.indexOf("['▣','Từ vựng'")<referenceUi.indexOf("['◍','Nghe hiểu'"),
  adapterHasListeningSpeakingWeights:/listening/.test(adapter)&&/speaking/.test(adapter)
};

const stages=arr(curriculum?.stages).map(x=>({id:x.id,title:x.title,goal:x.goal}));
const result={
  schema:'RUSSIAN_LEARNING_BASELINE_AUDIT_V1',
  vocab:vocabStats,
  handwriting:handwritingStats,
  speaking:speakingStats,
  lessons:{total:lessons.length},
  curriculum:{stages},
  codeDebt,
  targetGaps:{
    removeLearnerFacingVietnameseVocabularyMeaning:codeDebt.vietnamVocabDisplayFunction||codeDebt.vocabFlipMeaningLabel||vocabStats.withExplicitVietnameseFields>0,
    visualVocabularyCoverageIncomplete:vocabStats.withVisualEvidence<vocabStats.total,
    cursiveRepresentationNeedsVerification:handwritingStats.alphabetRows<33||handwritingStats.cursiveTextDifferentFromPrint<33,
    dialogueTranslationScaffoldStillPresent:codeDebt.dialogueVietnameseGlossFunction||codeDebt.dialogueHideViState,
    defaultLearningRouteNotOralFirst:codeDebt.legacyTheoryDefault,
    referenceUiPriorityNeedsReorder:codeDebt.referenceUiVocabBeforeListening
  }
};

console.log('RUSSIAN_LEARNING_BASELINE_AUDIT=PASS');
console.log(JSON.stringify(result,null,2));
