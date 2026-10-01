import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const target=read('subjects/russian/docs/p2/RUSSIAN_R01_R26_TARGET_CURRICULUM.json');
const model=read('subjects/russian/docs/ru02/RUSSIAN_RU02_CURRICULUM_CANONICAL_MODEL.json');
const owners=read('subjects/russian/docs/ru02/RUSSIAN_RU02_CANONICAL_OWNER_REGISTRY.json');
const handoff=read('subjects/russian/docs/ru02/RU03_RU04_INPUT_CONTRACT.json');
const fail=m=>{throw new Error(m)};
const modules=target.modules||[];
if(modules.length!==26) fail(`expected 26 modules, got ${modules.length}`);
const ids=modules.map(x=>x.id);
const expected=Array.from({length:26},(_,i)=>`R${String(i+1).padStart(2,'0')}`);
if(JSON.stringify(ids)!==JSON.stringify(expected)) fail('R01-R26 identity drift');
let units=0,micros=0; for(const m of modules){for(const u of (m.units||[])){units++; micros+=(u.microLessons||[]).length;}}
if(units!==243||micros!==729) fail(`target topology drift units=${units} micros=${micros}`);
function assertDag(nodes,edges,name){
 const set=new Set(nodes), out=new Map(nodes.map(n=>[n,[]]));
 for(const [a,b] of edges){if(!set.has(a)||!set.has(b)) fail(`${name} dangling edge ${a}->${b}`); out.get(a).push(b);}
 const temp=new Set(),perm=new Set();
 function visit(n){if(perm.has(n))return;if(temp.has(n))fail(`${name} cycle at ${n}`);temp.add(n);for(const x of out.get(n))visit(x);temp.delete(n);perm.add(n)}
 for(const n of nodes)visit(n);
}
const comps=model.competencies||[];
assertDag(comps.map(x=>x.id), comps.flatMap(x=>(x.requires||[]).map(r=>[r,x.id])), 'competency graph');
assertDag(expected,(model.macroPrerequisites||[]).map(e=>[e.from,e.to]),'macro prerequisite graph');
const entityTypes=owners.owners.map(x=>x[0]);
if(new Set(entityTypes).size!==entityTypes.length) fail('duplicate canonical entity owner');
if(owners.runtimeMigrationApplied!==false) fail('RU02 must not apply runtime migration');
if(handoff.state!=='PASS') fail('handoff not PASS');
console.log(JSON.stringify({ok:true,modules:26,units,microLessons:micros,competencies:comps.length,owners:entityTypes.length}));
