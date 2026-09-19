import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {validateHandwritingGlyphAuthorityPolicy} from './handwriting-glyph-authority-policy.mjs';

const root=process.cwd();
const fixtureDir=path.join(root,'subjects/russian/assets/__authority-policy-fixture__');
const rel=name=>'subjects/russian/assets/__authority-policy-fixture__/'+name;
const alphabetIds=Array.from({length:33},(_,i)=>'HW_AZ_'+String(i+1).padStart(2,'0'));
const previewBuild="fs.cpSync(path.join(root, 'subjects'), path.join(runtimeDist, 'subjects'), { recursive: true })";
const siteBuild="fs.cpSync(source,output,{recursive:true})";
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function expectPass(label,fn){
  try{fn();console.log('PASS · '+label);}catch(error){console.error('FAIL · '+label+' · '+String(error?.message||error));process.exitCode=1;}
}
function expectFail(label,fn,pattern){
  try{fn();console.error('FAIL · '+label+' · expected rejection');process.exitCode=1;}
  catch(error){
    const message=String(error?.message||error);
    if(pattern&&!pattern.test(message)){console.error('FAIL · '+label+' · unexpected error: '+message);process.exitCode=1;}
    else console.log('PASS · '+label);
  }
}

fs.rmSync(fixtureDir,{recursive:true,force:true});
fs.mkdirSync(fixtureDir,{recursive:true});
try{
  const fontPath=path.join(fixtureDir,'fixture.woff2');
  const licensePath=path.join(fixtureDir,'LICENSE.txt');
  const coveragePath=path.join(fixtureDir,'coverage.json');
  fs.writeFileSync(fontPath,'fixture-font-bytes');
  fs.writeFileSync(licensePath,'fixture-license');
  const coverage={
    schema:'RUSSIAN_HANDWRITING_GLYPH_COVERAGE_V1',
    alphabetIds,
    fontFamilies:['Fixture Handwriting'],
    reviewedAt:'2026-09-19T00:00:00.000Z',
    reviewedBy:'CI fixture'
  };
  fs.writeFileSync(coveragePath,JSON.stringify(coverage));

  const ready={
    schema:'RUSSIAN_HANDWRITING_GLYPH_AUTHORITY_V1',
    status:'ready',
    source:'bundled-vetted',
    trustedFamilies:['Fixture Handwriting'],
    asset:rel('fixture.woff2'),
    assetSha256:digest(fontPath),
    license:rel('LICENSE.txt'),
    licenseSha256:digest(licensePath),
    coverageManifest:rel('coverage.json'),
    coverageSha256:digest(coveragePath),
    verifiedAt:'2026-09-19T00:00:00.000Z'
  };
  const shell=[
    "'./assets/__authority-policy-fixture__/fixture.woff2'",
    "'./assets/__authority-policy-fixture__/LICENSE.txt'",
    "'./assets/__authority-policy-fixture__/coverage.json'"
  ].join(',');

  expectPass('ready authority fixture passes complete promotion policy',()=>validateHandwritingGlyphAuthorityPolicy({
    authority:ready,root,alphabetIds,serviceWorker:shell,previewBuild,siteBuild
  }));

  expectFail('tampered font digest is rejected',()=>validateHandwritingGlyphAuthorityPolicy({
    authority:{...ready,assetSha256:'0'.repeat(64)},root,alphabetIds,serviceWorker:shell,previewBuild,siteBuild
  }),/assetSha256 does not match/);

  const missingCoverage={...coverage,alphabetIds:alphabetIds.slice(0,32)};
  fs.writeFileSync(coveragePath,JSON.stringify(missingCoverage));
  const missingCoverageAuthority={...ready,coverageSha256:digest(coveragePath)};
  expectFail('coverage missing one Russian letter is rejected',()=>validateHandwritingGlyphAuthorityPolicy({
    authority:missingCoverageAuthority,root,alphabetIds,serviceWorker:shell,previewBuild,siteBuild
  }),/exactly 33 alphabet IDs|do not match/);
  fs.writeFileSync(coveragePath,JSON.stringify(coverage));

  expectFail('missing offline precache is rejected',()=>validateHandwritingGlyphAuthorityPolicy({
    authority:{...ready,coverageSha256:digest(coveragePath)},root,alphabetIds,serviceWorker:"'./assets/__authority-policy-fixture__/fixture.woff2'",previewBuild,siteBuild
  }),/precache/);

  expectFail('remote authority asset is rejected',()=>validateHandwritingGlyphAuthorityPolicy({
    authority:{...ready,asset:'https://example.com/font.woff2'},root,alphabetIds,serviceWorker:shell,previewBuild,siteBuild
  }),/local relative repo path/);

  const blocked={
    schema:'RUSSIAN_HANDWRITING_GLYPH_AUTHORITY_V1',
    status:'blocked',
    source:'none',
    trustedFamilies:[],
    asset:null,assetSha256:null,license:null,licenseSha256:null,coverageManifest:null,coverageSha256:null,verifiedAt:null
  };
  expectPass('clean blocked authority remains valid',()=>validateHandwritingGlyphAuthorityPolicy({
    authority:blocked,root,alphabetIds,serviceWorker:'',previewBuild,siteBuild
  }));
  expectFail('blocked authority carrying promotion metadata is rejected',()=>validateHandwritingGlyphAuthorityPolicy({
    authority:{...blocked,asset:rel('fixture.woff2')},root,alphabetIds,serviceWorker:'',previewBuild,siteBuild
  }),/must not carry promotion metadata/);
}finally{
  fs.rmSync(fixtureDir,{recursive:true,force:true});
}
if(process.exitCode)process.exit(process.exitCode);
console.log('HANDWRITING_GLYPH_AUTHORITY_POLICY_SELF_TEST=PASS');
