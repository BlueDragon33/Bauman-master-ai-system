import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {buildContentFirstRu03Handoff} from '../review/re61-r02-r04-source-review-handoff.mjs';
import {validateRe64SpeakerDeclaration,inspectRe64SpeakerPackage}
  from '../review/re64-speaker-recording-intake.mjs';
const handoff=buildContentFirstRu03Handoff();
const IDs=['LW_ITEM_R02_NAME','LW_ITEM_R02_INTRO'];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const declaration={
 schema:'RUSSIAN_CONTENT_FIRST_RE64_SPEAKER_DECLARATION_V1',
 status:'SUBMITTED_CANDIDATE_UNVERIFIED',
 sourceOwner:'subjects/russian/data/listen-write-lessons.json',
 generatedAtUtc:'2026-10-20T10:00:00.000Z',speakerCredit:'QA FAKE SPEAKER',
 consent:{selfRecordedHumanVoiceDeclared:true,rightsToLicenseDeclared:true,
   offeredLicense:'CC-BY-4.0',allowsOfflineDistribution:true,
   understoodIndependentReview:true,independentRightsVerified:false,
   grantedBy:'SPEAKER_SELF_DECLARATION_ONLY'},
 clips:IDs.map((id,i)=>({
   sourceItemId:id,sourceTextRu:handoff.reviewItems.find(x=>x.sourceItemId===id).textRu,
   filename:'RE64_R02_'+(i===0?'NAME':'INTRO')+'.webm',
   mimeType:'audio/webm;codecs=opus',bytes:1234,sha256:'a'.repeat(64),
   estimatedDurationSeconds:3,recordedAtUtc:'2026-10-20T10:00:00.000Z',
   originalAudioClaim:'SELF_RECORDED_HUMAN_VOICE_NOT_INDEPENDENTLY_VERIFIED'
 })),
 wholeTextAcousticallyVerified:false,humanRu03Approved:false,
 canonicalPublicationReady:false,autoUploaded:false
};
assert.equal(validateRe64SpeakerDeclaration(declaration,{handoff}).ok,true);
const mutate=change=>{
 const value=structuredClone(declaration);change(value);
 assert.equal(validateRe64SpeakerDeclaration(value,{handoff}).ok,false);
};
mutate(v=>{v.humanRu03Approved=true});
mutate(v=>{v.canonicalPublicationReady=true});
mutate(v=>{v.consent.independentRightsVerified=true});
mutate(v=>{v.consent.offeredLicense='UNKNOWN'});
mutate(v=>{v.consent.rightsToLicenseDeclared=false});
mutate(v=>{v.speakerCredit=''});
mutate(v=>{v.clips[1].sourceItemId=v.clips[0].sourceItemId});
mutate(v=>{v.clips[1].sourceTextRu='Меня зовут Сара.'});
mutate(v=>{v.clips[0].filename='../escape.webm'});
mutate(v=>{v.clips[0].mimeType='audio/mpeg'});
mutate(v=>{v.clips[0].sha256='fake-hash'});
mutate(v=>{v.clips[0].originalAudioClaim='APPROVED_HUMAN_VOICE'});
mutate(v=>{v.autoUploaded=true});
const dir=mkdtempSync(path.join(tmpdir(),'bauman-re64-'));
let positive='SKIPPED_NO_FFMPEG_OR_FFPROBE';
try{
  assert.throws(()=>inspectRe64SpeakerPackage({declaration,audioDir:dir,handoff}),/missing source audio/);
  const ffmpeg=spawnSync('ffmpeg',['-version'],{windowsHide:true});
  const ffprobe=spawnSync('ffprobe',['-version'],{windowsHide:true});
  if(ffmpeg.status===0&&ffprobe.status===0){
    const prepared=structuredClone(declaration);
    for(let i=0;i<prepared.clips.length;i++){
      const c=prepared.clips[i],file=path.join(dir,c.filename);
      // Purely artificial sound for testing the codec and integrity gate:
      // NOT human speech, not an acoustically verified utterance, no rights claim.
      const hz=i===0?'440':'660';
      const seconds=i===0?'1.7':'4.2';
      const run=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',
        '-f','lavfi','-i','sine=frequency='+hz+':duration='+seconds,
        '-ac','1','-ar','48000','-c:a','libopus','-b:a','48k',file],{windowsHide:true});
      assert.equal(run.status,0,'ffmpeg synthetic WebM fixture failed');
      const bytes=readFileSync(file);
      c.bytes=bytes.length;c.sha256=sha(bytes);c.estimatedDurationSeconds=Number(seconds);
    }
    const result=inspectRe64SpeakerPackage({declaration:prepared,audioDir:dir,handoff});
    assert.equal(result.itemCount,2);
    assert.equal(result.technicalIntegrityCount,2);
    assert.equal(result.voiceProvenanceVerified,false);
    assert.equal(result.independentRightsClearance,false);
    assert.equal(result.pronunciationVerified,false);
    assert.equal(result.ru03Approved,false);
    assert.equal(result.assetAvailableToLearner,false);
    assert.equal(result.canonicalPublicationReady,false);
    positive='TECHNICAL_SYNTHETIC_WEBM_TWO_FILES_ONLY';
    const tampered=path.join(dir,prepared.clips[0].filename);
    const bytes=readFileSync(tampered);
    bytes[bytes.length-1]^=0x1;
    writeFileSync(tampered,bytes);
    assert.throws(()=>inspectRe64SpeakerPackage({
      declaration:prepared,audioDir:dir,handoff
    }),/SHA\/bytes mismatch/);
  }
}finally{rmSync(dir,{recursive:true,force:true})}
console.log('RUSSIAN_RE64_SPEAKER_INTAKE_PASS',JSON.stringify({
  sourceItems:2,authorityForgeryCases:13,positiveTechnicalFixture:positive,
  realHumanRecordingSubmitted:false,consentVerifiedByThirdParty:false,
  humanRussianPhoneticsApproved:false,canonicalPublicationReady:false
}));
