import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mathRoot = path.join(root, "subjects", "math");
const mathData = path.join(mathRoot, "data");

const contracts = [
  ["lessons.json", 8],
  ["formulas.json", 24],
  ["exercises.json", 64],
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

const manifestContracts = [
  ["lessons", 8],
  ["formulas", 24],
  ["exercises", 64],
  ["applications", 16],
  ["simulations", 16],
  ["professor_qa", 8],
  ["question_bank", 48],
  ["review_packs", 8],
  ["mastery-map", 8],
  ["content-index", 8],
  ["concept-map", 1],
  ["mindmap", 1],
];

const failures = [];
const snapshot = [];

for (const [file, minItems] of contracts) {
  const full = path.join(mathData, file);
  if (!fs.existsSync(full)) {
    failures.push(file + ": missing");
    snapshot.push({ file, status: "missing", count: null, minItems });
    continue;
  }
  let value;
  try {
    value = JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (error) {
    failures.push(file + ": invalid JSON (" + error.message + ")");
    snapshot.push({ file, status: "invalid-json", count: null, minItems });
    continue;
  }
  const count = Array.isArray(value) ? value.length : (value && typeof value === "object" ? Object.keys(value).length : 0);
  const status = count >= minItems ? "pass" : "underfilled";
  snapshot.push({ file, status, count, minItems });
  if (status !== "pass") failures.push(file + ": count=" + count + ", required>=" + minItems);
}

const manifestPath = path.join(mathRoot, "subject-manifest.js");
if (!fs.existsSync(manifestPath)) {
  failures.push("subject-manifest.js: missing");
} else {
  const manifestText = fs.readFileSync(manifestPath, "utf8");
  for (const [key, minItems] of manifestContracts) {
    const token = JSON.stringify(key) + ":";
    const compact = manifestText.replace(/\s+/g, "");
    const pos = compact.indexOf(token);
    if (pos < 0) {
      failures.push("subject-manifest.js: missing data count for " + key);
      snapshot.push({ file: "subject-manifest.js", key, status: "missing", count: null, minItems });
      continue;
    }
    const rest = compact.slice(pos + token.length);
    const m = rest.match(/^(\d+)/);
    if (!m) {
      failures.push("subject-manifest.js: invalid data count for " + key);
      snapshot.push({ file: "subject-manifest.js", key, status: "invalid", count: null, minItems });
      continue;
    }
    const count = Number(m[1]);
    const status = count >= minItems ? "pass" : "underfilled";
    snapshot.push({ file: "subject-manifest.js", key, status, count, minItems });
    if (status !== "pass") failures.push("subject-manifest.js " + key + ": count=" + count + ", required>=" + minItems);
  }
}

console.log(JSON.stringify({ gate: "math-content-sync-e16", checkedAt: new Date().toISOString(), snapshot, pass: failures.length === 0 }, null, 2));

if (failures.length) {
  console.error("\nE16 content-sync gate FAILED:");
  for (const item of failures) console.error("- " + item);
  process.exit(1);
}

console.log("\nE16 content-sync gate PASS");
