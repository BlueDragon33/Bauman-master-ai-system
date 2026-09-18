import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

function gitBlobSha(bytes){
  return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
}
function expandRange(prefix,start,end){
  const a=Number(start),b=Number(end),width=start.length,out=[];
  for(let n=a;n<=b;n++)out.push(prefix+String(n).padStart(width,'0'));
  return out;
}
function expandInternal(raw){
  const refs=[]; const add=x=>{if(x&&!refs.includes(x))refs.push(x);}; let masked=raw;
  masked=masked.replace(/([A-Z]+-[RL]\d+-C\d{2}-L)(\d{2})[–-]L?(\d{2})/g,(m,p,a,b)=>{for(const x of expandRange(p,a,b))add(x);return ' ';});
  masked=masked.replace(/([A-Z]+-[RL]\d+-C)(\d{2})[–-]C?(\d{2})/g,(m,p,a,b)=>{for(const x of expandRange(p,a,b))add(x);return ' ';});
  masked=masked.replace(/([A-Z]+)-([RL]\d+)-C(\d{2})\/([RL]\d+)-C(\d{2})/g,(m,p,l1,c1,l2,c2)=>{add(`${p}-${l1}-C${c1}`);add(`${p}-${l2}-C${c2}`);return ' ';});
  for(const m of masked.match(/\b[A-Z]+-[RL]\d+-C\d{2}(?:-L\d{2})?\b/g)||[])add(m);
  const aliases=[
    [/giải tích cơ bản/i,['MATH-L0-C02']],
    [/Python NumPy\/Pandas/i,['PY-L2-C04','PY-L2-C05']],
    [/\bPython L2\b/i,['PY-L2-C06']],
    [/\bPY-L2\b(?!-C)/i,['PY-L2-C06']],
    [/Python cơ bản được khuyến nghị/i,['PY-L0-C01']],
    [/\bLinux L1\b/i,['SYS-L1-C03']],
    [/\bPython L1\b/i,['PY-L1-C03']]
  ];
  for(const [re,xs] of aliases)if(re.test(raw))for(const x of xs)add(x);
  return refs;
}
const gates=[
  ['EXT-DIAGNOSTIC-ENTRY',/diagnostic đầu vào/i,'blocking'],
  ['EXT-TECH-CHAPTER-IN-PROGRESS',/chapter chuyên môn tương ứng đang học/i,'contextual'],
  ['EXT-COMPLETE-TECHNICAL-PROJECT',/một project kỹ thuật hoàn chỉnh/i,'blocking'],
  ['EXT-CURRENT-SYLLABUS-IMPORTED',/syllabus môn đã nhập vào Kho 09/i,'blocking'],
  ['EXT-NIR-TOPIC-RESEARCH-PLAN',/Kho 10 đã có topic và research plan/i,'blocking'],
  ['EXT-EXISTING-COMPETENCY-CONFIRMED',/Existing Competency xác nhận/i,'alternative'],
  ['EXT-EXISTING-SIGNAL-DIAGNOSED',/Existing Competency tín hiệu được chẩn đoán/i,'blocking'],
  ['EXT-EXISTING-CONTROL-AUTOMATION',/Existing Competency Control\/automation/i,'blocking'],
  ['EXT-EXISTING-SIGNAL',/Existing Competency signal/i,'blocking'],
  ['EXT-OFFICIAL-COURSE-SYLLABUS',/syllabus\/tài liệu chính thức của môn/i,'blocking'],
  ['EXT-REAL-WEEKLY-MATERIAL',/tài liệu tuần thật/i,'blocking'],
  ['EXT-RELATED-WEEKS-COMPLETE',/các tuần liên quan đã học/i,'blocking'],
  ['EXT-CURRENT-COURSE-COMPLETE',/hoàn thành môn/i,'blocking'],
  ['EXT-EXISTING-AUTOMATION-CONTROL',/Existing Competency automation\/control/i,'blocking'],
  ['EXT-RELATED-TECHNICAL-MODULE',/module kỹ thuật liên quan/i,'contextual']
].map(([id,pattern,defaultType])=>({id,pattern,defaultType}));

function externalFor(segment){
  return gates.filter(g=>g.pattern.test(segment)).map(g=>g.id);
}
function edgeTypeForInternal(segment){
  if(/được khuyến nghị/i.test(segment))return 'recommended';
  if(/đang song hành/i.test(segment))return 'concurrent';
  if(/just-in-time/i.test(segment))return 'just_in_time';
  return 'blocking';
}
function externalType(id,segment){
  if(/đang song hành/i.test(segment))return 'concurrent';
  return gates.find(g=>g.id===id)?.defaultType||'blocking';
}

