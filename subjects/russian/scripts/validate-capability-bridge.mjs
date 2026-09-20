import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const js=fs.readFileSync(path.join(root,'assets','capability-progression.js'),'utf8');
new Function(js);

const need=(token,msg)=>{if(!js.includes(token))throw new Error(msg||`Missing token: ${token}`);};
const forbid=(token,msg)=>{if(js.includes(token))throw new Error(msg||`Forbidden token: ${token}`);};

need("type:'BAUMAN_SUBJECT_CAPABILITY_STATE'",'Capability bridge message type missing');
need("schema:'RUSSIAN_CAPABILITY_BRIDGE_V1'",'Capability bridge schema missing');
need("subjectId:SUBJECT_ID",'Capability bridge subject identity missing');
need("source:'subjects/russian'",'Capability bridge source missing');
need('function bridgePayload','Capability bridge payload builder missing');
need('currentBand:cur?{id:cur.id,title:cur.title','Current R-band summary missing');
need('nextGap','Next evidence gap summary missing');
need('stageExit:{stage:stage.stage,allowed:!!stage.allowed','Stage-exit summary missing');
need('bands:bands.map(x=>({id:x.id,unlocked:!!x.unlocked,complete:!!x.complete','Band summaries missing');
need('function publishBridge','Capability bridge publisher missing');
need('BaumanSubjectHost?.send?.(payload)','Capability state must use host bridge');
need("new CustomEvent('russian:capability-state'",'Local capability event missing');
need("event.data?.type==='BAUMAN_REQUEST_SUBJECT_CAPABILITY_STATE'",'On-demand capability state request missing');
need('BaumanSubjectHost?.trusted?.(event)','Incoming bridge request must be trusted');
need('if(!force&&sig===lastBridgeSig)return false','Capability bridge must deduplicate unchanged snapshots');

const start=js.indexOf('function bridgePayload');
const end=js.indexOf('function publishBridge',start);
if(start<0||end<0)throw new Error('Cannot isolate bridge payload');
const payloadBody=js.slice(start,end);
for(const forbidden of ['localStorage','reviewQueue','reviewHistory','completedTasks','completedExamPapers','snapshots:','steps:']){
  if(payloadBody.includes(forbidden))throw new Error(`Bridge payload exposes internal detail: ${forbidden}`);
}

forbid('mastered:true','Capability bridge must not synthesize mastery');
console.log('RUSSIAN_CAPABILITY_BRIDGE_GATE=PASS');
console.log('Checks: compact R0-R4 summary, next gap, stage exit, host send, trusted on-demand request, deduplication, no internal storage dump.');
