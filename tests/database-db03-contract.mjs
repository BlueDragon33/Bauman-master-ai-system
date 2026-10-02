import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const errors=read('subjects/database/docs/db03/DB_ERROR_TAXONOMY.json');
const correct=read('subjects/database/docs/db03/DB_GOLDEN_CORRECT_QUERIES.json');
const wrong=read('subjects/database/docs/db03/DB_GOLDEN_WRONG_QUERIES.json');
const fixtures=read('subjects/database/docs/db03/DB_PUBLIC_FIXTURE_CATALOG.json');
const state=read('prompts/subjects/database/PROJECT_STATE.json');

const codes=new Set(errors.errors.map(x=>x.code));
assert.equal(codes.size,errors.errors.length);
for(const x of ['MODEL_ERROR','KEY_CONSTRAINT_ERROR','JOIN_ERROR','CARDINALITY_ERROR','NULL_ERROR','DUPLICATE_ERROR','ORDER_ERROR','AGGREGATION_ERROR','SUBQUERY_SCOPE_ERROR','NORMALIZATION_ERROR','TRANSACTION_ERROR','ISOLATION_ERROR','INDEX_SELECTION_ERROR','PLAN_INTERPRETATION_ERROR','DIALECT_ERROR','SECURITY_ERROR']) assert(codes.has(x),'missing '+x);

const fixtureIds=new Set(fixtures.fixtures.map(x=>x.id));
assert.equal(fixtureIds.size,fixtures.fixtures.length);
const taskIds=new Set();
for(const task of correct.tasks){
  assert(!taskIds.has(task.taskId));
  taskIds.add(task.taskId);
  assert(task.alternatives.length>=2,task.taskId+' must have >=2 valid alternatives');
  assert(task.semantics.columns.length>0);
  assert(['preserve-bag','distinct-required','task-defined'].includes(task.semantics.duplicatePolicy));
  assert(['unordered','ordered-by-contract'].includes(task.semantics.orderingPolicy));
  assert.equal(task.semantics.nullPolicy,'sql-three-valued');
  for(const f of task.discriminatingFixtures) assert(fixtureIds.has(f),task.taskId+' missing fixture '+f);
}
for(const item of wrong.cases){
  assert(taskIds.has(item.taskId),item.id+' unknown task');
  assert(item.expectedErrors.length>0);
  for(const code of item.expectedErrors) assert(codes.has(code),item.id+' unknown error '+code);
  assert(item.distinguishedBy.length>0,item.id+' no differentiating fixture');
  for(const f of item.distinguishedBy) assert(fixtureIds.has(f),item.id+' missing '+f);
}

const key=row=>JSON.stringify(row.map(v=>v===null?['SQL_NULL']:[typeof v,String(v)]));
const multiset=rows=>{
  const m=new Map();
  for(const row of rows){const k=key(row);m.set(k,(m.get(k)||0)+1);}
  return [...m.entries()].sort(([a],[b])=>a.localeCompare(b));
};
const bagEq=(a,b)=>JSON.stringify(multiset(a))===JSON.stringify(multiset(b));
const setEq=(a,b)=>JSON.stringify([...new Set(a.map(key))].sort())===JSON.stringify([...new Set(b.map(key))].sort());

assert(bagEq([[1,'A'],[2,'B']],[[2,'B'],[1,'A']]),'unordered bag ignores incidental order');
assert(!bagEq([[1],[1]],[[1]]),'bag keeps multiplicity');
assert(setEq([[1],[1]],[[1]]),'set ignores multiplicity');
assert(!bagEq([[null]],[['NULL']]),'SQL NULL differs from text NULL');
assert(!bagEq([[0]],[[null]]),'SQL NULL differs from zero');

const wrongCodes=new Set(wrong.cases.flatMap(x=>x.expectedErrors));
for(const x of ['JOIN_ERROR','CARDINALITY_ERROR','NULL_ERROR','DUPLICATE_ERROR','ORDER_ERROR','AGGREGATION_ERROR','SUBQUERY_SCOPE_ERROR']) assert(wrongCodes.has(x),'golden library lacks '+x);
for(const x of ['db.fx.unmatched-parent','db.fx.multi-child','db.fx.nullable-column','db.fx.null-foreign-key','db.fx.boundary-100','db.fx.duplicates','db.fx.tie-order']) assert(fixtureIds.has(x),'fixture catalog lacks '+x);

assert(state.completedModules.includes('DB03'),'DB03 must remain completed after downstream progress');
assert(['DB04','DB05','DB06'].includes(state.activeModule),'active module must not regress before DB04');
assert(!['DB01','DB02','DB03'].includes(state.activeModule),'DB03 contract test must tolerate valid downstream state');

console.log('DATABASE_DB03_CONTRACT_PASS');
console.log(JSON.stringify({tasks:correct.tasks.length,correctAlternatives:correct.tasks.reduce((n,x)=>n+x.alternatives.length,0),wrongQueries:wrong.cases.length,fixtures:fixtures.fixtures.length,taxonomy:errors.errors.length},null,2));
