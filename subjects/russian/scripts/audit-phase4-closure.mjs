import {execFileSync} from 'node:child_process';

const PARENT='676fe08d05e6d92ff4479620ad9bf00abe5f8da6';
const output=execFileSync('git',['diff','--name-only',PARENT+'...HEAD'],{encoding:'utf8'}).trim();
const files=output?output.split(/\r?\n/).filter(Boolean):[];

const exact=new Set([
  '.github/workflows/russian-ui-reference-gate.yml',
  '.github/workflows/system-integration-ci.yml',
  'CODEX_STATE.md',
  'CODEX_TASK.md',
  'scripts/prepare-chatgpt-site.mjs',
  'scripts/prepare-cloudflare-preview.mjs',
  'tests/hub-premium-responsive-browser.mjs',
  'tests/russian-handwriting-recognition-browser.mjs',
  'tests/russian-handwriting-offline-authority-browser.mjs',
  'tests/system-browser-acceptance.mjs'
]);
const prefixes=[
  'subjects/russian/'
];
const forbiddenPrefixes=[
  'foundation/',
  'assets/js/academic',
  'foundation/content-registry/',
  'foundation/content-resolution/'
];

const forbidden=files.filter(file=>forbiddenPrefixes.some(prefix=>file.startsWith(prefix)));
const unexpected=files.filter(file=>!exact.has(file)&&!prefixes.some(prefix=>file.startsWith(prefix)));

console.log('RUSSIAN_PHASE4_CLOSURE_PARENT='+PARENT);
console.log('RUSSIAN_PHASE4_CLOSURE_FILE_COUNT='+files.length);
for(const file of files)console.log('SLICE · '+file);

if(forbidden.length){
  console.error('PHASE4_CLOSURE_FAIL · forbidden non-Russian authority paths: '+forbidden.join(', '));
  process.exit(1);
}
if(unexpected.length){
  console.error('PHASE4_CLOSURE_FAIL · unexpected paths outside Russian promotion slice: '+unexpected.join(', '));
  process.exit(1);
}
if(!files.includes('subjects/russian/assets/handwriting-recognition.js'))throw new Error('Russian handwriting runtime missing from closure slice');
if(!files.includes('subjects/russian/assets/handwriting-glyph-authority.js'))throw new Error('Russian glyph authority missing from closure slice');
if(!files.includes('tests/russian-handwriting-recognition-browser.mjs'))throw new Error('Russian recognition browser acceptance missing from closure slice');
if(!files.includes('tests/russian-handwriting-offline-authority-browser.mjs'))throw new Error('Russian offline authority browser acceptance missing from closure slice');

console.log('RUSSIAN_PHASE4_CLOSURE_AUDIT=PASS');
