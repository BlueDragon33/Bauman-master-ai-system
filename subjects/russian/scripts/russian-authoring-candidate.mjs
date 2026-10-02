import fs from 'node:fs';
import crypto from 'node:crypto';
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const GOV='subjects/russian/data/authoring-governance.json';
const OWNERS='subjects/russian/docs/ru02/RUSSIAN_RU02_CANONICAL_OWNER_REGISTRY.json';
const stable=v=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v);
const text=v=>String(v??'').trim();
const lines=v=>text(v).split(/\r?\n/).map(text).filter(Boolean);
export const hashPayload=v=>crypto.createHash('sha256').update(stable(v)).digest('hex');
function ownerByEntity(){
  const rows=readJson(OWNERS).owners||[];
  return new Map(rows.map(x=>[x[0],{entityType:x[0],canonicalOwner:x[1],status:x[2]}]));
}
export function validateCandidate(c,{requirePromotion=false}={}){
  const gov=readJson(GOV), owners=ownerByEntity(), errors=[];
  if(c?.schema!=='RUSSIAN_AUTHORING_CANDIDATE_V1')errors.push('candidate schema');
  for(const k of ['candidateId','responsibility','canonicalId','revision','rollbackNote','diffSummary'])if(!text(c?.[k]))errors.push('missing '+k);
  if(!('payload' in (c||{}))||!c?.payload||typeof c.payload!=='object'||Array.isArray(c.payload))errors.push('missing payload');
  if(!text(c?.payload?.ru))errors.push('missing Russian content');

  const owner=owners.get(c?.responsibility);
  if(!owner?.canonicalOwner)errors.push('no canonical owner for entity type');
  if(gov.derivedOutputs.includes(c?.responsibility))errors.push('derived output cannot be authored directly');
  if(!gov.authorableEntityTypes.includes(c?.responsibility))errors.push('entity type not authorable');
  if(!gov.lifecycle.candidateStates.includes(c?.state))errors.push('invalid lifecycle state');

  const entitySchema=gov.entitySchemas?.[c?.responsibility]||null;
  if(!entitySchema)errors.push('entity schema missing');
  const details=(c?.payload?.details&&typeof c.payload.details==='object'&&!Array.isArray(c.payload.details))?c.payload.details:{};
  for(const field of entitySchema?.fields||[])if(field.required&&!text(details[field.id]))errors.push('missing '+field.id);

  const policies=entitySchema?.validationPolicies||[];
  const sourceRefs=Array.isArray(c?.sourceRefs)?c.sourceRefs.map(text).filter(Boolean):[];
  if(c?.state!=='DRAFT'&&!sourceRefs.length)errors.push('sourceRefs required before review');
  if(sourceRefs.some(x=>/^ai:|generated|chatgpt/i.test(x)))errors.push('AI/generated output cannot be authority source');

  if(policies.includes('stress')&&!/\u0301/.test(text(details.stress)))errors.push('stress must use explicit combining acute');
  if(policies.includes('dialogue-role-turns')){
    if(lines(details.roles).length<2)errors.push('dialogue requires at least two roles');
    if(lines(details.turnPlan).length<2)errors.push('dialogue requires at least two turns');
  }
  if(policies.includes('audio-transcript-pairing')&&text(details.mediaType)==='audio'&&!text(details.transcript))errors.push('audio requires transcript');

  const hash=c&&c.payload?hashPayload(c.payload):null;
  if(c?.contentHash&&c.contentHash!==hash)errors.push('contentHash mismatch');

  const promoted=new Set(['APPROVED','CANONICAL_PATCHED','PUBLISHED']);
  if(requirePromotion||promoted.has(c?.state)){
    if(!sourceRefs.length)errors.push('sourceRefs required for promotion');
    if(!text(c?.reviewer))errors.push('reviewer required for promotion');
    if(!text(c?.reviewedAt))errors.push('reviewedAt required for promotion');
    if(c?.generated===true&&text(c?.confidence)!=='VERIFIED')errors.push('generated promotion requires VERIFIED provenance');
  }
  if(c?.state==='CANONICAL_PATCHED'&&!c?.canonicalPatched)errors.push('CANONICAL_PATCHED requires canonicalPatched');
  if(c?.state==='PUBLISHED'&&!c?.canonicalPatched)errors.push('PUBLISHED requires canonicalPatched');
  return {ok:errors.length===0,errors,canonicalOwner:owner?.canonicalOwner||null,contentHash:hash,entitySchema:c?.responsibility||null,validationPolicies:policies};
}
export function reviewEnvelope(c){
  const v=validateCandidate(c);if(!v.ok)throw new Error(v.errors.join('; '));
  return {subjectId:'russian',resourceType:c.responsibility,resourceId:c.canonicalId,revision:c.revision,contentHash:v.contentHash,sourcePath:v.canonicalOwner,summary:c.diffSummary,metadataOnly:true,candidateId:c.candidateId};
}
if(process.argv[2]){
  const raw=readJson(process.argv[2]),items=Array.isArray(raw)?raw:[raw];
  if(items.length>500)throw new Error('bulk candidate limit exceeded');
  const out=items.map(c=>{const v=validateCandidate(c);return {candidateId:c.candidateId,...v,reviewEnvelope:v.ok?reviewEnvelope(c):null}});
  if(out.some(x=>!x.ok)){console.error(JSON.stringify(out,null,2));process.exit(1)}
  console.log(JSON.stringify(out,null,2));
}
