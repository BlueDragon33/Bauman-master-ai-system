import assert from 'node:assert/strict';
import fs from 'node:fs';

const lessons=JSON.parse(fs.readFileSync('subjects/russian/data/listen-write-lessons.json','utf8'));
const rules=JSON.parse(fs.readFileSync('subjects/russian/data/listen-write-level-rules.json','utf8'));
const sourceLessons=JSON.parse(fs.readFileSync('subjects/russian/data/lessons.json','utf8'));
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const factory=fs.readFileSync('subjects/russian/assets/listen-write-factory.js','utf8');
const css=fs.readFileSync('subjects/russian/assets/core.css','utf8');
const adapter=fs.readFileSync('subjects/russian/assets/subject-adapter.js','utf8');
const optimizer=fs.readFileSync('subjects/russian/assets/runtime-optimizer.js','utf8');
const guide=fs.readFileSync('subjects/russian/docs/RUSSIAN_LISTEN_WRITE_AUTHORING_GUIDE.md','utf8');

assert.equal(Array.isArray(lessons),true,'RHW7 lessons must be an array');
assert.equal(lessons.length,10,'RHW7 must bind R01-R10 in the first expansion');
assert.equal(new Set(lessons.map(x=>x.lessonId)).size,10,'Duplicate RHW7 lessonId');
assert.deepEqual(lessons.map(x=>x.lessonId),Array.from({length:10},(_,i)=>'R'+String(i+1).padStart(2,'0')),'RHW7 R01-R10 binding drift');

const sourceIds=new Set(sourceLessons.map(x=>String(x.id||x.lessonId||'')));
for(const lesson of lessons){
  assert(sourceIds.has(lesson.lessonId),'RHW7 binding references unknown source lesson '+lesson.lessonId);
  assert.equal(lesson.schema,'RUSSIAN_LISTEN_WRITE_LESSON_V1');
  assert(Array.isArray(lesson.items)&&lesson.items.length>=2,lesson.lessonId+' needs >=2 listen-write items');
  assert(['A0','A1','A2'].includes(lesson.level),lesson.lessonId+' invalid expansion level');
  for(const item of lesson.items){
    assert(['letter','syllable','word','phrase','sentence','dictation'].includes(item.contentType),item.id+' invalid content type');
    assert.equal(typeof item.handwritingSample,'string');
    assert(item.handwritingSample.trim(),item.id+' missing handwriting sample');
    assert(Array.isArray(item.drills)&&item.drills.length>0,item.id+' missing drills');
    for(const drill of item.drills){
      assert.equal(typeof drill.audioText,'string');
      assert(drill.audioText.trim(),item.id+' missing audioText');
      assert.equal(typeof drill.answer,'string');
      assert(drill.answer.trim(),item.id+' missing answer');
    }
  }
}

const sentenceItems=lessons.flatMap(x=>x.items).filter(x=>x.contentType==='sentence'||x.contentType==='dictation');
assert(sentenceItems.length>=10,'S34 sentence/dictation expansion coverage too low');
const wordPhraseItems=lessons.flatMap(x=>x.items).filter(x=>['word','phrase','syllable'].includes(x.contentType));
assert(wordPhraseItems.length>=3,'S33 word/phrase/syllable expansion coverage too low');

assert.equal(rules.schema,'RUSSIAN_LISTEN_WRITE_LEVEL_RULES_V1');
assert.deepEqual(rules.bands.map(x=>x.level),['A0','A1','A2']);
for(const band of rules.bands){
  for(const id of band.lessonIds){
    const lesson=lessons.find(x=>x.lessonId===id);
    assert(lesson,'Level rule references unknown lesson '+id);
    assert.equal(lesson.level,band.level,'Level rule mismatch for '+id);
    for(const item of lesson.items)assert(band.allowedContentTypes.includes(item.contentType),id+' content type violates '+band.level+' rule');
  }
  assert(['learn','practice','dictation'].includes(band.defaultSessionMode),'Invalid default mode for '+band.level);
}
assert.equal(rules.futurePrepPolicy.requireExplicitLessonBinding,true);
assert.equal(rules.futurePrepPolicy.dataOnlyExpansion,true);
assert.equal(rules.futurePrepPolicy.javascriptChangeRequiredForNewLesson,false);
assert.equal(rules.futurePrepPolicy.fallbackWhenNoBinding,'hide_listen_write_panel');

