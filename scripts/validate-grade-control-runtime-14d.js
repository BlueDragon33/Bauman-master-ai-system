'use strict';
const fs=require('fs');
const policy=JSON.parse(fs.readFileSync('assets/data/grading-policy-bauman-2024.json','utf8'));
const arch=JSON.parse(fs.readFileSync('assets/data/course-learning-architecture-s1-2026.json','utf8'));
const runtime=fs.readFileSync('assets/js/academic-grade-runtime.js','utf8');
const eventRuntime=fs.readFileSync('assets/js/academic-event-runtime.js','utf8');
const css=fs.readFileSync('assets/css/academic-grade-2026.css','utf8');
const errors=[];const assert=(c,m)=>{if(!c)errors.push(m)};

assert(policy.version==='BAUMAN_GRADING_POLICY_2024_REFERENCE_V1','grading policy version drifted');
assert(policy.source?.url==='https://mf.bmstu.ru/assets/info/uu/ot/educontrol/docs/Pologhenie_o_tekuschem_KU_i_PAO_2024.pdf','official BMSTU grading-policy URL drifted');
assert(policy.source?.approvedByOrder==='27.02.2024 № 02.01-02/106','grading policy order identity drifted');
assert(policy.hubPolicy?.gradedEventSafetyTarget===90,'Hub graded-event safety target must stay 90');
assert(policy.hubPolicy?.supplementCounting==='forbidden_without_verified_transcript_entry_structure','supplement counting must remain forbidden without verified structure');
const expected=[[0,59,2],[60,70,3],[71,84,4],[85,100,5]];
const actual=(policy.ratingScale||[]).map(x=>[x.min,x.max,x.grade5Scale]).sort((a,b)=>a[0]-b[0]);
assert(JSON.stringify(actual)===JSON.stringify(expected),`Bauman grade bands drifted: ${JSON.stringify(actual)}`);
const covered=[];for(const [min,max] of actual)for(let n=min;n<=max;n++)covered.push(n);assert(covered.length===101&&new Set(covered).size===101&&Math.min(...covered)===0&&Math.max(...covered)===100,'grade bands must cover 0–100 exactly once');

for(const token of [
  'Pass 14D Grade Control Ledger',
  'bauman_academic_2026_grade_results_v1',
  'function policyBand(',
  'function resultState(',
  'function recordResult(',
  'resultConfirmed!==true',
  'Phải ghi nguồn của kết quả thực tế',
  'Numeric score và official grade không nhất quán',
  'supplementEntryVerified:false',
  'supplementEntryCounted:null',
  'supplementCounting:false',
  'courseCompletionMutation:false',
  'schedulerMutation:false'
])assert(runtime.includes(token),`Pass14D runtime missing ${token}`);
assert(!/schedule\.entries\s*\[[^\]]+\]\s*=/.test(runtime),'Pass14D must not mutate schedule entries');
assert(!/window\.save\s*\(/.test(runtime),'Pass14D must not call main save()');
assert(!/id\s*:\s*['"](?:COMPLETED|COURSE_COMPLETED|EVENT_COMPLETED)['"]/.test(runtime),'Pass14D must not manufacture completion state');
assert(!/supplementEntryCounted\s*:\s*true/.test(runtime),'Pass14D must not infer a diploma-supplement entry');
assert(!/(redDiploma|honorsDiploma).*(percent|ratio|count)/i.test(runtime),'Pass14D must not compute honors-diploma percentage from assessment events');
assert(runtime.includes("throw new Error('Không thể ghi kết quả khi assessment timing"),'unresolved event timing must hard-block result entry');
assert(runtime.includes('localStorage.setItem(STORE_KEY'),'Pass14D must persist only its dedicated result store');
assert(runtime.includes('currentUserScope()'),'Pass14D results must be user-scoped');
assert(eventRuntime.includes('function bootstrapGradeRuntime()')&&eventRuntime.includes('assets/js/academic-grade-runtime.js')&&eventRuntime.includes('assets/css/academic-grade-2026.css'),'Pass14C must additively bootstrap Pass14D');
assert(css.includes('.grade14d-kpis')&&css.includes('@media(max-width:850px)'),'Pass14D responsive CSS missing');

const events=arch.courses.flatMap(c=>(c.eventModel?.events||[]).map(e=>({courseId:c.courseId,...e}))),resolved=events.filter(x=>!/^unresolved/.test(String(x.timing||''))),locked=events.filter(x=>/^unresolved/.test(String(x.timing||'')));
assert(resolved.length===8,'Pass14D must expose exactly the 8 currently resolved S1 events');
assert(locked.length===4,'Pass14D must leave four multi-semester events timing-locked');

function band(score){return expected.find(([min,max])=>score>=min&&score<=max)?.[2]??null}
assert(band(100)===5&&band(85)===5&&band(84)===4&&band(71)===4&&band(70)===3&&band(60)===3&&band(59)===2&&band(0)===2,'grading boundary invariant failed');
function gradedState(score,officialGrade=null,target=90){const derived=score==null?null:band(score),grade=officialGrade??derived;if(derived&&officialGrade!=null&&derived!==officialGrade)return 'INVALID';if(grade===2)return 'RESULT_FAILED';if(grade===3)return 'RESULT_SATISFACTORY';if(grade===4)return 'RESULT_GOOD';if(grade===5&&score!=null&&score>=target)return 'RESULT_TARGET_MET';if(grade===5&&score!=null)return 'RESULT_EXCELLENT_BELOW_TARGET';if(grade===5)return 'RESULT_EXCELLENT_GRADE_ONLY';return 'RESULT_RECORDED'}
assert(gradedState(92)==='RESULT_TARGET_MET','92 must be grade 5 and meet internal safety target');
assert(gradedState(89)==='RESULT_EXCELLENT_BELOW_TARGET','89 must remain official-band 5 but below internal target 90');
assert(gradedState(84)==='RESULT_GOOD','84 must map to grade 4');
assert(gradedState(70)==='RESULT_SATISFACTORY','70 must map to grade 3');
assert(gradedState(59)==='RESULT_FAILED','59 must map to failed band');
assert(gradedState(92,4)==='INVALID','score/grade inconsistency must be rejected');

if(errors.length){console.error(`PASS14D_GRADE_CONTROL_FAIL (${errors.length})`);for(const e of errors)console.error(`- ${e}`);process.exit(1)}
console.log('PASS14D_GRADE_CONTROL_VALID');
console.log(JSON.stringify({policy:'BMSTU-2024',bands:actual,resolvedEvents:resolved.length,timingLocked:locked.length,internalSafetyTarget:90,supplementCounting:false,courseCompletionMutation:false},null,2));