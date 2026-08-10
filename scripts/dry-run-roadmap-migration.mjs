import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outputIndex = args.indexOf('--output');
if (outputIndex < 0 || !args[outputIndex + 1]) throw new Error('Usage: node scripts/dry-run-roadmap-migration.mjs --output <outside-worktree-path>');
const output = path.resolve(args[outputIndex + 1]);
const relative = path.relative(root, output);
if (!relative.startsWith('..') && !path.isAbsolute(relative)) throw new Error(`Dry-run output must be outside the worktree: ${output}`);

const sources = {
  registry: 'docs/roadmap_v2/roadmap_registry.json',
  prerequisiteGraph: 'docs/roadmap_v2/prerequisite_graph.json',
  mappingReport: 'docs/roadmap_v2/mapping_report.json',
  migrationContract: 'docs/roadmap_v2/migration_contract.json'
};
const parsed = Object.fromEntries(Object.entries(sources).map(([key, file]) => [key, JSON.parse(fs.readFileSync(file, 'utf8'))]));

if (parsed.migrationContract.currentScope.migrationExecuted) throw new Error('Contract incorrectly states that migration was already executed');
if (parsed.prerequisiteGraph.counts.cycles !== 0) throw new Error('Cannot dry-run a cyclic prerequisite graph');
if (parsed.mappingReport.entries.length !== parsed.registry.nodes.length) throw new Error('Mapping coverage mismatch');

fs.mkdirSync(output, { recursive: false });
const outputFiles = {};
for (const [key, source] of Object.entries(sources)) {
  const bytes = fs.readFileSync(source);
  const target = path.join(output, `${key}.json`);
  fs.writeFileSync(target, bytes);
  const sourceSha = crypto.createHash('sha256').update(bytes).digest('hex');
  const targetSha = crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');
  if (sourceSha !== targetSha) throw new Error(`Dry-run byte mismatch for ${key}`);
  outputFiles[key] = { source, target: path.basename(target), sha256: sourceSha };
}

const receipt = {
  schema: 'BAUMAN_ROADMAP_V2_DRY_RUN_RECEIPT_V1',
  status: 'PASS_B78',
  mode: 'temporary_sidecar_only',
  outputDirectory: path.basename(output),
  registryNodes: parsed.registry.counts.nodes,
  numberedLessons: parsed.registry.counts.numberedLessons,
  graphCycles: parsed.prerequisiteGraph.counts.cycles,
  mappingEntries: parsed.mappingReport.entries.length,
  legacyMutationCount: 0,
  runtimeMutationCount: 0,
  outputFiles
};
fs.writeFileSync(path.join(output, 'migration_receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify(receipt));

