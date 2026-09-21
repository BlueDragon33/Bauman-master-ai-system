import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=p=>fs.readFileSync(p,'utf8');
const schema=JSON.parse(read('subjects/russian/data/listen-write-lesson.schema.json'));
const fixtures=JSON.parse(read('subjects/russian/data/listen-write-fixtures.json'));
const factorySource=read('subjects/russian/assets/listen-write-factory.js');
const core=read('subjects/russian/assets/core.js');
const index=read('subjects/russian/index.html');
const sw=read('subjects/russian/sw.js');

const sandbox={};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(factorySource,sandbox,{filename:'listen-write-factory.js'});
const F=sandbox.RussianListenWriteFactory;
assert(F,'RHW6 factory did not attach to globalThis');

assert.equal(schema.$id,'RUSSIAN_LISTEN_WRITE_LESSON_V1');
assert.equal(F.schema,schema.$id);
assert.equal(F.version,'RHW6_FACTORY_V1');
assert.deepEqual(Array.from(F.contentTypes),['letter','syllable','word','phrase','sentence','dictation']);
assert.deepEqual(Array.from(F.drillKinds),['hear_select','hear_trace','hear_write','syllable_write','word_dictation','stress_mark','sound_spelling_discrimination']);

assert.equal(fixtures.length,2,'RHW6 requires exactly two acceptance fixtures');
assert(fixtures.every(x=>x.lessonId.startsWith('RHW6_FIXTURE_')),'RHW6 fixtures must remain isolated from production lesson ids');
assert(fixtures.every(x=>x.items.every(i=>i.contentType!=='letter')),'RHW6 acceptance fixtures must be non-alphabet');
for(const lesson of fixtures){
  const result=F.validateLesson(lesson);
  assert.equal(result.ok,true,'Valid RHW6 fixture rejected: '+result.errors.join('; '));
  assert.equal(F.assertLesson(lesson),lesson);
}

// Word fixture: same generic factory must play, score and render.
{
  const lesson=fixtures.find(x=>x.id==='LW_FIXTURE_WORD');
  const model=F.exerciseModel(lesson,0,0,'practice');
  assert.equal(model.contentType,'word');
  assert.equal(model.handwritingSample,'мама');
  assert.equal(model.drill.kind,'word_dictation');
  assert(Object.isFrozen(model),'RHW6 exercise model must be immutable');

  const normal=F.playbackRequest(model.drill);
  const slow=F.playbackRequest(model.drill,{slow:true});
  assert.deepEqual(JSON.parse(JSON.stringify(normal)),{text:'мама',lang:'ru-RU',rate:0.85});
  assert.deepEqual(JSON.parse(JSON.stringify(slow)),{text:'мама',lang:'ru-RU',rate:0.62});

  let spoken=null;
  F.play(model.drill,(text,rate,meta)=>{spoken={text,rate,meta};return 'PLAYED';},{slow:true});
  assert.equal(spoken.text,'мама');
  assert.equal(spoken.rate,0.62);
  assert.equal(spoken.meta.lang,'ru-RU');

  assert.equal(F.score(model.drill,' МАМА ').correct,true);
  assert.equal(F.score(model.drill,'мамо').correct,false);
  const html=F.renderExercise(model,{attempted:false});
  assert(html.includes('data-lw-kind="word_dictation"'));
  assert(html.includes('Đáp án được khóa đến sau lần làm đầu tiên.'));
  assert(!html.includes('Đáp án: <strong'));
}

// Sentence fixture: same renderer/scorer, no special runtime code.
{
  const lesson=fixtures.find(x=>x.id==='LW_FIXTURE_SENTENCE');
  const model=F.exerciseModel(lesson,0,0,'dictation');
  assert.equal(model.contentType,'sentence');
  assert.equal(model.drill.kind,'word_dictation');
  assert.equal(F.score(model.drill,'Меня зовут Нам.').correct,true);
  const html=F.renderExercise(model,{attempted:true,input:'Меня зовут Нам.',result:'correct'});
  assert(html.includes('listen-write-factory-feedback correct'));
  assert(html.includes('Меня зовут Нам.'));
}

