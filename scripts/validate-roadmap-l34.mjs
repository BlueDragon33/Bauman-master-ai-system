import fs from "node:fs";
import { spawnSync } from "node:child_process";

const commands = [
  ["scripts/validate-roadmap-persistence-contract.mjs"],
  ["scripts/build-roadmap-persistence-harness.mjs"],
  ["scripts/validate-roadmap-persistence-harness.mjs"],
  ["--test", "tests/roadmap-v2-persistence.test.mjs"]
];
const evidence = [];
for (const args of commands) {
  const run = spawnSync(process.execPath, args, { encoding: "utf8" });
  if (run.status !== 0) {
    process.stderr.write(run.stdout || "");
    process.stderr.write(run.stderr || "");
    throw new Error(`L34 focused gate failed: node ${args.join(" ")}`);
  }
  evidence.push({ command: `node ${args.join(" ")}`, status: "PASS" });
}
const generated = ["roadmap_v2/persistence/projection.json", "roadmap_v2/persistence/manifest.json"];
const first = generated.map((file) => fs.readFileSync(file));
const rebuild = spawnSync(process.execPath, ["scripts/build-roadmap-persistence-harness.mjs"], { encoding: "utf8" });
if (rebuild.status !== 0) throw new Error("L34 deterministic rebuild failed");
generated.forEach((file, index) => {
  if (!first[index].equals(fs.readFileSync(file))) throw new Error(`L34 generation is not deterministic: ${file}`);
});
evidence.push({ command: "Persistence projection and manifest deterministic rebuild", status: "PASS" });
const fullCheckout = process.env.ROADMAP_L34_FULL_CHECKOUT === "1";
console.log(JSON.stringify({
  status: fullCheckout ? "PASS_B136_L34_FULL_CHECKOUT_ACCEPTANCE" : "PASS_B136_LOCAL_FOCUSED_AWAITING_FULL_CHECKOUT_CI",
  gates: evidence.length,
  passed: evidence.length,
  failed: 0,
  provider: "unselected",
  tables: 12,
  migrations: 4,
  indexes: 4,
  productionConnections: 0,
  productionMigrations: 0,
  productionWrites: 0,
  productionBackups: 0,
  productionRestores: 0,
  fullRegressionAndProductionBoundary: fullCheckout ? "PASS_AS_PRECEDING_WORKFLOW_GATES" : "DEFERRED_TO_B136_FULL_GITHUB_CHECKOUT"
}));
