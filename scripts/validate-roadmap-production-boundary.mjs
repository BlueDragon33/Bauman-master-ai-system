import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync('roadmap_v2/manifest.json', 'utf8'));
if (manifest.productionIntegration !== 'disconnected') throw new Error('Roadmap sidecar must remain disconnected in Lượt 21');
if (manifest.mode !== 'read_only_sidecar') throw new Error('Roadmap sidecar is not read-only');

const productionEntrypoints = [
  'subjects/math/index.html',
  'subjects/math/subject-manifest.json',
  'subjects/math/subject-manifest.js'
];
for (const file of productionEntrypoints) {
  const text = fs.readFileSync(file, 'utf8');
  if (/roadmap_v2|roadmap-v2|loader\.mjs/i.test(text)) throw new Error(`Premature Roadmap production integration: ${file}`);
}

console.log(JSON.stringify({
  status: 'PASS_B84_PRODUCTION_DISCONNECTED',
  checkedEntrypoints: productionEntrypoints.length,
  sidecarMode: manifest.mode,
  productionIntegration: manifest.productionIntegration
}));

