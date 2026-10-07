const clean=v=>String(v??'').trim();
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};
const arr=v=>Array.isArray(v)?v:[];

export const RUSSIAN_ENGINE_BROWSER_EVIDENCE_RUNTIME='RUSSIAN_ENGINE_BROWSER_EVIDENCE_RUNTIME_V1';
export const RUSSIAN_ENGINE_OUTBOX_KEY='bauman_russian_engine_evidence_outbox_v1';

const FORBIDDEN_KEYS=new Set([
  'rawAudio','audioBlob','audioBytes','microphoneStream','mediaStream',
  'providerPrivateId','providerUserId','paymentCustomerId','billingProviderId',
  'paymentId','billingId'
]);

function scanForbidden(value,path='root',hits=[]){
  if(!value||typeof value!=='object')return hits;
  for(const [key,val] of Object.entries(value)){
    const next=path+'.'+key;
    if(FORBIDDEN_KEYS.has(key))hits.push(next);
    if(val&&typeof val==='object')scanForbidden(val,next,hits);
  }
  return hits;
}

function skillFromCompetency(id){
  const key=clean(id);
  if(key.includes('LISTEN'))return 'listening';
  if(key.includes('SPEAK'))return 'speaking';
  if(key.includes('READ'))return 'reading';
  if(key.includes('WRITE'))return 'writing';
  if(key.includes('INTERACT'))return 'interaction';
  if(key.includes('PHON'))return 'phonetics';
  if(key.includes('VOC'))return 'vocabulary';
  if(key.includes('GRAM'))return 'grammar';
  return 'integrated';
}

function readRows(storage){
  try{
    const raw=storage?.getItem?.(RUSSIAN_ENGINE_OUTBOX_KEY);
    const parsed=raw?JSON.parse(raw):{schema:RUSSIAN_ENGINE_BROWSER_EVIDENCE_RUNTIME,rows:[]};
    return Array.isArray(parsed?.rows)?parsed.rows:[];
  }catch(_){return []}
}

function writeRows(storage,rows){
  try{
    storage?.setItem?.(RUSSIAN_ENGINE_OUTBOX_KEY,JSON.stringify({
      schema:RUSSIAN_ENGINE_BROWSER_EVIDENCE_RUNTIME,
      rows
    }));
    return true;
  }catch(_){return false}
}

function buildOwnerPayload(observation,{contentRevision='browser-r1',mode='practice'}={}){
  if(observation?.authoritative===true)throw new Error('authoritative Engine evidence forbidden');
  const evidenceId=clean(observation?.evidenceId);
  const attemptId=clean(observation?.attemptId);
  const experienceId=clean(observation?.experienceId);
  const competencies=arr(observation?.competencyIds).map(clean).filter(Boolean);
  if(!evidenceId||!attemptId||!experienceId||!competencies.length)throw new Error('incomplete Engine observation identity');
  const providerFailure=observation?.provider?.infrastructureFailure===true;
  return {
    attempt:{
      attemptId,
      assessmentId:'ENGINE::'+experienceId,
      contentRevision:clean(contentRevision),
      mode:clean(mode)||'practice',
      responses:[{
        itemId:experienceId,
        response:copy(observation?.result??null),
        evaluation:{
          observationType:clean(observation?.observationType)||'engine-observation',
          success:observation?.result?.success===true,
          supportLevel:Number(observation?.supportLevel)||0,
          learnerImpact:!providerFailure
        },
        skill:skillFromCompetency(competencies[0]),
        topic:'russian-engine'
      }],
      evaluation:{source:'russian-engine-browser',providerFailure,authoritative:false},
      feedbackShown:(Number(observation?.supportLevel)||0)>0
    },
    evidence:competencies.map(competencyId=>({
      evidenceId:'RU04::'+evidenceId+'::'+competencyId,
      competencyId,
      skill:skillFromCompetency(competencyId),
      sourceAttemptId:attemptId,
      evidenceType:providerFailure?'infrastructure-observation':clean(observation?.observationType)||'engine-observation',
      result:{
        ...copy(observation?.result||{}),
        engineEvidenceId:evidenceId,
        supportLevel:Number(observation?.supportLevel)||0,
        providerFailure,
        learnerImpact:!providerFailure,
        mode:clean(mode)||'practice'
      },
      authoritative:false,
      delayed:observation?.delayed===true
    }))
  };
}

