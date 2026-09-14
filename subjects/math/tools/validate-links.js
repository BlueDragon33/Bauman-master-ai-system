const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'subject-manifest.json'),'utf8'));
let ok=true;
for(const item of manifest.dataFiles||[]){
  const relative=typeof item==='string'?`data/${item}.json`:item?.path;
  if(!relative){ok=false;console.error('Missing path declaration',item);continue}
  const target=path.join(root,relative);
  if(!fs.existsSync(target)){ok=false;console.error('Missing',relative)}else console.log('OK',relative);
}
process.exit(ok?0:1);