for(const token of [
  "function getListenWriteLessons()",
  "function getListenWriteLevelRules()",
  "function listenWriteLessonFor(lessonId)",
  "function listenWriteRuleFor(level)",
  "function ensureLessonListenWriteState(lesson)",
  "function lessonListenWriteModel(lesson)",
  "window.RussianListenWriteFactory.exerciseModel",
  "window.RussianListenWriteFactory.play",
  "window.RussianListenWriteFactory.score",
  "window.RussianListenWriteFactory.renderExercise",
  "function renderLessonListenWritePanel(lessonId)",
  "if(!lesson||!window.RussianListenWriteFactory)return ''",
  "data-lw-lesson=",
  "data-lw-mode=",
  "data-lw-nav=",
  "if(b.dataset.lwAct)"
]) assert(core.includes(token),'RHW7 runtime binding missing: '+token);
assert(factory.includes('data-lw-act="play"'),'RHW6 factory renderer missing play action');
assert(factory.includes('data-lw-act="play-slow"'),'RHW6 factory renderer missing slow-play action');
assert(factory.includes('data-lw-act="check"'),'RHW6 factory renderer missing check action');

assert(indexOfFactoryLogic(core,'function normalizeAnswer')===-1,'RHW7 core must not duplicate factory normalizer');
assert(indexOfFactoryLogic(core,'function validateLesson')===-1,'RHW7 core must not duplicate factory validator');
assert(core.includes("renderLessonListenWritePanel(lesson?.id||lessonKey(lesson))"),'RHW7 lesson reader is not bound to current lesson');
assert(core.includes("const lesson=listenWriteLessonFor(activeLessonContext().id)"),'RHW7 actions must resolve the active lesson binding');
assert(factory.includes("RUSSIAN_LISTEN_WRITE_LESSON_V1"),'RHW6 factory schema missing');
assert(css.includes('.lesson-listen-write-panel'),'RHW7 lesson listen-write styles missing');
assert(css.includes('@media (max-width:760px)'),'RHW7 mobile styles missing');

assert(adapter.includes("'listen-write-lessons'"),'Adapter missing RHW7 lesson dataset');
assert(adapter.includes("'listen-write-level-rules'"),'Adapter missing RHW7 level rules');
assert(optimizer.includes("'listen-write-lessons'"),'Offline core missing RHW7 lesson dataset');
assert(optimizer.includes("'listen-write-level-rules'"),'Offline core missing RHW7 level rules');

const raw=JSON.stringify(lessons);
for(const forbidden of ['meaningVi','meaning_vi','translation_vi','dịch nghĩa','nghĩa tiếng việt','Vietnamese meaning']){
  assert.equal(raw.toLowerCase().includes(forbidden.toLowerCase()),false,'RHW7 listen-write data injected Vietnamese translation field/text: '+forbidden);
}

// Future expansion must be authorable by adding a valid lesson row and level binding only.
const prep=rules.futurePrepPolicy;
assert.equal(prep.stage,'prep');
assert.equal(prep.requireExplicitLevel,true);
assert.equal(prep.dataOnlyExpansion,true);
assert.equal(prep.javascriptChangeRequiredForNewLesson,false);
for(const token of [
  'Data-only Authoring Guide',
  'listen-write-lessons.json',
  'listen-write-level-rules.json',
  'Do **not** edit `core.js`',
  'Binding is exact by `lessonId`',
  'stress_mark',
  'Ъ',
  'Ь',
  'Е/Ё/Ю/Я',
  'validate-listen-write-factory.mjs',
  'validate-listen-write-expansion.mjs',
  'RHWx-Hy'
]) assert(guide.includes(token),'RHW7-H1 authoring guide missing required token: '+token);

function indexOfFactoryLogic(text,needle){return text.indexOf(needle)}

console.log('RUSSIAN_RHW7_EXPANSION_BINDING=PASS');
console.log(JSON.stringify({
  lessons:lessons.length,
  wordPhraseItems:wordPhraseItems.length,
  sentenceItems:sentenceItems.length,
  levels:rules.bands.map(x=>x.level),
  automaticBinding:'lessonId_exact',
  fallback:'hide_panel',
  factoryReuse:true,
  futureExpansion:'data_only',
  vietnameseTranslationInjected:false
},null,2));
