import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {buildContentFirstRu03Handoff} from '../review/re61-r02-r04-source-review-handoff.mjs';
import {
 loadRe63Brief,validateRe63Brief,inspectRe63FullUtterance
} from '../review/re63-full-utterance-audio-preflight.mjs';

const brief=loadRe63Brief(), handoff=buildContentFirstRu03Handoff();
assert.equal(validateRe63Brief(brief,{handoff}).ok,true);
assert.equal(brief.recordedAssetCount,0);
assert.equal(brief.releaseAllowed,false);
assert.equal(brief.sourceItems.length,2);
assert.ok(handoff.reviewItems.length===6);
for(const id of ['LW_ITEM_R02_NAME','LW_ITEM_R02_INTRO']){
  const missing=inspectRe63FullUtterance({sourceItemId:id,brief,handoff});
  assert.equal(missing.status,'BLOCKED_FULL_SENTENCE_AUDIO_MISSING');
  assert.equal(missing.sha256FromBytes,null);
  assert.equal(missing.sourceTextAcousticallyVerified,false);
  assert.equal(missing.humanRu03Approved,false);
  assert.equal(missing.audioPromotable,false);
  assert.equal(missing.canonicalPublicationReady,false);
  assert.equal(missing.expectedExactUtterance,handoff.reviewItems.find(x=>x.sourceItemId===id).textRu);
}
const fakeApproved=structuredClone(brief);
fakeApproved.releaseAllowed=true;
assert.equal(validateRe63Brief(fakeApproved,{handoff}).ok,false);
const fakeAsset=structuredClone(brief);
fakeAsset.sourceItems[0].sourceAudioSha256='a'.repeat(64);
assert.equal(validateRe63Brief(fakeAsset,{handoff}).ok,false);
assert.throws(()=>inspectRe63FullUtterance({sourceItemId:'RANDOM',brief,handoff}),/unsupported sourceItemId/);
assert.throws(()=>inspectRe63FullUtterance({sourceItemId:'LW_ITEM_R02_NAME',provenance:'APPROVED',brief,handoff}),/provenance/);

const dir=mkdtempSync(path.join(tmpdir(),'russian-re63-'));
let positive='NOT_TESTED_FFPROBE_NOT_INSTALLED';
try {
 const file=path.join(dir,'r02-synthetic-technical-QA-ONLY.wav');
 // Generate a one-second silent 16-bit WAV with a real valid header.
 // This intentionally DOES NOT contain speech and can never prove R02 pronunciation.
 const samples=16000, body=Buffer.alloc(samples*2), wav=Buffer.alloc(44+body.length);
 wav.write('RIFF',0);wav.writeUInt32LE(36+body.length,4);wav.write('WAVE',8);
 wav.write('fmt ',12);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);
 wav.writeUInt16LE(1,22);wav.writeUInt32LE(samples,24);
 wav.writeUInt32LE(samples*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);
 wav.write('data',36);wav.writeUInt32LE(body.length,40);body.copy(wav,44);
 writeFileSync(file,wav);
 const exists=spawnSync('ffprobe',['-version'],{windowsHide:true}).status===0;
 const evaluated=inspectRe63FullUtterance({sourceItemId:'LW_ITEM_R02_INTRO',
    brief,handoff,audioPath:file,provenance:'SYNTHETIC_QA'});
 assert.equal(evaluated.actualBytes,wav.length);
 assert.equal(evaluated.sha256FromBytes,createHash('sha256').update(wav).digest('hex'));
 assert.equal(evaluated.originalAudioProvenance,'SYNTHETIC_QA');
 assert.equal(evaluated.sourceTextAcousticallyVerified,false);
 assert.equal(evaluated.humanRu03Approved,false);
 assert.equal(evaluated.audioPromotable,false);
 assert.equal(evaluated.canonicalPublicationReady,false);
 assert.equal(evaluated.offlineRuntimeAsset,false);
 assert.equal(evaluated.voiceAndWordsVerifiedByHuman,false);
 if(exists){
   assert.equal(evaluated.status,'TECHNICAL_BYTES_VALIDATED_RU03_AND_RIGHTS_BLOCKED');
   assert.equal(evaluated.codec,'pcm_s16le');
   assert.equal(evaluated.sampleRate,16000);
   assert.equal(evaluated.channels,1);
   positive='TECHNICAL_WAV_ONLY_NOT_SPEECH';
 }else{
   assert.equal(evaluated.status,'BLOCKED_CODEC_UNREADABLE');
   positive='BLOCKED_FFPROBE_NOT_AVAILABLE';
 }
 const wrong=path.join(dir,'invalid.wav');
 writeFileSync(wrong,Buffer.from('not an audio file'));
 const rejected=inspectRe63FullUtterance({sourceItemId:'LW_ITEM_R02_NAME',brief,handoff,
   provenance:'SYNTHETIC_QA',audioPath:wrong});
 assert.equal(rejected.status,'BLOCKED_FILE_SIZE');
 assert.equal(rejected.audioPromotable,false);
}finally{rmSync(dir,{recursive:true,force:true})}
console.log('RUSSIAN_RE63_EXACT_R02_AUDIO_PREFLIGHT_PASS',JSON.stringify({
 utteranceSlots:2,realHumanRecordings:0,syntheticQaBytesMeasured:true,
 syntheticTechnicalProbe:positive,sourceTextVerifiedByHuman:false,
 rightsApproval:false,ru03Approval:false,publishAllowed:false
}));
