import fs from "node:fs";
import { validateApiSurface, validateBackendApiContract, validateSyncContract } from "../roadmap_v2/backend-api.mjs";

const read = (name) => JSON.parse(fs.readFileSync(`roadmap_v2/backend-api/${name}`, "utf8"));
validateBackendApiContract(read("backend-api-contract.json"));
validateApiSurface(read("api-surface.json"));
validateSyncContract(read("sync-contract.json"));
console.log(JSON.stringify({ status: "PASS_B129_B130_BACKEND_API_AND_SYNC_CONTRACTS", endpoints: 7, persistenceBlocked: 5, databaseConnections: 0 }));
