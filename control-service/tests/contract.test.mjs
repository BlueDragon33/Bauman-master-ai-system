import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("Bauman control service is app-scoped and signed", async () => {
  const worker = await source("../src/index.ts");
  assert.match(worker, /BAUMAN_CONTROL_SERVICE_SECRET/);
  assert.match(worker, /TOKEN_ISSUER = "application-management"/);
  assert.match(worker, /TOKEN_AUDIENCE = "bauman-control"/);
  assert.match(worker, /TOKEN_APP = "bauman-master-ai"/);
  assert.match(worker, /HMAC/);
  assert.doesNotMatch(worker, /HEALTH_CONTROL_SERVICE_SECRET|RU_LIFE_CONTROL_SERVICE_SECRET|MEDICINE_SERVICE_SECRET/);
});

test("Bauman exposes only read-only readiness and subclient inventory", async () => {
  const worker = await source("../src/index.ts");
  assert.match(worker, /\/api\/control\/status/);
  assert.match(worker, /\/api\/control\/subclients/);
  assert.match(worker, /controlMode: "read-only-readiness"/);
  assert.match(worker, /readOnlyControlApi: "available"/);
  assert.doesNotMatch(worker, /approve-device|publish-content|delete-content|edit-content/);
});

test("Bauman topology remains under one level-1 hub", async () => {
  const worker = await source("../src/index.ts");
  for (const id of ["math", "programming", "ai", "signal", "systems", "foundation", "research", "russian"]) {
    assert.match(worker, new RegExp(`id: "${id}"`));
  }
  assert.match(worker, /BlueDragon33\/Math_Bauman/);
  assert.match(worker, /subclients: "Bauman-master-ai-system"/);
});

test("missing mutation capabilities stay explicitly missing", async () => {
  const worker = await source("../src/index.ts");
  assert.match(worker, /deviceRegistry: "missing"/);
  assert.match(worker, /deviceGateway: "missing"/);
  assert.match(worker, /auditApi: "missing"/);
  assert.match(worker, /contentReviewApi: "missing"/);
});
