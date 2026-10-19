// RE61: candidate-only source-bound RU03 handoff for the learner-visible R02–R04 lines.
// Reuses RE45/RE50 review fingerprints, authorized reviewer registry and readiness.
// A handoff is NOT an RU03 approval and does not generate/redistribute recorded audio.
import fs from 'node:fs';
import {fingerprint,finalizeReviewItem,buildReadinessReport} from './re45-review-core.mjs';
import {loadReviewerRegistry,validateReviewerRegistry} from './re50-external-review-handoff.mjs';

const read=relative=>JSON.parse(fs.readFileSync(new URL(relative,import.meta.url),'utf8'));
const TARGET_IDS=Object.freeze({
  R02:['LW_ITEM_R02_NAME','LW_ITEM_R02_INTRO'],
  R03:['LW_ITEM_R03_REG','LW_ITEM_R03_DOCS'],
  R04:['LW_ITEM_R04_METRO','LW_ITEM_R04_DOCTOR']
});
// These are reviewer situation prompts, not independently validated Russian facts.
const SCENE_HINT=Object.freeze({
  LW_ITEM_R02_NAME:{setting:'Gặp người tại trường',speakerRole:'learner',recipientRole:'teacher-or-staff',hint:'Tự giới thiệu tên'},
  LW_ITEM_R02_INTRO:{setting:'Gặp giáo viên lần đầu',speakerRole:'learner',recipientRole:'teacher',hint:'Chào và giới thiệu'},
  LW_ITEM_R03_REG:{setting:'Quầy ký túc xá',speakerRole:'learner',recipientRole:'dormitory-staff',hint:'Cần đăng ký lưu trú'},
  LW_ITEM_R03_DOCS:{setting:'Quầy ký túc xá',speakerRole:'learner',recipientRole:'dormitory-staff',hint:'Hỏi giấy tờ cần thiết'},
  LW_ITEM_R04_METRO:{setting:'Ngoài đường',speakerRole:'learner',recipientRole:'passerby',hint:'Hỏi đường đến metro'},
  LW_ITEM_R04_DOCTOR:{setting:'Cơ sở hỗ trợ y tế',speakerRole:'learner',recipientRole:'medical-staff',hint:'Xin gặp bác sĩ'}
});
const sourcePath='subjects/russian/data/listen-write-lessons.json';
const candidateMapPath='subjects/russian/engine/content/fixtures/r01-r06-source-bound-practice-map.candidate.json';

