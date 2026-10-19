// RE62: independent, read-only candidate-audio preflight.
// Does not download, certify speakers/rights/RU03, write media to runtime or grant mastery.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildContentFirstRu03Handoff} from './re61-r02-r04-source-review-handoff.mjs';

const json=relative=>JSON.parse(readFileSync(new URL(relative,import.meta.url),'utf8'));
export const loadRe62CandidateManifest=()=>json('../content/review/re62-audio-source-candidates.v1.json');
const hash=(bytes,kind)=>createHash(kind).update(bytes).digest('hex');
const HEX40=/^[a-f0-9]{40}$/, HEX64=/^[a-f0-9]{64}$/;
const text=value=>String(value??'').trim();
const sourcePage='https://commons.wikimedia.org/wiki/File:CPIDL_Russian_-_Zdravstvujte.ogg';
const mediaUrl='https://upload.wikimedia.org/wikipedia/commons/c/ca/CPIDL_Russian_-_Zdravstvujte.ogg';

export function validateRe62Manifest(manifest=loadRe62CandidateManifest(),{
  handoff=buildContentFirstRu03Handoff()
}={}){
  const errors=[];
  if(manifest?.schema!=='RUSSIAN_CONTENT_FIRST_RE62_AUDIO_SOURCE_CANDIDATES_V1')
    errors.push('manifest schema invalid');
  if(manifest?.status!=='UNVERIFIED_DISCOVERY_ONLY'||manifest?.humanApproval!==false||
    manifest?.canonicalPublicationReady!==false||manifest?.audioAuthority!=='NONE'||
    manifest?.reviewedBy!==null||manifest?.audioAssetHash!==null||
    manifest?.rightsReview!=='PENDING')errors.push('authority cannot be asserted by source manifest');
  if(handoff?.schema!=='RUSSIAN_CONTENT_FIRST_RE61_HANDOFF_V1'||
    handoff?.canonicalPublicationReady!==false||handoff?.audioReady!==false||
    handoff?.itemCount!==6)errors.push('exact RE61 handoff required');
  const allowed=new Map((handoff?.reviewItems||[]).map(x=>[x.sourceItemId,x]));
  const supplied=manifest?.sourceUtteranceIds||[];
  if(!Array.isArray(supplied)||supplied.length!==allowed.size||
    new Set(supplied).size!==allowed.size||supplied.some(id=>!allowed.has(id)))
    errors.push('six canonical utterances do not match RE61 handoff');
  const candidates=manifest?.candidates;
  if(!Array.isArray(candidates)||candidates.length!==1)
    errors.push('expected one explicitly described candidate');
  for(const c of Array.isArray(candidates)?candidates:[]){
    const item=allowed.get(c.sourceItemId);
    if(!item)errors.push('unknown source item');
    if(c.candidateId!=='RU03_COMMONS_PD_ZDRAVSTVUJTE_2004'||
      c.sourceType!=='PARTIAL_WORD_AUDIO_ONLY'||
      c.exactClipText!=='Здравствуйте'||c.startsUtteranceWith!=='Здравствуйте.'||
      c.wholeSourceItemMatched!==false||
      !item?.textRu?.startsWith(c.startsUtteranceWith)||
      item?.textRu===c.exactClipText||item?.textRu===c.startsUtteranceWith)
      errors.push('candidate must remain only a partial opening word, never whole RE61 sentence');
    if(c.sourcePage!==sourcePage||c.originalMediaUrl!==mediaUrl)
      errors.push('untrusted source or media URL');
    if(c.declaredLicense!=='PUBLIC_DOMAIN_DECLARED_ON_COMMONS_FILE_PAGE'||
      !/recorded by a friend/i.test(c.rightsNotes||'')||
      c.rightsNotes?.indexOf('recorded myself')<0)errors.push('copyright/upload provenance concern must remain explicit');
    if(c.declaredBytes!==11875||c.declaredSha1!=='6dc217b5eda1192da86824f449782a932d4e7c55'||
      c.declaredMediaType!=='application/ogg'||c.declaredContainer!=='ogg'||
      c.codecPageDescription!=='Ogg Vorbis'||
      Math.abs(c.declaredDurationSeconds-1.0071655328798186)>0.00001)
      errors.push('source metadata mismatch');
    if(c.pageEvidenceStatus!=='SOURCE_METADATA_RETRIEVED_NOT_BYTES'||
      c.byteStatus!=='NOT_DOWNLOADED'||
      c.actualSha1!==null||c.actualSha256!==null||
      c.measuredCodec!==null||c.measuredDurationSeconds!==null||
      c.measuredSampleRate!==null||c.measuredChannels!==null)
      errors.push('metadata cannot impersonate locally inspected bytes');
    if(c.playbackVerified!==false||c.russianPhoneticsVerified!==false||
      c.prosodyVerified!==false||c.humanRu03Status!=='PENDING_EXTERNAL_RU03'||
      c.packagingAllowed!==false||c.fullSentenceUseAllowed!==false||
      c.testOnly!==false)errors.push('not approved for runtime/rehosting/RU03');
  }
  return Object.freeze({ok:errors.length===0,errors,
    sourceCandidateCount:Array.isArray(candidates)?candidates.length:0,
    reviewerCount:handoff?.reviewerCount,
    canonicalPublicationReady:false});
}

