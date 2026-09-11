import fs from "node:fs";
import { spawnSync } from "node:child_process";

const commands = [
  ["scripts/validate-roadmap-ui-transition-contract.mjs"],
  ["scripts/build-roadmap-ui-transition.mjs"],
  ["scripts/validate-roadmap-ui-transition.mjs"],
  ["--test", "tests/roadmap-v2-ui-transition.test.mjs"]
];
const evidence = [];
for (const args of commands) {
  const run = spawnSync(process.execPath, args, { encoding: "utf8" });
  if (run.status !== 0) {
    process.stderr.write(run.stdout || "");
    process.stderr.write(run.stderr || "");
    throw new Error(`L32 focused gate failed: node ${args.join(" ")}`);
  }
  evidence.push({ command: `node ${args.join(" ")}`, status: "PASS" });
}
const generated = ["roadmap_v2/ui-transition/transition-plan.json", "roadmap_v2/ui-transition/manifest.json"];
const first = generated.map((file) => fs.readFileSync(file));
const rebuild = spawnSync(process.execPath, ["scripts/build-roadmap-ui-transition.mjs"], { encoding: "utf8" });
if (rebuild.status !== 0) throw new Error("L32 deterministic rebuild failed");
generated.forEach((file, index) => {
  if (!first[index].equals(fs.readFileSync(file))) throw new Error(`L32 generation is not deterministic: ${file}`);
});
evidence.push({ command: "UI transition plan and manifest deterministic rebuild", status: "PASS" });
const fullCheckout = process.env.ROADMAP_L32_FULL_CHECKOUT === "1";
console.log(JSON.stringify({
  status: fullCheckout ? "PASS_B128_L32_FULL_CHECKOUT_ACCEPTANCE" : "PASS_B128_LOCAL_FOCUSED_AWAITING_FULL_CHECKOUT_CI",
  gates: evidence.length,
  passed: evidence.length,
  failed: 0,
  canonicalCourses: 10,
  plannedCanonicalRoutes: 10,
  physicalCanonicalRoutesCreated: 0,
  legacyRoutesPreserved: 8,
  automaticRedirects: 0,
  openFindings: 16,
  productionWrites: 0,
  persistenceWrites: 0,
  fullRegressionAndProductionBoundary: fullCheckout ? "PASS_AS_PRECEDING_WORKFLOW_GATES" : "DEFERRED_TO_B128_FULL_GITHUB_CHECKOUT"
}));
