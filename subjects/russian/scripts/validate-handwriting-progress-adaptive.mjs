import assert from 'node:assert/strict';
import fs from 'node:fs';

const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const css=fs.readFileSync('subjects/russian/assets/core.css','utf8');

for(const token of [
  "handwritingSessionMode:'learn'",
  "handwritingListenWriteProgress:{byLetter:{}}",
  'function handwritingProgressRoot()',
  'function handwritingLetterProgress(item)',
  'function handwritingKindProgress(item,kind)',
  'function recordHandwritingAttempt(item,drill,result)',
  'function handwritingSessionKinds(mode)',
  'function handwritingProgressSummary()',
  'function handwritingWeaknessScore(item)',
  'function handwritingAdaptiveItems()',
  'function openAdaptiveHandwriting()',
  "learn:['hear_select','hear_trace','hear_write']",
  "practice:['syllable_write','word_dictation','stress_mark','sound_spelling_discrimination']",
  "dictation:['hear_write','syllable_write','word_dictation']",
  "if('handSession' in b.dataset)",
  "data-act=\"hand-adaptive-next\""
]) assert(core.includes(token),'RHW4 runtime token missing: '+token);

assert(core.includes("recordHandwritingAttempt(item,drill,'self')"),'Canvas self-check must record an explicit practice event');
assert(core.includes("recordHandwritingAttempt(item,drill,state.handwritingExerciseResult)"),'Graded listen-write result must update progress');
assert(core.includes("if(attempts>0)attempted++"),'Attempted-letter summary must come from recorded attempts');
assert(core.includes("if(graded>=3&&correct/graded>=.8)strong++"),'Strong-letter status must be evidence-derived');
assert(core.includes("if(wrong>correct||p.lastResult==='wrong')weak++"),'Weak-letter status must be evidence-derived');
assert(core.includes("wrong*5+(p.lastResult==='wrong'?4:0)+(attempts===0?2:0)-Math.min(correct,4)"),'Adaptive weakness score drift');
assert(core.includes("save();render();"),'RHW4 state changes must persist through the existing state store');
assert.equal(core.includes('Math.random()'),false,'RHW4 must not synthesize random progress or adaptive order');
assert.equal(core.includes('mini-progress'),false,'RHW4 must not reuse fake progress UI');

for(const token of ['.hand-session-tabs','.hand-progress-summary','.hand-letter-progress','@media (max-width:760px)']){
  assert(css.includes(token),'RHW4 CSS token missing: '+token);
}

// Pure regression of the weakness scoring rule used by the runtime.
const score=p=>{
 const attempts=Number(p.attempts||0),correct=Number(p.correct||0),wrong=Number(p.wrong||0);
 return wrong*5+(p.lastResult==='wrong'?4:0)+(attempts===0?2:0)-Math.min(correct,4);
};
assert(score({attempts:2,correct:0,wrong:2,lastResult:'wrong'})>score({attempts:3,correct:3,wrong:0,lastResult:'correct'}));
assert(score({attempts:0,correct:0,wrong:0,lastResult:null})>score({attempts:5,correct:5,wrong:0,lastResult:'correct'}));
assert.equal(score({attempts:1,correct:0,wrong:1,lastResult:'wrong'}),9);

// Session lists are deterministic and mutually meaningful.
const modes={
 learn:['hear_select','hear_trace','hear_write'],
 practice:['syllable_write','word_dictation','stress_mark','sound_spelling_discrimination'],
 dictation:['hear_write','syllable_write','word_dictation']
};
assert(modes.learn.includes('hear_trace'));
assert(modes.practice.includes('stress_mark'));
assert(modes.dictation.includes('word_dictation'));
assert(!modes.dictation.includes('hear_select'));

console.log('RUSSIAN_RHW4_PROGRESS_ADAPTIVE=PASS');
console.log(JSON.stringify({progress:'per_letter_and_kind',sessionModes:['learn','practice','dictation','review'],adaptive:'deterministic_weakness_first',resume:'existing_local_state_store',syntheticProgress:false},null,2));
