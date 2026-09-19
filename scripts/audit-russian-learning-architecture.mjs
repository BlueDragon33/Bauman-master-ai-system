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
const browserCapability=read('subjects/russian/assets/browser-capabilities.js');
const visualRuntime=read('subjects/russian/assets/visual-vocabulary-runtime.js');
const dialogueScaffold=read('subjects/russian/assets/dialogue-scaffold.js');
const cursiveGlyphs=read('subjects/russian/assets/cursive-glyphs.js');
const speakingCoach=read('subjects/russian/assets/speaking-coach.js');

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

const sourceAudioCount=count(speaking,x=>has(x,['audio','audio_url','voice','voice_url']));
const speakingRussianText=count(speaking,x=>has(x,['ru','text_ru','phrase_ru','utterances','turns','lines']));
const runtimeTtsContractReady=
  browserCapability.includes("const RU_LANG='ru-RU'")&&
  browserCapability.includes('function preferredRussianVoice()')&&
  browserCapability.includes('u.onstart=event=>')&&
  browserCapability.includes('u.onend=event=>')&&
  core.includes("onEnd:meta=>{if(inPracticeMode()){markPracticeLineHeard(d,idx);render()}");
const speakingStats={
  total:speaking.length,
  withRussianText:speakingRussianText,
  withVietnameseScaffolding:count(speaking,x=>has(x,['vi','meaning_vi','context_title_vi','purpose_vi','communicative_functions_vi'])),
  withAudioEvidence:sourceAudioCount,
  withSourceAudioAssets:sourceAudioCount,
  runtimeTtsEligibleRows:runtimeTtsContractReady?speakingRussianText:0,
  runtimeTtsEligiblePercent:pct(runtimeTtsContractReady?speakingRussianText:0,speaking.length),
  runtimeTtsContractReady,
  russianVoiceSelection:browserCapability.includes('function russianVoices()')&&browserCapability.includes('if(voice)u.voice=voice'),
  playbackCompletionEvidence:core.includes("russian:listening-playback-completed")&&core.includes("onEnd:meta=>{if(inPracticeMode()){markPracticeLineHeard(d,idx);render()}"),
  recognitionConfirmedSpeaking:speakingCoach.includes("russian:speaking-recording-result")&&speakingCoach.includes('recognitionConfirmed:true'),
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

const runtimeReadiness={
  learnerFacingVocabularyTranslationBlocked:
    visualRuntime.includes("RUSSIAN_VISUAL_VOCABULARY_RUNTIME_V1")&&
    !visualRuntime.includes('meaning_vi')&&!visualRuntime.includes('translation_vi')&&
    core.includes('RussianVisualVocabularyRuntime'),
  verifiedImageEnrichment:
    visualRuntime.includes("https://commons.wikimedia.org/w/api.php")&&
    visualRuntime.includes("upload\\.wikimedia\\.org")&&
    visualRuntime.includes('scoreCommonsPage'),
  explicitCursiveVectorRuntime:
    cursiveGlyphs.includes('RUSSIAN_CURSIVE_GLYPH_SHAPES_V2')&&
    cursiveGlyphs.includes('function glyphCoverage(){return Object.keys(UPPER).length+Object.keys(LOWER).length;}'),
  dialogueTranslationFreeRuntime:
    dialogueScaffold.includes('RUSSIAN_DIALOGUE_SCAFFOLD_V1')&&!dialogueScaffold.includes('vi_turns'),
  oralFirstDefault:core.includes("learnTab:'practice'"),
  russianTtsRuntime:runtimeTtsContractReady,
  playbackConfirmedListening:speakingStats.playbackCompletionEvidence,
  recognitionConfirmedSpeaking:speakingStats.recognitionConfirmedSpeaking
};

const stages=arr(curriculum?.stages).map(x=>({id:x.id,title:x.title,goal:x.goal}));
const sourceGaps={
  legacyVietnameseFieldsPresent:vocabStats.withAnyLegacyViField>0,
  concreteVisualCorpusIncomplete:count(vocab,x=>has(x,['image','image_url','picture','illustration','illustration_url']))<vocab.length,
  sourceSpeakingAudioAssetsIncomplete:speakingStats.withSourceAudioAssets<speakingStats.total,
  cursiveSourceTextNotDistinct:handwritingStats.alphabetRows<33||handwritingStats.cursiveTextDifferentFromPrint<33,
  legacyDialogueHideStatePresent:codeDebt.dialogueHideViState
};
const unresolvedRuntimeGaps={
  learnerFacingVietnameseVocabularyMeaning:!runtimeReadiness.learnerFacingVocabularyTranslationBlocked,
  verifiedVisualEnrichmentMissing:!runtimeReadiness.verifiedImageEnrichment,
  cursiveRuntimeProofMissing:!runtimeReadiness.explicitCursiveVectorRuntime,
  dialogueTranslationRuntimePresent:!runtimeReadiness.dialogueTranslationFreeRuntime,
  defaultLearningRouteNotOralFirst:!runtimeReadiness.oralFirstDefault,
  russianTtsRuntimeMissing:!runtimeReadiness.russianTtsRuntime,
  playbackConfirmedListeningMissing:!runtimeReadiness.playbackConfirmedListening,
  recognitionConfirmedSpeakingMissing:!runtimeReadiness.recognitionConfirmedSpeaking,
  referenceUiPriorityNeedsReorder:codeDebt.referenceUiVocabBeforeListening
};
const result={
  schema:'RUSSIAN_LEARNING_BASELINE_AUDIT_V1',
  vocab:vocabStats,
  handwriting:handwritingStats,
  speaking:speakingStats,
  lessons:{total:lessons.length},
  curriculum:{stages},
  codeDebt,
  sourceGaps,
  runtimeReadiness,
  targetGaps:unresolvedRuntimeGaps
};

console.log('RUSSIAN_LEARNING_BASELINE_AUDIT=PASS');
console.log(JSON.stringify(result,null,2));
