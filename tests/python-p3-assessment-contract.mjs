import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const readJson=(rel)=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const exists=(rel)=>fs.existsSync(path.join(root,rel));
const fail=(m)=>{throw new Error('[PYTHON03] '+m);};

const p2=readJson('prompts/subjects/python/evidence/PYTHON_P2_CANONICAL_MODEL.json');
const model=readJson('prompts/subjects/python/evidence/PYTHON_P3_ASSESSMENT_MODEL.json');
const taxonomy=readJson('prompts/subjects/python/evidence/PYTHON_DEBUGGING_ERROR_TAXONOMY.json');
const fixtures=readJson('prompts/subjects/python/evidence/PYTHON_ASSESSMENT_GOLDEN_FIXTURES.json');
const legacy=readJson('subjects/programming/data/tests.json');

if(p2.status!=='PASS') fail('PYTHON02 must be PASS');
if(model.schemaVersion!=='1.0.0') fail('unexpected schemaVersion');
if(!['VALIDATING','PASS'].includes(model.status)) fail('model must be VALIDATING or PASS');
if(model.owner?.runtimeExecutionOwner!=='PYTHON04') fail('runtime owner drift');
if(model.owner?.masteryOwner!=='GLOBAL_C4') fail('mastery owner drift');

const dims=new Set(model.reasoningDimensions||[]);
for(const d of ['reading','tracing','predicting','constructing','decomposing','debugging','testing','explaining','refactoring','transferring']){
  if(!dims.has(d)) fail('missing reasoning dimension '+d);
}
const loop=(model.debuggingLoop||[]).join('>');
if(loop!=='REPRODUCE>MINIMIZE>OBSERVE>HYPOTHESIZE>TEST_HYPOTHESIS>FIX_ROOT_CAUSE>REGRESSION_TEST') fail('debugging loop drift');

if(model.grading?.sourceStringPrimaryGrader!==false) fail('source string primary grader must be forbidden');
if(model.grading?.finalSampleOutputAloneSufficient!==false) fail('sample output cannot be sufficient');
if(model.grading?.equivalentValidImplementationsMustPass!==true) fail('equivalent implementations acceptance missing');
if(model.grading?.hiddenTestsMustFollowDocumentedContract!==true) fail('hidden-test contract missing');
if(model.history?.firstOfficialAttemptImmutable!==true || model.history?.retriesAppend!==true) fail('attempt history must be immutable+append');
if(model.runtimeSecurity?.executionAuthorizedInPYTHON03!==false) fail('PYTHON03 must not activate execution');
if(model.runtimeSecurity?.hiddenTestLeakForbidden!==true) fail('hidden test leak guard missing');

for(const rel of model.deliverables||[]) if(!exists(rel)) fail('missing deliverable '+rel);

const requiredCats=['syntax_indentation','name_scope','type','value','index_key','attribute','import_environment','file_encoding','control_flow','off_by_one','mutation_aliasing','none_truthiness','iterator_state','float_numeric','logic_requirement','state_side_effect','test_fixture'];
const catIds=new Set((taxonomy.categories||[]).map(x=>x.id));
for(const id of requiredCats) if(!catIds.has(id)) fail('missing error category '+id);

const requiredFixtures=['mutable_default_argument','identity_vs_equality','shallow_copy_aliasing','off_by_one_loop','iterator_exhaustion','exception_misuse','float_comparison','stale_notebook_state','hardcoded_sample_output','valid_alternate_implementation'];
const fixtureMap=new Map((fixtures.fixtures||[]).map(x=>[x.id,x]));
for(const id of requiredFixtures) if(!fixtureMap.has(id)) fail('missing golden fixture '+id);
if(fixtureMap.get('hardcoded_sample_output').expectedEvaluation?.mustRejectHardcodedSample!==true) fail('anti-hardcode fixture weak');
if(fixtureMap.get('valid_alternate_implementation').expectedEvaluation?.mustAcceptEquivalentImplementations!==true) fail('alternate implementation fixture weak');

const qs=legacy.questions||[];
const sig=new Map();
for(const q of qs){const k=(q.question||'').trim();sig.set(k,(sig.get(k)||0)+1);}
const dup=[...sig.values()].filter(n=>n>1).length;
if(qs.length!==model.currentLegacyReality.questionRecords) fail('legacy question count drift');
if(sig.size!==model.currentLegacyReality.uniqueQuestionText) fail('legacy unique question text drift');
if(dup!==model.currentLegacyReality.exactDuplicateSignatureGroups) fail('legacy duplicate-group count drift');
if(new Set(qs.map(q=>q.questionType)).size!==1 || qs[0]?.questionType!=='multiple_choice') fail('legacy bank type drift');

console.log(JSON.stringify({
  status:'PASS',
  check:'PYTHON03 assessment contract',
  reasoningDimensions:dims.size,
  errorCategories:catIds.size,
  goldenFixtures:fixtureMap.size,
  legacyQuestions:qs.length,
  uniqueLegacyQuestionText:sig.size,
  runtimeExecution:false
}));

