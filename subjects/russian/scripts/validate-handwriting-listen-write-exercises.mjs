import assert from 'node:assert/strict';
import fs from 'node:fs';

const data=JSON.parse(fs.readFileSync('subjects/russian/data/handwriting-listen-write.json','utf8'));
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const css=fs.readFileSync('subjects/russian/assets/core.css','utf8');

assert.equal(data.length,33,'RHW3 must retain all 33 alphabet rows');
const allDrills=data.flatMap(row=>row.drills.map(drill=>({row,drill})));
const counts={};
for(const {drill} of allDrills)counts[drill.kind]=(counts[drill.kind]||0)+1;

for(const row of data){
  for(const kind of ['hear_select','hear_trace','hear_write']){
    assert(row.drills.some(d=>d.kind===kind),row.id+' missing '+kind);
  }
  const select=row.drills.find(d=>d.kind==='hear_select');
  assert(Array.isArray(select.choices)&&select.choices.length===3,row.id+' hear_select must expose 3 deterministic choices');
  assert(select.choices.includes(row.letter),row.id+' hear_select choices must include the answer');
  assert.equal(new Set(select.choices).size,3,row.id+' hear_select choices must be unique');
}
assert((counts.syllable_write||0)>0,'RHW3 syllable drill coverage missing');
assert((counts.word_dictation||0)>0,'RHW3 word dictation coverage missing');
assert.equal(counts.stress_mark,13,'RHW3 stress coverage drift');
assert.equal(counts.sound_spelling_discrimination,10,'RHW3 sound-spelling coverage drift');

for(const {row,drill} of allDrills.filter(x=>x.drill.kind==='stress_mark')){
  assert(Array.isArray(drill.choices)&&drill.choices.length>=2,row.id+' stress drill needs explicit choices');
  assert(drill.choices.includes(drill.answer),row.id+' stress answer must be an explicit choice');
  assert(/[\u0301]/u.test(drill.answer.normalize('NFD')),row.id+' stress answer must explicitly encode stress');
}
for(const sign of ['Ъ','Ь']){
  const row=data.find(x=>x.letter===sign);
  assert(row,'Missing '+sign);
  assert(row.drills.every(d=>d.kind!=='syllable_write'),sign+' must not gain an isolated syllable drill');
  assert(row.drills.some(d=>d.kind==='word_dictation'),sign+' must remain contextual in dictation');
}

for(const token of [
 'handwritingExerciseIndex:0',
 'function handwritingExerciseList(item)',
 'function currentHandwritingExercise(item)',
 'function resetHandwritingExerciseResponse(resetIndex=false)',
 'function handwritingExerciseKindLabel(kind)',
 'function normalizeHandwritingAnswer(value)',
 'function handwritingExerciseUsesChoice(drill)',
 'function handwritingExerciseIsCanvasOnly(drill)',
 'function speakHandwritingExercise(item,slow=false)',
 'function evaluateHandwritingExercise(item)',
 'function moveHandwritingExercise(item,delta)',
 'function renderHandwritingExercise(item)',
 'data-act="hand-exercise-play"',
 'data-act="hand-exercise-check"',
 'data-act="hand-exercise-retry"',
 'data-act="hand-exercise-next"',
 "if('handChoice' in b.dataset)",
 "data-hand-exercise-input=\"1\""
]) assert(core.includes(token),'RHW3 runtime token missing: '+token);

assert(core.includes("Đáp án được khóa đến sau lần làm đầu tiên."),'RHW3 must hide answer before the first attempt');
assert(core.includes("state.handwritingExerciseAttempted=true"),'RHW3 attempt state missing');
assert(core.includes("state.handwritingExerciseReveal=true"),'RHW3 reveal-after-attempt state missing');
assert(core.includes("normalize('NFC')"),'RHW3 deterministic Unicode normalization missing');
const normStart=core.indexOf('function normalizeHandwritingAnswer(value)');
const normEnd=core.indexOf('function handwritingExerciseUsesChoice',normStart);
assert(normStart>=0&&normEnd>normStart,'RHW3 normalization function boundary missing');
const normSource=core.slice(normStart,normEnd);
assert.equal(normSource.includes(".replace(/ё/g,'е')"),false,'RHW3 must not collapse ё into е during answer validation');
assert(core.includes("state.handwritingExerciseResult=normalizeHandwritingAnswer(response)===normalizeHandwritingAnswer(drill.answer)?'correct':'wrong'"),'RHW3 deterministic correct/wrong comparison missing');
assert(core.includes("handwritingExerciseResult='self'"),'RHW3 canvas self-check state missing');
assert(css.includes('.hand-exercise-card'),'RHW3 exercise styling missing');
assert(css.includes('.hand-exercise-feedback.correct'),'RHW3 correct feedback styling missing');
assert(css.includes('.hand-exercise-feedback.wrong'),'RHW3 wrong feedback styling missing');

// Deterministic answer behavior: preserve Russian orthography and explicit stress.
const norm=v=>String(v??'').normalize('NFC').trim().toLocaleLowerCase('ru-RU').replace(/\s+/g,' ');
assert.equal(norm(' Ё '),'ё');
assert.notEqual(norm('ё'),norm('е'));
assert.equal(norm('ма\u0301ма'),norm('ма́ма'));
assert.notEqual(norm('ма́ма'),norm('мама́'));

console.log('RUSSIAN_RHW3_LISTEN_WRITE_EXERCISES=PASS');
console.log(JSON.stringify({letters:data.length,totalDrills:allDrills.length,counts,answerReveal:'after_attempt',orthographicYoPreserved:true,canvasRecognitionRequired:false},null,2));