// Orthography must preserve Ё/Е distinction and Unicode stress.
assert.equal(F.normalizeAnswer(' Ё '),'ё');
assert.notEqual(F.normalizeAnswer('ё'),F.normalizeAnswer('е'));
assert.equal(F.normalizeAnswer('ма\u0301ма'),F.normalizeAnswer('ма́ма'));
assert.notEqual(F.normalizeAnswer('ма́ма'),F.normalizeAnswer('мама́'));

// Canvas-only exercise is intentionally self-assessed, not OCR-guessed.
{
  const lesson=structuredClone(fixtures[0]);
  lesson.items[0].drills=[{kind:'hear_trace',audioText:'мама',answer:'мама',choices:[],hint:null,stress:null}];
  assert.equal(F.validateLesson(lesson).ok,true);
  const score=F.score(lesson.items[0].drills[0],'anything');
  assert.equal(score.gradable,false);
  assert.equal(score.correct,null);
}

// S31 authoring failures must fail closed.
const invalidCases=[];
{
  const x=structuredClone(fixtures[0]); delete x.items[0].handwritingSample; invalidCases.push(['missing handwriting sample',x]);
}
{
  const x=structuredClone(fixtures[0]); x.items[0].drills[0].audioText=''; invalidCases.push(['missing audio target',x]);
}
{
  const x=structuredClone(fixtures[0]); x.items[0].drills[0].answer=''; invalidCases.push(['missing answer',x]);
}
{
  const x=structuredClone(fixtures[0]); x.items[0].contentType='video'; invalidCases.push(['unsupported content type',x]);
}
{
  const x=structuredClone(fixtures[0]); x.items[0].drills[0].kind='ai_guess'; invalidCases.push(['unsupported drill kind',x]);
}
{
  const x=structuredClone(fixtures[0]);
  x.items[0].drills=[{kind:'stress_mark',audioText:'мама',answer:'ма́ма',choices:['ма́ма','мама́'],hint:null,stress:null}];
  invalidCases.push(['missing explicit stress',x]);
}
{
  const x=structuredClone(fixtures[0]); x.extraAuthority=true; invalidCases.push(['unsupported lesson field',x]);
}
for(const [label,lesson] of invalidCases){
  const result=F.validateLesson(lesson);
  assert.equal(result.ok,false,'RHW6 fail-closed case unexpectedly accepted: '+label);
  assert.throws(()=>F.assertLesson(lesson),/ListenWriteLesson invalid/);
}

// Factory stays independent from the accepted alphabet implementation.
assert.equal(factorySource.includes('HW_AZ_'),false,'RHW6 factory hard-coded alphabet ids');
assert.equal(factorySource.includes('handwriting.json'),false,'RHW6 factory depends on alphabet source file');
if(core.includes('RussianListenWriteFactory')){
  for(const token of ['window.RussianListenWriteFactory.exerciseModel','window.RussianListenWriteFactory.play','window.RussianListenWriteFactory.score','window.RussianListenWriteFactory.renderExercise']){
    assert(core.includes(token),'RHW7 binding must reuse RHW6 factory API: '+token);
  }
  assert.equal(core.includes('function normalizeAnswer('),false,'RHW7 binding must not duplicate factory normalizer');
  assert.equal(core.includes('function validateLesson('),false,'RHW7 binding must not duplicate factory validator');
}
assert.equal(core.includes('HW_AZ_01')&&core.includes('RussianListenWriteFactory'),false,'Factory binding must not hard-code alphabet ids into core');
assert(index.includes('assets/listen-write-factory.js'),'RHW6 factory asset missing from Russian page');
assert(sw.includes('./assets/listen-write-factory.js'),'RHW6 factory missing from offline shell');

console.log('RUSSIAN_RHW6_LISTEN_WRITE_FACTORY=PASS');
console.log(JSON.stringify({
  fixtures:fixtures.map(x=>({id:x.id,contentTypes:x.items.map(i=>i.contentType)})),
  schema:F.schema,
  player:'speaker_adapter',
  scorer:'deterministic_unicode',
  renderer:'generic_html',
  alphabetCoreForked:false,
  failClosedCases:invalidCases.length
},null,2));
