import fs from "node:fs";
import assert from "node:assert/strict";
import { canonicalPublicKey, displayCodeFor, normalizedPublicKey } from "../src/index.js";

const source = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const migration = fs.readFileSync(new URL("../migrations/0001_device_control.sql", import.meta.url), "utf8");
const failures = [];
const check = (name, condition) => { if (!condition) failures.push(name); };

const key = normalizedPublicKey({
  kty: "EC",
  crv: "P-256",
  x: "A".repeat(43),
  y: "B".repeat(43),
  ext: true,
  key_ops: ["verify"]
});
assert.equal(canonicalPublicKey(key), JSON.stringify({ kty: "EC", crv: "P-256", x: "A".repeat(43), y: "B".repeat(43) }));
assert.equal(displayCodeFor("0123456789abcdef".repeat(4)), "BM-0123-4567-89AB-CDEF");

check("public device endpoint", source.includes('url.pathname === "/api/device"'));
check("control status endpoint", source.includes('"/api/control/status"'));
check("control devices endpoint", source.includes('"/api/control/devices"'));
check("control audit endpoint", source.includes('"/api/control/audit"'));
check("client-owned readiness", source.includes('"client-owned-registry-v1"'));
check("P-256 proof capability", source.includes('"p256-device-proof-v1"'));
check("browser bridge capability", source.includes('"browser-bridge-v1"'));
check("owner required for writes", source.includes("requireOwner(actor)"));
check("proof binds runtime/device/challenge", source.includes("bauman-runtime:${deviceId}:${challenge}"));
check("blocked devices cannot challenge", source.includes('row.status !== "approved"'));
check("registry schema", migration.includes("CREATE TABLE IF NOT EXISTS bauman_devices"));
check("challenge schema", migration.includes("CREATE TABLE IF NOT EXISTS bauman_challenges"));
check("audit schema", migration.includes("CREATE TABLE IF NOT EXISTS bauman_audit_log"));
check("status constrained", migration.includes("CHECK(status IN ('pending','approved','blocked'))"));

if (failures.length) {
  console.error(`Bauman control contract regression failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(2);
}
console.log("Bauman control contract regression PASS.");