import fs from "node:fs";
import { validateSourceInventory, validateUiAuditContract } from "../roadmap_v2/ui-audit.mjs";

const directory = "roadmap_v2/ui-audit";
const read = (name) => JSON.parse(fs.readFileSync(`${directory}/${name}`, "utf8"));
validateUiAuditContract(read("ui-audit-contract.json"));
validateSourceInventory(read("source-inventory.json"));
console.log(JSON.stringify({ status: "PASS_B121_UI_AUDIT_CONTRACT_AND_PINNED_INVENTORY", routes: 9, physicalModules: 8, productionWrites: 0 }));
