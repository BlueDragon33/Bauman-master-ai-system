import fs from 'node:fs';
import crypto from 'node:crypto';
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const GOV='subjects/russian/data/authoring-governance.json';
const OWNERS='subjects/russian/docs/ru02/RUSSIAN_RU02_CANONICAL_OWNER_REGISTRY.json';
const stable=v=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v);
export const hashPayload=v=>crypto.createHash('sha256').update(stable(v)).digest('hex');
function ownerByEntity(){
  const rows=readJson(OWNERS).owners||[];
  return new Map(rows.map(x=>[x[0],{entityType:x[0],canonicalOwner:x[1],status:x[2]}]));
}
export function validateCandidate(c,{requirePromotion=false}={}){
  const gov=readJson(GOV), owners=ownerByEntity(), errors=[];
  if(c?.schema!=='RUSSIAN_AUTHORING_CANDIDATE_V1')errors.push('candidate schema');
  for(const k of ['candidateId','responsibility','canonicalId','revision','rollbackNote','diffSummary'])if(!String(c?.[k]??'').trim())errors.push('missing '+k);
  if(!('payload' in (c||{})))errors.push('missing payload');
  const owner=owners.get(c?.responsibility);
  if(!owner?.canonicalOwner)errors.push('no canonical owner for entity type');
  if(gov.derivedOutputs.includes(c?.responsibility))errors.push('derived output cannot be authored directly');
  if(!gov.authorableEntityTypes.includes(c?.responsibility))errors.push('entity type not authorable');
  if(!gov.lifecycle.candidateStates.includes(c?.state))errors.push('invalid lifecycle state');
  const hash=c&&'payload' in c?hashPayload(c.payload):null;
  if(c?.contentHash&&c.contentHash!==hash)errors.push('contentHash mismatch');
  const promoted=new Set(['APPROVED','CANONICAL_PATCHED','PUBLISHED']);
  if(requirePromotion||promoted.has(c?.state)){
    if(!Array.isArray(c?.sourceRefs)||!c.sourceRefs.length)errors.push('sourceRefs required for promotion');
    if(!String(c?.reviewer??'').trim())errors.push('reviewer required for promotion');
    if(!String(c?.reviewedAt??'').trim())errors.push('reviewedAt required for promotion');
    if(c?.generated===true&&String(c?.confidence??'')!=='VERIFIED')errors.push('generated promotion requires VERIFIED provenance');
  }
  if(c?.state==='PUBLISHED'&&!c?.canonicalPatched)errors.push('PUBLISHED requires canonicalPatched');
  return {ok:errors.length===0,errors,canonicalOwner:owner?.canonicalOwner||null,contentHash:hash};
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
