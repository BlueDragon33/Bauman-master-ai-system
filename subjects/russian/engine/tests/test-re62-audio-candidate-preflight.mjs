import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {loadRe62CandidateManifest,validateRe62Manifest,inspectRe62Candidate,buildRe62AudioReviewAddendum}
  from '../review/re62-audio-candidate-preflight.mjs';
import {buildContentFirstRu03Handoff} from '../review/re61-r02-r04-source-review-handoff.mjs';

const m=loadRe62CandidateManifest();
const handoff=buildContentFirstRu03Handoff();
assert.equal(handoff.itemCount,6);
assert.equal(validateRe62Manifest(m,{handoff}).ok,true);
assert.equal(m.candidates.length,1);
assert.equal(m.candidates[0].sourceType,'PARTIAL_WORD_AUDIO_ONLY');
assert.equal(m.candidates[0].exactClipText,'Здравствуйте');
assert.equal(m.candidates[0].wholeSourceItemMatched,false);
assert.equal(m.candidates[0].declaredBytes,11875);
assert.equal(m.candidates[0].declaredSha1,'6dc217b5eda1192da86824f449782a932d4e7c55');
assert.equal(m.candidates[0].actualSha256,null);
assert.equal(m.candidates[0].testOnly,false);
const linked=buildRe62AudioReviewAddendum({manifest:m,handoff});
assert.equal(linked.schema,'RUSSIAN_CONTENT_FIRST_RE62_RU03_AUDIO_ADDENDUM_V1');
assert.equal(linked.reviewItemCount,6);
assert.equal(linked.discoveredPartialClips,1);
assert.equal(linked.fullSentenceAudioAvailable,0);
assert.equal(linked.audioHashedFromBytes,0);
assert.equal(linked.authorizedReviewerCount,0);
assert.equal(linked.canonicalPublicationReady,false);
const intro=linked.reviewItems.find(x=>x.sourceItemId==='LW_ITEM_R02_INTRO');
assert.equal(intro.partialReferences.length,1);
assert.equal(intro.partialReferences[0].clipText,'Здравствуйте');
assert.equal(intro.partialReferences[0].eligibleAsFullSourceAudio,false);
assert.ok(linked.reviewItems.filter(x=>x.sourceItemId!=='LW_ITEM_R02_INTRO')
  .every(x=>x.partialReferences.length===0));
assert.ok(linked.reviewItems.every(x=>x.audioFingerprint===null&&x.canonicalPublicationReady===false));
const withoutBytes=inspectRe62Candidate({manifest:m,handoff});
assert.equal(withoutBytes.status,'BLOCKED_AUDIO_BYTES_NOT_AVAILABLE');
assert.equal(withoutBytes.actualSha256,null);
assert.equal(withoutBytes.technicalAudioPassed,false);
assert.equal(withoutBytes.packagingAllowed,false);
assert.equal(withoutBytes.audioRu03Ready,false);
assert.equal(withoutBytes.canonicalPublicationReady,false);

const mutate=(fn)=>{
  const copy=structuredClone(m);
  fn(copy);
  assert.equal(validateRe62Manifest(copy,{handoff}).ok,false);
  assert.throws(()=>inspectRe62Candidate({manifest:copy,handoff}),/RE62 candidate contract invalid/);
};
mutate(x=>{x.humanApproval=true});
mutate(x=>{x.audioAuthority='HUMAN_RU03'});
mutate(x=>{x.candidates[0].actualSha256='a'.repeat(64)});
mutate(x=>{x.candidates[0].declaredSha1='b'.repeat(40)});
mutate(x=>{x.candidates[0].rightsNotes='all rights cleared'});
mutate(x=>{x.candidates[0].wholeSourceItemMatched=true});
mutate(x=>{x.candidates[0].sourceItemId='LW_ITEM_R04_METRO'});
mutate(x=>{x.candidates[0].fullSentenceUseAllowed=true});
mutate(x=>{x.sourceUtteranceIds.pop()});
mutate(x=>{x.candidates[0].packagingAllowed=true});
mutate(x=>{x.candidates[0].sourcePage='http://example.org/audio.ogg'});

const dir=mkdtempSync(path.join(tmpdir(),'russian-re62-'));
try{
  const fake=path.join(dir,'synthetic-invalid.ogg');
  writeFileSync(fake,Buffer.from('OggS-THIS-IS-NOT-A-REAL-ORIGINAL-FILE'));
  const result=inspectRe62Candidate({manifest:m,handoff,audioPath:fake});
  assert.equal(result.status,'BLOCKED_BYTES_METADATA_OR_OGG_MISMATCH');
  assert.equal(result.actualBytes,37);
  assert.match(result.actualSha256,/^[a-f0-9]{64}$/);
  assert.equal(result.sourceBytesMatch,false);
  assert.equal(result.audioRu03Ready,false);
  assert.equal(result.packagingAllowed,false);
  assert.equal(result.canonicalPublicationReady,false);
  const missing=inspectRe62Candidate({manifest:m,handoff,audioPath:path.join(dir,'missing.ogg')});
  assert.equal(missing.status,'BLOCKED_AUDIO_FILE_UNREADABLE');
}finally{rmSync(dir,{recursive:true,force:true})}
console.log('RUSSIAN_RE62_AUDIO_SOURCE_PREFLIGHT_PASS',JSON.stringify({
  metadataBound:true,utterances:handoff.itemCount,partialCandidate:1,
  sourceBytesDownloaded:false,actualSha256:null,codecInspection:'BLOCKED_NO_REAL_SOURCE_BYTES',
  fakeOggRejected:true,rightsHumanReviewPending:true,
  negativeAuthoritySourceCases:11,canonicalPublicationReady:false
}));