export function inspectRe62Candidate({manifest=loadRe62CandidateManifest(),
  handoff=buildContentFirstRu03Handoff(),audioPath=null,ffprobe='ffprobe'}={}){
  const verified=validateRe62Manifest(manifest,{handoff});
  if(!verified.ok)throw Error('RE62 candidate contract invalid: '+verified.errors.join('; '));
  const candidate=manifest.candidates[0];
  const base={
    schema:'RUSSIAN_CONTENT_FIRST_RE62_AUDIO_INSPECTION_V1',
    candidateId:candidate.candidateId,sourceItemId:candidate.sourceItemId,
    sourcePage:candidate.sourcePage,utteranceScope:'PARTIAL_WORD_ONLY',
    matchesFullSentence:false,reviewAuthority:'NONE',
    rightsStatus:'PENDING_INDEPENDENT_PROVENANCE_CHECK',
    audioAuthority:'NONE',audioRu03Ready:false,
    linguisticReview:'PENDING_EXTERNAL_RU03',canonicalPublicationReady:false,
    packagingAllowed:false,rightsEvidenceSource:'COMMONS_PAGE_DECLARATION_ONLY',
    sampleRate:null,channels:null,codec:null,durationSeconds:null,
    actualBytes:null,actualSha1:null,actualSha256:null,
    sourceBytesMatch:false,technicalAudioPassed:false
  };
  if(!audioPath)return Object.freeze({...base,status:'BLOCKED_AUDIO_BYTES_NOT_AVAILABLE'});
  let bytes;
  try{bytes=readFileSync(audioPath)}
  catch(e){return Object.freeze({...base,status:'BLOCKED_AUDIO_FILE_UNREADABLE',
    reason:String(e?.code||e?.message||e)})}
  const results={
    actualBytes:bytes.length,actualSha1:hash(bytes,'sha1'),
    actualSha256:hash(bytes,'sha256')
  };
  if(!HEX40.test(results.actualSha1)||!HEX64.test(results.actualSha256)||
    results.actualBytes!==candidate.declaredBytes||
    results.actualSha1!==candidate.declaredSha1||
    bytes.subarray(0,4).toString('ascii')!=='OggS'){
    return Object.freeze({...base,...results,status:'BLOCKED_BYTES_METADATA_OR_OGG_MISMATCH'});
  }
  let info;
  try{
    const raw=execFileSync(ffprobe,[
      '-v','error','-show_entries','format=format_name,duration,size:stream=codec_name,sample_rate,channels',
      '-of','json',audioPath
    ],{encoding:'utf8',timeout:12000,maxBuffer:102400,windowsHide:true,stdio:['ignore','pipe','pipe']});
    info=JSON.parse(raw);
  }catch(e){
    return Object.freeze({...base,...results,status:'BLOCKED_CODEC_INSPECTION_UNAVAILABLE',
      reason:String(e?.code||e?.message||e).slice(0,250)});
  }
  const stream=(info?.streams||[]).find(s=>s.codec_name==='vorbis');
  const codec=stream?.codec_name||null, sampleRate=Number(stream?.sample_rate)||null;
  const channels=Number(stream?.channels)||null,duration=Number(info?.format?.duration)||null;
  const formats=String(info?.format?.format_name||'').split(',');
  const valid=formats.includes('ogg')&&codec==='vorbis'&&
    sampleRate>=8000&&sampleRate<=192000&&channels>=1&&channels<=2&&
    duration>0&&Math.abs(duration-candidate.declaredDurationSeconds)<0.1&&
    Number(info?.format?.size)===bytes.length;
  return Object.freeze({...base,...results,codec,sampleRate,channels,durationSeconds:duration,
    sourceBytesMatch:valid,technicalAudioPassed:valid,
    status:valid?'TECHNICAL_BYTES_VALIDATED_RU03_RIGHTS_BLOCKED':'BLOCKED_CODEC_OR_DURATION_MISMATCH'});
}

