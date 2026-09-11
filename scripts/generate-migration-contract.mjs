import fs from 'node:fs';

const baseline = JSON.parse(fs.readFileSync('docs/roadmap_v2/baseline_inventory.json', 'utf8'));
const registry = JSON.parse(fs.readFileSync('docs/roadmap_v2/roadmap_registry.json', 'utf8'));
const graph = JSON.parse(fs.readFileSync('docs/roadmap_v2/prerequisite_graph.json', 'utf8'));

const mathCandidates = {
  'MATH-L0-C01': ['MATH-VN-LA-C01', 'MATH-PREP-LOG-C08'],
  'MATH-L0-C02': ['MATH-VN-CA-C03', 'MATH-PREP-CA1-C11', 'MATH-PREP-CA2-C12', 'MATH-PREP-CA3-C13', 'MATH-PREP-ODE-C14'],
  'MATH-L1-C03': ['MATH-VN-LA-C01', 'MATH-VN-LA-C02', 'MATH-PREP-LA1-C09', 'MATH-PREP-LA2-C10', 'MATH-HK1-NLA-C19'],
  'MATH-L1-C04': ['MATH-VN-CA-C03', 'MATH-PREP-CA2-C12', 'MATH-HK1-OPT-C20', 'MATH-HK2-NN-C27'],
  'MATH-L2-C05': ['MATH-VN-PS-C04', 'MATH-VN-PS-C05', 'MATH-PREP-PS2-C15'],
  'MATH-L2-C06': ['MATH-VN-PS-C06', 'MATH-PREP-ST1-C16'],
  'MATH-L3-C08': ['MATH-PREP-NM-C17', 'MATH-HK1-NLA-C19'],
  'MATH-L3-C09': ['MATH-HK1-OPT-C20', 'MATH-HK1-INFO-C21', 'MATH-HK2-MLB-C25', 'MATH-HK2-NN-C27'],
  'MATH-L3-C10': ['MATH-HK1-TS-C22', 'MATH-HK1-SIG-C23', 'MATH-HK2-KF-C29', 'MATH-NIR-TSADV-C31']
};

const entries = registry.nodes.map(node => {
  if (node.id === 'MATH-L2-C07') {
    return {
      roadmapNodeId: node.id,
      status: 'verified_composite',
      legacyRefs: node.legacyRefs,
      evidence: 'B73 parsed immutable lessons.json blob and verified exact lesson IDs/titles',
      action: 'reuse theory source; create missing formula/exercise/simulation/test sidecars'
    };
  }
  if (mathCandidates[node.id]) {
    return {
      roadmapNodeId: node.id,
      status: 'candidate_chapter_mapping',
      legacyRefs: mathCandidates[node.id],
      evidence: 'B73 lesson catalogue title/topic match; exact per-lesson audit deferred to Math integration lượt',
      action: 'audit lesson-level coverage before reuse; do not rewrite legacy'
    };
  }
  if (node.subjectId === '01') {
    return {
      roadmapNodeId: node.id,
      status: 'legacy_module_inventory_pending',
      legacyRefs: [],
      evidence: 'Russian module is outside the inventoried math-only baseline scope',
      action: 'inventory Russian source during its scheduled integration lượt'
    };
  }
  if (node.subjectId === '09') {
    return {
      roadmapNodeId: node.id,
      status: 'create_dynamic',
      legacyRefs: [],
      evidence: 'Course Instance must be generated from an official current syllabus',
      action: 'create schema/template only; never invent a Bauman course list'
    };
  }
  return {
    roadmapNodeId: node.id,
    status: 'create_new',
    legacyRefs: [],
    evidence: 'Lượt 18 reuse matrix classifies this academic content as new',
    action: 'create content through the common module contract and Master-ready gate'
  };
});

const mappingCounts = entries.reduce((counts, entry) => {
  counts[entry.status] = (counts[entry.status] || 0) + 1;
  return counts;
}, {});

