import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mathData = path.join(root, "subjects", "math", "data");

const contracts = [
  ["applications.json", 16],
  ["simulations.json", 16],
  ["professor_qa.json", 8],
  ["question_bank.json", 48],
  ["review_packs.json", 8],
  ["mastery-map.json", 8],
  ["content-index.json", 8],
  ["concept-map.json", 1],
  ["mindmap.json", 1],
];

const failures = [];
const snapshot = [];

for (const [file, minItems] of contracts) {
  const full = path.join(mathData, file);
  if (!fs.existsSync(full)) {
    failures.push(`${file}: missing`);
    snapshot.push({ file, status: "missing", count: null, minItems });
    continue;
  }

  let value;
  try {
    value = JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (error) {
    failures.push(`${file}: invalid JSON (${error.message})`);
    snapshot.push({ file, status: "invalid-json", count: null, minItems });
    continue;
  }

  const count = Array.isArray(value)
    ? value.length
    : value && typeof value === "object"
      ? Object.keys(value).length
      : 0;

  const status = count >= minItems ? "pass" : "underfilled";
  snapshot.push({ file, status, count, minItems });

  if (status !== "pass") {
    failures.push(`${file}: count=${count}, required>=${minItems}`);
  }
}

console.log(JSON.stringify({
  gate: "math-content-sync-e16",
  checkedAt: new Date().toISOString(),
  snapshot,
  pass: failures.length === 0,
}, null, 2));

if (failures.length) {
  console.error("\nE16 content-sync gate FAILED:");
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}

console.log("\nE16 content-sync gate PASS");
