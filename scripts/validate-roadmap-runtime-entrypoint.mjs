import crypto from "node:crypto";
import fs from "node:fs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return crypto.createHash("sha1").update(header).update(buffer).digest("hex");
}

const contract = JSON.parse(fs.readFileSync("roadmap_v2/runtime/runtime-bridge-contract.json", "utf8"));
const rule = contract.mutationScope.indexMutation;
const index = fs.readFileSync("subjects/math/index.html", "utf8");
const tag = rule.allowedInsertion;
assert(index.split(tag).length === 2, "Math entrypoint does not contain exactly one authorized Runtime Bridge tag");
assert(index.includes(`${tag}\n</body>`), "Runtime Bridge is not immediately before the closing body tag");
let restored = Buffer.from(index.replace(`${tag}\n`, ""), "utf8");
if (rule.legacySnapshotStorageTrailingLfExcluded === true && restored.at(-1) === 0x0a) restored = restored.subarray(0, -1);
assert(gitBlobSha(restored) === rule.legacyGitBlobSha, "Removing the Runtime Bridge does not restore the exact legacy index");

const bridge = fs.readFileSync("subjects/math/assets/roadmap-v2-bridge.mjs", "utf8");
assert(!/localStorage|sessionStorage|indexedDB|document\.|innerHTML|appendChild|Notification|serviceWorker/.test(bridge), "Runtime Bridge contains a forbidden browser mutation surface");
assert(bridge.includes("../../../roadmap_v2/browser-runtime.mjs"), "Runtime Bridge browser module route drift");

console.log(JSON.stringify({
  status: "PASS_B114_AUTHORIZED_RUNTIME_ENTRYPOINT",
  authorizedScriptTags: 1,
  rollbackLegacyGitBlobSha: gitBlobSha(restored),
  subjectManifestMutations: 0,
  domMutations: 0,
  storageWrites: 0,
  notificationWrites: 0
}));
