import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync('roadmap_v2/manifest.json', 'utf8'));
if (manifest.productionIntegration !== 'disconnected') throw new Error('Roadmap sidecar must remain disconnected through Lượt 23');
if (manifest.mode !== 'read_only_sidecar') throw new Error('Roadmap sidecar is not read-only');

const consumerManifest = JSON.parse(fs.readFileSync('roadmap_v2/consumer/manifest.json', 'utf8'));
if (consumerManifest.productionIntegration !== 'disconnected') throw new Error('Roadmap consumer must remain disconnected through Lượt 23');
if (consumerManifest.mode !== 'read_only_consumer_bridge') throw new Error('Roadmap consumer is not read-only');

const diagnosticManifest = JSON.parse(fs.readFileSync('roadmap_v2/diagnostic/manifest.json', 'utf8'));
if (diagnosticManifest.productionIntegration !== 'disconnected') throw new Error('Roadmap diagnostic must remain disconnected in Lượt 23');
if (diagnosticManifest.mode !== 'read_only_diagnostic_harness') throw new Error('Roadmap diagnostic is not a read-only harness');
if (diagnosticManifest.counts.executablePlans !== 0) throw new Error('Roadmap diagnostic contains executable production plans');
if (diagnosticManifest.safety.runtimeWrites !== 0) throw new Error('Roadmap diagnostic permits runtime writes');

const masteryManifest = JSON.parse(fs.readFileSync('roadmap_v2/mastery/manifest.json', 'utf8'));
if (masteryManifest.productionIntegration !== 'disconnected') throw new Error('Roadmap mastery must remain disconnected in Lượt 24');
if (masteryManifest.mode !== 'in_memory_append_only_evidence_harness') throw new Error('Roadmap mastery is not an in-memory harness');
if (masteryManifest.counts.persistentStores !== 0) throw new Error('Roadmap mastery contains a production store');
if (masteryManifest.safety.persistentStoreWrites !== 0 || masteryManifest.safety.runtimeWrites !== 0) throw new Error('Roadmap mastery permits persistent or runtime writes');

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
  status: 'PASS_B96_PRODUCTION_DISCONNECTED',
  checkedEntrypoints: productionEntrypoints.length,
  sidecarMode: manifest.mode,
  consumerMode: consumerManifest.mode,
  diagnosticMode: diagnosticManifest.mode,
  diagnosticExecutablePlans: diagnosticManifest.counts.executablePlans,
  masteryMode: masteryManifest.mode,
  masteryPersistentStores: masteryManifest.counts.persistentStores,
  productionIntegration: manifest.productionIntegration
}));
