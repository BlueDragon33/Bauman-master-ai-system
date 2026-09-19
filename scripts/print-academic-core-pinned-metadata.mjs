import fs from 'node:fs';
import crypto from 'node:crypto';

const resources=[
  {id:'official-curriculum',path:'assets/data/official-curriculum-iu5-2026.json'},
  {id:'prerequisite-registry',path:'assets/data/prerequisite-registry-iu5-2026.json'},
  {id:'prerequisite-pack-manifest',path:'assets/data/prerequisite-packs/manifest-2026.json'}
];

const rows=resources.map(row=>{
  const bytes=fs.readFileSync(row.path);
  JSON.parse(bytes.toString('utf8'));
  return {
    ...row,
    algorithm:'sha256',
    digest:crypto.createHash('sha256').update(bytes).digest('hex'),
    byteLength:bytes.byteLength
  };
});

console.log('ACADEMIC_CORE_PINNED_METADATA_CANDIDATE='+JSON.stringify(rows));
