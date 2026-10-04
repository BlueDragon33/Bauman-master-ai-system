import assert from "node:assert/strict";
import fs from "node:fs";

const base="subjects/algorithms/docs/alg02/";
const read=(p)=>fs.readFileSync(p,"utf8");
const json=(p)=>JSON.parse(read(p));
const req=[
 "ALG_ACADEMIC_BLUEPRINT.md","ALG_COMPETENCY_GRAPH.json","ALG_PREREQUISITE_GRAPH.json",
 "ALG_CANONICAL_ENTITY_SCHEMA.json","ALG_ADT_OPERATION_CONTRACT.md","ALG_COMPLEXITY_CLAIM_CONTRACT.md",
 "ALG_CORRECTNESS_INVARIANT_CONTRACT.md","ALG_ALGORITHM_REGISTRY.json","ALG_DATA_STRUCTURE_REGISTRY.json",
 "ALG_LEGACY_COMPATIBILITY_MAP.json","ALG03_INPUT_CONTRACT.md","ALG_P2_CANONICAL_MODEL.json"
];
for(const f of req)assert.ok(fs.existsSync(base+f),"missing ALG02 deliverable "+f);

const model=json(base+"ALG_P2_CANONICAL_MODEL.json");
const comp=json(base+"ALG_COMPETENCY_GRAPH.json");
const graph=json(base+"ALG_PREREQUISITE_GRAPH.json");
const schema=json(base+"ALG_CANONICAL_ENTITY_SCHEMA.json");
const alg=json(base+"ALG_ALGORITHM_REGISTRY.json");
const ds=json(base+"ALG_DATA_STRUCTURE_REGISTRY.json");
const compat=json(base+"ALG_LEGACY_COMPATIBILITY_MAP.json");

assert.equal(model.schemaVersion,"1.0.0");
assert.ok(["VALIDATING","PASS"].includes(model.status));
assert.equal(model.owner.academicTruth,base+"ALG_P2_CANONICAL_MODEL.json");
assert.equal(model.targetProgram.code,"09.04.01/11");
assert.equal(model.targetProgram.officialAdministrativePrerequisiteClaimed,false);
assert.equal(model.migration.runtimeMutationAuthorized,false);
assert.equal(model.migration.productionMigrationActivated,false);
assert.equal(model.migration.preserveLegacyIds,true);
assert.equal(model.migration.preserveLearnerState,true);
for(const p of model.deliverables)assert.ok(fs.existsSync(p),"model deliverable missing "+p);

assert.equal(comp.competencies.length,15);
assert.equal(comp.idNamespace,"alg.comp");
const compIds=new Set(comp.competencies.map(x=>x.id));
assert.equal(compIds.size,15);
for(const c of comp.competencies){
 assert.match(c.id,/^alg\.comp\./);
 for(const p of c.prerequisites||[])assert.ok(compIds.has(p),"dangling competency prerequisite "+p);
 assert.ok((c.evidence||[]).length>=2,"competency evidence too thin "+c.id);
}
const nodeIds=new Set(graph.nodes.map(x=>x.id));
assert.deepEqual(nodeIds,compIds);
const outgoing=new Map([...nodeIds].map(id=>[id,[]]));
for(const e of graph.edges){
 assert.ok(nodeIds.has(e.from)&&nodeIds.has(e.to),"dangling graph edge");
 assert.notEqual(e.from,e.to,"self edge");
 outgoing.get(e.from).push(e.to);
}
const state=new Map();
const visit=(id)=>{
 const s=state.get(id)||0;if(s===1)throw new Error("cycle at "+id);if(s===2)return;
 state.set(id,1);for(const to of outgoing.get(id)||[])visit(to);state.set(id,2);
};
for(const id of nodeIds)visit(id);

for(const n of ["algorithm","variant","adt","dataStructure","operation","invariant","precondition","postcondition","complexityClaim","trace"])assert.ok(schema.namespaces[n],"missing namespace "+n);
assert.equal(schema.identityRule.includes("language-neutral"),true);
assert.equal(schema.runtimeMutationAuthorized,false);

