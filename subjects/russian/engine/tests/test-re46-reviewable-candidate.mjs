import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gitBlobSha1,loadReviewableCandidates,validateReviewableCandidates} from '../review/re46-reviewable-candidate.mjs';

const spatialPath=new URL('../content/fixtures/real-life-spatial.r2-ai-proposal.json',import.meta.url);
const dialoguePath=new URL('../content/fixtures/repair-dialogues.r1-ai-proposal.json',import.meta.url);
const overlayPath=new URL('../content/fixtures/re46-reviewable-overlay.v1.json',import.meta.url);
const spatialRaw=fs.readFileSync(spatialPath,'utf8');
const dialogueRaw=fs.readFileSync(dialoguePath,'utf8');
const overlay=JSON.parse(fs.readFileSync(overlayPath,'utf8'));

assert.equal(gitBlobSha1(spatialRaw),'3e4a8605575300e48207f70574bbaea0b0182b7a','RE42 source must remain byte-identical');
assert.equal(gitBlobSha1(dialogueRaw),'86b02bf8ea4f7ce12cb1d730bd139637ed0074e1','RE44 source must remain byte-identical');
assert.equal(overlay.humanApproval,false);

const resolved=loadReviewableCandidates();
const check=validateReviewableCandidates(resolved);
assert.equal(check.ok,true,check.errors.join('; '));
assert.equal(resolved.spatial.revision,'real-life-r3-ai-candidate-1');
assert.equal(resolved.dialogues.revision,'repair-dialogues-ai-draft-r2');
assert.equal(resolved.spatial.scenes.length,15);
assert.equal(resolved.dialogues.scenes.length,4);
assert.equal(resolved.spatial.scenes.every(s=>!('speakerRole' in s)),true);
assert.equal(resolved.spatial.scenes.every(s=>s.vn?.setting&&s.vn?.purpose&&s.vn?.actionHint),true);
assert.equal(resolved.dialogues.scenes.every(s=>!('speakerRole' in s)&&s.interlocutorRole),true);

const spatial=id=>resolved.spatial.scenes.find(s=>s.sceneId===id);
assert.deepEqual(
  {speaker:spatial('rl-04-shop').utteranceSpeakerRole,recipient:spatial('rl-04-shop').utteranceRecipientRole},
  {speaker:'learner',recipient:'shop-staff'}
);
assert.deepEqual(
  {speaker:spatial('rl-11-dorm').utteranceSpeakerRole,recipient:spatial('rl-11-dorm').utteranceRecipientRole},
  {speaker:'learner',recipient:'dorm-administrator'}
);
assert.deepEqual(
  {speaker:spatial('rl-01-room').utteranceSpeakerRole,recipient:spatial('rl-01-room').utteranceRecipientRole},
  {speaker:'peer',recipient:'learner'}
);
assert.equal(spatial('rl-08-metro').vn.actionHint.includes('không nhầm với thẻ đi tàu'),true);
assert.equal(spatial('rl-11-dorm').vn.actionHint.includes('không chọn một cánh cửa bất kỳ'),true);
assert.equal(spatial('rl-13-university').vn.actionHint.includes('không chọn cả tòa nhà'),true);

const dialogue=id=>resolved.dialogues.scenes.find(s=>s.sceneId===id);
assert.equal(dialogue('repair-metro-entrance').surface.reply,'Вход в метро дальше по улице, справа.');
assert.equal(dialogue('repair-university-room').surface.reply,'Аудитория номер двенадцать — дальше по коридору, справа.');
assert.equal(dialogue('repair-university-room').vn.reply.includes('phòng học số 12'),true);
assert.deepEqual(dialogue('repair-shop-milk').turnRoles.request,{speakerRole:'learner',recipientRole:'shop-staff'});
assert.deepEqual(dialogue('repair-shop-milk').turnRoles.reply,{speakerRole:'shop-staff',recipientRole:'learner'});

assert.equal(resolved.spatial.humanApproval,false);
assert.equal(resolved.dialogues.humanApproval,false);
assert.equal(resolved.spatial.scenes.every(s=>s.humanApproval===false&&s.textAuthority==='NONE'&&s.audioAuthority==='NONE'),true);
assert.equal(resolved.dialogues.scenes.every(s=>s.humanApproval===false&&s.status==='AI_DRAFT_PENDING_RU03'),true);

const runtime=fs.readFileSync(new URL('../integration/spatial-candidate-experience.js',import.meta.url),'utf8');
assert.equal(runtime.includes('real-life-spatial.r2-ai-proposal.json'),true,'existing preview remains on old candidate');
assert.equal(runtime.includes('re46-reviewable-overlay'),false,'RE46 must not silently enable itself');
assert.equal(runtime.includes('real-life-r3-ai-candidate'),false,'RE46 remains review-only');

console.log(JSON.stringify({
  ok:true,
  baseSpatialImmutable:true,
  baseDialoguesImmutable:true,
  spatialScenes:15,
  dialogueScenes:4,
  explicitTurnRoles:true,
  revisionBoundVietnamese:true,
  revisedDirectionalReplies:2,
  defaultRuntimeUnchanged:true,
  canonicalPublicationReady:false
}));
