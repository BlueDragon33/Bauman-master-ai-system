import assert from 'node:assert/strict';
import {buildRe48Candidate,validateRe48Candidate} from '../review/re48-linguistic-redteam.mjs';
import {loadReviewableCandidates} from '../review/re46-reviewable-candidate.mjs';
import {fingerprint} from '../review/re45-review-core.mjs';

const base=loadReviewableCandidates();
const candidate=buildRe48Candidate({base});
const again=buildRe48Candidate({base});
const valid=validateRe48Candidate(candidate);

assert.equal(valid.ok,true,valid.errors.join('; '));
assert.equal(candidate.humanApproval,false);
assert.equal(candidate.canonicalPublicationReady,false);
assert.equal(candidate.corrections.spatial.length,1);
assert.equal(candidate.corrections.dialogues.length,1);
assert.equal(candidate.spatial.scenes.find(x=>x.sceneId==='rl-15-university').russianDraft,'Передай мне, пожалуйста, тетрадь.');
assert.equal(candidate.dialogues.scenes.find(x=>x.sceneId==='repair-dorm-shower').surface.reply,'Душевая в конце коридора справа.');
assert.equal(candidate.dialogues.revision,'repair-dialogues-ai-draft-r4');
assert.equal(candidate.dialogues.scenes.find(x=>x.sceneId==='repair-dorm-shower').vn.replyHint,'Quản lý cho biết phòng tắm ở cuối hành lang, bên phải.');
assert.equal(candidate.dialogues.scenes.find(x=>x.sceneId==='repair-dorm-shower').vn.replyHint.includes('rẽ phải'),false,'location is not a right-turn instruction');
assert.equal(candidate.spatial.scenes.find(x=>x.sceneId==='rl-15-university').expectedAction.toNodeId,'classmate');
assert.equal(candidate.dialogues.scenes.find(x=>x.sceneId==='repair-dorm-shower').targetNodeId,'shower-room');
assert.equal(candidate.spatial.scenes.every(x=>x.revision===candidate.spatial.revision),true,'every spatial scene revision must match pack revision');
assert.equal(fingerprint(candidate),fingerprint(again),'RE48 output must be deterministic');

const tampered=structuredClone(base);
tampered.spatial.scenes.find(x=>x.sceneId==='rl-15-university').russianDraft='Передай тетрадь.';
assert.throws(()=>buildRe48Candidate({base:tampered}),/old text drift/,'silent source drift must fail closed');

console.log(JSON.stringify({
  ok:true,
  corrections:2,
  rl15RecipientDisambiguated:true,
  dormLocationAdverbCorrected:true,
  VietnameseDirectionalHintAligned:true,
  revisionsAligned:true,
  deterministic:true,
  humanApproval:false,
  canonicalPublicationReady:false
}));
