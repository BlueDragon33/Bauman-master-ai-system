import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));

const required=[
  'MATH_CAPABILITY_REGISTRY.json',
  'MATH_EXPRESSION_PARSER_CONTRACT.md',
  'MATH_SYMBOLIC_PROVIDER_CONTRACT.md',
  'MATH_NUMERICAL_COMPUTATION_POLICY.md',
  'MATH_GRAPH_GEOMETRY_CONTRACT.md',
  'MATH_SIMULATION_NUMERICAL_METHODS_CONTRACT.md',
  'MATH_AI_TUTOR_CONTRACT.md',
  'MATH_AI_TOOL_PERMISSION_MATRIX.md',
  'MATH_COMPUTATION_VISUALIZATION_GOLDEN_FIXTURES.json',
  'MATH_P5_INPUT_CONTRACT.md'
];
for(const f of required)assert.ok(fs.existsSync('prompts/subjects/math/evidence/'+f),'missing MATH04 output '+f);

const registryDoc=readJson('prompts/subjects/math/evidence/MATH_CAPABILITY_REGISTRY.json');
assert.equal(registryDoc.owner,'MATH04');
assert.equal(registryDoc.authority.mathematicalTruth,'MATH02');
assert.equal(registryDoc.authority.assessmentVerdicts,'MATH03');
for(const id of ['math.parse.expression','math.numeric.evaluate','math.graph.sample','math.matrix.compute','math.simulation.run','math.symbolic.simplify','math.ai.coach']){
  assert.ok(registryDoc.capabilities.some(x=>x.id===id),'missing capability '+id);
}

const src=fs.readFileSync('subjects/math/assets/math-capability-runtime.js','utf8');
assert.ok(!/\beval\s*\(/.test(src),'arbitrary eval is forbidden');
assert.ok(!/new Function\s*\(/.test(src),'new Function is forbidden');
assert.ok(src.includes("GENERAL_CAS_NOT_BOUND"),'general CAS fail-honest boundary missing');
assert.ok(src.includes("ANSWER_REVEAL_BLOCKED_BY_POLICY"),'AI assessment reveal guard missing');

const api=require('../subjects/math/assets/math-capability-runtime.js');
const self=api.selfCheck();
assert.equal(self.arbitraryEval,false);
assert.equal(self.generalCAS,false);
assert.equal(self.formalProofVerifier,false);
assert.equal(self.aiMasteryAuthority,false);
assert.equal(self.academicWrites,false);
assert.equal(self.masteryWrites,false);
assert.equal(self.offlineCore,true);

const fixtures=readJson('prompts/subjects/math/evidence/MATH_COMPUTATION_VISUALIZATION_GOLDEN_FIXTURES.json');
for(const tc of fixtures.cases){
  const out=await api.invoke(tc.capability,tc.input||{},tc.context||{});
  assert.equal(out.status,tc.expect.status,tc.id+' status');
  if('error' in tc.expect)assert.equal(out.error,tc.expect.error,tc.id+' error');
  if('value' in tc.expect)assert.deepEqual(out.data?.value,tc.expect.value,tc.id+' value');
  if('converged' in tc.expect)assert.equal(out.data?.converged,tc.expect.converged,tc.id+' converged');
  if('warning' in tc.expect)assert.equal(out.warning,tc.expect.warning,tc.id+' warning');
  if(tc.expect.hasGap)assert.ok((out.data?.gaps||[]).length>0,tc.id+' expected gap');
  assert.equal(out.masteryWrite,false,tc.id+' mastery write');
  assert.equal(out.academicWrite,false,tc.id+' academic write');
}

const domain=await api.invoke('math.symbolic.simplify',{expression:'(x^2-4)/(x-2)',assumptions:['x!=2']});
assert.equal(domain.status,'UNAVAILABLE');
assert.deepEqual(domain.provenance.assumptions,[],'unbound symbolic provider must not pretend assumptions were processed');

const parsed=await api.invoke('math.parse.expression',{expression:'2*(x+1)^2'});
assert.equal(parsed.status,'OK');
assert.equal(parsed.data.grammar,'safe-arithmetic-v1');

console.log(JSON.stringify({status:'PASS',check:'MATH04 capability golden contract',capabilities:self.capabilities,fixtures:fixtures.cases.length,offlineCore:self.offlineCore}));
