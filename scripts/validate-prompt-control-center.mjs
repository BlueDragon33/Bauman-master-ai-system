#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const errors=[];
const notes=[];

function fail(msg){errors.push(msg)}
function note(msg){notes.push(msg)}
function p(rel){return path.join(root,rel)}
function exists(rel){return fs.existsSync(p(rel))}
function readJson(rel){
  try{return JSON.parse(fs.readFileSync(p(rel),'utf8'))}
  catch(err){fail(`${rel}: invalid/missing JSON (${err.message})`);return null}
}
function checkPath(rel,label){
  if(typeof rel!=='string'||!rel.trim()){fail(`${label}: missing path`);return}
  if(!exists(rel)) fail(`${label}: referenced path does not exist: ${rel}`);
}
function listFiles(dir){
  const out=[];
  if(!exists(dir)) return out;
  for(const ent of fs.readdirSync(p(dir),{withFileTypes:true})){
    const rel=path.posix.join(dir,ent.name);
    if(ent.isDirectory()) out.push(...listFiles(rel));
    else out.push(rel);
  }
  return out;
}

const registry=readJson('prompts/PROMPT_REGISTRY.json');
const hubState=readJson('prompts/hub/HUB_SHARED_STATE.json');
const hubPacket=readJson('prompts/hub/CURRENT_WORK_PACKET.json');
const hubResult=readJson('prompts/hub/CURRENT_EXECUTION_RESULT.json');
const subjectIndex=readJson('prompts/subjects/SUBJECT_PROMPT_INDEX.json');

if(registry){
  const topPathKeys=['constitution','repositoryAuthority','executionProtocol','chatEntry','constitutionLibrary','dependencyPolicy','infrastructureMigrationPlan'];
  for(const key of topPathKeys) if(registry[key]) checkPath(registry[key],`registry.${key}`);

  const ids=new Set();
  const masters=new Map();
  for(const d of registry.domains||[]){
    if(!d.id){fail('registry domain missing id');continue}
    if(ids.has(d.id)) fail(`duplicate registry domain id: ${d.id}`);
    ids.add(d.id);

    for(const key of ['readme','masterPrompt','state','workSplit','scopeBoundary','subappBoundary','workPacket','executionResult','chatStart','codexStart','router','archivePackage','fullRecoveryArchive']){
      if(d[key]) checkPath(d[key],`registry.domains[${d.id}].${key}`);
    }
    if(d.masterPrompt){
      if(masters.has(d.masterPrompt)) fail(`masterPrompt reused by multiple domains: ${d.masterPrompt}`);
      masters.set(d.masterPrompt,d.id);
    }
  }

  const hub=(registry.domains||[]).find(d=>d.id==='hub');
  if(!hub) fail('registry missing hub domain');
  else{
    const expected={
      masterPrompt:'prompts/hub/HUB_MASTER_PROMPT.md',
      chatStart:'prompts/hub/chat/CHAT_START.md',
      codexStart:'prompts/hub/codex/CODEX_START.md',
      state:'prompts/hub/HUB_SHARED_STATE.json',
      workPacket:'prompts/hub/CURRENT_WORK_PACKET.json',
      executionResult:'prompts/hub/CURRENT_EXECUTION_RESULT.json'
    };
    for(const [key,value] of Object.entries(expected)){
      if(hub[key]!==value) fail(`hub registry ${key} must be ${value}, got ${hub[key]??'<missing>'}`);
    }
    if(hubState&&hub.status!==hubState.status) fail(`hub registry status ${hub.status} != shared state status ${hubState.status}`);
  }
}

if(subjectIndex&&registry){
  const byId=new Map((registry.domains||[]).map(d=>[d.id,d]));
  for(const s of subjectIndex.subjects||[]){
    const d=byId.get(s.id);
    if(!d) fail(`subject index id missing from registry: ${s.id}`);
    checkPath(s.canonicalRoot,`subjectIndex[${s.id}].canonicalRoot`);
    if(s.archive) checkPath(s.archive,`subjectIndex[${s.id}].archive`);
    if(d?.status==='PENDING_IMPORT_EXISTING_AUTHORITY') fail(`subject index marks ${s.id} canonical but registry still says PENDING_IMPORT_EXISTING_AUTHORITY`);
  }
}

