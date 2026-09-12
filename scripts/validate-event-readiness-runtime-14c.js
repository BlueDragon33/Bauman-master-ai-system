'use strict';
const fs=require('fs');
const arch=JSON.parse(fs.readFileSync('assets/data/course-learning-architecture-s1-2026.json','utf8'));
const runtime=fs.readFileSync('assets/js/academic-event-runtime.js','utf8');
const courseRuntime=fs.readFileSync('assets/js/academic-course-runtime.js','utf8');
const css=fs.readFileSync('assets/css/academic-event-2026.css','utf8');
const errors=[];const assert=(c,m)=>{if(!c)errors.push(m)};

for(const token of [
  'Pass 14C Assessment Event Readiness',
  "bauman_academic_2026_event_readiness_v1",
  'function eventState(',
  'function courseEventAxis(',
  'function recordEvidence(',
  'requirementsVerified===true',
  'allVerifiedRequirementsMet===true',
  'critical===0',
  'score>=Number(event.internalTarget)',
  "reason:'timing_unresolved'",
  "throw new Error('Không thể đánh dấu readiness khi assessment timing",
  'officialResultMutation:false',
  'schedulerMutation:false'
])assert(runtime.includes(token),`Pass14C runtime missing ${token}`);

assert(!/schedule\.entries\s*\[[^\]]+\]\s*=/.test(runtime),'Pass14C must not mutate scheduler entries');
assert(!/window\.save\s*\(/.test(runtime),'Pass14C must not call main save()');
assert(!/COMPLETED/.test(runtime),'Pass14C must not manufacture course/event completion states');
assert(!/officialResult\s*=/.test(runtime),'Pass14C must not write official result values');
assert(runtime.includes('localStorage.setItem(STORE_KEY'),'Pass14C should persist only its dedicated readiness evidence store');
assert(runtime.includes('currentUserScope()'),'Pass14C evidence must be user-scoped');
assert(runtime.includes("eventKey(courseId,event){return `${courseId}::${event.code}::${event.timing||'unknown'}`"),'Event key must include course, code and timing');

assert(courseRuntime.includes('function fallbackEventAxis('),'Pass14B fallback event axis missing');
assert(courseRuntime.includes('window.BAUMAN_EVENT_READINESS_2026?.courseEventAxis?.(courseId)'),'Pass14B must consume Pass14C event axis when available');
assert(courseRuntime.includes("assets/css/academic-event-2026.css")&&courseRuntime.includes("assets/js/academic-event-runtime.js"),'Pass14B must bootstrap Pass14C assets after course runtime');
assert(courseRuntime.includes('openAcademicEventReadiness2026'),'Course modal event rows must bridge to Pass14C editor');

const all=[];
for(const course of arch.courses)for(const event of course.eventModel?.events||[])all.push({courseId:course.courseId,...event});
const resolved=all.filter(x=>!/^unresolved/.test(String(x.timing||'')));
const unresolved=all.filter(x=>/^unresolved/.test(String(x.timing||'')));
const resolvedKeys=resolved.map(x=>`${x.courseId}:${x.code}`).sort();
const expectedResolved=['d02:Зчт','d03:ДЗчт','d03:Зчт','d04:ДЗчт','d04:Экз','d05:ДЗчт','d05:Экз','d06:Экз'].sort();
assert(resolved.length===8,`Expected 8 resolved S1 events, got ${resolved.length}`);
assert(JSON.stringify(resolvedKeys)===JSON.stringify(expectedResolved),`Resolved event set drifted: ${resolvedKeys.join(', ')}`);
const unresolvedKeys=unresolved.map(x=>`${x.courseId}:${x.code}`).sort();
const expectedUnresolved=['d01:Зчт','d15:ДЗчт','d15:Экз','p02:ДЗчт'].sort();
assert(unresolved.length===4,`Expected 4 unresolved multi-semester events, got ${unresolved.length}`);
assert(JSON.stringify(unresolvedKeys)===JSON.stringify(expectedUnresolved),`Unresolved event set drifted: ${unresolvedKeys.join(', ')}`);

for(const event of all){
  if(event.code==='Зчт')assert(event.internalTarget===null,`${event.courseId} pure Зчт must not have numeric internal target`);
  if(event.gradingNature==='graded')assert(event.internalTarget===90,`${event.courseId} ${event.code} graded event must use internal safety target 90`);
}

function stateFromEvidence(event,evidence){
  if(/^unresolved/.test(String(event.timing||'')))return 'EVENT_UNASSESSED';
  if(!evidence)return 'EVENT_UNASSESSED';
  const verified=evidence.requirementsVerified===true,source=String(evidence.requirementSource||'').trim(),met=evidence.allVerifiedRequirementsMet===true,critical=Number(evidence.criticalOpenIssues);
  const scoreNeeded=event.gradingNature==='graded'&&Number.isFinite(Number(event.internalTarget));
  const score=Number(evidence.rehearsalScore),scoreOk=!scoreNeeded||(Number.isFinite(score)&&score>=Number(event.internalTarget));
  return verified&&source.length>=3&&met&&Number.isInteger(critical)&&critical===0&&scoreOk?'EVENT_READY':'EVENT_PREPARING';
}
const d04exam=resolved.find(x=>x.courseId==='d04'&&x.code==='Экз');
assert(stateFromEvidence(d04exam,null)==='EVENT_UNASSESSED','Missing event evidence must remain UNASSESSED');
assert(stateFromEvidence(d04exam,{requirementsVerified:true,requirementSource:'LMS',allVerifiedRequirementsMet:true,criticalOpenIssues:0,rehearsalScore:89})==='EVENT_PREPARING','Graded rehearsal 89 must not be READY');
assert(stateFromEvidence(d04exam,{requirementsVerified:true,requirementSource:'LMS',allVerifiedRequirementsMet:true,criticalOpenIssues:0,rehearsalScore:90})==='EVENT_READY','Graded rehearsal 90 with verified evidence must be READY');
assert(stateFromEvidence(d04exam,{requirementsVerified:true,requirementSource:'LMS',allVerifiedRequirementsMet:true,criticalOpenIssues:1,rehearsalScore:100})==='EVENT_PREPARING','Critical issue must block EVENT_READY');
const d02credit=resolved.find(x=>x.courseId==='d02'&&x.code==='Зчт');
assert(stateFromEvidence(d02credit,{requirementsVerified:true,requirementSource:'LMS',allVerifiedRequirementsMet:true,criticalOpenIssues:0,rehearsalScore:null})==='EVENT_READY','Pure Зчт must become READY without numeric rehearsal score when verified requirements are met');
const d15exam=unresolved.find(x=>x.courseId==='d15'&&x.code==='Экз');
assert(stateFromEvidence(d15exam,{requirementsVerified:true,requirementSource:'LMS',allVerifiedRequirementsMet:true,criticalOpenIssues:0,rehearsalScore:100})==='EVENT_UNASSESSED','Unresolved timing must hard-block readiness even with perfect evidence');

assert(css.includes('.event14c-kpis')&&css.includes('@media(max-width:850px)'),'Pass14C responsive CSS missing');

if(errors.length){console.error(`PASS14C_EVENT_READINESS_FAIL (${errors.length})`);for(const e of errors)console.error(`- ${e}`);process.exit(1)}
console.log('PASS14C_EVENT_READINESS_VALID');
console.log(JSON.stringify({resolvedEvents:resolved.length,unresolvedEvents:unresolved.length,userScoped:true,schedulerMutation:false,officialResultMutation:false,gradedReadyFloor:90},null,2));