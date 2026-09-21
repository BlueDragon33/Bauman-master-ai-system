import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const data=read('subjects/russian/data/handwriting-listen-write.json');
const schema=read('subjects/russian/data/handwriting-listen-write-item.schema.json');
const rules=read('subjects/russian/data/handwriting-listen-write-rules.json');
const handwriting=read('subjects/russian/data/handwriting.json');
const adapter=fs.readFileSync('subjects/russian/assets/subject-adapter.js','utf8');
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const css=fs.readFileSync('subjects/russian/assets/core.css','utf8');

assert.equal(data.length,33,'RHW2 pronunciation dataset must cover all 33 letters');
assert.equal(new Set(data.map(x=>x.id)).size,33,'Duplicate RHW2 item id');
assert.equal(new Set(data.map(x=>x.handwritingId)).size,33,'Duplicate RHW2 handwriting binding');

const alphabet=handwriting.filter(x=>x.mode==='alphabet');
assert.equal(alphabet.length,33,'Alphabet baseline drift');
for(let i=0;i<33;i++){
 const row=data[i], base=alphabet[i];
 assert.equal(row.handwritingId,base.id,'RHW2 binding drift at '+base.id);
 assert.equal(row.id,'RHW_AZ_'+String(i+1).padStart(2,'0'),'RHW2 id sequence drift');
 assert.equal(typeof row.letter,'string');
 assert.equal(typeof row.letterNameText,'string');
 assert(row.letterNameText.length>0,'Missing letter name: '+row.id);
 assert(schema.properties.soundKind.enum.includes(row.soundKind),'Invalid sound kind: '+row.id);
 assert(Array.isArray(row.soundExamples)&&row.soundExamples.length>=1&&row.soundExamples.length<=4,'Invalid examples: '+row.id);
 assert(Array.isArray(row.drills)&&row.drills.length>=1,'Missing drills: '+row.id);
 for(const ex of row.soundExamples){
   assert.equal(typeof ex.text,'string');
   assert(ex.text.length>0,'Empty sound example: '+row.id);
   assert(['letter_name','syllable','word','context'].includes(ex.kind),'Invalid example kind: '+row.id);
 }
 for(const drill of row.drills){
   assert(schema.properties.drills.items.properties.kind.enum.includes(drill.kind),'Invalid drill kind: '+row.id);
   assert.equal(typeof drill.audioText,'string');
   assert(drill.audioText.length>0,'Empty audio text: '+row.id);
   assert.equal(typeof drill.answer,'string');
   assert(drill.answer.length>0,'Empty answer: '+row.id);
 }
}

for(const sign of ['Ъ','Ь']){
 const row=data.find(x=>x.letter===sign);
 assert(row,'Missing sign '+sign);
 assert.equal(row.soundKind,'sign',sign+' must be a sign');
 assert(row.soundExamples.every(x=>x.kind==='context'),sign+' must use context examples only');
 assert(row.drills.every(x=>x.kind!=='syllable_write'),sign+' must not synthesize a syllable drill');
 assert.equal(rules.signLetters[sign].independentPhoneme,false);
}
for(const letter of ['Е','Ё','Ю','Я']){
 const row=data.find(x=>x.letter===letter);
 assert(row&&row.soundExamples.length>=2,letter+' needs contextual examples');
 assert(row.soundExamples.every(x=>['context','word'].includes(x.kind)),letter+' must not be taught as one fixed syllable');
}
assert.equal(data.find(x=>x.letter==='Ё').soundExamples.some(x=>x.text.includes('ё')),true,'Ё examples must preserve ё');

for(const token of [
 "'handwriting-listen-write'",
 "getHandwritingListenWrite(db)",
 "function getHandwritingListenWrite()",
 "function handwritingListenWriteFor(item)",
 "function handwritingSpeechAvailable()",
 "function handwritingAudioTarget(item",
 "function speakHandwriting(item",
 "data-act=\"hand-speak-name\"",
 "data-act=\"hand-speak-example\"",
 "data-act=\"hand-speak-example-slow\""
]) assert(core.includes(token)||adapter.includes(token),'Missing RHW2 runtime token: '+token);

assert(adapter.includes("path:'data/handwriting-listen-write.json'"),'Adapter does not register RHW2 dataset');
assert(adapter.includes('plannedCount:33'),'Adapter planned count must be 33');
assert(core.includes("u.lang=A.speech?.lang||'ru-RU'"),'Russian TTS locale fallback missing');
assert(core.includes("slow?.62:.85"),'Normal/slow playback rate binding missing');
assert(core.includes("speechSynthesis.cancel()"),'Rapid playback must cancel prior utterance');
assert(core.includes("Bạn vẫn có thể tiếp tục luyện viết"),'Speech-unavailable writing fallback missing');
assert(core.includes("data-hand-audio"),'Playing-state marker missing');
assert(css.includes('.hand-listen-write-card'),'RHW2 audio UI styles missing');
assert(css.includes('@media (max-width:760px)'),'RHW2 mobile layout missing');
assert(css.includes('prefers-reduced-motion'),'RHW2 reduced-motion handling missing');

// New runtime must remain self-contained and not fetch external audio.
assert.equal(/https?:\/\//.test(data.map(x=>JSON.stringify(x)).join('')),false,'RHW2 dataset gained external network dependency');

console.log('RUSSIAN_RHW2_HANDWRITING_PRONUNCIATION=PASS');
console.log(JSON.stringify({letters:data.length,signs:['Ъ','Ь'],contextual:['Е','Ё','Ю','Я'],normalRate:.85,slowRate:.62,selfContained:true},null,2));
