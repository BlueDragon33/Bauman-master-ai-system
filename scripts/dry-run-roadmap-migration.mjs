import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const outputIndex = args.indexOf("--output");
if (outputIndex < 0 || !args[outputIndex + 1]) throw new Error("Usage: node scripts/dry-run-roadmap-migration.mjs --output <outside-worktree-path>");
const output = path.resolve(args[outputIndex + 1]);
const relative = path.relative(root, output);
if (!relative.startsWith("..") && !path.isAbsolute(relative)) throw new Error(`Dry-run output must be outside the worktree: ${output}`);

const sources = {
  registry: "roadmap_v2/registry/roadmap-v2.registry.json",
  prerequisiteGraph: "roadmap_v2/graph/prerequisite-graph.json",
  mappingReport: "roadmap_v2/migration/legacy-to-roadmap-v2.mapping.json",
  migrationContract: "roadmap_v2/migration/migration-contract.json"
};
const parsed = Object.fromEntries(Object.entries(sources).map(([key, file]) => [key, JSON.parse(fs.readFileSync(file, "utf8"))]));

if (parsed.migrationContract.acceptance.priorityEngineActivated) throw new Error("Contract incorrectly activates the Priority Engine");
if (parsed.prerequisiteGraph.validation.cycleNodes.length !== 0) throw new Error("Cannot dry-run a cyclic prerequisite graph");
if (parsed.mappingReport.validation.result !== "PASS_CONTRACT_ONLY") throw new Error("Mapping contract is not PASS_CONTRACT_ONLY");
if (parsed.mappingReport.legacyLessonMappings.length !== 347) throw new Error("Legacy lesson inventory coverage drift");
if (parsed.mappingReport.validation.exactLegacyLessonMappingsVerified !== 5) throw new Error("Authoritative composite mapping drift");
if (parsed.mappingReport.frameworkMappings.some((item) => item.mappingStatus !== "secondary_outline_quarantined_candidate" || item.priorityEngineEligible)) {
  throw new Error("Outline-only framework candidate escaped quarantine");
}

fs.mkdirSync(output, { recursive: false });
const outputFiles = {};
for (const [key, source] of Object.entries(sources)) {
  const bytes = fs.readFileSync(source);
  const target = path.join(output, `${key}.json`);
  fs.writeFileSync(target, bytes);
  const sourceSha = crypto.createHash("sha256").update(bytes).digest("hex");
  const targetSha = crypto.createHash("sha256").update(fs.readFileSync(target)).digest("hex");
  if (sourceSha !== targetSha) throw new Error(`Dry-run byte mismatch for ${key}`);
  outputFiles[key] = { source, target: path.basename(target), sha256: sourceSha };
}

const receipt = {
  schema: "BAUMAN_ROADMAP_V2_DRY_RUN_RECEIPT_V2",
  status: "PASS_B78",
  mode: "temporary_sidecar_only",
  outputDirectory: path.basename(output),
  registryChapters: parsed.registry.counts.chapters,
  numberedLessons: parsed.registry.counts.numberedLessons,
  graphCycles: parsed.prerequisiteGraph.validation.cycleNodes.length,
  legacyLessonsInventoried: parsed.mappingReport.validation.legacyLessonsInventoried,
  exactLegacyLessonMappingsVerified: parsed.mappingReport.validation.exactLegacyLessonMappingsVerified,
  semanticMappingComplete: parsed.mappingReport.validation.semanticMappingComplete,
  frameworkCandidatesQuarantined: parsed.mappingReport.validation.frameworkCandidatesQuarantined,
  legacyMutationCount: 0,
  runtimeMutationCount: 0,
  outputFiles
};
fs.writeFileSync(path.join(output, "migration_receipt.json"), `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify(receipt));
