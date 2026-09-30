'use strict';
(function(){
  const STORAGE_KEY='bauman_russian_assessment_mastery_v1';
  const RECOVERY_KEY=STORAGE_KEY+'_recovery_meta';
  const SCHEMA='RUSSIAN_ASSESSMENT_MASTERY_STATE_V1';
  const now=()=>new Date().toISOString();
  const clean=v=>String(v??'').trim();
  let recoveryBlock=null;
  let sequence=0;

  function empty(){
    return {
      schema:SCHEMA,
      attempts:{},
      firstAttemptByAssessment:{},
      firstAttemptByItem:{},
      evidence:{},
      mastery:{},
      stageGates:{},
      weaknesses:{},
      events:[],
      updatedAt:null
    };
  }

  function markRecovery(reason,raw){
    recoveryBlock={reason,length:String(raw||'').length,detectedAt:now()};
    try{localStorage.setItem(RECOVERY_KEY,JSON.stringify(recoveryBlock));}catch(_){}
  }

  function read(){
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return empty();
    try{
      const parsed=JSON.parse(raw);
      if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('state-not-object');
      return {
        ...empty(),...parsed,schema:SCHEMA,
        attempts:parsed.attempts&&typeof parsed.attempts==='object'?parsed.attempts:{},
        firstAttemptByAssessment:parsed.firstAttemptByAssessment&&typeof parsed.firstAttemptByAssessment==='object'?parsed.firstAttemptByAssessment:{},
        firstAttemptByItem:parsed.firstAttemptByItem&&typeof parsed.firstAttemptByItem==='object'?parsed.firstAttemptByItem:{},
        evidence:parsed.evidence&&typeof parsed.evidence==='object'?parsed.evidence:{},
        mastery:parsed.mastery&&typeof parsed.mastery==='object'?parsed.mastery:{},
        stageGates:parsed.stageGates&&typeof parsed.stageGates==='object'?parsed.stageGates:{},
        weaknesses:parsed.weaknesses&&typeof parsed.weaknesses==='object'?parsed.weaknesses:{},
        events:Array.isArray(parsed.events)?parsed.events.slice(-2000):[]
      };
    }catch(e){
      markRecovery('malformed-json',raw);
      return empty();
    }
  }

  let state=read();

  function write(){
    if(recoveryBlock)return false;
    state.schema=SCHEMA;
    state.updatedAt=now();
    try{
      localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
      return true;
    }catch(e){
      console.warn('Russian assessment/mastery save failed',e);
      return false;
    }
  }

  function stableCopy(value){
    try{return JSON.parse(JSON.stringify(value));}catch(_){return null;}
  }

  function event(type,payload={}){
    state.events.push({id:`EV-${Date.now()}-${++sequence}`,type,at:now(),...stableCopy(payload)});
    if(state.events.length>2000)state.events=state.events.slice(-2000);
  }

  function newAttemptId(assessmentId='assessment'){
    const safe=clean(assessmentId).replace(/[^A-Za-z0-9:_-]+/g,'-')||'assessment';
    return `ATT-${safe}-${Date.now()}-${++sequence}`;
  }

  function recordAssessmentAttempt(input={}){
    const attemptId=clean(input.attemptId);
    const assessmentId=clean(input.assessmentId);
    if(!attemptId||!assessmentId)throw new Error('attemptId and assessmentId are required');
    if(state.attempts[attemptId])return {created:false,attempt:stableCopy(state.attempts[attemptId])};

    const responses=Array.isArray(input.responses)?input.responses.map((row,index)=>{
      const itemId=clean(row?.itemId||row?.id||`item-${index+1}`);
      const itemKey=`${assessmentId}::${itemId}`;
      const firstForItem=!state.firstAttemptByItem[itemKey];
      return {
        itemId,
        response:stableCopy(row?.response),
        evaluation:stableCopy(row?.evaluation),
        skill:clean(row?.skill),
        lessonId:clean(row?.lessonId),
        topic:clean(row?.topic),
        firstAttempt:firstForItem
      };
    }):[];

    const firstForAssessment=!state.firstAttemptByAssessment[assessmentId];
    const at=clean(input.timestamp)||now();
    const attempt={
      attemptId,
      assessmentId,
      contentRevision:clean(input.contentRevision),
      mode:clean(input.mode)||'exam',
      stage:clean(input.stage),
      cycle:input.cycle??null,
      paperType:clean(input.paperType),
      timestamp:at,
      responses,
      evaluation:stableCopy(input.evaluation),
      feedbackShown:!!input.feedbackShown,
      firstAttempt:firstForAssessment
    };
    state.attempts[attemptId]=attempt;
    if(firstForAssessment)state.firstAttemptByAssessment[assessmentId]=attemptId;
    responses.forEach(row=>{
      const itemKey=`${assessmentId}::${row.itemId}`;
      if(!state.firstAttemptByItem[itemKey])state.firstAttemptByItem[itemKey]=attemptId;
    });
    event('answer_submitted',{attemptId,assessmentId,mode:attempt.mode});
    event('answer_evaluated',{attemptId,assessmentId});
    write();
    return {created:true,attempt:stableCopy(attempt)};
  }

  function recordEvidence(input={}){
    const evidenceId=clean(input.evidenceId)||`EVID-${Date.now()}-${++sequence}`;
    if(state.evidence[evidenceId])return {created:false,evidence:stableCopy(state.evidence[evidenceId])};
    const row={
      evidenceId,
      competencyId:clean(input.competencyId),
      skill:clean(input.skill),
      sourceAttemptId:clean(input.sourceAttemptId),
      evidenceType:clean(input.evidenceType),
      result:stableCopy(input.result),
      authoritative:input.authoritative===true,
      delayed:input.delayed===true,
      createdAt:now()
    };
    state.evidence[evidenceId]=row;
    event('mastery_evidence_recorded',{evidenceId,competencyId:row.competencyId,authoritative:row.authoritative});
    if(row.authoritative&&row.competencyId){
      const prev=state.mastery[row.competencyId]||{};
      state.mastery[row.competencyId]={
        ...prev,
        competencyId:row.competencyId,
        lastEvidenceId:evidenceId,
        lastEvidenceAt:row.createdAt,
        skill:row.skill||prev.skill||'',
        evidenceCount:Number(prev.evidenceCount||0)+1
      };
    }
    write();
    return {created:true,evidence:stableCopy(row)};
  }

  function recordStageGate(input={}){
    const gateId=clean(input.gateId);
    const transactionId=clean(input.transactionId);
    if(!gateId||!transactionId)throw new Error('gateId and transactionId are required');
    const prev=state.stageGates[gateId]||{history:[]};
    if((prev.history||[]).some(x=>x.transactionId===transactionId))return {created:false,gate:stableCopy(prev)};
    const row={
      transactionId,
      passed:input.passed===true,
      criticalCompetencies:Array.isArray(input.criticalCompetencies)?[...input.criticalCompetencies]:[],
      evidenceAttemptIds:Array.isArray(input.evidenceAttemptIds)?[...input.evidenceAttemptIds]:[],
      at:now()
    };
    const next={...prev,gateId,last:row,history:[...(prev.history||[]),row].slice(-100)};
    state.stageGates[gateId]=next;
    event(input.passed?'stage_gate_passed':'stage_gate_checked',{gateId,transactionId});
    write();
    return {created:true,gate:stableCopy(next)};
  }

  const cyclePolicy=Object.freeze({
    7:{role:'early-retention-repair'},
    14:{role:'mid-retention'},
    21:{role:'transfer-weakness-check'},
    28:{role:'longer-retention-stage-consolidation'}
  });

  function cyclePurpose(days){return cyclePolicy[Number(days)]||null;}
  function status(){return {schema:SCHEMA,storageKey:STORAGE_KEY,recoveryBlock:stableCopy(recoveryBlock),attemptCount:Object.keys(state.attempts).length,evidenceCount:Object.keys(state.evidence).length};}
  function exportState(){return stableCopy(state);}
  function rawBackup(){return localStorage.getItem(STORAGE_KEY);}

  window.RussianAssessmentMastery={
    schema:SCHEMA,
    storageKey:STORAGE_KEY,
    newAttemptId,
    recordAssessmentAttempt,
    recordEvidence,
    recordStageGate,
    cyclePurpose,
    status,
    exportState,
    rawBackup,
    refresh(){state=read();return status();}
  };
})();