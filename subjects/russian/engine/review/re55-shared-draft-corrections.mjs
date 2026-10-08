/**
 * Shared AI editorial patch facts for the review pipeline and opt-in learner preview.
 * These are NOT linguistic certifications and never mutate the underlying fixtures.
 */
export const DRAFT_LINGUISTIC_PATCHES=Object.freeze({
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
      hintFrom:'Quản lý hướng dẫn đi cuối hành lang rồi rẽ phải.',
      hintTo:'Quản lý cho biết phòng tắm ở cuối hành lang, bên phải.',
      rationaleVi:'«направо» là hướng chuyển động (sang phải), còn câu hiện tại mô tả vị trí. «справа» khớp nghĩa vị trí và đơn giản hơn cho A0.'
    })
  })
});
const copy=value=>structuredClone(value);
function fail(reason){throw new Error('RE55 preview draft mismatch: '+reason)}

export function applyPreviewSpatialDraft(base){
  if(base?.schema!=='RUSSIAN_ENGINE_SPATIAL_CANDIDATE_V1'||
     base?.revision!=='real-life-r2-ai-candidate-1'||
     base?.status!=='AI_DRAFT_NONCANONICAL'||base?.humanApproval!==false){
    fail('spatial source authority/revision');
  }
  const patch=DRAFT_LINGUISTIC_PATCHES.spatial['rl-15-university'];
  const scene=base.scenes?.find(s=>s.sceneId==='rl-15-university');
  if(scene?.russianDraft!==patch.from||scene?.speakerRole!=='classmate'||
     scene?.expectedAction?.kind!=='handover-object'||
     scene?.expectedAction?.toNodeId!=='classmate'){
    fail('spatial source text or semantic recipient changed');
  }
  const out=copy(base),target=out.scenes.find(s=>s.sceneId==='rl-15-university');
  target.russianDraft=patch.to;
  out.revision='real-life-r2-ai-preview-re55';
  for(const item of out.scenes)item.revision=out.revision;
  out.previewCorrectionStatus='AI_DRAFT_NOT_HUMAN_RU03_REVIEWED';
  out.humanApproval=false;
  return out;
}

export function applyPreviewDialogueDraft(base){
  if(base?.schema!=='RUSSIAN_ENGINE_REPAIR_DIALOGUES_AI_DRAFT_V1'||
     base?.revision!=='repair-dialogues-ai-draft-r1'||
     base?.status!=='AI_DRAFT_PENDING_RU03'||
     base?.humanApproval!==false){
    fail('dialogue source authority/revision');
  }
  const patch=DRAFT_LINGUISTIC_PATCHES.dialogues['repair-dorm-shower'];
  const scene=base.scenes?.find(s=>s.sceneId==='repair-dorm-shower');
  if(scene?.surface?.reply!==patch.from||scene?.vn?.replyHint!==patch.hintFrom||
     scene?.targetNodeId!=='shower-room'||scene?.speakerRole!=='dorm-administrator'){
    fail('dialogue source text, location or Vietnamese meaning changed');
  }
  const out=copy(base),target=out.scenes.find(s=>s.sceneId==='repair-dorm-shower');
  target.surface.reply=patch.to;
  target.vn.replyHint=patch.hintTo;
  out.revision='repair-dialogues-ai-preview-re55';
  out.previewCorrectionStatus='AI_DRAFT_NOT_HUMAN_RU03_REVIEWED';
  out.humanApproval=false;
  return out;
}
