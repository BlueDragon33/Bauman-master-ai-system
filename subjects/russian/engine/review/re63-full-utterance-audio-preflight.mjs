// RE63: exact R02 full-utterance incoming media technical inspection.
// Read-only. RE61 owns text/review fingerprints; RE45/RE50 own human authorization.
// A valid WAV/Ogg/FLAC proves file structure, NOT that the words were spoken correctly.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {buildContentFirstRu03Handoff} from './re61-r02-r04-source-review-handoff.mjs';

const read=relative=>JSON.parse(readFileSync(new URL(relative,import.meta.url),'utf8'));
export const loadRe63Brief=()=>read('../content/review/re63-r02-full-utterance-capture-brief.v1.json');
const SOURCE_IDS=['LW_ITEM_R02_NAME','LW_ITEM_R02_INTRO'];
const FMT=Object.freeze({
  'wav:pcm_s16le':'WAV_PCM_S16LE',
  'ogg:vorbis':'OGG_VORBIS',
  'flac:flac':'FLAC_LOSSLESS'
});

export function validateRe63Brief(brief=loadRe63Brief(),{
  handoff=buildContentFirstRu03Handoff()
}={}){
  const errors=[];
  if(brief?.schema!=='RUSSIAN_CONTENT_FIRST_RE63_R02_FULL_UTTERANCE_CAPTURE_BRIEF_V1'||
     brief.status!=='RECORDINGS_REQUIRED_HUMAN_VOICE_NOT_SUPPLIED'||
     brief.releaseAllowed!==false||brief.noTtsPromotion!==true||
     brief.defaultLearnerAudioAuthority!=='NONE'||brief.recordedAssetCount!==0||
     brief.humanRu03Status!=='PENDING_EXTERNAL_REVIEW')
    errors.push('brief authority/status invalid');
  if(handoff?.schema!=='RUSSIAN_CONTENT_FIRST_RE61_HANDOFF_V1'||
     handoff.audioReady!==false||handoff.canonicalPublicationReady!==false||
     handoff.itemCount!==6)errors.push('RE61 original handoff is required');
  if(!Array.isArray(brief.sourceItems)||brief.sourceItems.length!==2||
     brief.sourceItems.some((r,i)=>r.sourceItemId!==SOURCE_IDS[i]))
    errors.push('source items must exactly enumerate two R02 utterances');
  const byId=new Map((handoff?.reviewItems||[]).map(x=>[x.sourceItemId,x]));
  for(const item of brief.sourceItems||[]){
    const source=byId.get(item.sourceItemId);
    if(!source||source.itemId!==item.re61PacketId||source.lessonId!=='R02'||
       !source.textRu||source.humanApproval!==false)
      errors.push('RE61 source binding invalid: '+item.sourceItemId);
    if(item.scope!=='COMPLETE_VERBATIM_SOURCE_UTTERANCE'||
       item.speakerRecordingRequired!==true||
       item.sourceAudioFile!==null||item.recordedConsentProof!==null||
       item.licenseApproval!==null||item.sourceAudioSha256!==null||
       item.humanRu03Decision!==null)
      errors.push('no original human full sentence recording/approval exists: '+item.sourceItemId);
  }
  const c=brief.targetCapture;
  if(!c||c.prohibitConcatenatedWords!==true||c.excludeTtsAsHumanSource!==true||
     c.maxBytes!==15728640||c.durationMinSeconds!==0.4||
     c.durationMaxSeconds!==30||
     JSON.stringify(c.requestedAudioFormats)!==JSON.stringify(Object.values(FMT))||
     c.mandatoryHumanReview?.length!==6)
    errors.push('media quality and human approval requirements must remain locked');
  return Object.freeze({ok:errors.length===0,errors,sourceItemCount:brief.sourceItems?.length||0});
}

