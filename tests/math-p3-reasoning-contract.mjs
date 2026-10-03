import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));

const problemContract=readJson('prompts/subjects/math/evidence/MATH_PROBLEM_CONTRACT.json');
const stepSchema=readJson('prompts/subjects/math/evidence/MATH_SOLUTION_STEP_SCHEMA.json');
const pilot=readJson('subjects/math/data/math_reasoning_pilot_v1.json');
const exercises=readJson('subjects/math/data/exercise_content.json').records||[];

assert.equal(problemContract.owner,'MATH03');
assert.equal(problemContract.authority?.mathematicalTruth,'MATH02 canonical facts/specification');
assert.equal(problemContract.authority?.mastery,'global C4 policy; MATH03 emits evidence only');
for(const k of ['problemId','canonicalLessonId','canonicalChapterId','domain','assumptions','equivalencePolicy','verificationMethod','evidenceType','provenance']){
  assert.ok(problemContract.required.includes(k),'Problem contract missing required field '+k);
}
for(const s of ['VALID_EQUIVALENT_TRANSFORMATION','VALID_IMPLICATION_ONLY','VALID_UNDER_CONDITION','DOMAIN_ERROR','UNKNOWN']){
  assert.ok(stepSchema.validity.includes(s),'Step schema missing '+s);
}
for(const tier of ['exposure','progress','performance','mastery-input'])assert.ok(problemContract.evidenceTiers.includes(tier));

const exerciseById=new Map(exercises.map(x=>[x.exerciseId,x]));
for(const p of pilot.problems){
  assert.ok(p.problemId&&p.canonicalLessonId&&p.canonicalChapterId,'Pilot problem missing canonical identity');
  assert.ok(Array.isArray(p.targetEvidenceDimensions)&&p.targetEvidenceDimensions.length,'Pilot problem missing evidence dimensions');
  assert.ok(p.domain!==undefined,'Pilot problem missing domain');
  if(p.sourceExerciseId){
    const src=exerciseById.get(p.sourceExerciseId);
    assert.ok(src,'Pilot sourceExerciseId not found: '+p.sourceExerciseId);
    assert.equal(src.lessonId,p.canonicalLessonId,'Pilot lesson drift for '+p.problemId);
    assert.equal(src.chapterId,p.canonicalChapterId,'Pilot chapter drift for '+p.problemId);
  }
}

const evaluator=require('../subjects/math/assets/math-reasoning-evaluator.js');
assert.equal(evaluator.selfCheck().generalCAS,false);
assert.equal(evaluator.selfCheck().formalProofVerifier,false);
assert.equal(evaluator.selfCheck().masteryAuthority,false);

const problemById=id=>pilot.problems.find(x=>x.problemId===id);
for(const tc of pilot.goldenCases||[]){
  const result=evaluator.evaluate(problemById(tc.problemId),tc.response,tc.context||{});
  for(const [k,v] of Object.entries(tc.expected||{}))assert.deepEqual(result[k],v,tc.id+' expected '+k);
}

const multi=pilot.pilotRequirements?.multiStepSolution||[];
assert.ok(multi.length>=2,'Representative pilot lacks multi-step solution');
for(const step of multi){
  const result=evaluator.evaluateStep(step);
  assert.equal(result.validity,step.expectedValidity,'Step validity drift: '+step.stepId);
}
assert.equal(evaluator.evaluateStep({before:'x^2-4',after:'(x-2)*(x+2)',relation:'equivalent',conditionRequired:true,conditionSatisfied:false}).validity,'DOMAIN_ERROR');

const unsupported=evaluator.evaluate({
  problemId:'qa:unsupported-vector',
  targetEvidenceDimensions:['representation_conversion'],
  equivalencePolicy:{class:'vector'}
},[1,2,3]);
assert.equal(unsupported.status,'INDETERMINATE');
assert.equal(unsupported.errorCode,'EQUIVALENCE_CLASS_UNSUPPORTED');

const mem=new Map();
Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{
  getItem:k=>mem.has(k)?mem.get(k):null,
  setItem:(k,v)=>mem.set(k,String(v)),
  removeItem:k=>mem.delete(k)
}});
try{Object.defineProperty(globalThis,'navigator',{configurable:true,value:{}})}catch{}
const evidence=require('../subjects/math/assets/math-reasoning-evidence.js');
mem.clear();

const p=problemById('math03:domain:rational-cancel-01');
const firstEval=evaluator.evaluate(p,{expression:'x+2',excludedValues:[]});
const secondEval=evaluator.evaluate(p,{expression:'2+x',excludedValues:['2']});
const base={problemId:p.problemId,sourceExerciseId:p.sourceExerciseId,lessonId:p.canonicalLessonId,chapterId:p.canonicalChapterId,mode:'guided_practice',hintLevel:0,problemRevision:pilot.contentRevision};

const a1=await evidence.recordAttempt({...base,submissionId:'submission-1',response:{expression:'x+2',excludedValues:[]},evaluation:firstEval,at:1000});
const a2=await evidence.recordAttempt({...base,submissionId:'submission-2',response:{expression:'2+x',excludedValues:['2']},evaluation:secondEval,at:2000});
const dup=await evidence.recordAttempt({...base,submissionId:'submission-2',response:{expression:'tampered',excludedValues:[]},evaluation:firstEval,at:3000});
assert.equal(a1.ok,true);
assert.equal(a2.ok,true);
assert.equal(dup.duplicate,true);
assert.equal(dup.attempt.attemptId,'submission-2','Duplicate must return the exact stored attempt');
assert.equal(evidence.attemptsForProblem(p.problemId).length,2,'Duplicate submission created a third attempt');
assert.equal(evidence.firstAttempt(p.problemId).attemptId,'submission-1');
assert.equal(evidence.firstAttempt(p.problemId).evaluation.status,'CONDITIONAL','First attempt was overwritten');
const lessonSummary=evidence.summaryForLesson(p.canonicalLessonId);
assert.equal(lessonSummary.attempts,2);
assert.equal(lessonSummary.accepted,1);
assert.equal(lessonSummary.conditional,1);
assert.equal(lessonSummary.masteryWrite,false);
assert.equal(lessonSummary.academicWrite,false);

assert.equal(pilot.pilotRequirements.commonMisconception.expectedStatus,'CONDITIONAL');
assert.equal(pilot.pilotRequirements.remediationAndRecheck.expectedStatus,'ACCEPTED');
assert.equal(pilot.pilotRequirements.deterministicExpectedEvidence.masteryWrite,false);
assert.equal(pilot.pilotRequirements.deterministicExpectedEvidence.academicWrite,false);

for(const policy of [
  'MATH_EQUIVALENCE_POLICY.md',
  'MATH_PROOF_REASONING_POLICY.md',
  'MATH_ERROR_REMEDIATION_MAP.md',
  'MATH_ASSESSMENT_EVIDENCE_POLICY.md',
  'MATH_MASTERY_SPECIALIZATION.md',
  'MATH_ADAPTIVE_PROBLEM_POLICY.md',
  'MATH_FIRST_ATTEMPT_INTEGRITY_REPORT.md',
  'MATH_P4_INPUT_CONTRACT.md'
]) assert.ok(fs.existsSync('prompts/subjects/math/evidence/'+policy),'Missing MATH03 output '+policy);

console.log(JSON.stringify({
  status:'PASS',
  check:'MATH03 reasoning/evidence golden contract',
  problems:pilot.problems.length,
  goldenCases:pilot.goldenCases.length,
  firstAttemptImmutable:true,
  idempotent:true,
  masteryWrite:false
}));
