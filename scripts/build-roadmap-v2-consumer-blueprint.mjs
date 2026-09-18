import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

const specPath='recovery/roadmap-v2/historical-l27/roadmap_v2/spec/Bauman_Roadmap_V2_Syllabus_Luot18.md';
const expectedSpecBlob='fd1c3f179d66922faf6ac9363772f3d072851d00';
const consumerPath='roadmap_v2/consumer/consumer-contract.json';
const bytes=fs.readFileSync(specPath);
const blob=crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
assert.equal(blob,expectedSpecBlob,'L23 consumer blueprint syllabus source drift');
const spec=bytes.toString('utf8');
const consumer=JSON.parse(fs.readFileSync(consumerPath,'utf8'));
assert.equal(consumer.schema,'BAUMAN_ROADMAP_V2_CONSUMER_CONTRACT_V1');
assert.equal(consumer.mode.productionIntegration,'disconnected');
assert.equal(consumer.capabilities.diagnosticBlueprintRead,true);
assert.equal(consumer.capabilities.diagnosticExecution,false);

function expandInternal(raw){
  const refs=[]; const add=x=>{if(x&&!refs.includes(x))refs.push(x);}; let masked=raw;
  masked=masked.replace(/([A-Z]+-[RL]\d+-C\d{2}-L)(\d{2})[–-]L?(\d{2})/g,(m,p,a,b)=>{for(let n=+a;n<=+b;n++)add(p+String(n).padStart(2,'0'));return ' ';});
  masked=masked.replace(/([A-Z]+-[RL]\d+-C)(\d{2})[–-]C?(\d{2})/g,(m,p,a,b)=>{for(let n=+a;n<=+b;n++)add(p+String(n).padStart(2,'0'));return ' ';});
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
function external(raw){
  const rules=[
    [/chapter chuyên môn tương ứng đang học/i,'EXT-TECH-CHAPTER-IN-PROGRESS'],
    [/một project kỹ thuật hoàn chỉnh/i,'EXT-COMPLETE-TECHNICAL-PROJECT'],
    [/syllabus môn đã nhập vào Kho 09/i,'EXT-CURRENT-SYLLABUS-IMPORTED'],
    [/Kho 10 đã có topic và research plan/i,'EXT-NIR-TOPIC-RESEARCH-PLAN'],
    [/diagnostic đầu vào/i,'EXT-DIAGNOSTIC-ENTRY'],
    [/Existing Competency xác nhận/i,'EXT-EXISTING-COMPETENCY-CONFIRMED'],
    [/Existing Competency tín hiệu được chẩn đoán/i,'EXT-EXISTING-SIGNAL-DIAGNOSED'],
    [/Existing Competency Control\/automation/i,'EXT-EXISTING-CONTROL-AUTOMATION'],
    [/Existing Competency signal/i,'EXT-EXISTING-SIGNAL'],
    [/syllabus\/tài liệu chính thức của môn/i,'EXT-OFFICIAL-COURSE-SYLLABUS'],
    [/tài liệu tuần thật/i,'EXT-REAL-WEEKLY-MATERIAL'],
    [/các tuần liên quan đã học/i,'EXT-RELATED-WEEKS-COMPLETE'],
    [/hoàn thành môn/i,'EXT-CURRENT-COURSE-COMPLETE'],
    [/Existing Competency automation\/control/i,'EXT-EXISTING-AUTOMATION-CONTROL'],
    [/module kỹ thuật liên quan/i,'EXT-RELATED-TECHNICAL-MODULE']
  ];
  return rules.filter(([re])=>re.test(raw)).map(([,id])=>id);
}

const lines=spec.split('\n'), chapters=[];
for(let i=0;i<lines.length;i++){
  const m=lines[i].match(/^####\s+([A-Z][A-Z0-9-]*-C\d+)\s+—\s+(.+)$/);
  if(!m)continue;
  let j=i+1,block=[];
  while(j<lines.length&&!/^####\s+/.test(lines[j])&&!/^#{1,3}\s+/.test(lines[j])){block.push(lines[j]);j++;}
  const ll=block.find(x=>x.startsWith('- **Bài'))||'';
  const pl=block.find(x=>x.startsWith('- **Prerequisite:**'))||'';
  const raw=pl.replace('- **Prerequisite:**','').trim().replace(/\.$/,'');
  const dynamic=ll.startsWith('- **Bài động:**');
  const legacy=/LEGACY COMPOSITE/i.test(m[2]);
  const lessons=[];
  if(!dynamic&&!legacy){
    const body=ll.replace('- **Bài:**','').trim().replace(/\.$/,'');
    for(const seg of body.split(';').map(x=>x.trim())){
      const lm=seg.match(/^(L\d{2})\s+(.+)$/);
      assert(lm,`Invalid lesson segment: ${m[1]} / ${seg}`);
      lessons.push({id:`${m[1]}-${lm[1]}`,localId:lm[1],title:lm[2]});
    }
    assert.equal(lessons.length,4,`Static chapter must have four syllabus lessons: ${m[1]}`);
  }
  chapters.push({
    id:m[1],title:m[2],
    deliveryMode:dynamic?'dynamic':legacy?'legacy_preserve':'static',
    prerequisiteText:raw,
    prerequisiteRefs:expandInternal(raw),
    externalGateIds:external(raw),
    lessonIds:lessons.map(x=>x.id),
    lessons,
    diagnosticEligible:!dynamic
  });
}
const allIds=new Set(chapters.flatMap(ch=>[ch.id,...ch.lessons.map(l=>l.id)]));
const unknown=[...new Set(chapters.flatMap(ch=>ch.prerequisiteRefs.filter(x=>!allIds.has(x))))];
const diagnosticTargets=[];
for(const ch of chapters){
  if(ch.deliveryMode==='dynamic')continue;
  diagnosticTargets.push({id:ch.id,targetType:'roadmap_chapter',title:ch.title,deliveryMode:ch.deliveryMode,prerequisiteRefs:ch.prerequisiteRefs,externalGateIds:ch.externalGateIds});
  for(const l of ch.lessons)diagnosticTargets.push({id:l.id,targetType:'roadmap_lesson',title:l.title,deliveryMode:'static',parentChapterId:ch.id,prerequisiteRefs:ch.prerequisiteRefs,externalGateIds:ch.externalGateIds});
}
const blockedDynamicTargets=chapters.filter(ch=>ch.deliveryMode==='dynamic').map(ch=>({
  id:ch.id,title:ch.title,reasonCode:'DYNAMIC_INSTANCE_REQUIRED',prerequisiteText:ch.prerequisiteText,externalGateIds:ch.externalGateIds
}));
const lessonCount=chapters.reduce((n,ch)=>n+ch.lessons.length,0);
const blueprint={
  schema:'BAUMAN_ROADMAP_V2_CONSUMER_BLUEPRINT_V1',
  version:1,
  source:{
    syllabusSpecPath:specPath,
    syllabusSpecGitBlobSha:expectedSpecBlob,
    consumerContractPath:consumerPath,
    consumerContractSchema:consumer.schema
  },
  mode:{access:'read_only',productionIntegration:'disconnected',diagnosticExecution:false,runtimeActivation:false},
  counts:{
    chapters:chapters.length,
    eligibleChapterBlueprints:chapters.filter(ch=>ch.diagnosticEligible).length,
    staticChapters:chapters.filter(ch=>ch.deliveryMode==='static').length,
    legacyPreserveChapters:chapters.filter(ch=>ch.deliveryMode==='legacy_preserve').length,
    dynamicChapters:chapters.filter(ch=>ch.deliveryMode==='dynamic').length,
    numberedLessons:lessonCount,
    diagnosticTargets:diagnosticTargets.length
  },
  chapters,
  diagnosticTargets,
  blockedDynamicTargets,
  validation:{
    uniqueChapterIds:new Set(chapters.map(x=>x.id)).size===chapters.length,
    uniqueLessonIds:new Set(chapters.flatMap(x=>x.lessons.map(l=>l.id))).size===lessonCount,
    unknownPrerequisiteRefs:unknown,
    generatedQuestionItems:0,
    executableDiagnosticPlans:0,
    result:unknown.length?'FAIL':'PASS'
  }
};
assert.deepEqual(blueprint.counts,{chapters:85,eligibleChapterBlueprints:77,staticChapters:76,legacyPreserveChapters:1,dynamicChapters:8,numberedLessons:304,diagnosticTargets:381});
assert.deepEqual(unknown,[]);
process.stdout.write(JSON.stringify(blueprint,null,2)+'\n');