const concepts=new Set((alg.concepts||[]).map(x=>x.id));
const algorithms=new Set(alg.algorithms.map(x=>x.id));
const variants=new Set(alg.variants.map(x=>x.id));
const pre=new Set(alg.preconditions.map(x=>x.id));
const post=new Set(alg.postconditions.map(x=>x.id));
const inv=new Set(alg.invariants.map(x=>x.id));
const traces=new Set(alg.traces.map(x=>x.id));
const claims=new Map(alg.complexityClaims.map(x=>[x.id,x]));
assert.equal(alg.algorithms.length,9);
assert.equal(algorithms.size,9);
for(const a of alg.algorithms){
 assert.match(a.id,/^alg\.algorithm\./);
 for(const x of a.conceptIds||[])assert.ok(concepts.has(x),"unknown concept "+x);
 for(const x of a.competencyIds||[])assert.ok(compIds.has(x),"unknown competency "+x);
 for(const x of a.preconditionIds||[])assert.ok(pre.has(x),"unknown precondition "+x);
 for(const x of a.postconditionIds||[])assert.ok(post.has(x),"unknown postcondition "+x);
 for(const x of a.invariantIds||[])assert.ok(inv.has(x),"unknown invariant "+x);
 for(const x of a.complexityClaimIds||[])assert.ok(claims.has(x),"unknown complexity claim "+x);
 assert.ok(traces.has(a.traceSchemaId),"unknown trace "+a.traceSchemaId);
 for(const x of a.variantIds||[])assert.ok(variants.has(x),"unknown variant "+x);
}
for(const v of alg.variants)assert.ok(algorithms.has(v.algorithmId),"variant points to unknown algorithm "+v.id);
for(const c of alg.complexityClaims){
 for(const k of ["ownerId","operationOrAlgorithm","inputMeasure","dimension","case","notation","bound"])assert.ok(c[k],"complexity claim missing "+k+" "+c.id);
 assert.ok(Array.isArray(c.assumptions)&&c.assumptions.length>0,"complexity assumptions missing "+c.id);
}
const byId=(id)=>alg.algorithms.find(x=>x.id===id);
assert.ok(byId("alg.algorithm.binary-search").preconditionIds.includes("alg.pre.sorted-total-order"));
assert.ok(byId("alg.algorithm.bfs").preconditionIds.includes("alg.pre.bfs-unweighted-shortest"));
assert.ok(claims.get("alg.cx.bfs.time-adj-list").inputMeasure.includes("V"));
assert.ok(claims.get("alg.cx.bfs.time-adj-list").inputMeasure.includes("E"));
assert.equal(claims.get("alg.cx.quicksort.worst-time").bound,"Theta(n^2)");

const adtIds=new Set(ds.abstractDataTypes.map(x=>x.id));
const structureIds=new Set(ds.dataStructures.map(x=>x.id));
assert.equal(adtIds.size,ds.abstractDataTypes.length);
assert.equal(structureIds.size,ds.dataStructures.length);
for(const s of ds.dataStructures){
 assert.match(s.id,/^alg\.ds\./);
 for(const a of s.implementsAdtIds||[])assert.ok(adtIds.has(a),"unknown ADT "+a);
 assert.ok(typeof s.representation==="string"&&s.representation.length>4);
}
const bst=ds.dataStructures.find(x=>x.id==="alg.ds.binary-search-tree");
assert.ok(bst.operationComplexityClaims.some(x=>x.time==="O(h)"));
assert.ok(bst.operationComplexityClaims.some(x=>x.case==="worst"&&x.time==="O(n)"));
const hash=ds.dataStructures.find(x=>x.id==="alg.ds.hash-table-chaining");
assert.ok(hash.operationComplexityClaims.some(x=>x.case==="expected"&&/O\(1\)/.test(x.time)));
assert.ok(hash.operationComplexityClaims.some(x=>x.case==="worst"&&x.time==="O(n)"));
const al=ds.dataStructures.find(x=>x.id==="alg.ds.graph-adjacency-list");
const am=ds.dataStructures.find(x=>x.id==="alg.ds.graph-adjacency-matrix");
assert.ok(al.operationComplexityClaims.some(x=>x.space==="Theta(V+E)"));
assert.ok(am.operationComplexityClaims.some(x=>x.space==="Theta(V^2)"));

assert.deepEqual(compat.legacyLessons.map(x=>x.lessonId).sort(),["PR02","PR10","PR11"]);
for(const x of compat.legacyLessons){assert.equal(x.preserveLegacyId,true);assert.equal(x.productionDeletionAuthorized,false);}
assert.equal(compat.migrationActivated,false);

const coreIds=new Set(alg.algorithms.map(x=>x.id));
for(const deferred of ["alg.algorithm.dijkstra","alg.algorithm.topological-sort","alg.algorithm.kruskal"])assert.equal(coreIds.has(deferred),false,"deferred topic promoted into core");
assert.ok((alg.deferredNotDefault||[]).some(x=>x.id==="alg.algorithm.dijkstra"));

assert.equal(fs.existsSync("subjects/algorithms/index.html"),false,"ALG02 must not create learner runtime");
const p04=json("assets/data/prerequisite-packs/p04-discrete-algorithms-data-structures.json");
assert.equal(p04.nodes.length,10);
assert.equal(p04.notOfficialAdministrativePrerequisite,true);

const project=json("prompts/subjects/algorithms/PROJECT_STATE.json");
const sequence=["ALG01","ALG02","ALG03","ALG04","ALG05","ALG06"];
assert.ok(sequence.includes(project.activeModule),"unexpected active module "+project.activeModule);
assert.ok(Array.isArray(project.completedModules)&&project.completedModules.includes("ALG01"),"ALG01 completion missing");
assert.ok(
  ["ALG02_VALIDATING","ALG02_PASS","ALG03_VALIDATING","ALG03_PASS","ALG04_VALIDATING","ALG04_PASS","ALG05_VALIDATING","ALG05_PASS","ALG06_VALIDATING","ALG06_PASS"].includes(project.status),
  "ALG02 contract must remain valid after downstream handoff; got "+project.status
);
if(project.activeModule!=="ALG02")assert.ok(project.completedModules.includes("ALG02"),"downstream handoff requires ALG02 completion");

console.log(JSON.stringify({status:"PASS",check:"ALG02 canonical academic contract",competencies:comp.competencies.length,edges:graph.edges.length,algorithms:alg.algorithms.length,dataStructures:ds.dataStructures.length,runtimeMutation:false}));
