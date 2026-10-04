import assert from "node:assert/strict";
import fs from "node:fs";

const read=(p)=>fs.readFileSync(p,"utf8");
const json=(p)=>JSON.parse(read(p));

const base="subjects/algorithms/docs/alg01/";
const required=[
  "ALG01_EXECUTIVE_SUMMARY.md",
  "ALG01_REPOSITORY_MAP.md",
  "ALG01_CONTENT_INVENTORY.json",
  "ALG01_ALGORITHM_INVENTORY.json",
  "ALG01_DATA_STRUCTURE_INVENTORY.json",
  "ALG01_ASSESSMENT_GRADER_AUDIT.md",
  "ALG01_RUNTIME_VISUALIZATION_AUDIT.md",
  "ALG01_OWNER_DUPLICATION_MAP.md",
  "ALG01_LEGACY_REGISTER.json",
  "ALG01_RISK_REGISTER.json",
  "ALG02_INPUT_CONTRACT.md"
];
for(const f of required)assert.ok(fs.existsSync(base+f),"missing ALG01 deliverable "+f);

assert.equal(fs.existsSync("subjects/algorithms/index.html"),false,"ALG01 must not fabricate a learner runtime during audit");

const lessons=json("subjects/programming/data/lessons.json");
const exercises=json("subjects/programming/data/exercises.json");
const tests=json("subjects/programming/data/tests.json");
const simulations=json("subjects/programming/data/simulations.json");
const p04=json("assets/data/prerequisite-packs/p04-discrete-algorithms-data-structures.json");
const math=json("subjects/math/data/discipline_spine.json");

assert.equal(lessons.length,48);
assert.equal(exercises.length,144);
assert.equal(tests.questions.length,384);
assert.equal(simulations.length,96);

const ids=["PR02","PR10","PR11"];
for(const id of ids){
  assert.ok(lessons.some(x=>(x.id||x.lessonId)===id),"missing "+id);
  assert.equal(exercises.filter(x=>x.lessonId===id).length,3,id+" exercise count drift");
  assert.equal(tests.questions.filter(x=>x.lessonId===id).length,8,id+" test count drift");
  assert.equal(simulations.filter(x=>x.lessonId===id).length,2,id+" simulation count drift");
}

assert.ok(tests.questions.every(x=>(x.questionType||x.type)==="multiple_choice"),"Programming bank is no longer MCQ-only; re-audit ALG01");
const prompts=tests.questions.map(x=>String(x.prompt||x.question||x.text||"").trim());
assert.equal(new Set(prompts).size,192,"Programming exact prompt duplication baseline drift");
const rel=tests.questions.filter(x=>ids.includes(x.lessonId));
assert.equal(rel.length,24);
assert.equal(new Set(rel.map(x=>String(x.prompt||x.question||x.text||"").trim())).size,12);

assert.equal(p04.nodes.length,10);
assert.equal(p04.diagnostic.D0.items.length,18);
assert.equal(p04.diagnostic.D1.items.length,12);
assert.equal(p04.diagnostic.D2.items.length,8);
assert.equal(p04.criticalMisconceptions.length,10);
assert.ok(p04.repairRoutes.length>=8);
assert.equal(p04.notOfficialAdministrativePrerequisite,true);

assert.ok((math.disciplines||[]).some(x=>x.id==="discrete_graph_db_knowledge"),"adjacent Math owner missing");

const sim=read("subjects/programming/simulations/sim_algorithm_complexity_lab.html");
assert.match(sim,/R=Math\.min\(100,A\*\.65\+\(100-B\)\*\.8\)/,"complexity-lab baseline formula drifted");
assert.match(sim,/Rủi ro demo/);
assert.doesNotMatch(sim,/function\s+(binarySearch|bfs|dfs|mergeSort|quickSort)/,"baseline complexity lab unexpectedly became an algorithm engine; re-audit");

const content=json(base+"ALG01_CONTENT_INVENTORY.json");
assert.equal(content.dedicatedAlgorithmsRuntimeExists,false);
assert.deepEqual(content.programmingTotals,{lessons:48,exercises:144,testItems:384,simulationRecords:96});
assert.equal(content.p04PrerequisitePack.diagnostic.total,38);

const risk=json(base+"ALG01_RISK_REGISTER.json");
assert.ok(risk.risks.some(x=>x.id==="ALG-R03"&&x.severity==="CRITICAL"));
assert.ok(risk.risks.some(x=>x.id==="ALG-R04"&&x.category==="WEAK_GRADER"));

const state=json("prompts/subjects/algorithms/PROJECT_STATE.json");
const sequence=["ALG01","ALG02","ALG03","ALG04","ALG05","ALG06"];
assert.ok(sequence.includes(state.activeModule),"unexpected activeModule "+state.activeModule);
assert.ok(Array.isArray(state.completedModules)&&state.completedModules.includes("ALG01"),"accepted ALG01 must remain in completedModules");
assert.ok(
  ["ALG01_PASS","ALG02_VALIDATING","ALG02_PASS","ALG03_VALIDATING","ALG03_PASS","ALG04_VALIDATING","ALG04_PASS","ALG05_VALIDATING","ALG05_PASS","ALG06_VALIDATING","ALG06_PASS"].includes(state.status),
  "ALG01 regression contract must remain valid after downstream handoff; got "+state.status
);
if(state.activeModule==="ALG01")throw new Error("accepted ALG01 must not regress to active ALG01 state");

console.log("ALG01_FORENSIC_STATIC=PASS");
