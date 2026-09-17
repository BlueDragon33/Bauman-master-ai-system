import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const fail=message=>{throw new Error(`FOUNDATION_CANONICAL_CONTEXT_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};
const source=read('subjects/shared/foundation-canonical-context.js');
const extractorSource=read('foundation/domain-model/legacy-snapshot-extractor.js');
const index=read('subjects/russian/index.html');
const aiGuard=read('subjects/russian/assets/ai-mentor-guard.js');

assert(!/localStorage\s*\.|sessionStorage\s*\./.test(source),'Canonical context adapter must be storage-neutral');
assert(!/document\s*\.|innerHTML\s*=|appendChild\s*\(|insertAdjacentHTML\s*\(/.test(source),'Canonical context adapter must be UI-neutral');
assert(!/setItem\s*\(|removeItem\s*\(/.test(source),'Canonical context adapter must not write storage');
assert(source.includes('legacyAuthoritative:true'),'Adapter must explicitly preserve legacy authority');
assert(source.includes('mayModifyMastery:false'),'Adapter must explicitly forbid mastery mutation');
assert(aiGuard.includes('BaumanFoundationCanonicalContext?.current?.'),'AI Mentor must consume the explicit canonical context adapter');
assert(aiGuard.includes('canonicalIdentityReadOnly:true'),'AI Mentor policy must mark canonical identity read-only');

const projectionPos=index.indexOf('../shared/foundation-identity-projection.js');
const contextPos=index.indexOf('../shared/foundation-canonical-context.js');
const planningPos=index.indexOf('assets/planning-bridge.js');
const aiPos=index.indexOf('assets/ai-mentor-guard.js');
assert(projectionPos>=0&&contextPos>projectionPos,'Canonical context adapter must load after durable projection bridge');
assert(planningPos>contextPos&&aiPos>contextPos,'Canonical context adapter must load before Russian consumers');

const lookup=(systemId,scope,legacyId)=>legacyId?`bd-test:${systemId}:${scope}:${encodeURIComponent(String(legacyId))}`:null;
const sandbox={console,JSON,Object,String,Number,Error,Set,encodeURIComponent,decodeURIComponent};
sandbox.globalThis=sandbox;
sandbox.BAUMAN_FOUNDATION_IDENTITY_PROJECTION_REPORT={status:'ready',durable:true,checksum:'checksum-ctx'};
sandbox.BaumanFoundationIdentityProjection={canonicalFor:lookup};
vm.runInNewContext(extractorSource,sandbox,{filename:'legacy-snapshot-extractor.js'});
vm.runInNewContext(source,sandbox,{filename:'foundation-canonical-context.js'});
const api=sandbox.BaumanFoundationCanonicalContext;
assert(api?.schema==='BAUMAN_FOUNDATION_CANONICAL_CONTEXT_V1','Canonical context adapter API missing');

const route={view:'learning',learnTab:'theory',stage:'vn',lessonId:'R01',slide:2};
const context=api.capture({
  subjectId:'russian',
  route,
  resume:{route:{view:'learning',lessonId:'R01'}},
  reviewIds:['vocab:12','grammar:G01'],
  lessonId:'R01',
  hostTask:{subjectId:'russian',courseId:'prep',taskId:'task-01',missionId:'mission-01'}
});
assert(context.status==='ready'&&context.durable===true,'Durable projection did not produce ready context');
assert(context.projectionChecksum==='checksum-ctx','Projection checksum was not carried into context');
assert(context.canonical.lesson===lookup('russian-learning-flow','lesson','R01'),'Lesson canonical identity mismatch');
assert(context.canonical.resume===lookup('russian-learning-state','resume','current'),'Resume canonical identity mismatch');
assert(context.canonical.review.length===2,'Review canonical identities missing');
assert(context.canonical.host.task===lookup('bauman-subject-host','task','task-01'),'Host task canonical identity mismatch');
assert(context.canonical.route===lookup('russian-core-state','route',api.routeId(route)),'Route canonical identity mismatch');
assert(Object.isFrozen(context)&&Object.isFrozen(context.canonical)&&Object.isFrozen(context.canonical.host),'Canonical context must be deeply immutable');

const unknown=api.capture({subjectId:'russian',lessonId:'UNKNOWN'});
assert(unknown.canonical.lesson===lookup('russian-learning-flow','lesson','UNKNOWN'),'Adapter must delegate identity lookup without display-name inference');

sandbox.BAUMAN_FOUNDATION_IDENTITY_PROJECTION_REPORT={status:'blocked',durable:false,checksum:null};
const blocked=api.capture({subjectId:'russian',lessonId:'R01',reviewIds:['vocab:12'],hostTask:{taskId:'task-01'}});
assert(blocked.status==='blocked'&&blocked.durable===false,'Blocked projection must fail closed');
assert(blocked.canonical.lesson===null,'Blocked projection leaked lesson canonical identity');
assert(blocked.canonical.review[0]?.canonicalId===null,'Blocked projection leaked review canonical identity');
assert(blocked.canonical.host.task===null,'Blocked projection leaked host canonical identity');

console.log('FOUNDATION_CANONICAL_CONTEXT_GATE=PASS');
console.log(JSON.stringify({schema:api.schema,ready:context.status,blocked:blocked.status,storageWrites:0,uiWrites:0,legacyAuthoritative:true,masteryWrites:0},null,2));
