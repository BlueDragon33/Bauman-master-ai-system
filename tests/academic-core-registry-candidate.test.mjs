import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateCandidate} from '../scripts/validate-academic-core-registry-candidate.mjs';

const original=JSON.parse(fs.readFileSync('foundation/content-resolution/registry-candidates/academic-core-2026.v1.json','utf8'));
const realRead=path=>fs.readFileSync(path);
const copy=()=>structuredClone(original);

assert.equal((await validateCandidate(copy(),realRead)).length,3);

{
  const x=copy();
  x.extensions.academicCore2026.runtimeAuthoritySwitch=true;
  await assert.rejects(()=>validateCandidate(x,realRead),/switched runtime authority/);
}
{
  const x=copy();
  x.records.checksum['bdr:checksum:academic-2026:official-curriculum-sha256'].digest='0'.repeat(64);
  await assert.rejects(()=>validateCandidate(x,realRead),/Pinned SHA-256 drift/);
}
{
  const x=copy();
  x.records.checksum['bdr:checksum:academic-2026:prerequisite-registry-sha256'].byteLength+=1;
  await assert.rejects(()=>validateCandidate(x,realRead),/Pinned byte length drift/);
}
{
  const x=copy();
  x.records.asset['bdr:asset:academic-2026:prerequisite-pack-manifest-json'].state='quarantined';
  await assert.rejects(()=>validateCandidate(x,realRead),/Asset state is not verified|INVALID_ASSET_STATE/);
}
{
  const x=copy();
  x.records.access['bdr:access:academic-2026:official-curriculum-content'].visibility='public';
  await assert.rejects(()=>validateCandidate(x,realRead),/Explicit private access drift/);
}
{
  const x=copy();
  x.records.content['bdr:content:academic-2026:official-curriculum'].assetIds=['bdr:asset:academic-2026:prerequisite-registry-json'];
  await assert.rejects(()=>validateCandidate(x,realRead),/Content asset linkage drift/);
}
{
  const fakeRead=path=>{
    const bytes=realRead(path);
    if(path.includes('manifest-2026.json'))return Buffer.concat([bytes,Buffer.from('\n')]);
    return bytes;
  };
  await assert.rejects(()=>validateCandidate(copy(),fakeRead),/Pinned SHA-256 drift|Pinned byte length drift/);
}

console.log('ACADEMIC_CORE_REGISTRY_CANDIDATE_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:7,pinnedSha256:true,explicitPrivateAccess:true},null,2));
