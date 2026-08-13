import fs from "node:fs";
import { validateCurriculumContract } from "../roadmap_v2/curriculum.mjs";

const contract = JSON.parse(fs.readFileSync("roadmap_v2/curriculum/curriculum-reconciliation-contract.json", "utf8"));
const schema = JSON.parse(fs.readFileSync("roadmap_v2/curriculum/curriculum-reconciliation-contract.schema.json", "utf8"));
if (schema.$id !== contract.schema) throw new Error("Curriculum contract/schema identity mismatch");
if (!schema.required.includes("prohibitedInferences") || !schema.required.includes("capabilities")) throw new Error("Curriculum contract schema omits fail-closed fields");
validateCurriculumContract(contract);
console.log(JSON.stringify({
  status: contract.status,
  step: 117,
  evidenceClasses: contract.evidenceClasses.length,
  prohibitedInferences: contract.prohibitedInferences.length,
  writeCapabilities: Object.values(contract.capabilities).filter(Boolean).length,
  persistenceDeferredTo: contract.planAmendment.persistenceDeferredTo
}));
