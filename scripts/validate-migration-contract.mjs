import fs from 'node:fs';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const baseline = read('docs/roadmap_v2/baseline_inventory.json');
const registry = read('docs/roadmap_v2/roadmap_registry.json');
const graph = read('docs/roadmap_v2/prerequisite_graph.json');
const mapping = read('docs/roadmap_v2/mapping_report.json');
const contract = read('docs/roadmap_v2/migration_contract.json');
const fail = message => { throw new Error(message); };

if (contract.status !== 'PASS_B76_CONTRACT_ONLY') fail('Migration contract status invalid');
if (contract.baseline.commit !== baseline.commit) fail('Baseline commit mismatch');
if (JSON.stringify(contract.baseline.fingerprints) !== JSON.stringify(baseline.fingerprints)) fail('Baseline fingerprints mismatch');
if (!contract.identityRules.legacyIdsImmutable) fail('Legacy IDs are not protected');
if (!contract.identityRules.historicalLabelE15MustNotBeUsedAsRef) fail('Historical E15 label is not blocked as a ref');
if (contract.currentScope.migrationExecuted || contract.currentScope.runtimePatched || contract.currentScope.protectedSourcePatched) fail('B76 must be contract-only');

const registryIds = new Set(registry.nodes.map(node => node.id));
if (mapping.entries.length !== registry.nodes.length) fail('Mapping report does not cover all registry nodes');
if (new Set(mapping.entries.map(entry => entry.roadmapNodeId)).size !== registry.nodes.length) fail('Duplicate mapping entry');
for (const entry of mapping.entries) if (!registryIds.has(entry.roadmapNodeId)) fail(`Unknown mapping node ${entry.roadmapNodeId}`);

const pca = mapping.entries.find(entry => entry.roadmapNodeId === 'MATH-L2-C07');
if (pca.status !== 'verified_composite') fail('MATH-L2-C07 is not verified composite');
if (JSON.stringify(pca.legacyRefs) !== JSON.stringify(baseline.roadmapLogicalMappings['MATH-L2-C07'].legacyRefs)) fail('PCA legacy mapping mismatch');

if (graph.counts.cycles !== 0 || graph.counts.unresolvedInternalRefs !== 0) fail('Graph gate is not PASS');
if (contract.validationSummary.mappingEntries !== 85) fail('Unexpected mapping entry count');

const expectedMappingCounts = {
  verified_composite: 1,
  candidate_chapter_mapping: 9,
  legacy_module_inventory_pending: 10,
  create_dynamic: 6,
  create_new: 59
};
for (const [key, value] of Object.entries(expectedMappingCounts)) {
  if (mapping.counts[key] !== value) fail(`Unexpected mapping count ${key}: ${mapping.counts[key]}`);
}

console.log(JSON.stringify({
  status: 'PASS_B76',
  baseline: baseline.commit,
  mappingEntries: mapping.entries.length,
  mappingCounts: mapping.counts,
  protectedPaths: contract.protectedPaths.length,
  migrationExecuted: contract.currentScope.migrationExecuted
}));

