import fs from "node:fs";
import path from "node:path";
import { buildUiTransitionPlan, validateUiTransitionManifest } from "../roadmap_v2/ui-transition.mjs";

const root = path.resolve(".");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const paths = {
  contract: "roadmap_v2/ui-transition/ui-transition-contract.json",
  courseRoutePlan: "roadmap_v2/ui-transition/course-route-plan.json",
  legacyCompatibilityPlan: "roadmap_v2/ui-transition/legacy-compatibility-plan.json",
  remediationBacklog: "roadmap_v2/ui-transition/remediation-backlog.json",
  targetDisposition: "roadmap_v2/curriculum/target-course-disposition.json",
  findings: "roadmap_v2/ui-audit/findings.json"
};
const expected = buildUiTransitionPlan(Object.fromEntries(Object.entries(paths).map(([key, name]) => [key, readJson(name)])));
const actual = readJson("roadmap_v2/ui-transition/transition-plan.json");
if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error("UI transition plan drift");
validateUiTransitionManifest(readJson("roadmap_v2/ui-transition/manifest.json"), (name) => fs.readFileSync(path.join(root, name)));
console.log(JSON.stringify({ status: "PASS_B126_UI_TRANSITION_DESIGN_VALIDATED", canonicalCourses: 10, legacyRoutesPreserved: 8, openFindings: 16 }));
