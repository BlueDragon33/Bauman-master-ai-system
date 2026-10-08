import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DRAFT_LINGUISTIC_PATCHES,applyPreviewSpatialDraft,applyPreviewDialogueDraft} from '../review/re55-shared-draft-corrections.mjs';
import {buildRe48Candidate} from '../review/re48-linguistic-redteam.mjs';
import {validateSpatialCandidate} from '../world/spatial-candidate-runtime.mjs';
import {validateRepairDialogueCandidate} from '../conversation/repair-dialogue-candidate.mjs';

const read=uri=>JSON.parse(fs.readFileSync(new URL(uri,import.meta.url),'utf8'));
const baseSpatial=read('../content/fixtures/real-life-spatial.r2-ai-proposal.json');
const baseDialog=read('../content/fixtures/repair-dialogues.r1-ai-proposal.json');
const rawSpatial=JSON.stringify(baseSpatial),rawDialog=JSON.stringify(baseDialog);
const resultSpatial=applyPreviewSpatialDraft(baseSpatial),resultDialog=applyPreviewDialogueDraft(baseDialog);
assert.equal(validateSpatialCandidate(resultSpatial).ok,true);
assert.equal(validateRepairDialogueCandidate(resultDialog,resultSpatial).ok,true);
assert.equal(resultSpatial.scenes.length,15);
assert.equal(resultDialog.scenes.length,4);
assert.equal(resultSpatial.humanApproval,false);
assert.equal(resultDialog.humanApproval,false);
assert.equal(resultSpatial.scenes.every(s=>s.revision===resultSpatial.revision),true);
assert.equal(JSON.stringify(baseSpatial),rawSpatial,'spatial original must not be mutated');
assert.equal(JSON.stringify(baseDialog),rawDialog,'dialogue original must not be mutated');

const notebook=resultSpatial.scenes.find(s=>s.sceneId==='rl-15-university');
const shower=resultDialog.scenes.find(s=>s.sceneId==='repair-dorm-shower');
const review=buildRe48Candidate();
assert.equal(notebook.russianDraft,review.spatial.scenes.find(s=>s.sceneId==='rl-15-university').russianDraft);
assert.equal(shower.surface.reply,review.dialogues.scenes.find(s=>s.sceneId==='repair-dorm-shower').surface.reply);
assert.equal(shower.vn.replyHint,review.dialogues.scenes.find(s=>s.sceneId==='repair-dorm-shower').vn.replyHint);
assert.equal(notebook.russianDraft,DRAFT_LINGUISTIC_PATCHES.spatial['rl-15-university'].to);
assert.equal(shower.surface.reply,DRAFT_LINGUISTIC_PATCHES.dialogues['repair-dorm-shower'].to);

const wrong=structuredClone(baseDialog);
wrong.scenes.find(s=>s.sceneId==='repair-dorm-shower').vn.replyHint='Đi thẳng rồi rẽ trái.';
assert.throws(()=>applyPreviewDialogueDraft(wrong),/Vietnamese meaning changed/);
const old=structuredClone(baseSpatial);
old.scenes.find(s=>s.sceneId==='rl-15-university').russianDraft='Дай тетрадь.';
assert.throws(()=>applyPreviewSpatialDraft(old),/source text or semantic recipient changed/);
assert.throws(()=>applyPreviewSpatialDraft({...baseSpatial,humanApproval:true}),/authority\/revision/);
assert.throws(()=>applyPreviewDialogueDraft({...baseDialog,revision:'unknown'}),/authority\/revision/);

console.log(JSON.stringify({ok:true,spatialPreviewScenes:15,dialoguePreviewScenes:4,reviewCopyMatch:true,vietnameseMeaningAligned:true,sourceImmutable:true,driftBlocked:true,humanApproval:false}));
