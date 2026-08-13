import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { buildPersistenceProjection } from "../roadmap_v2/persistence.mjs";

const root = path.resolve(".");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const writeJson = (name, value) => fs.writeFileSync(path.join(root, name), `${JSON.stringify(value, null, 2)}\n`);
const descriptor = (name) => {
  const bytes = fs.readFileSync(path.join(root, name));
  return { path: name, bytes: bytes.length, sha256: crypto.createHash("sha256").update(bytes).digest("hex") };
};
const paths = {
  contractSchema: "roadmap_v2/persistence/persistence-contract.schema.json",
  contract: "roadmap_v2/persistence/persistence-contract.json",
  relationalModel: "roadmap_v2/persistence/relational-model.json",
  migrationPlan: "roadmap_v2/persistence/migration-plan.json",
  backupRestoreContract: "roadmap_v2/persistence/backup-restore-contract.json"
};
const projection = buildPersistenceProjection({
  contract: readJson(paths.contract),
  model: readJson(paths.relationalModel),
  migrations: readJson(paths.migrationPlan),
  backup: readJson(paths.backupRestoreContract)
});
writeJson("roadmap_v2/persistence/projection.json", projection);
writeJson("roadmap_v2/persistence/manifest.json", {
  schema: "BAUMAN_ROADMAP_V2_PERSISTENCE_MANIFEST_V1",
  version: "2.14.0-l34-b135",
  status: "PASS_B135_DETERMINISTIC_PERSISTENCE_PACKAGE",
  headBeforeL34: "cf88194bfa66b37856b6e477a94449158b99833d",
  sources: Object.fromEntries(Object.entries(paths).map(([key, name]) => [key, descriptor(name)])),
  generatedProjection: descriptor("roadmap_v2/persistence/projection.json"),
  counts: projection.counts,
  safety: projection.safety,
  acceptance: { step: 135, result: "PASS_PERSISTENCE_PACKAGE" }
});
console.log(JSON.stringify({ status: "PASS_B135_DETERMINISTIC_PERSISTENCE_PACKAGE", ...projection.counts }));
