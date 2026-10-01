import fs from 'node:fs';
import crypto from 'node:crypto';
export const PATH='subjects/russian/data/authoring-governance.json';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const stable=v=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v);
export const hashPayload=v=>crypto.createHash('sha256').update(stable(v)).digest('hex');
export function validateCandidate(c,{promotion=false}={}){
 const g=read(PATH),errors=[];
 if(c?.schema!=='RUSSIAN_AUTHORING_CANDIDATE_V2')errors.push('candidate schema');
 for(const k of ['candidateId','responsibility','canonicalId','revision','rollbackNote','diffSummary'])if(!String(c?.[k]??'').trim())errors.push('missing '+k);
 if(!('payload' in (c||{})))errors.push('missing payload');
 const owner=g.responsibilities?.[c?.responsibility]||null;
 if(!owner)errors.push('responsibility is not authorable');
 if(g.derivedResponsibilities.includes(c?.responsibility))errors.push('derived responsibility cannot be authored directly');
 if(!g.lifecycle.candidateStates.includes(c?.state))errors.push('invalid lifecycle state');
 const hash=c&&'payload'in c?hashPayload(c.payload):null;
 if(c?.contentHash&&c.contentHash!==hash)errors.push('contentHash mismatch');
 if(promotion||['APPROVED','CANONICAL_PATCHED','PUBLISHED'].includes(c?.state)){
  if(!Array.isArray(c?.sourceRefs)||!c.sourceRefs.length)errors.push('sourceRefs required for promotion');
  if(!String(c?.reviewer??'').trim())errors.push('reviewer required for promotion');
  if(!String(c?.reviewedAt??'').trim())errors.push('reviewedAt required for promotion');
  if(c?.generated===true&&String(c?.confidence??'')!=='VERIFIED')errors.push('generated promotion requires VERIFIED provenance');
 }
 if(c?.state==='PUBLISHED'&&!c?.canonicalPatched)errors.push('PUBLISHED requires canonicalPatched');
 return {ok:!errors.length,errors,canonicalOwner:owner,contentHash:hash};
}
export function reviewEnvelope(c){
 const v=validateCandidate(c); if(!v.ok)throw new Error(v.errors.join('; '));
 return {subjectId:'russian',resourceType:c.responsibility,resourceId:c.canonicalId,revision:c.revision,contentHash:v.contentHash,sourcePath:v.canonicalOwner,summary:c.diffSummary,metadataOnly:true,candidateId:c.candidateId};
}
if(process.argv[2]){
 const raw=read(process.argv[2]),items=Array.isArray(raw)?raw:[raw];
 if(items.length>500)throw new Error('bulk candidate limit exceeded');
 const result=items.map(c=>{const v=validateCandidate(c);return {candidateId:c.candidateId,...v,reviewEnvelope:v.ok?reviewEnvelope(c):null}});
 if(result.some(x=>!x.ok)){console.error(JSON.stringify(result,null,2));process.exit(1)}
 console.log(JSON.stringify(result,null,2));
}