export function buildContentFirstRu03Handoff({rows=read('../../data/listen-write-lessons.json'),
  map=read('../content/fixtures/r01-r06-source-bound-practice-map.candidate.json'),
  registry=loadReviewerRegistry()}={}){
  const valid=validateReviewerRegistry(registry);
  if(!valid.ok)throw Error('RU03 reviewer registry invalid: '+valid.errors.join(','));
  if(map?.status!=='CANDIDATE_NONCANONICAL_UNVERIFIED'||map.canonicalMutation!==false||
    map.published!==false)throw Error('Source map may not be approved, canonical or published');
  const items=[];
  for(const [lessonId,ids] of Object.entries(TARGET_IDS)){
    const matches=rows.filter(row=>row.lessonId===lessonId);
    if(matches.length!==1||matches[0].id!=='LW_'+lessonId)throw Error('Missing or duplicated source lesson '+lessonId);
    const source=matches[0];
    const m=map.lessonPlans.find(x=>x.lessonId===lessonId);
    if(!m||m.microPractices.length!==ids.length||source.items.length!==ids.length)
      throw Error('Candidate map/source mismatch '+lessonId);
    for(const sourceItemId of ids){
      const matching=source.items.filter(x=>x.id===sourceItemId);
      if(matching.length!==1)throw Error('Missing or duplicated source item '+sourceItemId);
      const sourceItem=matching[0],drill=sourceItem.drills?.[0];
      const mapping=m.microPractices.find(x=>x.sourceItemId===sourceItemId);
      const situation=SCENE_HINT[sourceItemId];
      if(!mapping||!situation||mapping.semanticAuthority!=='UNVERIFIED'||
        mapping.sampleAudioAuthority!=='BLOCKED_NO_RU03_AUDIO_HASH'||
        mapping.textMatchEligibility!=='PROVISIONAL_TEXT_ONLY'||
        !drill?.audioText||sourceItem.printSample!==drill.audioText||
        drill.answer!==drill.audioText)throw Error('Unsafe/untraceable learner text '+sourceItemId);
      const itemId='content-first:'+sourceItemId;
      const sourceRevision=fingerprint({lessonId,sourceItem});
      const packet=finalizeReviewItem({
        itemId,
        sourceCatalog:sourcePath,sourceRevision,sourceSceneId:sourceItemId,
        utteranceKind:drill.kind,textRu:drill.audioText,
        worldId:'learner-scenario-'+lessonId,
        situationVi:{setting:situation.setting,purpose:situation.hint,
          contextAuthority:'CANDIDATE_FOR_REVIEW'},
        speakerRole:situation.speakerRole,recipientRole:situation.recipientRole,
        register:'UNVERIFIED_PLEASE_REVIEW',
        expectedAction:{kind:'learner-says-and-compares-text-only',sourceItemId},
        expectedVisual:{source:'candidate-map',kind:'SYMBOL_ONLY_UNVERIFIED',
          symbols:m.scenarioCue.glyphs,license:'NO_APPROVED_ILLUSTRATION'},
        audio:{kind:'BROWSER_TTS_SAMPLE_ONLY',authority:'NONE',
          immutableAudioSha256:null,recordedAsset:null,licensedAsset:false}
      });
      items.push(Object.freeze({
        ...packet,lessonId,sourceItemId,sourceItemFingerprint:sourceRevision,
        curriculumAuthority:'UNVERIFIED',audioAuthority:'NONE',
        meaningAuthority:'NONE',humanApproval:false,
        reviewQuestions:Object.freeze([
          'TEXT: Is the exact sentence natural, correct and sufficiently polite for the specific speaker, recipient and situation?',
          'TEXT: Verify vocabulary sense, morphology, government, register and any ambiguous contextual meaning.',
          'AUDIO: Require rights-cleared immutable recorded audio and review stress, palatalization, reduction, rhythm and prosody.',
          'TEACHING: Is the expected reaction suitable for a no-Russian Pre-A0/A0 learner without default Vietnamese translation?'
        ]),
        decisionTemplate:Object.freeze({
          decisionId:'',itemId,scope:'TEXT',decision:null,
          reviewerAuthority:'HUMAN_RU03',reviewerType:'HUMAN',reviewerId:'',
          decidedAt:'',reviewFingerprint:packet.reviewFingerprint,
          textFingerprint:packet.textFingerprint,audioFingerprint:null,notes:''
        }),
        status:'PENDING_EXTERNAL_RU03'
      }));
    }
  }
  const inventory={schema:'RUSSIAN_CONTENT_FIRST_RE61_REVIEW_INVENTORY_V1',items};
  const readiness=buildReadinessReport(inventory,[],{reviewerRegistry:registry});
  if(readiness.promotionReady||readiness.entries.some(x=>x.status!=='linguistic_review_pending'))
    throw Error('RU03 external approval missing: fail closed');
  return Object.freeze({
    schema:'RUSSIAN_CONTENT_FIRST_RE61_HANDOFF_V1',
    status:'PENDING_EXTERNAL_RU03',
    inheritsReviewCore:'RE45_RE50_AUTHORIZED_REVIEW_SYSTEM',
    sourceOwner:sourcePath,sourceCandidateMap:candidateMapPath,
    reviewerCount:valid.reviewerCount,itemCount:items.length,
    textReady:false,audioReady:false,canonicalPublicationReady:false,
    re50InventoryUnaffected:true,
    reviewItems:Object.freeze(items),readiness
  });
}