export function plannerCandidatesFromObservation(observation){
  const providerFailure=observation?.provider?.infrastructureFailure===true;
  if(providerFailure)return [];
  const id=clean(observation?.evidenceId);
  const experienceId=clean(observation?.experienceId);
  const support=Math.max(0,Number(observation?.supportLevel)||0);
  const success=observation?.result?.success===true;
  if(!id||!experienceId)return [];

  if(success&&support===0){
    return [{
      id:'engine:evidence:continue:'+id,
      label:'Tiếp tục nâng độ khó sau lượt hiểu độc lập',
      skill:'listening',
      reason:'continue_path',
      route:{view:'media'},
      priority:620,
      source:'russian-engine'
    }];
  }
  if(success){
    return [{
      id:'engine:evidence:reinforce:'+id,
      label:'Củng cố để giảm mức trợ giúp',
      skill:'listening',
      reason:'weakness_repair',
      route:{view:'media'},
      priority:760,
      source:'russian-engine'
    }];
  }
  return [{
    id:'engine:evidence:remediate:'+id,
    label:'Luyện lại điểm chưa hiểu',
    skill:'listening',
    reason:'weakness_repair',
    route:{view:'media'},
    priority:840,
    source:'russian-engine'
  }];
}

export function createBrowserEvidenceRuntime({windowLike=globalThis?.window,plannerSource=null}={}){
  const storage=windowLike?.localStorage;
  let rows=readRows(storage);

  function persist(){return writeRows(storage,rows)}
  function messageId(observation){return 'ENGINE-EVIDENCE::'+clean(observation?.evidenceId)}

  function enqueue(observation,meta={}){
    const hits=scanForbidden(observation);
    if(hits.length)throw new Error('forbidden persisted fields: '+hits.join(','));
    const id=messageId(observation);
    if(id==='ENGINE-EVIDENCE::')throw new Error('evidenceId required');
    const existing=rows.find(x=>x.messageId===id);
    if(existing)return {created:false,row:copy(existing)};
    const row={
      messageId:id,
      state:'PENDING',
      attempts:0,
      observation:copy(observation),
      meta:{contentRevision:clean(meta.contentRevision)||'browser-r1',mode:clean(meta.mode)||'practice'},
      lastError:null,
      deliveredAt:null
    };
    rows.push(row);persist();
    return {created:true,row:copy(row)};
  }

  function deliver(messageIdValue){
    const row=rows.find(x=>x.messageId===clean(messageIdValue));
    if(!row)throw new Error('unknown evidence outbox message');
    if(row.state==='DELIVERED')return {delivered:false,row:copy(row)};
    row.state='DELIVERING';row.attempts++;persist();
    try{
      const owner=windowLike?.RussianAssessmentMastery;
      if(!owner?.recordAssessmentAttempt||!owner?.recordEvidence)throw new Error('RussianAssessmentMastery owner unavailable');
      const payload=buildOwnerPayload(row.observation,row.meta);
      const attemptResult=owner.recordAssessmentAttempt(copy(payload.attempt));
      const evidenceResults=payload.evidence.map(item=>owner.recordEvidence(copy(item)));
      row.state='DELIVERED';
      row.lastError=null;
      row.deliveredAt=new Date().toISOString();
      plannerSource?.publish?.(plannerCandidatesFromObservation(row.observation));
      persist();
      return {delivered:true,row:copy(row),attemptResult,evidenceResults};
    }catch(error){
      row.state='FAILED_RETRYABLE';
      row.lastError=String(error?.message||error);
      persist();
      return {delivered:false,row:copy(row)};
    }
  }

  function submit(observation,meta={}){
    const queued=enqueue(observation,meta);
    return deliver(queued.row.messageId);
  }

  function retryPending(){
    return rows
      .filter(x=>x.state!=='DELIVERED')
      .map(x=>deliver(x.messageId));
  }

  function audit(){
    return {
      schema:RUSSIAN_ENGINE_BROWSER_EVIDENCE_RUNTIME,
      total:rows.length,
      pending:rows.filter(x=>x.state!=='DELIVERED').length,
      delivered:rows.filter(x=>x.state==='DELIVERED').length,
      forbiddenPersistedFields:rows.flatMap(x=>scanForbidden(x)),
      rawAudioPersisted:false
    };
  }

  return Object.freeze({
    schema:RUSSIAN_ENGINE_BROWSER_EVIDENCE_RUNTIME,
    submit,enqueue,deliver,retryPending,audit,
    list:()=>copy(rows)
  });
}
