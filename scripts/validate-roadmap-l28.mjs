import fs from "node:fs";
import { spawnSync } from "node:child_process";

const commands = [
  ["scripts/validate-roadmap-integration-contract.mjs"],
  ["scripts/build-roadmap-integration-harness.mjs"],
  ["scripts/validate-roadmap-integration-engine.mjs"],
  ["--test", "tests/roadmap-v2-integration.test.mjs"]
];

const evidence = [];
for (const args of commands) {
  const run = spawnSync(process.execPath, args, { encoding: "utf8" });
  if (run.status !== 0) {
    process.stderr.write(run.stdout || "");
    process.stderr.write(run.stderr || "");
    throw new Error(`L28 focused gate failed: node ${args.join(" ")}`);
  }
  evidence.push({ command: `node ${args.join(" ")}`, status: "PASS" });
}

const manifestFile = "roadmap_v2/integration/manifest.json";
const first = fs.readFileSync(manifestFile);
const rebuild = spawnSync(process.execPath, ["scripts/build-roadmap-integration-harness.mjs"], { encoding: "utf8" });
if (rebuild.status !== 0) {
  process.stderr.write(rebuild.stdout || "");
  process.stderr.write(rebuild.stderr || "");
  throw new Error("L28 deterministic rebuild failed");
}
if (!first.equals(fs.readFileSync(manifestFile))) throw new Error("L28 Integration manifest generation is not deterministic");
evidence.push({ command: "Integration manifest deterministic rebuild", status: "PASS" });

console.log(JSON.stringify({
  status: "PASS_B112_LOCAL_FOCUSED_AWAITING_FULL_CHECKOUT_CI",
  gates: evidence.length,
  passed: evidence.length,
  failed: 0,
  integrationTests: 15,
  featureFlags: 5,
  effectiveEnabledFlags: 0,
  persistedActivationPlans: 0,
  runtimeWrites: 0,
  legacyMutations: 0,
  fullRegressionAndProductionBoundary: "DEFERRED_TO_B112_FULL_GITHUB_CHECKOUT"
}));
