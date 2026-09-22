import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const source=path.join(root,'runtime-dist');
const output=path.join(root,'dist');
const revision=String(process.env.BAUMAN_BUILD_REVISION||process.env.GITHUB_SHA||'').trim();

if(!/^[0-9a-f]{40}$/i.test(revision))throw new Error('BAUMAN_BUILD_REVISION or GITHUB_SHA must be a full 40-character Git commit.');
if(!fs.statSync(path.join(source,'index.html'),{throwIfNoEntry:false})?.isFile())throw new Error('runtime-dist/index.html is required; materialize the accepted runtime package first.');

const foundationRuntime=[
  'subjects/shared/foundation-identity-bootstrap.js',
  'subjects/shared/foundation-identity-persistence.js',
  'subjects/shared/foundation-identity-projection.js',
  'subjects/shared/foundation-canonical-context.js',
  'foundation/domain-model/canonical-identity-runtime.js',
  'foundation/domain-model/identity-overlay-store.js',
  'foundation/domain-model/legacy-snapshot-extractor.js',
  'foundation/domain-model/canonical-read-projection.js',
  'foundation/domain-model/legacy-mapping-registry.v1.json'
];

for(const relative of [
  'assets/js/platform/runtime-config.js',
  'assets/js/platform/device-access-gate.js',
  'assets/css/deep-study-journal-v1.css',
  'assets/js/deep-study-journal-v1.js',
  'subjects/math/index.html',
  'subjects/russian/index.html',
  'subjects/russian/assets/handwriting-glyph-authority.js',
  'subjects/russian/assets/handwriting-recognition.js',
  'subjects/russian/assets/russian-future-ui.css',
  'subjects/russian/assets/russian-future-ui.js',
  ...foundationRuntime,
  'subjects/russian/data/chunks/dialogue-bauman-az/manifest.json',
  'subjects/russian/data/chunks/deep-speaking-bauman/manifest.json'
]){
  if(!fs.statSync(path.join(source,relative),{throwIfNoEntry:false})?.isFile())throw new Error(`Accepted runtime package is missing ${relative}.`);
}
for(const removed of [
  'subjects/russian/data/dialogue-bauman-az.json',
  'subjects/russian/data/deep-speaking-bauman.json'
]){
  if(fs.existsSync(path.join(source,removed)))throw new Error(`Oversized runtime source must remain absent: ${removed}.`);
}

fs.rmSync(output,{recursive:true,force:true});
fs.cpSync(source,output,{recursive:true});

// Defense in depth: a ChatGPT Site package is valid only if every Foundation file
// referenced by packaged subject pages survives the runtime-dist -> dist copy.
for(const relative of foundationRuntime){
  if(!fs.statSync(path.join(output,relative),{throwIfNoEntry:false})?.isFile())throw new Error(`ChatGPT Site package is missing runtime dependency ${relative}.`);
}

const russianHtml=fs.readFileSync(path.join(output,'subjects/russian/index.html'),'utf8');
if(!russianHtml.includes('assets/handwriting-glyph-authority.js'))throw new Error('Packaged Russian runtime is missing handwriting glyph authority script reference.');
if(!russianHtml.includes('assets/handwriting-recognition.js'))throw new Error('Packaged Russian runtime is missing handwriting recognition script reference.');
if(russianHtml.indexOf('assets/handwriting-glyph-authority.js')>russianHtml.indexOf('assets/handwriting-recognition.js'))throw new Error('Packaged Russian glyph authority must load before handwriting recognition.');
for(const resource of ['assets/russian-future-ui.css','assets/russian-future-ui.js']){
  if(!russianHtml.includes(resource))throw new Error(`Packaged Russian Future UI reference missing: ${resource}`);
}
for(const resource of [
  '../../foundation/domain-model/canonical-identity-runtime.js',
  '../../foundation/domain-model/identity-overlay-store.js',
  '../../foundation/domain-model/legacy-snapshot-extractor.js',
  '../../foundation/domain-model/canonical-read-projection.js',
  '../shared/foundation-identity-bootstrap.js',
  '../shared/foundation-identity-persistence.js',
  '../shared/foundation-identity-projection.js',
  '../shared/foundation-canonical-context.js'
]){
  if(!russianHtml.includes(resource))throw new Error(`Packaged Russian runtime is missing Foundation script reference ${resource}.`);
}

const indexPath=path.join(output,'index.html');
const sourceHtml=fs.readFileSync(indexPath,'utf8');
if(sourceHtml.includes('bauman-platform-access'))throw new Error('Source runtime already contains a platform access marker.');
if(!sourceHtml.includes('assets/js/platform/device-access-gate.js'))throw new Error('Device Gate v4 must remain loaded in the Site package.');
for(const resource of ['assets/css/deep-study-journal-v1.css','assets/js/deep-study-journal-v1.js']){
  if(!sourceHtml.includes(resource))throw new Error(`Deep Study Journal package reference missing: ${resource}`);
}
const metadata=[
  `  <meta name="bauman-platform-access" content="chatgpt-site-owner-private">`,
  `  <meta name="bauman-deployment-channel" content="chatgpt-site">`,
  `  <meta name="bauman-build-revision" content="${revision}">`
].join('\n');
const packagedHtml=sourceHtml.replace('</head>',`${metadata}\n</head>`);
if(packagedHtml===sourceHtml)throw new Error('Unable to inject ChatGPT Site package metadata.');
fs.writeFileSync(indexPath,packagedHtml);

console.log(JSON.stringify({
  status:'CHATGPT_SITE_PACKAGE_PASS',
  source:'runtime-dist',
  output:'dist',
  accessBoundary:'chatgpt-site-owner-private',
  foundationRuntime:'present',
  canonicalProjection:'present',
  canonicalContext:'present',
  revision
},null,2));
