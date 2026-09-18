import assert from 'node:assert/strict';
import fs from 'node:fs';

function deepFreeze(value,seen=new WeakSet()){
  if(!value||typeof value!=='object'||seen.has(value))return value;
  seen.add(value);
  for(const child of Object.values(value))deepFreeze(child,seen);
  return Object.freeze(value);
}
function cloneFrozen(value){
  if(value===null||value===undefined)return value;
  return deepFreeze(structuredClone(value));
}
function readJson(path,label){
  if(!fs.existsSync(path))throw new Error(`Missing current mastery file: ${label}`);
  const bytes=fs.readFileSync(path);
  let value;
  try{value=JSON.parse(bytes.toString('utf8'));}catch{throw new Error(`Invalid current mastery JSON: ${label}`);}
  return {bytes,value};
}
function percent(value,label){
  assert(Number.isFinite(value)&&value>=0&&value<=100,`${label} must be between 0 and 100`);
  return value;
}
function integer(value,label,minimum=0){
  assert(Number.isInteger(value)&&value>=minimum,`${label} must be an integer >= ${minimum}`);
  return value;
}
function validDate(value){return typeof value==='string'&&!Number.isNaN(Date.parse(value));}

export function loadCurrentMasteryHarness(options={}){
  const root=options.rootDir||process.cwd();
  const masteryLoaded=readJson(`${root}/roadmap_v2/mastery/mastery-contract.json`,'mastery contract');
  const masterySchema=readJson(`${root}/roadmap_v2/mastery/mastery-contract.schema.json`,'mastery contract schema').value;
  const eventSchema=readJson(`${root}/roadmap_v2/mastery/evidence-event.schema.json`,'evidence event schema').value;
  const snapshotSchema=readJson(`${root}/roadmap_v2/mastery/mastery-snapshot.schema.json`,'mastery snapshot schema').value;
  const blueprint=readJson(`${root}/roadmap_v2/consumer/blueprint.json`,'consumer blueprint').value;
  const diagnostic=readJson(`${root}/roadmap_v2/diagnostic/diagnostic-contract.json`,'diagnostic contract').value;
  const catalog=readJson(`${root}/roadmap_v2/diagnostic/catalog.json`,'diagnostic catalog').value;
  const contract=masteryLoaded.value;

  assert.equal(contract.schema,'BAUMAN_ROADMAP_V2_MASTERY_CONTRACT_V2','Unsupported current Mastery contract');
  assert.equal(masterySchema.$id,contract.schema,'Mastery contract/schema identity mismatch');
  assert.equal(eventSchema.$id,contract.upstream.evidenceEventSchema,'Mastery event schema identity mismatch');
  assert.equal(snapshotSchema.$id,contract.upstream.masterySnapshotSchema,'Mastery snapshot schema identity mismatch');
  assert.equal(blueprint.schema,contract.upstream.consumerBlueprintSchema,'Mastery/Consumer Blueprint schema mismatch');
  assert.equal(blueprint.validation.result,contract.upstream.consumerBlueprintValidationRequired,'Consumer Blueprint validation is not accepted');
  assert.equal(diagnostic.schema,contract.upstream.diagnosticContractSchema,'Mastery/Diagnostic schema mismatch');
  assert.equal(catalog.schema,contract.upstream.diagnosticCatalogSchema,'Mastery/Diagnostic Catalog schema mismatch');
  assert.equal(contract.mode.productionIntegration,'disconnected','Mastery production boundary widened');
  assert.equal(contract.mode.persistentStoreEnabled,false,'Mastery persistence unexpectedly enabled');
  assert.equal(contract.capabilities.persistentStoreWrite,false,'Mastery store write capability enabled');
  assert.equal(contract.capabilities.priorityEngineWrite,false,'Mastery Priority write capability enabled');
  assert.equal(contract.capabilities.schedulerWrite,false,'Mastery scheduler write capability enabled');
  assert.equal(contract.capabilities.runtimeActivation,false,'Mastery runtime activation enabled');

  const knownTargets=new Set();
  for(const chapter of blueprint.chapters){
    knownTargets.add(chapter.id);
    for(const lesson of chapter.lessons)knownTargets.add(lesson.id);
  }
  const planTargets=new Set(catalog.plans.map(p=>p.targetId));
  const phases=new Set(eventSchema.properties.phaseId.enum);
  const evidenceTypes=new Set(contract.evidenceTypes);

  const validatePayload=event=>{
    const payload=event.payload;
    assert(payload&&typeof payload==='object'&&!Array.isArray(payload),`Invalid payload: ${event.eventId}`);
    switch(event.evidenceType){
      case 'diagnostic_result':{
        const allowed=new Set([contract.diagnosticBoundary.passingStatus,...contract.diagnosticBoundary.gapStatuses]);
        assert(allowed.has(payload.status),`Invalid diagnostic status: ${event.eventId}`);
        percent(payload.scorePercent,`diagnostic score ${event.eventId}`);
        percent(payload.criticalPercent,`diagnostic critical score ${event.eventId}`);
        assert(payload.masterReady===false,`Diagnostic event grants Master-ready: ${event.eventId}`);
        assert(payload.persistable===false,`Diagnostic event is marked persistable: ${event.eventId}`);
        break;
      }
      case 'chapter_assessment':
        percent(payload.percent,`assessment score ${event.eventId}`);
        percent(payload.criticalPercent,`assessment critical score ${event.eventId}`);
        break;
      case 'exercise_set':
        percent(payload.percent,`exercise score ${event.eventId}`);
        integer(payload.completedItems,`completed exercise items ${event.eventId}`);
        integer(payload.totalItems,`total exercise items ${event.eventId}`,1);
        assert(payload.completedItems<=payload.totalItems,`Completed exercise count exceeds total: ${event.eventId}`);
        break;
      case 'lab_or_simulation':
        assert(typeof payload.passed==='boolean',`Invalid lab pass flag: ${event.eventId}`);
        assert(typeof payload.explanationAccepted==='boolean',`Invalid lab explanation flag: ${event.eventId}`);
        break;
      case 'project_rubric':
        assert(payload.rubric&&typeof payload.rubric==='object'&&!Array.isArray(payload.rubric),`Missing project rubric: ${event.eventId}`);
        for(const dimension of contract.thresholds.projectRubricDimensions){
          assert(Number.isFinite(payload.rubric[dimension])&&payload.rubric[dimension]>=0&&payload.rubric[dimension]<=4,`Invalid project rubric ${dimension}: ${event.eventId}`);
        }
        break;
      case 'retention_check':
        percent(payload.percent,`retention score ${event.eventId}`);
        integer(payload.daysAfterLearning,`retention days ${event.eventId}`);
        break;
      case 'russian_technical_terms':
        integer(payload.verifiedTermCount,`Russian term count ${event.eventId}`);
        break;
      case 'gap_override':
        assert(typeof payload.active==='boolean',`Invalid gap override flag: ${event.eventId}`);
        assert(typeof payload.reason==='string'&&payload.reason.trim(),`Missing gap override reason: ${event.eventId}`);
        break;
      default:
        throw new Error(`Unknown evidence type: ${event.evidenceType}`);
    }
  };

  const validateEvent=event=>{
    assert(event&&typeof event==='object'&&!Array.isArray(event),'Invalid evidence event');
    assert.equal(event.schema,eventSchema.$id,`Evidence event schema mismatch: ${event.eventId||'unknown'}`);
    assert(typeof event.eventId==='string'&&event.eventId,'Missing evidence event ID');
    assert(typeof event.streamId==='string'&&event.streamId,`Missing stream ID: ${event.eventId}`);
    integer(event.sequence,`sequence ${event.eventId}`,1);
    assert(knownTargets.has(event.targetId),`Unknown mastery target: ${event.targetId}`);
    assert(planTargets.has(event.targetId),`Target has no current diagnostic plan: ${event.targetId}`);
    assert(phases.has(event.phaseId),`Unknown Roadmap phase: ${event.phaseId}`);
    assert(evidenceTypes.has(event.evidenceType),`Unknown evidence type: ${event.evidenceType}`);
    assert(validDate(event.occurredAt),`Invalid event date: ${event.eventId}`);
    assert(event.source&&typeof event.source==='object'&&!Array.isArray(event.source),`Invalid event source: ${event.eventId}`);
    assert(typeof event.source.kind==='string'&&event.source.kind,`Invalid event source kind: ${event.eventId}`);
    assert(typeof event.source.ref==='string'&&event.source.ref,`Invalid event source ref: ${event.eventId}`);
    validatePayload(event);
    return cloneFrozen(event);
  };

  const computeGate=(dimensions,targetId,phaseId,gapOverrideActive)=>{
    const t=contract.thresholds;
    const assessment=dimensions.chapterAssessment;
    const exercise=dimensions.exercise;
    const lab=dimensions.labOrSimulation;
    const project=dimensions.projectRubric;
    const retention=dimensions.retention;
    const russianTermsRequired=['GD2','GD3'].includes(phaseId)
      && t.russianTechnicalTermsInGD2GD3.appliesToNonRussianTargets
      && !targetId.startsWith('RU-');
    const checks={
      chapterAssessment:Boolean(assessment&&assessment.percent>=t.chapterAssessmentPercent&&assessment.criticalPercent>=t.criticalPrerequisiteFloorPercent),
      exercise:Boolean(exercise&&exercise.percent>=t.exercisePercent&&exercise.completedItems===exercise.totalItems),
      labOrSimulation:Boolean(lab&&lab.passed&&(!t.labExplanationRequired||lab.explanationAccepted)),
      projectRubric:Boolean(project&&t.projectRubricDimensions.every(d=>project.rubric[d]>=t.projectRubricMinimumPerDimension)),
      retention:Boolean(retention&&retention.percent>=t.retentionPercent&&retention.daysAfterLearning>=t.retentionWindowDays.minimum&&retention.daysAfterLearning<=t.retentionWindowDays.maximum),
      russianTechnicalTerms:!russianTermsRequired||Boolean(dimensions.russianTechnicalTerms&&dimensions.russianTechnicalTerms.verifiedTermCount>=t.russianTechnicalTermsInGD2GD3.minimum),
      noGapOverride:!gapOverrideActive
    };
    const required=[...contract.masterReadyGate.requiredDimensions,...(russianTermsRequired?['russianTechnicalTerms']:[]),'noGapOverride'];
    return deepFreeze({required,checks,russianTermsRequired,passed:required.every(id=>checks[id])});
  };

  const reduceEvidenceStream=events=>{
    assert(Array.isArray(events)&&events.length>0,'Evidence stream must contain at least one event');
    const validated=events.map(validateEvent);
    const first=validated[0];
    const eventIds=new Set();
    for(let i=0;i<validated.length;i++){
      const event=validated[i];
      assert(!eventIds.has(event.eventId),`Duplicate evidence event ID: ${event.eventId}`);
      eventIds.add(event.eventId);
      assert.equal(event.streamId,first.streamId,`Evidence stream ID changed: ${event.eventId}`);
      assert.equal(event.targetId,first.targetId,`Evidence target changed: ${event.eventId}`);
      assert.equal(event.phaseId,first.phaseId,`Evidence phase changed: ${event.eventId}`);
      const expected=i===0?1:validated[i-1].sequence+1;
      assert.equal(event.sequence,expected,`Non-monotonic evidence sequence: ${event.eventId}`);
    }

    const dimensions={
      diagnostic:null,chapterAssessment:null,exercise:null,labOrSimulation:null,
      projectRubric:null,retention:null,russianTechnicalTerms:null,gapOverride:null
    };
    let existingCompetencyVerified=false;
    let knowledgeState='chua_hoc';
    let diagnosticGapSequence=0;
    let learningEvidenceSequence=0;
    let gapOverrideActive=false;
    let everMasterReady=false;
    const transitions=[];

    const derive=sequence=>{
      const gate=computeGate(dimensions,first.targetId,first.phaseId,gapOverrideActive);
      if(gapOverrideActive)return {state:'gap',reason:'gap_override',gate};
      if(gate.passed)return {state:'master_ready',reason:'master_ready_gate_passed',gate};
      if(diagnosticGapSequence>learningEvidenceSequence)return {state:'gap',reason:'diagnostic_gap',gate};
      const retentionFailed=Boolean(dimensions.retention&&!gate.checks.retention);
      if((everMasterReady||gate.checks.chapterAssessment)&&retentionFailed)return {state:'can_on',reason:'retention_due',gate};
      if(existingCompetencyVerified||gate.checks.chapterAssessment)return {state:'dat_prerequisite',reason:'prerequisite_evidence_passed',gate};
      if(sequence>0)return {state:'dang_hoc',reason:'evidence_in_progress',gate};
      return {state:'chua_hoc',reason:'no_evidence',gate};
    };

    let gate=computeGate(dimensions,first.targetId,first.phaseId,false);
    for(const event of validated){
      switch(event.evidenceType){
        case 'diagnostic_result':
          dimensions.diagnostic={...event.payload,sequence:event.sequence};
          if(event.payload.status===contract.diagnosticBoundary.passingStatus)existingCompetencyVerified=true;
          else diagnosticGapSequence=event.sequence;
          break;
        case 'chapter_assessment':
          dimensions.chapterAssessment={...event.payload,sequence:event.sequence}; learningEvidenceSequence=event.sequence; break;
        case 'exercise_set':
          dimensions.exercise={...event.payload,sequence:event.sequence}; learningEvidenceSequence=event.sequence; break;
        case 'lab_or_simulation':
          dimensions.labOrSimulation={...event.payload,sequence:event.sequence}; learningEvidenceSequence=event.sequence; break;
        case 'project_rubric':
          dimensions.projectRubric={rubric:{...event.payload.rubric},sequence:event.sequence}; learningEvidenceSequence=event.sequence; break;
        case 'retention_check':
          dimensions.retention={...event.payload,sequence:event.sequence}; learningEvidenceSequence=event.sequence; break;
        case 'russian_technical_terms':
          dimensions.russianTechnicalTerms={...event.payload,sequence:event.sequence}; break;
        case 'gap_override':
          dimensions.gapOverride={...event.payload,sequence:event.sequence}; gapOverrideActive=event.payload.active; break;
      }
      const derived=derive(event.sequence);
      gate=derived.gate;
      if(derived.state!==knowledgeState){
        transitions.push({sequence:event.sequence,from:knowledgeState,to:derived.state,reason:derived.reason});
        knowledgeState=derived.state;
      }
      if(knowledgeState==='master_ready')everMasterReady=true;
    }

    assert(contract.knowledgeStates.includes(knowledgeState),`Reducer emitted unknown knowledge state: ${knowledgeState}`);
    assert(!(existingCompetencyVerified&&validated.length===1&&knowledgeState==='master_ready'),'Diagnostic pass granted Master-ready');
    assert(knowledgeState!=='master_ready'||gate.passed,'Reducer emitted Master-ready without passing gate');

    return deepFreeze({
      schema:snapshotSchema.$id,
      streamId:first.streamId,
      targetId:first.targetId,
      phaseId:first.phaseId,
      eventCount:validated.length,
      lastSequence:validated.at(-1).sequence,
      knowledgeState,
      existingCompetencyVerified,
      dimensions,
      masterReadyGate:gate,
      prerequisiteEligible:contract.prerequisiteGate.satisfyingStates.includes(knowledgeState),
      persisted:false,
      transitions
    });
  };

  return Object.freeze({
    contract:cloneFrozen(contract),
    blueprint:cloneFrozen(blueprint),
    diagnostic:cloneFrozen(diagnostic),
    catalog:cloneFrozen(catalog),
    validateEvent,
    reduceEvidenceStream
  });
}