export function inspectRe63FullUtterance({
  sourceItemId, audioPath=null, provenance='UNKNOWN',
  brief=loadRe63Brief(),handoff=buildContentFirstRu03Handoff(),ffprobe='ffprobe'
}={}){
  const checked=validateRe63Brief(brief,{handoff});
  if(!checked.ok)throw Error('RE63 brief invalid: '+checked.errors.join('; '));
  if(!SOURCE_IDS.includes(sourceItemId))throw Error('RE63 unsupported sourceItemId');
  const source=handoff.reviewItems.find(x=>x.sourceItemId===sourceItemId);
  if(!source)throw Error('RE63 source fingerprint not found');
  if(!['UNKNOWN','HUMAN_UNVERIFIED','SYNTHETIC_QA'].includes(provenance))
    throw Error('RE63 recording provenance must be explicit');
  const base={
    schema:'RUSSIAN_CONTENT_FIRST_RE63_AUDIO_INSPECTION_V1',
    sourceItemId,expectedExactUtterance:source.textRu,
    reviewFingerprint:source.reviewFingerprint,textFingerprint:source.textFingerprint,
    originalAudioProvenance:provenance,
    technicalAudioStatus:'NOT_INSPECTED',
    actualBytes:null,sha256FromBytes:null,codec:null,
    sampleRate:null,channels:null,durationSeconds:null,
    voiceAndWordsVerifiedByHuman:false,
    sourceTextAcousticallyVerified:false,speakerRightsCleared:false,
    humanRu03Approved:false,audioPromotable:false,
    offlineRuntimeAsset:false,canonicalPublicationReady:false
  };
  if(!audioPath)return Object.freeze({...base,status:'BLOCKED_FULL_SENTENCE_AUDIO_MISSING'});
  let bytes;
  try{bytes=readFileSync(audioPath)}
  catch(e){return Object.freeze({...base,status:'BLOCKED_SOURCE_FILE_UNREADABLE',reason:String(e?.code||e?.message||e)})}
  const actualBytes=bytes.length;
  const sha256FromBytes=createHash('sha256').update(bytes).digest('hex');
  const max=brief.targetCapture.maxBytes;
  if(actualBytes<100||actualBytes>max)return Object.freeze({
    ...base,actualBytes,sha256FromBytes,status:'BLOCKED_FILE_SIZE'});
  let detail;
  try{
    const raw=execFileSync(ffprobe,[
      '-v','error','-show_entries','format=format_name,duration,size:stream=codec_name,sample_rate,channels',
      '-of','json',audioPath
    ],{encoding:'utf8',timeout:12000,maxBuffer:102400,windowsHide:true,stdio:['ignore','pipe','pipe']});
    detail=JSON.parse(raw);
  }catch(e){return Object.freeze({
    ...base,actualBytes,sha256FromBytes,status:'BLOCKED_CODEC_UNREADABLE',
    reason:String(e?.code||e?.message||e).slice(0,250)
  })}
  const first=(detail?.streams||[])[0];
  const formats=String(detail?.format?.format_name||'').split(',');
  const codec=first?.codec_name||null, sampleRate=Number(first?.sample_rate)||null,
    channels=Number(first?.channels)||null,duration=Number(detail?.format?.duration)||null;
  const format=formats.includes('wav')?'wav':formats.includes('ogg')?'ogg':
     formats.includes('flac')?'flac':'other';
  const formatKey=FMT[format+':'+codec]||null;
  const head=bytes.subarray(0,4).toString('ascii');
  const magicOk=(format==='wav'&&head==='RIFF'&&bytes.subarray(8,12).toString('ascii')==='WAVE')||
    (format==='ogg'&&head==='OggS')||(format==='flac'&&head==='fLaC');
  const valid=!!formatKey&&magicOk&&brief.targetCapture.requestedAudioFormats.includes(formatKey)&&
    brief.targetCapture.allowedSampleRatesHz.includes(sampleRate)&&
    brief.targetCapture.channelsAllowed.includes(channels)&&
    duration>=brief.targetCapture.durationMinSeconds&&
    duration<=brief.targetCapture.durationMaxSeconds&&
    Number(detail.format.size)===actualBytes;
  return Object.freeze({...base,actualBytes,sha256FromBytes,
    codec,sampleRate,channels,durationSeconds:duration,
    technicalAudioStatus:valid?'TECHNICAL_FILE_INSPECTED':'INVALID_AUDIO_SPEC',
    status:valid?'TECHNICAL_BYTES_VALIDATED_RU03_AND_RIGHTS_BLOCKED':'BLOCKED_AUDIO_SPEC_MISMATCH'
  });
}
