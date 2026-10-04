import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const root='subjects/programming';

assert.ok(fs.existsSync(root), 'Current Python scope must resolve to subjects/programming for PYTHON01 baseline');
assert.ok(!fs.existsSync('subjects/python'), 'PYTHON01 baseline changed: a subjects/python runtime now exists and requires reconciliation');

const manifest=json(root+'/subject-manifest.json');
const curriculum=json(root+'/data/curriculum.json');
const lessons=json(root+'/data/lessons.json');
const exercises=json(root+'/data/exercises.json');
const simulations=json(root+'/data/simulations.json');
const bank=json(root+'/data/tests.json');
const questions=bank.questions||[];

assert.equal(manifest.id,'programming');
assert.equal((curriculum.stages||[]).length,6);
assert.equal((curriculum.modules||[]).length,6);
assert.equal(lessons.length,48);
assert.equal(exercises.length,144);
assert.equal(simulations.length,96);
assert.equal(questions.length,384);
assert.ok(questions.every(q=>q.questionType==='multiple_choice'),'PYTHON01 baseline changed: non-MCQ assessment exists; revalidate PYTHON03 implications');

const uniqueQuestionText=new Set(questions.map(q=>String(q.question||'')));
assert.equal(uniqueQuestionText.size,192,'Test-bank uniqueness changed; reconcile inventory before continuing');

const signatures=new Map();
for(const q of questions){
  const sig=JSON.stringify([q.lessonId,q.level,q.question,q.answer]);
  signatures.set(sig,(signatures.get(sig)||0)+1);
}
assert.equal([...signatures.values()].filter(n=>n>1).length,192,'Exact duplicate-group count changed');

assert.equal(read(root+'/data/grammar.json'),read(root+'/data/grammar-path.json'),'Known grammar duplicate diverged; ownership must be reconciled intentionally');

const runtime=[read(root+'/assets/core.js'),read(root+'/assets/subject-adapter.js'),read(root+'/index.html'),read(root+'/editor.html')].join('\n').toLowerCase();
for(const marker of ['pyodide','skulpt','brython'])assert.equal(runtime.includes(marker),false,'Python execution provider appeared; PYTHON01/PYTHON04 baseline must be revalidated');
assert.equal(/\bnew\s+function\s*\(/i.test(runtime),false,'Ungoverned Function constructor found');
assert.equal(/\beval\s*\(/i.test(runtime),false,'Ungoverned eval runner found');

const core=read(root+'/assets/core.js');
assert.match(core,/function\s+aiGenerate\s*\(/,'Local AI-template generator missing; AI reality changed');
assert.match(core,/function\s+renderAiMentor\s*\(/,'AI Mentor surface missing');
assert.doesNotMatch(core,/api\.openai\.com|anthropic\.com|generativelanguage\.googleapis\.com/i,'External model provider appeared; PYTHON04 AI authority must be revalidated');

const editor=read(root+'/editor.html');
assert.doesNotMatch(editor,/<textarea|contenteditable|monaco|codemirror/i,'Current editor baseline changed into an editing surface');

console.log('PYTHON_P1_FORENSIC_STATIC=PASS');
