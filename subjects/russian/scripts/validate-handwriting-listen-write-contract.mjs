import assert from 'node:assert/strict';
import fs from 'node:fs';

const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const contract=readJson('subjects/russian/data/handwriting-listen-write-contract.json');
const schema=readJson('subjects/russian/data/handwriting-listen-write-item.schema.json');
const rules=readJson('subjects/russian/data/handwriting-listen-write-rules.json');
const handwriting=readJson('subjects/russian/data/handwriting.json');
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');

assert.equal(contract.schema,'RUSSIAN_HANDWRITING_LISTEN_WRITE_CONTRACT_V1');
assert.equal(contract.version,'1.0.0-rhw1');
assert.equal(contract.sourceData,'subjects/russian/data/handwriting.json');
assert.equal(contract.scope.requiredAlphabetCount,33);
assert.deepEqual(contract.scope.futureModes,['word','sentence','academic']);
assert.equal(contract.playback.language,'ru-RU');
assert(contract.playback.normalRate>contract.playback.slowRate);
assert.equal(contract.playback.cancelPreviousBeforePlay,true);
assert.equal(contract.playback.networkRequired,false);
assert.equal(contract.playback.writingAvailableWhenSpeechUnavailable,true);
assert.equal(contract.pronunciation.isolatedPhonemeTtsRequired,false);
assert.equal(contract.pronunciation.preferPlayableRussianText,true);

const expectedKinds=['hear_select','hear_trace','hear_write','syllable_write','word_dictation','stress_mark','sound_spelling_discrimination'];
assert.deepEqual(contract.exerciseKinds,expectedKinds);
assert.equal(contract.feedbackPolicy.revealBeforeAttempt,false);
assert.equal(contract.feedbackPolicy.retryAllowed,true);
assert.equal(contract.feedbackPolicy.writingCanvasAlwaysAvailable,true);
assert.equal(contract.feedbackPolicy.storeMistakesForAdaptiveReview,true);
assert.equal(contract.contentPolicy.imageFirstVocabularyKeepsVietnameseTranslationOut,true);

assert.equal(schema.$id,'RUSSIAN_HANDWRITING_LISTEN_WRITE_ITEM_V1');
assert.equal(schema.additionalProperties,false);
assert.deepEqual(schema.required,['id','handwritingId','letter','letterNameText','soundKind','soundExamples','drills']);
assert.deepEqual(schema.properties.soundKind.enum,['vowel','consonant','sign']);
assert.deepEqual(schema.properties.drills.items.properties.kind.enum,expectedKinds);

const alphabet=handwriting.filter(x=>x.mode==='alphabet');
assert.equal(alphabet.length,33,'Russian alphabet baseline must contain exactly 33 items');
for(let i=0;i<33;i++){
  const item=alphabet[i];
  assert.equal(item.id,'HW_AZ_'+String(i+1).padStart(2,'0'),'Alphabet sequence drift at '+(i+1));
  for(const key of ['print','cursive','copy'])assert.equal(typeof item[key],'string','Missing '+key+' for '+item.id);
  assert(Array.isArray(item.strokes)&&item.strokes.length>0,'Missing alphabet stroke guidance for '+item.id);
}
assert.equal(handwriting.length>=48,true,'Handwriting expansion baseline unexpectedly shrank');

assert.equal(rules.schema,'RUSSIAN_HANDWRITING_LISTEN_WRITE_RULES_V1');
for(const sign of ['Ъ','Ь']){
  assert.equal(rules.signLetters[sign].independentPhoneme,false,sign+' must not expose an invented independent phoneme');
  assert(rules.signLetters[sign].letterNameText.length>0,sign+' must keep a playable letter name');
}
for(const v of ['Е','Ё','Ю','Я'])assert.equal(rules.contextualVowels[v].requiresContextExamples,true,v+' must use contextual sound examples');
assert.equal(rules.contextualVowels['Ё'].note.includes('two dots'),true,'Ё orthography preservation rule missing');
assert.equal(rules.hardSoftPolicy.consonantsUseContext,true);
assert.equal(rules.hardSoftPolicy.doNotTeachOneTtsUtteranceAsUniversalPhoneme,true);
assert.equal(rules.stressPolicy.stressAnswerMustBeExplicitWhenExerciseKindIsStressMark,true);

// RHW1 must not silently wire an incomplete contract into the visible runtime.
for(const token of ['handwriting-listen-write-contract.json','handwriting-listen-write-item.schema.json','handwriting-listen-write-rules.json']){
  assert.equal(core.includes(token),false,'RHW1 contract leaked into runtime before RHW2: '+token);
}
// Existing speech primitive must remain available for RHW2 reuse.
assert(/function speak\(text,rate=\.85(?:,callbacks=\{\})?\)/.test(core), 'Existing Russian speech helper missing or incompatibly changed');
assert(core.includes("new SpeechSynthesisUtterance(text)"), 'SpeechSynthesis primitive missing');
assert(core.includes("u.lang=A.speech?.lang||'ru-RU'"), 'Russian speech locale fallback missing');

console.log('RUSSIAN_RHW1_LISTEN_WRITE_CONTRACT=PASS');
console.log(JSON.stringify({alphabet:alphabet.length,handwritingItems:handwriting.length,exerciseKinds:expectedKinds.length,contractFilesRuntimeWired:false,specialSigns:['Ъ','Ь'],contextualVowels:['Е','Ё','Ю','Я']},null,2));
