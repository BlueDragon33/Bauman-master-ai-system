// RE64: offline, no-upload reader for two volunteer R02 recordings plus browser consent declaration.
// RE61 remains the canonical text/fingerprint owner. This program cannot authenticate the
// declarant, prove speech authenticity, clear rights, approve RU03 or publish assets.
import {readFileSync,lstatSync,realpathSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildContentFirstRu03Handoff} from './re61-r02-r04-source-review-handoff.mjs';
import {inspectRe63FullUtterance,loadRe63Brief} from './re63-full-utterance-audio-preflight.mjs';

const IDS=['LW_ITEM_R02_NAME','LW_ITEM_R02_INTRO'];
const filenames={
 LW_ITEM_R02_NAME:/^RE64_R02_NAME\.(?:webm|ogg|m4a)$/,
 LW_ITEM_R02_INTRO:/^RE64_R02_INTRO\.(?:webm|ogg|m4a)$/
};
const extFromMime=mime=>{
 if(/^audio\/webm(?:;.*)?$/i.test(mime))return 'webm';
 if(/^audio\/ogg(?:;.*)?$/i.test(mime))return 'ogg';
 if(/^audio\/mp4(?:;.*)?$/i.test(mime))return 'm4a';
 return null;
};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const safe=id=>String(id??'').trim();
export function validateRe64SpeakerDeclaration(declaration,{handoff=buildContentFirstRu03Handoff()}={}){
 const errors=[];
 if(declaration?.schema!=='RUSSIAN_CONTENT_FIRST_RE64_SPEAKER_DECLARATION_V1'||
    declaration?.status!=='SUBMITTED_CANDIDATE_UNVERIFIED'||
    declaration?.sourceOwner!=='subjects/russian/data/listen-write-lessons.json'||
    declaration?.autoUploaded!==false||declaration?.humanRu03Approved!==false||
    declaration?.canonicalPublicationReady!==false||
    declaration?.wholeTextAcousticallyVerified!==false)
   errors.push('speaker declaration must not claim authority or upload');
 if(!safe(declaration?.speakerCredit)||safe(declaration.speakerCredit).length>120)
   errors.push('speaker credit is required (identity remains unverified)');
 const consent=declaration?.consent||{};
 if(consent.selfRecordedHumanVoiceDeclared!==true||
   consent.rightsToLicenseDeclared!==true||
   consent.offeredLicense!=='CC-BY-4.0'||consent.allowsOfflineDistribution!==true||
   consent.understoodIndependentReview!==true||consent.independentRightsVerified!==false||
   consent.grantedBy!=='SPEAKER_SELF_DECLARATION_ONLY')
   errors.push('explicit license/speaker declarations required, not independent clearance');
 if(!declaration?.generatedAtUtc||Number.isNaN(Date.parse(declaration.generatedAtUtc)))
   errors.push('declaration timestamp missing');
 if(handoff?.itemCount!==6||handoff.canonicalPublicationReady!==false)
   errors.push('RE61 unapproved six-item reference required');
 const source=new Map((handoff?.reviewItems||[]).map(x=>[x.sourceItemId,x]));
 const clips=declaration?.clips;
 if(!Array.isArray(clips)||clips.length!==2||
    clips.some((clip,i)=>clip?.sourceItemId!==IDS[i]))
   errors.push('exactly two R02 recordings with stable source order required');
 for(const clip of Array.isArray(clips)?clips:[]){
   const item=source.get(clip?.sourceItemId);
   if(!item||item.lessonId!=='R02'||clip.sourceTextRu!==item.textRu)
     errors.push('wrong exact source sentence for '+clip?.sourceItemId);
   const ext=extFromMime(clip.mimeType);
   if(!ext||!filenames[clip.sourceItemId]?.test(clip.filename)||!clip.filename.endsWith('.'+ext))
     errors.push('unexpected source-specific filename/mime');
   if(!Number.isInteger(clip.bytes)||clip.bytes<100||clip.bytes>15728640)
     errors.push('invalid recorded bytes');
   if(!/^[a-f0-9]{64}$/.test(clip.sha256||''))
     errors.push('missing recorded SHA-256');
   if(!(Number.isFinite(clip.estimatedDurationSeconds)&&
        clip.estimatedDurationSeconds>=0.4&&clip.estimatedDurationSeconds<=30.5))
     errors.push('recorded duration outside QA range');
   if(!clip.recordedAtUtc||Number.isNaN(Date.parse(clip.recordedAtUtc)))
     errors.push('recording timestamp missing');
   if(clip.originalAudioClaim!=='SELF_RECORDED_HUMAN_VOICE_NOT_INDEPENDENTLY_VERIFIED')
     errors.push('source voice declaration cannot be verified automatically');
 }
 return Object.freeze({ok:errors.length===0,errors,sourceItems:IDS.length,
   verifiedRights:false,verifiedHumanSpeech:false,ru03Approved:false});
}

