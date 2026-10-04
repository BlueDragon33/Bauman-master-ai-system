import assert from "node:assert/strict";
import fs from "node:fs";

const base="subjects/algorithms/docs/alg03/";
const read=p=>fs.readFileSync(p,"utf8");
const json=p=>JSON.parse(read(p));

const required=[
 "ALG_REASONING_CONTRACT.md","ALG_CORRECTNESS_ASSESSMENT_CONTRACT.md","ALG_COMPLEXITY_ASSESSMENT_CONTRACT.md",
 "ALG_ERROR_TAXONOMY.json","ALG_ALTERNATE_SOLUTION_POLICY.md","ALG_GRADER_CONTRACT.md",
 "ALG_GOLDEN_CORRECT_SOLUTIONS.json","ALG_GOLDEN_WRONG_SOLUTIONS.json","ALG_GOLDEN_EDGE_CASES.json",
 "ALG04_INPUT_CONTRACT.md","ALG_P3_ASSESSMENT_MODEL.json","ALG_PARTIAL_CREDIT_RUBRIC.json"
];
for(const f of required)assert.ok(fs.existsSync(base+f),"missing ALG03 deliverable "+f);

const model=json(base+"ALG_P3_ASSESSMENT_MODEL.json");
const taxonomy=json(base+"ALG_ERROR_TAXONOMY.json");
const correct=json(base+"ALG_GOLDEN_CORRECT_SOLUTIONS.json");
const wrong=json(base+"ALG_GOLDEN_WRONG_SOLUTIONS.json");
const edge=json(base+"ALG_GOLDEN_EDGE_CASES.json");
const rubric=json(base+"ALG_PARTIAL_CREDIT_RUBRIC.json");
const alg=json("subjects/algorithms/docs/alg02/ALG_ALGORITHM_REGISTRY.json");
const comp=json("subjects/algorithms/docs/alg02/ALG_COMPETENCY_GRAPH.json");

assert.ok(["VALIDATING","PASS"].includes(model.status));
assert.equal(model.owner.assessmentTruth,base+"ALG_P3_ASSESSMENT_MODEL.json");
assert.equal(model.reasoningDimensions.length,10);
assert.deepEqual(model.reasoningDimensions.map(x=>x.id),["representation","strategy","trace","invariant","correctness","complexity","implementation","testing","tradeoff","explanation"]);
assert.equal(model.runtimeMutationAuthorized,false);
assert.equal(model.learnerStateMutationAuthorized,false);
assert.equal(model.retryPolicy.officialFirstAttemptWrite,false);
assert.equal(model.retryPolicy.masteryWrite,false);
assert.match(model.evidenceLevels.at(-1).id,/L4_TRANSFER/);
assert.ok(model.graderPrinciples.includes("behavior_and_contract_over_source_shape"));
assert.ok(model.graderPrinciples.includes("multiple_valid_outputs_supported"));
assert.ok(model.graderPrinciples.includes("timing_never_sole_asymptotic_truth"));

const requiredErrors=[
 "REPRESENTATION_ERROR","PRECONDITION_ERROR","INVARIANT_ERROR","BOUNDARY_ERROR","TERMINATION_ERROR",
 "STATE_UPDATE_ERROR","COMPLEXITY_ERROR","CASE_CONFUSION","MUTATION_ERROR","TRAVERSAL_ORDER_ERROR",
 "GREEDY_FALLACY","DP_STATE_ERROR","GRAPH_MODEL_ERROR","IMPLEMENTATION_LANGUAGE_ERROR"
];
const errorIds=new Set(taxonomy.errors.map(x=>x.id));
for(const id of requiredErrors)assert.ok(errorIds.has(id),"missing required error "+id);
assert.equal(errorIds.size,taxonomy.errors.length,"duplicate error IDs");
const remediationIds=new Set(taxonomy.remediations.map(x=>x.id));
const compIds=new Set(comp.competencies.map(x=>x.id));
for(const e of taxonomy.errors){
 assert.ok(remediationIds.has(e.remediationId),"missing remediation "+e.remediationId);
 for(const c of e.targetCompetencyIds)assert.ok(compIds.has(c),"unknown competency "+c);
}
for(const r of taxonomy.remediations)assert.ok(r.recheckEvidenceRequirement,"remediation needs recheck "+r.id);

const algorithmIds=new Set(alg.algorithms.map(x=>x.id));
const claimIds=new Set(alg.complexityClaims.map(x=>x.id));
assert.ok(correct.fixtures.length>=8);
assert.ok(wrong.fixtures.length>=9);
assert.ok(edge.fixtures.length>=20);
for(const f of correct.fixtures){
 assert.equal(f.expected,"PASS");
 if(f.algorithmId)assert.ok(algorithmIds.has(f.algorithmId),"unknown correct fixture algorithm "+f.algorithmId);
 if(f.complexityClaimId)assert.ok(claimIds.has(f.complexityClaimId),"unknown complexity claim "+f.complexityClaimId);
}
for(const f of wrong.fixtures){
 assert.equal(f.expected,"FAIL");
 for(const id of f.expectedErrorIds)assert.ok(errorIds.has(id),"unknown expected error "+id);
 if(f.algorithmId)assert.ok(algorithmIds.has(f.algorithmId),"unknown wrong fixture algorithm "+f.algorithmId);
}

const families=new Set(edge.fixtures.map(x=>x.family));
for(const family of ["binary-search","stable-sort","reachability","bfs-distance","hashing","bst-complexity"])assert.ok(families.has(family),"missing edge family "+family);
for(const id of ["alg.edge.search.empty","alg.edge.search.singleton-hit","alg.edge.search.duplicates","alg.edge.sort.all-equal","alg.edge.sort.already-sorted","alg.edge.sort.reverse","alg.edge.graph.disconnected","alg.edge.graph.cycle","alg.edge.hash.collision"])assert.ok(edge.fixtures.some(x=>x.id===id),"missing golden edge "+id);
assert.equal(edge.policies.multipleValidOrder.includes("accept any output"),true);

for(const profile of rubric.taskProfileExamples){
 const sum=Object.values(profile.weights).reduce((a,b)=>a+b,0);
 assert.ok(Math.abs(sum-1)<1e-9,"rubric weights must sum to 1: "+profile.id+"="+sum);
}
assert.equal(rubric.masteryWrite,false);

for(const file of ["ALG_GRADER_CONTRACT.md","ALG_ALTERNATE_SOLUTION_POLICY.md"]){
 const c=read(base+file);
 assert.match(c,/source-string/i);
 assert.match(c,/multiple valid/i);
}
assert.match(read(base+"ALG_COMPLEXITY_ASSESSMENT_CONTRACT.md"),/UNRESOLVED/);
assert.match(read(base+"ALG_COMPLEXITY_ASSESSMENT_CONTRACT.md"),/Benchmark/i);
assert.match(read(base+"ALG_CORRECTNESS_ASSESSMENT_CONTRACT.md"),/sample/i);

const state=json("prompts/subjects/algorithms/PROJECT_STATE.json");
assert.equal(state.activeModule,"ALG03");
assert.ok(["ALG03_VALIDATING","ALG03_PASS"].includes(state.status));

console.log(JSON.stringify({status:"PASS",check:"ALG03 assessment contract",reasoningDimensions:model.reasoningDimensions.length,errorTypes:taxonomy.errors.length,correctFixtures:correct.fixtures.length,wrongFixtures:wrong.fixtures.length,edgeCases:edge.fixtures.length}));
