import fs from "node:fs";
import path from "node:path";
import { buildPersistenceProjection, validatePersistenceManifest } from "../roadmap_v2/persistence.mjs";

const root = path.resolve(".");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const expected = buildPersistenceProjection({
  contract: readJson("roadmap_v2/persistence/persistence-contract.json"),
  model: readJson("roadmap_v2/persistence/relational-model.json"),
  migrations: readJson("roadmap_v2/persistence/migration-plan.json"),
  backup: readJson("roadmap_v2/persistence/backup-restore-contract.json")
});
const actual = readJson("roadmap_v2/persistence/projection.json");
if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error("Persistence projection drift");
validatePersistenceManifest(readJson("roadmap_v2/persistence/manifest.json"), (name) => fs.readFileSync(path.join(root, name)));
console.log(JSON.stringify({ status: "PASS_B134_B135_PERSISTENCE_HARNESS_VALIDATED", ...actual.counts, restoredEvents: actual.backupRestoreSimulation.restoredEvents }));
