'use strict';

const fs=require('fs');
const vm=require('vm');

const failures=[];
const checks=[];
const check=(name,ok,detail='')=>{checks.push({name,ok:!!ok,detail});if(!ok)failures.push(`${name}${detail?': '+detail:''}`);};
const read=file=>fs.readFileSync(file,'utf8');

const dataPath='assets/js/academic-data-v3.js';
const bridgePath='assets/js/platform/academic-runtime-v3-bridge.js';
const roadmapBridgePath='assets/js/platform/academic-roadmap-v3-bridge.js';
const indexPath='index.html';
const workerPath='service-worker.js';

for(const file of [dataPath,bridgePath,roadmapBridgePath,indexPath,workerPath]){
  if(!fs.existsSync(file))failures.push(`Missing ${file}`);
}

const sandbox={window:{BAUMAN_DATA:{}}};
sandbox.window.window=sandbox.window;
vm.createContext(sandbox);
try{vm.runInContext(read(dataPath),sandbox,{filename:dataPath});}catch(error){failures.push(`Cannot execute academic runtime: ${error.message}`);}
const data=sandbox.window.BAUMAN_DATA||{};
const runtime=sandbox.window.BAUMAN_ACADEMIC_RUNTIME_V3||{};

check('runtime display code',runtime.displayCode==='09.04.01/11',String(runtime.displayCode));
check('runtime department',runtime.department==='ИУ-5',String(runtime.department));
check('runtime has 8 content engines',Array.isArray(data.subjects)&&data.subjects.length===8,String(data.subjects?.length));
check('runtime has 3 main stages',Array.isArray(data.stages)&&data.stages.length===3,String(data.stages?.length));
check('runtime has 4 master semesters',Array.isArray(data.semesters)&&data.semesters.length===4,String(data.semesters?.length));
check('runtime has substantial course graph',Array.isArray(data.courses)&&data.courses.length>=45,String(data.courses?.length));
check('all semester stages populated',[1,2,3,4].every(n=>data.courses.some(c=>c.stage===`m${n}`)),JSON.stringify(data.courses?.reduce((acc,c)=>(acc[c.stage]=(acc[c.stage]||0)+1,acc),{})));
check('pre-master is populated',data.courses.some(c=>c.stage==='prepare')&&data.courses.some(c=>c.stage==='preparatory'));
check('official curriculum tag exists',data.courses.filter(c=>/^m[1-4]$/.test(c.stage)).every(c=>c.officialSource==='ИУ-5 · учебный план 2026'));

const requiredRussian=[
  'Аналитические модели автоматизированных систем обработки информации и управления',
  'Многомерный анализ данных в системах искусственного интеллекта',
  'Оптимизация баз данных систем машинного обучения',
  'Методы машинного обучения в автоматизированных системах обработки информации и управления',
  'Модели надёжности АСОИУ',
  'Постреляционные базы данных',
  'Разработка нейросетевых систем',
  'Анализ временных рядов',
  'Подготовка и защита ВКР'
];
const allRussian=(data.courses||[]).map(c=>c.ru).filter(Boolean);
for(const title of requiredRussian)check(`official course present: ${title}`,allRussian.includes(title));

const academicScope=JSON.stringify({stages:data.stages,semesters:data.semesters,subjects:data.subjects,courses:data.courses}).toLowerCase();
check('no comparison-school label in academic runtime',!academicScope.includes('hutech'));
check('no UGV/USV hard-coded into academic runtime',!academicScope.includes('ugv')&&!academicScope.includes('usv'));

const index=read(indexPath);
const ordered=[
  'assets/js/data.js',
  'assets/js/academic-data-v3.js',
  'assets/js/main.js',
  'assets/js/platform/academic-runtime-v3-bridge.js',
  'assets/js/platform/academic-roadmap-v3-bridge.js'
];
let previous=-1;
for(const asset of ordered){
  const pos=index.indexOf(`src=\"${asset}\"`);
  check(`main entry wires ${asset}`,pos>=0);
  check(`main entry order ${asset}`,pos>previous,`${pos} <= ${previous}`);
  previous=pos;
}

const bridge=read(bridgePath);
check('state metadata migration is idempotent',/academicRuntimeVersion/.test(bridge)&&/syncSubjectMetadata/.test(bridge));
check('research page is replaced with NIR-VKR flow',/app\.research=function/.test(bridge)&&/НИР 4 → ВКР/.test(bridge));
check('legacy subject paths are preserved',/mainPath:current\.mainPath/.test(bridge)&&/editorPath:current\.editorPath/.test(bridge));
check('course cards identify official 2026 source',/Учебный план ИУ-5 · 2026/.test(bridge));

const worker=read(workerPath);
check('offline shell caches academic data runtime',worker.includes("'./assets/js/academic-data-v3.js'"));
check('offline shell caches academic runtime bridge',worker.includes("'./assets/js/platform/academic-runtime-v3-bridge.js'"));

const report={generatedAt:new Date().toISOString(),runtime:{version:runtime.version||null,displayCode:runtime.displayCode||null,department:runtime.department||null,subjects:data.subjects?.length||0,courses:data.courses?.length||0},checks,failures};
fs.mkdirSync('docs/migration',{recursive:true});
fs.writeFileSync('docs/migration/L5_ACADEMIC_RUNTIME_V3_REGRESSION.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(`L5 academic runtime V3 regression: ${checks.length} checks, ${failures.length} failure(s).`);
if(failures.length){console.error(failures.join('\n'));process.exit(2);}
console.log('L5 academic runtime V3 regression PASS.');
