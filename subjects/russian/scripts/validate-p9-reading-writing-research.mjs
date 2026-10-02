import fs from 'node:fs';
const j=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const reading=j('subjects/russian/data/reading.json');
const perf=j('subjects/russian/data/performance-tasks.json');
const af=j('subjects/russian/data/academic-functions.json');
const tc=j('subjects/russian/data/technical-concepts.json');
const topo=j('subjects/russian/docs/p3/RUSSIAN_CANONICAL_OWNER_TOPOLOGY.json');
const ids=(a,k='id')=>new Set(a.map(x=>x[k]));
const afIds=ids(af.functions), tcIds=ids(tc.concepts);
if(reading.canonicalOwner!=='subjects/russian/data/reading.json') throw new Error('ReadingText owner mismatch');
if(perf.canonicalOwner!=='subjects/russian/data/performance-tasks.json') throw new Error('PerformanceTask owner mismatch');
for(const t of reading.tasks){
 if(!t.targets?.length||!t.operations?.length||t.operations.length<2||!t.output) throw new Error('Weak reading task '+t.id);
 for(const id of t.academicFunctions||[]) if(!afIds.has(id)) throw new Error('Unknown AcademicFunction '+id+' in '+t.id);
 for(const id of t.technicalConcepts||[]) if(!tcIds.has(id)) throw new Error('Unknown TechnicalConcept '+id+' in '+t.id);
}
for(const t of perf.tasks){
 if(!t.targets?.length||!t.output||!t.evidenceTypes?.length) throw new Error('Weak performance task '+t.id);
 if(!String(t.rubricRef||'').startsWith('RU04')) throw new Error('RU04 assessment authority missing '+t.id);
}
const targetOwners=new Map(topo.targetOwners.map(x=>[x.entityType,x.targetOwner]));
if(targetOwners.get('ReadingText')!==reading.canonicalOwner) throw new Error('P3 ReadingText topology broken');
if(targetOwners.get('PerformanceTask')!==perf.canonicalOwner) throw new Error('P3 PerformanceTask topology broken');
const perfTargets=new Set(perf.tasks.flatMap(x=>x.targets));
for(const r of ['R19','R20','R21','R22','R23','R24','R25','R26']) if(!perfTargets.has(r)) throw new Error('Research/defense coverage missing '+r);
const readTargets=new Set(reading.tasks.flatMap(x=>x.targets));
for(const r of ['R11','R12','R14','R15','R16','R17','R18','R19','R20','R21','R23','R25']) if(!readTargets.has(r)) throw new Error('Reading progression coverage missing '+r);
if(perf.activeOwner!=='RU06') throw new Error('RU06 active performance-task owner missing');
if(perf.assessmentOwner!=='RU04') throw new Error('RU04 must own assessment');
console.log('RUSSIAN_P9_READING_WRITING_RESEARCH_GATE=PASS',JSON.stringify({readingTasks:reading.tasks.length,performanceTasks:perf.tasks.length,readingTargets:[...readTargets].length,performanceTargets:[...perfTargets].length}));
