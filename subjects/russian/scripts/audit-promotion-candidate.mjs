import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  const p=path.join(dir,e.name);
  return e.isDirectory()?walk(p):[p];
});
const rel=p=>path.relative(root,p).replaceAll('\\','/');
const files=walk(root);
const stale=files.map(rel).filter(p=>/\.bak$|\.orig$|~$|\.tmp$/i.test(p));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1]);
const styles=[...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map(m=>m[1]);
const dup=xs=>[...new Set(xs.filter((x,i)=>xs.indexOf(x)!==i))];
const userSurfaces=[
  'index.html',
  'assets/russian-reference-ui.js',
  'assets/learning-state.js',
  'assets/learning-flow.js',
  'assets/vocab-srs.js',
  'assets/speaking-coach.js',
  'assets/academic-language.js',
  'assets/runtime-optimizer.js'
].map(p=>({path:p,text:fs.readFileSync(path.join(root,p),'utf8')}));
const visibleVersion=[];
for(const x of userSurfaces){
  // Only flag version/gate/debug wording inside likely rendered HTML/text literals, not schema/storage metadata.
  const hits=[...x.text.matchAll(/(?:>[^<\n]{0,80}|['"`][^'"`\n]{0,100})(?:\b(?:PASS|DEBUG|GATE)\b|\bV\d+(?:[._-]\d+)+\b)/gi)].map(m=>m[0].trim()).slice(0,12);
  if(hits.length)visibleVersion.push({path:x.path,hits});
}
const storage={
  legacyCore:/bauman_russian_(?:survival_master_)?v11_clean_skeleton/.test(fs.readFileSync(path.join(root,'assets','subject-adapter.js'),'utf8')),
  canonicalLearning:fs.readFileSync(path.join(root,'assets','learning-state.js'),'utf8').includes('bauman_russian_learning_state_v1'),
  vocabSrs:fs.readFileSync(path.join(root,'assets','vocab-srs.js'),'utf8').includes('bauman_russian_vocab_srs_v1'),
  academic:fs.readFileSync(path.join(root,'assets','academic-language.js'),'utf8').includes('bauman_russian_academic_language_v1')
};
const jsFiles=files.filter(p=>p.endsWith('.js'));
const destructiveStorage=jsFiles.map(p=>({path:rel(p),clear:fs.readFileSync(p,'utf8').includes('localStorage.clear(')})).filter(x=>x.clear);
const report={
  schema:'RUSSIAN_PROMOTION_AUDIT_V1',
  files:files.length,
  stale,
  loadOrder:{styles,scripts,duplicateStyles:dup(styles),duplicateScripts:dup(scripts)},
  userSurfaceLeaks:visibleVersion,
  storage,
  destructiveStorage,
  legacyDocs:files.map(rel).filter(p=>/^(HOTFIX|LOGIC-QA|QA-CHECKLIST).*\.md$/i.test(path.basename(p)))
};
console.log('RUSSIAN_PROMOTION_AUDIT='+JSON.stringify(report));
if(stale.length)throw new Error('Stale backup/temp files remain: '+stale.join(', '));
if(report.loadOrder.duplicateStyles.length||report.loadOrder.duplicateScripts.length)throw new Error('Duplicate runtime asset references detected');
if(visibleVersion.length)throw new Error('User-facing version/gate/debug wording detected: '+JSON.stringify(visibleVersion));
if(destructiveStorage.length)throw new Error('Destructive localStorage.clear found: '+JSON.stringify(destructiveStorage));
if(!Object.values(storage).every(Boolean))throw new Error('Expected additive storage contracts are not all present');
console.log('RUSSIAN_PROMOTION_AUDIT=PASS');
