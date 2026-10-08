import {fingerprint} from './re45-review-core.mjs';
import {loadReviewableCandidates,validateReviewableCandidates} from './re46-reviewable-candidate.mjs';

const clone=v=>structuredClone(v);

const PATCHES=Object.freeze({
  spatial:Object.freeze({
    'rl-15-university':Object.freeze({
      from:'Передай, пожалуйста, тетрадь.',
      to:'Передай мне, пожалуйста, тетрадь.',
      rationaleVi:'Lời nhờ phải khớp hành động đưa quyển vở cho chính người đang nói. Thêm «мне» loại bỏ mơ hồ người nhận và phù hợp hơn cho người học A0.'
    })
  }),
  dialogues:Object.freeze({
    'repair-dorm-shower':Object.freeze({
      field:'reply',
      from:'Душевая в конце коридора, направо.',
      to:'Душевая в конце коридора справа.',
      rationaleVi:'«направо» là hướng chuyển động (sang phải), còn câu hiện tại mô tả vị trí. «справа» khớp nghĩa vị trí và đơn giản hơn cho A0.'
    })
  })
});

function fail(message){throw new Error('RE48 '+message)}

export function buildRe48Candidate({base=loadReviewableCandidates()}={}){
  const check=validateReviewableCandidates(base);
  if(!check.ok)fail('base candidate invalid: '+check.errors.join('; '));
  if(base.spatial.revision!=='real-life-r3-ai-candidate-1')fail('unexpected spatial base revision');
  if(base.dialogues.revision!=='repair-dialogues-ai-draft-r2')fail('unexpected dialogue base revision');

  const spatial=clone(base.spatial),dialogues=clone(base.dialogues);
  const s=spatial.scenes.find(x=>x.sceneId==='rl-15-university');
  const sp=PATCHES.spatial['rl-15-university'];
  if(!s||s.russianDraft!==sp.from)fail('rl-15 old text drift');
  if(s.utteranceSpeakerRole!=='classmate'||s.utteranceRecipientRole!=='learner')fail('rl-15 roles drift');
  if(s.expectedAction?.kind!=='handover-object'||s.expectedAction?.toNodeId!=='classmate')fail('rl-15 action drift');
  s.russianDraft=sp.to;
  s.revision='real-life-r4-ai-candidate-1';
  s.status='AI_DRAFT_PENDING_RU03';
  spatial.revision='real-life-r4-ai-candidate-1';
  spatial.status='AI_DRAFT_PENDING_RU03';
  spatial.humanApproval=false;

  const d=dialogues.scenes.find(x=>x.sceneId==='repair-dorm-shower');
  const dp=PATCHES.dialogues['repair-dorm-shower'];
  if(!d||d.surface?.[dp.field]!==dp.from)fail('dorm reply old text drift');
  if(d.targetNodeId!=='shower-room'||d.turnRoles?.reply?.speakerRole!=='dorm-administrator'||d.turnRoles?.reply?.recipientRole!=='learner')fail('dorm reply context drift');
  d.surface[dp.field]=dp.to;
  d.status='AI_DRAFT_PENDING_RU03';
  dialogues.revision='repair-dialogues-ai-draft-r3';
  dialogues.status='AI_DRAFT_PENDING_RU03';
  dialogues.humanApproval=false;

  return Object.freeze({
    schema:'RUSSIAN_ENGINE_RE48_LINGUISTIC_REDTEAM_CANDIDATE_V1',
    status:'AI_DRAFT_PENDING_RU03',
    humanApproval:false,
    source:Object.freeze({
      spatialRevision:base.spatial.revision,
      dialogueRevision:base.dialogues.revision,
      spatialFingerprint:fingerprint(base.spatial),
      dialogueFingerprint:fingerprint(base.dialogues)
    }),
    corrections:Object.freeze({
      spatial:Object.freeze([{sceneId:'rl-15-university',...sp}]),
      dialogues:Object.freeze([{sceneId:'repair-dorm-shower',...dp}])
    }),
    spatial:Object.freeze(spatial),
    dialogues:Object.freeze(dialogues),
    canonicalPublicationReady:false
  });
}

export function validateRe48Candidate(candidate){
  const errors=[];
  if(candidate?.schema!=='RUSSIAN_ENGINE_RE48_LINGUISTIC_REDTEAM_CANDIDATE_V1')errors.push('schema');
  if(candidate?.status!=='AI_DRAFT_PENDING_RU03'||candidate?.humanApproval!==false)errors.push('authority');
  const s=candidate?.spatial?.scenes?.find(x=>x.sceneId==='rl-15-university');
  if(s?.russianDraft!=='Передай мне, пожалуйста, тетрадь.')errors.push('rl-15 correction');
  if(s?.expectedAction?.toNodeId!=='classmate')errors.push('rl-15 semantics');
  const d=candidate?.dialogues?.scenes?.find(x=>x.sceneId==='repair-dorm-shower');
  if(d?.surface?.reply!=='Душевая в конце коридора справа.')errors.push('dorm correction');
  if(d?.targetNodeId!=='shower-room')errors.push('dorm target');
  if(candidate?.spatial?.revision!=='real-life-r4-ai-candidate-1')errors.push('spatial revision');
  if(candidate?.dialogues?.revision!=='repair-dialogues-ai-draft-r3')errors.push('dialogue revision');
  return Object.freeze({ok:errors.length===0,errors,canonicalPublicationReady:false});
}