// RE62 is an *addendum* to RE61/RE45/RE50, not a second reviewer pipeline.
// One-word reference has no ability to satisfy the whole-utterance AUDIO gate.
export function buildRe62AudioReviewAddendum({manifest=loadRe62CandidateManifest(),
  handoff=buildContentFirstRu03Handoff()}={}){
  const valid=validateRe62Manifest(manifest,{handoff});
  if(!valid.ok)throw Error('RE62 addendum manifest invalid: '+valid.errors.join('; '));
  const entries=handoff.reviewItems.map(item=>{
    const candidates=manifest.candidates.filter(c=>c.sourceItemId===item.sourceItemId);
    return Object.freeze({
      itemId:item.itemId,sourceItemId:item.sourceItemId,
      exactTextFingerprint:item.textFingerprint,exactReviewFingerprint:item.reviewFingerprint,
      audioFingerprint:null,wholeSentenceAsset:null,
      partialReferences:Object.freeze(candidates.map(c=>Object.freeze({
        candidateId:c.candidateId,sourcePage:c.sourcePage,
        clipText:c.exactClipText,
        sourceStatus:'DISCOVERED_ONLY',
        immutableSha256:null,
        licensedReuse:'REQUIRES_INDEPENDENT_RIGHTS_CHECK',
        clipScope:'WORD_ONLY_NOT_FULL_RE61_SENTENCE',
        eligibleAsFullSourceAudio:false,
        approvedRu03:false
      }))),
      languageReview:'PENDING_EXTERNAL_RU03',audioReview:'PENDING_EXTERNAL_RU03',
      canonicalPublicationReady:false
    });
  });
  return Object.freeze({
    schema:'RUSSIAN_CONTENT_FIRST_RE62_RU03_AUDIO_ADDENDUM_V1',
    inherits:'RE61_RE45_RE50_AUTHORIZED_REVIEW',
    reviewItems:entries,reviewItemCount:entries.length,
    discoveredPartialClips:entries.reduce((sum,item)=>sum+item.partialReferences.length,0),
    fullSentenceAudioAvailable:0,
    audioHashedFromBytes:0,
    approvedTextCount:0,approvedAudioCount:0,
    authorizedReviewerCount:handoff.reviewerCount,
    rightsClearanceReady:false,audioInspectionReady:false,
    canonicalPublicationReady:false
  });
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
  const fileIndex=process.argv.indexOf('--file');
  if(fileIndex>=0&&!process.argv[fileIndex+1])throw Error('--file requires a local audio path');
  const report=inspectRe62Candidate({audioPath:fileIndex>=0?process.argv[fileIndex+1]:null});
  console.log(JSON.stringify(report,null,2));
  // A technically inspected file is still not an authority decision.
  if(!report.technicalAudioPassed)process.exitCode=2;
}
