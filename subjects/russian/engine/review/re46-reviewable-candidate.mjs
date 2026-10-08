import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const arr=v=>Array.isArray(v)?v:[];
const txt=v=>String(v??'').trim();
const clone=v=>structuredClone(v);

export function gitBlobSha1(raw){
  const body=Buffer.from(String(raw),'utf8');
  const header=Buffer.from('blob '+body.length+'\0','utf8');
  return createHash('sha1').update(header).update(body).digest('hex');
}
function fail(message){throw new Error('RE46 '+message)}
function mergeObject(base,patch){
  return {...base,...patch};
}

export function buildReviewableCandidates({spatialBase,dialogueBase,overlay,spatialRaw,dialogueRaw}={}){
  if(overlay?.schema!=='RUSSIAN_ENGINE_RE46_REVIEWABLE_OVERLAY_V1')fail('overlay schema mismatch');
  if(overlay?.status!=='AI_DRAFT_PENDING_RU03'||overlay?.humanApproval!==false)fail('overlay authority invalid');
  if(spatialBase?.revision!==overlay?.base?.spatial?.revision)fail('spatial base revision mismatch');
  if(dialogueBase?.revision!==overlay?.base?.dialogues?.revision)fail('dialogue base revision mismatch');
  if(gitBlobSha1(spatialRaw)!==overlay?.base?.spatial?.gitBlobSha1)fail('spatial base blob drift');
  if(gitBlobSha1(dialogueRaw)!==overlay?.base?.dialogues?.gitBlobSha1)fail('dialogue base blob drift');

  const spatial=clone(spatialBase);
  spatial.schema='RUSSIAN_ENGINE_SPATIAL_REVIEWABLE_CANDIDATE_V2';
  spatial.status='AI_DRAFT_PENDING_RU03';
  spatial.revision=overlay.next.spatialRevision;
  spatial.humanApproval=false;
  spatial.sourceCandidate={revision:spatialBase.revision,gitBlobSha1:overlay.base.spatial.gitBlobSha1};
  const spatialIds=new Set(arr(spatial.scenes).map(s=>s.sceneId));
  if(spatialIds.size!==15)fail('expected 15 spatial scenes');
  if(Object.keys(overlay.spatialScenes||{}).length!==15)fail('overlay must cover all 15 spatial scenes');
  for(const scene of spatial.scenes){
    const patch=overlay.spatialScenes?.[scene.sceneId];
    if(!patch)fail('missing spatial overlay '+scene.sceneId);
    scene.revision=spatial.revision;
    scene.status='AI_DRAFT_PENDING_RU03';
    scene.legacyDeclaredRole=scene.speakerRole;
    delete scene.speakerRole;
    scene.utteranceSpeakerRole=patch.utteranceSpeakerRole;
    scene.utteranceRecipientRole=patch.utteranceRecipientRole;
    scene.vn=clone(patch.vn);
    scene.textAuthority='NONE';
    scene.audioAuthority='NONE';
    scene.humanApproval=false;
  }
  for(const id of Object.keys(overlay.spatialScenes||{}))if(!spatialIds.has(id))fail('unknown spatial overlay '+id);

  const dialogues=clone(dialogueBase);
  dialogues.schema='RUSSIAN_ENGINE_REPAIR_DIALOGUES_REVIEWABLE_V2';
  dialogues.revision=overlay.next.dialogueRevision;
  dialogues.status='AI_DRAFT_PENDING_RU03';
  dialogues.languageAuthority='NONE';
  dialogues.audioAuthority='NONE';
  dialogues.humanApproval=false;
  dialogues.sourceCandidate={revision:dialogueBase.revision,gitBlobSha1:overlay.base.dialogues.gitBlobSha1};
  for(const scene of arr(dialogues.scenes)){
    const interlocutor=scene.speakerRole;
    scene.interlocutorRole=interlocutor;
    delete scene.speakerRole;
    scene.turnRoles={
      greet:{speakerRole:'learner',recipientRole:interlocutor},
      request:{speakerRole:'learner',recipientRole:interlocutor},
      reply:{speakerRole:interlocutor,recipientRole:'learner'},
      thanks:{speakerRole:'learner',recipientRole:interlocutor},
      closing:{speakerRole:interlocutor,recipientRole:'learner'}
    };
    const patch=overlay.dialogueScenes?.[scene.sceneId]||{};
    scene.surface=mergeObject(scene.surface,patch.surface||{});
    scene.vn=mergeObject(scene.vn,patch.vn||{});
    scene.status='AI_DRAFT_PENDING_RU03';
    scene.humanApproval=false;
  }
  dialogues.repairTurnRole='learner-to-current-interlocutor';
  return {spatial,dialogues};
}

