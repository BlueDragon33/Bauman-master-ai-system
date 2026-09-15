import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const source=path.join(root,'runtime-dist');
const output=path.join(root,'dist');
const revision=String(process.env.BAUMAN_BUILD_REVISION||process.env.GITHUB_SHA||'').trim();

if(!/^[0-9a-f]{40}$/i.test(revision))throw new Error('BAUMAN_BUILD_REVISION or GITHUB_SHA must be a full 40-character Git commit.');
if(!fs.statSync(path.join(source,'index.html'),{throwIfNoEntry:false})?.isFile())throw new Error('runtime-dist/index.html is required; materialize the accepted runtime package first.');

for(const relative of [
  'assets/js/platform/runtime-config.js',
  'assets/js/platform/device-access-gate.js',
  'subjects/math/index.html',
  'subjects/russian/index.html',
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

const indexPath=path.join(output,'index.html');
const sourceHtml=fs.readFileSync(indexPath,'utf8');
if(sourceHtml.includes('bauman-platform-access'))throw new Error('Source runtime already contains a platform access marker.');
if(!sourceHtml.includes('assets/js/platform/device-access-gate.js'))throw new Error('Device Gate v4 must remain loaded in the Site package.');
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
  revision
},null,2));
