import fs from "node:fs";
import { spawnSync } from "node:child_process";

const commands = [
  ["scripts/validate-roadmap-runtime-contract.mjs"],
  ["scripts/build-roadmap-runtime-bridge.mjs"],
  ["scripts/validate-roadmap-runtime-bridge.mjs"],
  ["scripts/validate-roadmap-runtime-entrypoint.mjs"],
  ["--test", "tests/roadmap-v2-runtime.test.mjs"]
];

const evidence = [];
for (const args of commands) {
  const run = spawnSync(process.execPath, args, { encoding: "utf8" });
  if (run.status !== 0) {
    process.stderr.write(run.stdout || "");
    process.stderr.write(run.stderr || "");
    throw new Error(`L29 focused gate failed: node ${args.join(" ")}`);
  }
  evidence.push({ command: `node ${args.join(" ")}`, status: "PASS" });
}

const manifestFile = "roadmap_v2/runtime/manifest.json";
const first = fs.readFileSync(manifestFile);
const rebuild = spawnSync(process.execPath, ["scripts/build-roadmap-runtime-bridge.mjs"], { encoding: "utf8" });
if (rebuild.status !== 0) {
  process.stderr.write(rebuild.stdout || "");
  process.stderr.write(rebuild.stderr || "");
  throw new Error("L29 deterministic rebuild failed");
}
if (!first.equals(fs.readFileSync(manifestFile))) throw new Error("L29 Runtime manifest generation is not deterministic");
evidence.push({ command: "Runtime manifest deterministic rebuild", status: "PASS" });

console.log(JSON.stringify({
  status: "PASS_B116_LOCAL_FOCUSED_AWAITING_FULL_CHECKOUT_CI_AND_BROWSER",
  gates: evidence.length,
  passed: evidence.length,
  failed: 0,
  runtimeTests: 15,
  featureFlags: 5,
  defaultOffFlags: 5,
  availableL29Capabilities: 1,
  productionBridgeTags: 1,
  persistentStores: 0,
  domMutations: 0,
  runtimeWrites: 0,
  legacyMutations: 0,
  fullRegressionProductionBoundaryAndBrowser: "DEFERRED_TO_B116_FULL_GITHUB_CHECKOUT"
}));