const mappingReport = {
  schema: 'BAUMAN_ROADMAP_V2_MAPPING_REPORT_V1',
  version: '2.0.0-l19-b76',
  status: 'PASS_MAPPING_CONTRACT',
  baselineCommit: baseline.commit,
  registryVersion: registry.version,
  policy: {
    exactLegacyRefRequiredForReuse: true,
    candidateChapterMappingIsReusableContent: false,
    plannedManifestCountIsReusableContent: false,
    unmatchedNodeIsMigrationFailure: false,
    ambiguousLegacyRefIsMigrationFailure: true
  },
  entries,
  counts: mappingCounts
};

const migrationContract = {
  schema: 'BAUMAN_ROADMAP_V2_MIGRATION_CONTRACT_V1',
  version: '2.0.0-l19-b76',
  status: 'PASS_B76_CONTRACT_ONLY',
  baseline: {
    repository: baseline.repository,
    ref: baseline.ref,
    commit: baseline.commit,
    fingerprints: baseline.fingerprints
  },
  inputs: {
    baselineInventory: 'docs/roadmap_v2/baseline_inventory.json',
    registry: 'docs/roadmap_v2/roadmap_registry.json',
    prerequisiteGraph: 'docs/roadmap_v2/prerequisite_graph.json',
    mappingReport: 'docs/roadmap_v2/mapping_report.json'
  },
  writeMode: 'sidecar_only_until_runtime_adapter_gate',
  namespace: 'roadmap_v2',
  identityRules: {
    legacyIdsImmutable: true,
    roadmapIdsImmutableAfterRegistryAcceptance: true,
    oneRoadmapNodeMayHaveManyLegacyRefs: true,
    oneLegacyRefMaySupportManyRoadmapNodes: true,
    physicalChapterNumberMustNotBeDerivedFromRoadmapId: true,
    historicalLabelE15MustNotBeUsedAsRef: true
  },
  protectedPaths: Object.keys(baseline.fingerprints),
  allowedL19Paths: [
    'Bauman_Roadmap_V2_Syllabus_Luot18.md',
    'docs/roadmap_v2/**',
    'scripts/generate-roadmap-registry.mjs',
    'scripts/generate-prerequisite-graph.mjs',
    'scripts/generate-migration-contract.mjs',
    'scripts/validate-roadmap-v2.mjs',
    'scripts/validate-prerequisite-graph.mjs',
    'scripts/validate-migration-contract.mjs'
  ],
  gates: [
    { id: 'G1_BASELINE', requires: 'baseline inventory PASS and fingerprints unchanged' },
    { id: 'G2_REGISTRY', requires: '10 subjects, 85 nodes, 304 numbered lessons, 8 dynamic nodes' },
    { id: 'G3_GRAPH', requires: 'all internal refs resolved and required graph acyclic' },
    { id: 'G4_MAPPING', requires: 'exact legacyRefs before content is marked reusable' },
    { id: 'G5_ADAPTER', requires: 'feature-flagged read-only adapter plus static and browser regression tests' }
  ],
  rollback: {
    registrySidecar: 'remove roadmap_v2 sidecar references; legacy runtime remains untouched',
    protectedWrite: 'reject commit when pre/post Git blob fingerprint differs without an approved targeted migration'
  },
  currentScope: {
    migrationExecuted: false,
    runtimePatched: false,
    protectedSourcePatched: false,
    nextAuthorizedStep: 'L20_B77_VALIDATOR_AND_MIGRATION_DRY_RUN'
  },
  validationSummary: {
    registryNodes: registry.counts.nodes,
    numberedLessons: registry.counts.numberedLessons,
    requiredGraphEdges: graph.counts.requiredInternalEdges,
    graphCycles: graph.counts.cycles,
    mappingEntries: entries.length
  }
};

fs.writeFileSync('docs/roadmap_v2/mapping_report.json', `${JSON.stringify(mappingReport, null, 2)}\n`);
fs.writeFileSync('docs/roadmap_v2/migration_contract.json', `${JSON.stringify(migrationContract, null, 2)}\n`);
console.log(JSON.stringify({ mappingCounts, validationSummary: migrationContract.validationSummary }));

