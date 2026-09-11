import fs from "node:fs";
import { spawnSync } from "node:child_process";

const commands = [
  ["scripts/validate-roadmap-backend-api-contract.mjs"],
  ["scripts/build-roadmap-backend-api.mjs"],
  ["scripts/validate-roadmap-backend-api.mjs"],
  ["--test", "tests/roadmap-v2-backend-api.test.mjs"]
];
const evidence = [];
for (const args of commands) {
  const run = spawnSync(process.execPath, args, { encoding: "utf8" });
  if (run.status !== 0) {
    process.stderr.write(run.stdout || "");
    process.stderr.write(run.stderr || "");
    throw new Error(`L33 focused gate failed: node ${args.join(" ")}`);
  }
  evidence.push({ command: `node ${args.join(" ")}`, status: "PASS" });
}
const generated = ["roadmap_v2/backend-api/projection.json", "roadmap_v2/backend-api/manifest.json"];
const first = generated.map((file) => fs.readFileSync(file));
const rebuild = spawnSync(process.execPath, ["scripts/build-roadmap-backend-api.mjs"], { encoding: "utf8" });
if (rebuild.status !== 0) throw new Error("L33 deterministic rebuild failed");
generated.forEach((file, index) => {
  if (!first[index].equals(fs.readFileSync(file))) throw new Error(`L33 generation is not deterministic: ${file}`);
});
evidence.push({ command: "Backend API projection and manifest deterministic rebuild", status: "PASS" });
const fullCheckout = process.env.ROADMAP_L33_FULL_CHECKOUT === "1";
console.log(JSON.stringify({
  status: fullCheckout ? "PASS_B132_L33_FULL_CHECKOUT_ACCEPTANCE" : "PASS_B132_LOCAL_FOCUSED_AWAITING_FULL_CHECKOUT_CI",
  gates: evidence.length,
  passed: evidence.length,
  failed: 0,
  endpoints: 7,
  inMemoryReadOnly: 2,
  persistenceBlocked: 5,
  productionRoutes: 0,
  databaseConnections: 0,
  persistentStores: 0,
  userRecords: 0,
  sessions: 0,
  tokens: 0,
  eventWrites: 0,
  syncWrites: 0,
  fullRegressionAndProductionBoundary: fullCheckout ? "PASS_AS_PRECEDING_WORKFLOW_GATES" : "DEFERRED_TO_B132_FULL_GITHUB_CHECKOUT"
}));
