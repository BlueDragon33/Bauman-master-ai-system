'use strict';
(async()=>{
  const $=s=>document.querySelector(s);
  const form=$('#authoringForm'), out=$('#preview'), status=$('#status');
  const governance=await fetch('./data/authoring-governance.json').then(r=>r.json());
  const owners=await fetch('./docs/ru02/RUSSIAN_RU02_CANONICAL_OWNER_REGISTRY.json').then(r=>r.json());
  const ownerMap=new Map((owners.owners||[]).map(([entityType,path,state])=>[entityType,{path,state}]));
  const select=$('#entityType');
  for(const type of governance.authorableEntityTypes){
    const o=ownerMap.get(type); if(!o||String(o.state).startsWith('PLANNED')) continue;
    const el=document.createElement('option'); el.value=type; el.textContent=type; select.appendChild(el);
  }
  const enc=new TextEncoder();
  const sha=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');
  const candidate=async()=>{
    const proposal={text:$('#proposal').value.trim()};
    return {
      schema:'RUSSIAN_RU08_AUTHORING_CANDIDATE_V1',
      candidateId:$('#candidateId').value.trim(),
      entityType:select.value,canonicalId:$('#canonicalId').value.trim(),revision:$('#revision').value.trim(),
      state:'DRAFT',generated:$('#generated').checked,proposal,
      sourceRefs:$('#sourceRefs').value.split('\n').map(x=>x.trim()).filter(Boolean),
      rollbackNote:$('#rollbackNote').value.trim(),diffSummary:$('#diffSummary').value.trim(),
      contentHash:await sha(JSON.stringify(proposal))
    };
  };
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const c=await candidate(), owner=ownerMap.get(c.entityType), errors=[];
    for(const k of ['candidateId','entityType','canonicalId','revision','rollbackNote','diffSummary']) if(!c[k]) errors.push(k);
    if(!c.proposal.text) errors.push('proposal');
    if(!owner?.path) errors.push('canonical owner');
    status.textContent=errors.length?'Thiếu: '+errors.join(', '):'Hợp lệ ở mức DRAFT. Chưa ghi dữ liệu chuẩn.';
    out.textContent=JSON.stringify({...c,canonicalOwner:owner?.path||null,reviewEnvelope:{subjectId:'russian',resourceType:c.entityType,resourceId:c.canonicalId,revision:c.revision,contentHash:c.contentHash,sourcePath:owner?.path||null,summary:c.diffSummary,metadataOnly:true,candidateId:c.candidateId}},null,2);
  });
})();
