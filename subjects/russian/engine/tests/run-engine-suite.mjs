import fs from 'node:fs';

const directory=new URL('.',import.meta.url);
const tests=fs.readdirSync(directory)
  .filter(file=>/^test-re\d.*\.mjs$/i.test(file))
  .filter(file=>file!=='run-engine-suite.mjs')
  .sort((a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'}));

if(!tests.length)throw new Error('Russian Engine suite discovered no tests');

for(const file of tests){
  await import(new URL(file,import.meta.url));
}

console.log(JSON.stringify({
  ok:true,
  suite:'RUSSIAN_ENGINE_FAST_SUITE_V2',
  discovery:'test-re*.mjs',
  tests:tests.length,
  files:tests
}));