if(hubState&&hubPacket&&hubResult){
  const activePath=hubState.activePacket;
  if(activePath!=='prompts/hub/CURRENT_WORK_PACKET.json') fail(`Hub activePacket must point to CURRENT_WORK_PACKET.json while active; got ${activePath}`);
  if(hubState.activePacketId!==hubPacket.packetId) fail(`Hub state activePacketId ${hubState.activePacketId} != packetId ${hubPacket.packetId}`);
  if(Number(hubState.activePacketRevision)!==Number(hubPacket.revision)) fail(`Hub state activePacketRevision ${hubState.activePacketRevision} != packet revision ${hubPacket.revision}`);
  if(hubState.activePacketStatus!==hubPacket.status) fail(`Hub state activePacketStatus ${hubState.activePacketStatus} != packet status ${hubPacket.status}`);
  if(hubResult.packetId!==hubPacket.packetId) fail(`Hub execution result packetId ${hubResult.packetId} != packetId ${hubPacket.packetId}`);
  if(Number(hubResult.packetRevision)!==Number(hubPacket.revision)) fail(`Hub execution result revision ${hubResult.packetRevision} != packet revision ${hubPacket.revision}`);

  if(hubState.masterPrompt!=='prompts/hub/HUB_MASTER_PROMPT.md') fail('Hub state masterPrompt is not canonical HUB_MASTER_PROMPT.md');
  if(hubState.chatStart!=='prompts/hub/chat/CHAT_START.md') fail('Hub state chatStart mismatch');
  if(hubState.codexStart!=='prompts/hub/codex/CODEX_START.md') fail('Hub state codexStart mismatch');

  const stateToPacket={
    READY_FOR_CODEX:'READY_FOR_CODEX',
    IN_CODEX:'IN_CODEX',
    CHAT_REVIEW:'CHAT_REVIEW',
    REVISE:'REVISE',
    BLOCKED:'BLOCKED',
    ACCEPTED_MERGED:'ACCEPTED_MERGED'
  };
  if(stateToPacket[hubState.status]&&hubPacket.status!==stateToPacket[hubState.status]){
    fail(`Hub state status ${hubState.status} inconsistent with packet status ${hubPacket.status}`);
  }

  const resultAllowed={
    READY_FOR_CODEX:['AWAITING_CODEX_EXECUTION'],
    IN_CODEX:['IN_CODEX'],
    CHAT_REVIEW:['EXECUTION_COMPLETE_PENDING_CHAT_REVIEW','CODEX_DONE'],
    REVISE:['REVISE'],
    BLOCKED:['BLOCKED'],
    ACCEPTED_MERGED:['ACCEPTED_MERGED']
  };
  const allowed=resultAllowed[hubState.status];
  if(allowed&&!allowed.includes(hubResult.status)) fail(`Hub result status ${hubResult.status} not allowed for state ${hubState.status}; expected one of ${allowed.join(', ')}`);

  if(hubState.status==='READY_FOR_CODEX'&&hubResult.executionState&&hubResult.executionState!=='NOT_STARTED'){
    fail(`READY_FOR_CODEX result executionState must be NOT_STARTED, got ${hubResult.executionState}`);
  }

  if(hubPacket.previousAcceptedPacket&&!hubPacket.previousAcceptedPacket.doNotReexecute){
    fail('previousAcceptedPacket must be marked doNotReexecute=true');
  }
  if(hubState.lastAcceptedPacket&&!hubState.lastAcceptedPacket.doNotReexecute){
    fail('lastAcceptedPacket must be marked doNotReexecute=true');
  }
}

const historyDir='prompts/hub/history';
if(exists(historyDir)){
  for(const rel of listFiles(historyDir).filter(x=>x.endsWith('.json'))){
    const h=readJson(rel);
    if(!h) continue;
    if(!String(h.status||'').includes('ACCEPTED')) fail(`${rel}: historical packet must be accepted/closed evidence`);
    if(h.doNotReexecute!==true) fail(`${rel}: historical packet must set doNotReexecute=true`);
  }
}

const promptFiles=listFiles('prompts');
const badMaster=promptFiles.filter(rel=>{
  const name=path.posix.basename(rel);
  return /MASTER_PROMPT(?:[-_.]?(?:v\d+|final\d*|new\d*|copy\d*))\.(?:md|txt)$/i.test(name);
});
for(const rel of badMaster) fail(`version-suffixed/competing Master Prompt filename is forbidden: ${rel}`);

if(errors.length){
  console.error('Prompt Control Center validation FAILED');
  for(const e of errors) console.error(' - '+e);
  process.exit(1);
}

note(`registry domains: ${registry?.domains?.length||0}`);
note(`Hub active packet: ${hubPacket?.packetId||'none'} r${hubPacket?.revision??'-'} ${hubPacket?.status||''}`);
note(`Hub result: ${hubResult?.status||'unknown'}`);
note(`prompt files scanned: ${promptFiles.length}`);
console.log('Prompt Control Center validation PASS');
for(const n of notes) console.log(' - '+n);
