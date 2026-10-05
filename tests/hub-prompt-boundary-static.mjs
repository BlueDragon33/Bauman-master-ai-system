import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const json=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const packet=json('prompts/hub/bridge/CURRENT_WORK_PACKET.json');
const state=json('prompts/hub/HUB_SHARED_STATE.json');
assert.equal(packet.packetId,'HUB-TRUTH-UX-CLEANUP-002');
assert.equal(state.activePacket,'prompts/hub/bridge/CURRENT_WORK_PACKET.json');
for(const file of [...packet.requiredContracts,'prompts/hub/codex/HUB_CODEX_MASTER_PROMPT.md','prompts/hub/codex/CODEX_START.md','prompts/hub/chat/CHAT_START.md','prompts/hub/bridge/work-packet.schema.json','prompts/hub/bridge/execution-result.schema.json']){
 assert.ok(!/^(subjects|prompts\/subjects)\//.test(file),'Hub prompt dependency crosses forbidden scope');
 assert.ok(fs.existsSync(file),'missing Hub control-plane dependency '+file);
}
const changed=execFileSync('git',['diff','--name-only',packet.reconciliation.beforeSha],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const added=execFileSync('git',['ls-files','--others','--exclude-standard'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const match=(file,glob)=>new RegExp('^'+glob.split('**').map(part=>part.split('*').map(s=>s.replace(/[.+?^${}()|[\]\\]/g,'\\$&')).join('[^/]*')).join('.*')+'$').test(file);
for(const file of new Set([...changed,...added])){
 assert.ok(!/^(subjects|prompts\/subjects)\//.test(file),'forbidden path changed: '+file);
 assert.ok(packet.allowedPaths.some(glob=>match(file,glob)),'path outside approved packet: '+file);
}
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.indexOf('assets/js/hub-subject-adapter.js')<index.indexOf('assets/js/main.js'),'adapter must exist before first canonical render');
const adapter=fs.readFileSync('assets/js/hub-subject-adapter.js','utf8');
assert.ok(!/localStorage|indexedDB|querySelector|fetch\(/.test(adapter),'subject adapter may not inspect subject private data or invent transports');
const result=json('prompts/hub/bridge/CURRENT_EXECUTION_RESULT.json');
if(result.status==='CODEX_DONE'){
 for(const key of ['beforeSha','afterSha'])assert.match(result[key],/^[a-f0-9]{40}$/);
 assert.equal(result.boundaryCompliance.subjectInternalReads,false);
 assert.equal(result.boundaryCompliance.subjectPromptsUntouched,true);
 assert.equal(result.releaseState,'TESTED_NOT_MERGED_NOT_DEPLOYED_PENDING_CHAT_REVIEW');
}
console.log('HUB_PROMPT_BOUNDARY_STATIC_PASS '+new Set([...changed,...added]).size+' approved paths');