export function inspectRe64SpeakerPackage({
  declaration,audioDir,ffprobe='ffprobe',
  handoff=buildContentFirstRu03Handoff(),brief=loadRe63Brief()
}={}){
 const check=validateRe64SpeakerDeclaration(declaration,{handoff});
 if(!check.ok)throw Error('RE64 speaker declaration invalid: '+check.errors.join('; '));
 if(!safe(audioDir))throw Error('RE64 audio directory required');
 const base=realpathSync(audioDir);
 const results=[],hashes=new Set();
 for(const clip of declaration.clips){
   if(!filenames[clip.sourceItemId].test(clip.filename)||path.basename(clip.filename)!==clip.filename)
     throw Error('RE64 unsafe candidate filename');
   const file=path.join(base,clip.filename);
   let st;
   try{st=lstatSync(file)}catch{throw Error('RE64 missing source audio '+clip.filename)}
   if(!st.isFile()||st.isSymbolicLink()||realpathSync(file)!==file)
     throw Error('RE64 symbolic/nonregular source file forbidden');
   const bytes=readFileSync(file);
   const digest=hash(bytes);
   if(bytes.length!==clip.bytes||digest!==clip.sha256)
     throw Error('RE64 recorded audio SHA/bytes mismatch '+clip.sourceItemId);
   if(hashes.has(digest))throw Error('RE64 duplicate identical recorded bytes across two sentences');
   hashes.add(digest);
   const inspected=inspectRe63FullUtterance({
     sourceItemId:clip.sourceItemId,audioPath:file,
     provenance:'HUMAN_UNVERIFIED',brief,handoff,ffprobe
   });
   const codecOk=(clip.filename.endsWith('.webm')&&inspected.codec==='opus')||
      (clip.filename.endsWith('.ogg')&&inspected.codec==='opus')||
      (clip.filename.endsWith('.m4a')&&inspected.codec==='aac');
   if(inspected.status!=='TECHNICAL_BYTES_VALIDATED_RU03_AND_RIGHTS_BLOCKED'||!codecOk||
       inspected.sha256FromBytes!==digest||
       Math.abs(inspected.durationSeconds-clip.estimatedDurationSeconds)>2)
     throw Error('RE64 technical codec/duration inspection incomplete '+clip.sourceItemId);
   const packet=handoff.reviewItems.find(x=>x.sourceItemId===clip.sourceItemId);
   results.push(Object.freeze({
     sourceItemId:clip.sourceItemId,itemId:packet.itemId,
     expectedTextRu:packet.textRu,
     exactTextFingerprint:packet.textFingerprint,
     exactReviewFingerprint:packet.reviewFingerprint,
     fileName:clip.filename,sha256:digest,bytes:bytes.length,
     format:inspected.codec,sampleRate:inspected.sampleRate,
     channels:inspected.channels,durationSeconds:inspected.durationSeconds,
     technicalIntegrity:true,voiceAndSpeechAccuracyVerified:false,
     licenceDeclared:'CC-BY-4.0',rightsReview:'INDEPENDENT_REVIEW_REQUIRED',
     humanRu03Review:'PENDING_EXTERNAL',audioApproved:false,
     publishable:false
   }));
 }
 return Object.freeze({
   schema:'RUSSIAN_CONTENT_FIRST_RE64_REVIEW_INBOX_V1',
   status:'MEDIA_TECHNICALLY_INSPECTED_RIGHTS_AND_HUMAN_RU03_PENDING',
   sourceOwner:'subjects/russian/data/listen-write-lessons.json',
   speakerCreditClaim:declaration.speakerCredit,
   origin:'LOCAL_VOLUNTARY_UNVERIFIED_SPEAKER_DECLARATION',
   recordings:Object.freeze(results),itemCount:results.length,
   technicalIntegrityCount:results.length,
   voiceProvenanceVerified:false,independentRightsClearance:false,
   pronunciationVerified:false,ru03Approved:false,
   canonicalPublicationReady:false,assetAvailableToLearner:false
 });
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const di=process.argv.indexOf('--declaration'),ai=process.argv.indexOf('--audio-dir');
 if(di<0||ai<0||!process.argv[di+1]||!process.argv[ai+1]){
   console.error('Usage: node re64-speaker-recording-intake.mjs --declaration /safe/consent.json --audio-dir /safe/voice-folder');
   process.exitCode=2;
 }else{
   try{
     const result=inspectRe64SpeakerPackage({
       declaration:JSON.parse(readFileSync(process.argv[di+1],'utf8')),
       audioDir:process.argv[ai+1]
     });
     console.log(JSON.stringify(result,null,2));
   }catch(e){
     console.error(JSON.stringify({
       status:'BLOCKED_INTAKE',reason:String(e?.message||e),
       humanRu03Approved:false,canonicalPublicationReady:false
     }));
     process.exitCode=2;
   }
 }
}