export function validateReviewableCandidates({spatial,dialogues}={}){
  const errors=[];
  if(spatial?.schema!=='RUSSIAN_ENGINE_SPATIAL_REVIEWABLE_CANDIDATE_V2')errors.push('wrong spatial schema');
  if(spatial?.status!=='AI_DRAFT_PENDING_RU03'||spatial?.humanApproval!==false)errors.push('spatial authority invalid');
  if(arr(spatial?.scenes).length!==15)errors.push('spatial scene count');
  for(const scene of arr(spatial?.scenes)){
    if('speakerRole' in scene)errors.push(scene.sceneId+': ambiguous speakerRole retained');
    if(!txt(scene.utteranceSpeakerRole)||!txt(scene.utteranceRecipientRole))errors.push(scene.sceneId+': explicit turn roles missing');
    if(!txt(scene.vn?.setting)||!txt(scene.vn?.purpose)||!txt(scene.vn?.actionHint))errors.push(scene.sceneId+': revision-bound VN context missing');
    if(scene.textAuthority!=='NONE'||scene.audioAuthority!=='NONE'||scene.humanApproval!==false)errors.push(scene.sceneId+': authority must remain NONE');
    if(!/[А-Яа-яЁё]/u.test(scene.russianDraft||''))errors.push(scene.sceneId+': Russian draft missing');
  }
  if(dialogues?.schema!=='RUSSIAN_ENGINE_REPAIR_DIALOGUES_REVIEWABLE_V2')errors.push('wrong dialogue schema');
  if(dialogues?.status!=='AI_DRAFT_PENDING_RU03'||dialogues?.humanApproval!==false||dialogues?.languageAuthority!=='NONE'||dialogues?.audioAuthority!=='NONE')errors.push('dialogue authority invalid');
  if(arr(dialogues?.scenes).length!==4)errors.push('dialogue scene count');
  for(const scene of arr(dialogues?.scenes)){
    if('speakerRole' in scene)errors.push(scene.sceneId+': ambiguous dialogue speakerRole retained');
    if(!txt(scene.interlocutorRole))errors.push(scene.sceneId+': interlocutor missing');
    for(const field of ['greet','request','reply','thanks','closing']){
      const role=scene.turnRoles?.[field];
      if(!txt(role?.speakerRole)||!txt(role?.recipientRole))errors.push(scene.sceneId+': '+field+' roles missing');
      if(!/[А-Яа-яЁё]/u.test(scene.surface?.[field]||''))errors.push(scene.sceneId+': '+field+' Russian missing');
    }
    for(const field of ['setting','purpose','replyHint','greeting','request','reply','thank'])if(!txt(scene.vn?.[field]))errors.push(scene.sceneId+': VN '+field+' missing');
    if(scene.humanApproval!==false||scene.status!=='AI_DRAFT_PENDING_RU03')errors.push(scene.sceneId+': fake approval');
  }
  return {ok:errors.length===0,errors,spatialScenes:arr(spatial?.scenes).length,dialogueScenes:arr(dialogues?.scenes).length,canonicalPublicationReady:false};
}

export function loadReviewableCandidates(){
  const root=new URL('../',import.meta.url);
  const spatialUrl=new URL('content/fixtures/real-life-spatial.r2-ai-proposal.json',root);
  const dialogueUrl=new URL('content/fixtures/repair-dialogues.r1-ai-proposal.json',root);
  const overlayUrl=new URL('content/fixtures/re46-reviewable-overlay.v1.json',root);
  const spatialRaw=fs.readFileSync(spatialUrl,'utf8');
  const dialogueRaw=fs.readFileSync(dialogueUrl,'utf8');
  const overlay=JSON.parse(fs.readFileSync(overlayUrl,'utf8'));
  return buildReviewableCandidates({
    spatialBase:JSON.parse(spatialRaw),
    dialogueBase:JSON.parse(dialogueRaw),
    overlay,spatialRaw,dialogueRaw
  });
}
function arg(name){const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null}
function write(file,value){fs.mkdirSync(path.dirname(path.resolve(file)),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n','utf8')}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const resolved=loadReviewableCandidates();
  const check=validateReviewableCandidates(resolved);
  if(!check.ok)fail(check.errors.join('; '));
  const so=arg('--spatial-out'),do_=arg('--dialogue-out');
  if(so)write(so,resolved.spatial);
  if(do_)write(do_,resolved.dialogues);
  console.log(JSON.stringify({ok:true,spatialRevision:resolved.spatial.revision,dialogueRevision:resolved.dialogues.revision,spatialScenes:check.spatialScenes,dialogueScenes:check.dialogueScenes,canonicalPublicationReady:false}));
}
