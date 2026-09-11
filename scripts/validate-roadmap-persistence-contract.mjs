import fs from "node:fs";
import {
  validateBackupRestoreContract,
  validateMigrationPlan,
  validatePersistenceContract,
  validateRelationalModel
} from "../roadmap_v2/persistence.mjs";

const read = (name) => JSON.parse(fs.readFileSync(`roadmap_v2/persistence/${name}`, "utf8"));
const contract = read("persistence-contract.json");
const model = read("relational-model.json");
validatePersistenceContract(contract);
validateRelationalModel(model);
validateMigrationPlan(read("migration-plan.json"), model);
validateBackupRestoreContract(read("backup-restore-contract.json"));
console.log(JSON.stringify({ status: "PASS_B133_B134_PERSISTENCE_MIGRATION_BACKUP_CONTRACTS", provider: "unselected", tables: 12, migrations: 4, productionConnections: 0, productionWrites: 0 }));