export function buildCurrentPrerequisitePolicy(options={}){
  const root=options.rootDir||process.cwd();
  const blueprintPath=`${root}/roadmap_v2/consumer/blueprint.json`;
  const bytes=fs.readFileSync(blueprintPath);
  const bp=JSON.parse(bytes.toString('utf8'));
  assert.equal(bp.schema,'BAUMAN_ROADMAP_V2_CONSUMER_BLUEPRINT_V1');
  assert.equal(bp.validation.result,'PASS');

  const allIds=new Set();
  const lessonParent=new Map();
  for(const ch of bp.chapters){
    allIds.add(ch.id);
    for(const l of ch.lessons){allIds.add(l.id);lessonParent.set(l.id,ch.id);}
  }
  const knownExternal=new Set(gates.map(g=>g.id));
  const edges=[],resolutions=[];
  const missingAssignedRefs=[],missingAssignedGates=[],unknownRefs=[],unknownGates=[],selfRefs=[];

  for(const ch of bp.chapters){
    const raw=ch.prerequisiteText||'';
    const segments=raw.split(';').map(x=>x.trim()).filter(Boolean);
    const assignedRefs=new Set(),assignedGates=new Set();
    const segmentRecords=[];

    for(let i=0;i<segments.length;i++){
      const segment=segments[i];
      const refs=expandInternal(segment).filter(ref=>ch.prerequisiteRefs.includes(ref));
      const ext=externalFor(segment).filter(id=>ch.externalGateIds.includes(id));
      const logic=/\bhoặc\b/i.test(segment)?'any_of':'all_of';
      const groupId=logic==='any_of'?`ANY_OF::${ch.id}::${i+1}`:null;
      const internalType=edgeTypeForInternal(segment);
      const segEdges=[];

      for(const ref of refs){
        assignedRefs.add(ref);
        if(!allIds.has(ref))unknownRefs.push({targetId:ch.id,ref});
        if(ref===ch.id||lessonParent.get(ref)===ch.id)selfRefs.push({targetId:ch.id,ref});
        const e={from:ref,to:ch.id,type:internalType,logic,groupId,sourceRaw:segment};
        edges.push(e);segEdges.push(e);
      }
      for(const id of ext){
        assignedGates.add(id);
        if(!knownExternal.has(id))unknownGates.push({targetId:ch.id,id});
        const e={from:id,to:ch.id,type:externalType(id,segment),logic,groupId,sourceRaw:segment,external:true};
        edges.push(e);segEdges.push(e);
      }
      segmentRecords.push({index:i+1,raw:segment,logic,groupId,edges:segEdges});
    }

    for(const ref of ch.prerequisiteRefs)if(!assignedRefs.has(ref))missingAssignedRefs.push({targetId:ch.id,ref,raw});
    for(const id of ch.externalGateIds)if(!assignedGates.has(id))missingAssignedGates.push({targetId:ch.id,id,raw});
    resolutions.push({targetId:ch.id,raw,segments:segmentRecords});
  }

  const edgeKeys=new Set(),duplicateEdgeKeys=[];
  for(const e of edges){
    const key=[e.from,e.to,e.type,e.logic,e.groupId||''].join('|');
    if(edgeKeys.has(key))duplicateEdgeKeys.push(key);
    edgeKeys.add(key);
  }

  const chapterIds=bp.chapters.map(ch=>ch.id);
  const adjacency=new Map(chapterIds.map(id=>[id,new Set()]));
  const indegree=new Map(chapterIds.map(id=>[id,0]));
  for(const e of edges){
    if(e.external||['recommended','contextual'].includes(e.type))continue;
    const sourceChapter=lessonParent.get(e.from)||e.from;
    if(!adjacency.has(sourceChapter)||sourceChapter===e.to)continue;
    if(!adjacency.get(sourceChapter).has(e.to)){
      adjacency.get(sourceChapter).add(e.to);
      indegree.set(e.to,indegree.get(e.to)+1);
    }
  }
  const queue=chapterIds.filter(id=>indegree.get(id)===0).sort();
  const topo=[];
  while(queue.length){
    const id=queue.shift();topo.push(id);
    for(const next of [...adjacency.get(id)].sort()){
      indegree.set(next,indegree.get(next)-1);
      if(indegree.get(next)===0){queue.push(next);queue.sort();}
    }
  }
  const cycleNodes=chapterIds.filter(id=>!topo.includes(id));

  const typeCounts={blocking:0,just_in_time:0,alternative:0,concurrent:0,recommended:0,contextual:0};
  for(const e of edges)typeCounts[e.type]=(typeCounts[e.type]||0)+1;

  const policy={
    schema:'BAUMAN_ROADMAP_V2_CURRENT_PREREQUISITE_POLICY_V1',
    version:1,
    source:{
      consumerBlueprintPath:'roadmap_v2/consumer/blueprint.json',
      consumerBlueprintGitBlobSha:gitBlobSha(bytes),
      consumerBlueprintSchema:bp.schema
    },
    mode:{access:'read_only_projection',productionIntegration:'disconnected',persistenceEnabled:false,runtimeActivation:false},
    counts:{
      chapters:bp.chapters.length,
      internalEdges:edges.filter(e=>!e.external).length,
      externalEdges:edges.filter(e=>e.external).length,
      prerequisiteEdges:edges.length,
      anyOfGroups:new Set(edges.filter(e=>e.groupId).map(e=>e.groupId)).size,
      edgeTypes:typeCounts
    },
    edges,
    resolutions,
    topologicalChapterOrder:topo,
    validation:{
      missingAssignedRefs,
      missingAssignedGates,
      unknownRefs,
      unknownGates,
      selfRefs,
      duplicateEdgeKeys,
      cycleNodes,
      topologicalChapterCount:topo.length,
      result:[missingAssignedRefs,missingAssignedGates,unknownRefs,unknownGates,selfRefs,duplicateEdgeKeys,cycleNodes].every(x=>x.length===0)?'PASS':'FAIL'
    }
  };
  return policy;
}

if(import.meta.url===`file://${process.argv[1]}`){
  process.stdout.write(JSON.stringify(buildCurrentPrerequisitePolicy(),null,2)+'\n');
}
