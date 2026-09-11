import crypto from "node:crypto";

const STATIC_DATA = Object.freeze(["course_registry", "prerequisite_graph", "lesson_content", "exercise_content", "simulation_content", "assessment_blueprints"]);
const DYNAMIC_DATA = Object.freeze(["learning_events", "mastery_snapshots", "assessment_attempts", "study_schedule", "bookmarks", "weak_topics", "mentor_history", "user_preferences", "sync_cursors"]);
const ENDPOINTS = Object.freeze([
  ["GET", "/health", "health"],
  ["GET", "/catalog/summary", "catalogSummary"],
  ["GET", "/users/{userId}/learning-state", "learningState"],
  ["POST", "/users/{userId}/learning-events", "appendLearningEvents"],
  ["GET", "/users/{userId}/schedule", "readSchedule"],
  ["PUT", "/users/{userId}/schedule", "writeSchedule"],
  ["POST", "/users/{userId}/sync/changes", "syncChanges"]
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function unique(values, label) {
  assert(new Set(values).size === values.length, `${label} contains duplicates`);
}

function sameMembers(actual, expected, label) {
  unique(actual, label);
  assert(actual.length === expected.length, `${label} count drift`);
  const left = [...actual].sort();
  const right = [...expected].sort();
  assert(left.every((value, index) => value === right[index]), `${label} membership drift`);
}

function sameJson(actual, expected, label) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${label} drift`);
}

export function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

export function validateBackendApiContract(contract) {
  assert(contract?.schema === "BAUMAN_ROADMAP_V2_BACKEND_API_CONTRACT_V1", "Backend API contract schema drift");
  assert(contract.version === "2.13.0-l33-b129" && contract.status === "PASS_B129_CONTRACT_ONLY", "Backend API contract status drift");
  assert(contract.mode === "PROVIDER_NEUTRAL_DISCONNECTED_HARNESS", "L33 backend mode drift");
  assert(contract.baselineCommit === "e383912354673bdce7a0059d6b9a23799d74e689", "Backend API baseline drift");
  assert(contract.headBeforeL33 === "6b6226c81f94d5adaca300ba480b60e29a6569ef", "Pre-L33 head drift");
  assert(contract.scopeDecision?.persistenceDeferredTo === "L34/B133", "Persistence deferral drift");
  assert(contract.scopeDecision?.thisTurnLayer === "backend_api", "L33 scope layer drift");
  sameMembers(contract.dataClasses?.staticContent || [], STATIC_DATA, "static data classes");
  sameMembers(contract.dataClasses?.dynamicUserData || [], DYNAMIC_DATA, "dynamic user data classes");
  const security = contract.securityBoundary || {};
  assert(security.defaultCredentialsAllowed === false, "Default credentials were authorized");
  assert(security.plaintextPasswordsAllowed === false, "Plaintext passwords were authorized");
  assert(security.frontendSecretsAllowed === false && security.callerSuppliedRolesTrusted === false, "Frontend trust boundary drift");
  assert(security.userResourceOwnershipRequired === true && security.opaqueUserIdRequired === true, "User ownership boundary incomplete");
  assert(security.corsMode === "explicit_allowlist_only", "CORS policy drift");
  assert(Object.values(contract.persistenceBoundary || {}).every((value) => value === 0), "L33 persistence counter drift");
  assert(Object.keys(contract.capabilities || {}).length === 10 && Object.values(contract.capabilities).every((value) => value === false), "L33 must have zero production/persistence capability");
  assert(contract.acceptance?.step === 129 && contract.acceptance?.result === "PASS_CONTRACT_ONLY", "B129 acceptance drift");
  return true;
}

export function validateApiSurface(surface) {
  assert(surface?.schema === "BAUMAN_ROADMAP_V2_API_SURFACE_V1", "API surface schema drift");
  assert(surface.version === "2.13.0-l33-b130" && surface.status === "PASS_B130_PLANNED_API_SURFACE", "API surface status drift");
  assert(surface.basePath === "/api/v1" && surface.provider === "unselected", "API deployment/provider boundary drift");
  assert(surface.productionRoutesCreated === 0, "L33 created production API routes");
  assert(surface.endpoints?.length === 7, "API endpoint count drift");
  unique(surface.endpoints.map((endpoint) => endpoint.operationId), "API operation IDs");
  unique(surface.endpoints.map((endpoint) => `${endpoint.method} ${endpoint.path}`), "API route signatures");
  sameMembers(surface.endpoints.map((endpoint) => `${endpoint.method}|${endpoint.path}|${endpoint.operationId}`), ENDPOINTS.map((endpoint) => endpoint.join("|")), "API endpoints");
  for (const endpoint of surface.endpoints) {
    assert(endpoint.productionDisposition !== "deployed", `API endpoint overclaimed as deployed: ${endpoint.operationId}`);
    if (endpoint.operationId !== "health") assert(endpoint.auth !== "none", `Protected API endpoint lacks auth: ${endpoint.operationId}`);
    if (endpoint.dataClass === "dynamic_user_data") assert(endpoint.harnessDisposition === "blocked_persistence_unavailable", `Dynamic endpoint escaped persistence block: ${endpoint.operationId}`);
  }
  sameJson(surface.counts, { endpoints: 7, public: 1, authenticated: 6, inMemoryReadOnly: 2, persistenceBlocked: 5, productionDeployed: 0 }, "API surface counts");
  assert(surface.acceptance?.step === 130 && surface.acceptance?.result === "PASS_API_SURFACE_DESIGN_ONLY", "B130 API surface acceptance drift");
  return true;
}

export function validateSyncContract(sync) {
  assert(sync?.schema === "BAUMAN_ROADMAP_V2_SYNC_CONTRACT_V1", "Sync contract schema drift");
  assert(sync.status === "PASS_B130_CONTRACT_ONLY_PERSISTENCE_BLOCKED", "Sync contract status drift");
  assert(sync.identity?.emailAsResourceId === false, "Email was authorized as resource ID");
  sameJson(sync.writeEnvelope?.required, ["userId", "deviceId", "idempotencyKey", "baseCursor", "events"], "sync required fields");
  assert(sync.writeEnvelope?.maxEventsPerBatch === 100, "Sync batch limit drift");
  assert(sync.writeEnvelope?.staleBasePolicy === "reject_with_conflict_and_server_cursor", "Sync stale-base policy drift");
  assert(sync.writeEnvelope?.crossUserPolicy === "reject_forbidden", "Sync cross-user policy drift");
  assert(sync.writeEnvelope?.partialWritePolicy === "forbidden_atomic_batch", "Sync atomic batch boundary drift");
  sameMembers(sync.conflictCodes || [], ["STALE_BASE_CURSOR", "DUPLICATE_EVENT_ID", "CROSS_USER_ACCESS", "UNKNOWN_EVENT_TYPE", "PERSISTENCE_UNAVAILABLE"], "sync conflict codes");
  assert(Object.values(sync.harness || {}).every((value) => value === false || value === 0), "Sync harness write/persistence drift");
  assert(sync.activationPrerequisites?.length === 5 && sync.activationPrerequisites[0] === "L34 persistence contract PASS", "Sync activation prerequisites drift");
  assert(sync.acceptance?.step === 130 && sync.acceptance?.result === "PASS_SYNC_CONTRACT_ONLY", "B130 sync acceptance drift");
  return true;
}

function validateRequestContext(context) {
  assert(context && typeof context === "object", "Authenticated request context missing");
  assert(context.authenticated === true && context.authSource === "trusted_server_adapter", "Untrusted authentication context");
  assert(/^usr_[A-Za-z0-9_-]{8,64}$/.test(context.actorUserId || ""), "Invalid actor user ID");
  assert(/^ses_[A-Za-z0-9_-]{8,64}$/.test(context.sessionId || ""), "Invalid session ID");
  assert(/^[A-Za-z0-9._:-]{8,128}$/.test(context.requestId || ""), "Invalid request ID");
}

function response(status, code, body = {}) {
  return deepFreeze({ status, body: { schema: "BAUMAN_ROADMAP_V2_API_RESPONSE_V1", code, ...body }, persisted: false, productionRoute: false });
}

function matchPath(template, path) {
  const templateParts = template.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);
  if (templateParts.length !== pathParts.length) return null;
  const params = {};
  for (let index = 0; index < templateParts.length; index += 1) {
    const expected = templateParts[index];
    const actual = pathParts[index];
    if (expected.startsWith("{") && expected.endsWith("}")) params[expected.slice(1, -1)] = actual;
    else if (expected !== actual) return null;
  }
  return params;
}

export function createDisconnectedApiHarness({ contract, surface, sync, catalogSummary }) {
  validateBackendApiContract(contract);
  validateApiSurface(surface);
  validateSyncContract(sync);
  assert(catalogSummary?.courses === 10 && catalogSummary?.chapters === 85 && catalogSummary?.numberedLessons === 304 && catalogSummary?.dynamicChapters === 8, "Catalog summary drift");
  const routes = surface.endpoints.map((endpoint) => ({ ...endpoint, template: `${surface.basePath}${endpoint.path}` }));
  return deepFreeze({
    status: "ready_disconnected_backend_api_harness",
    provider: "unselected",
    productionServerStarted: false,
    databaseConnected: false,
    persistentStores: 0,
    handle(request) {
      assert(request && typeof request === "object", "API request missing");
      assert(["GET", "POST", "PUT"].includes(request.method), "Unsupported API method");
      assert(typeof request.path === "string" && request.path.startsWith("/api/v1/"), "Invalid API path");
      const matched = routes.map((route) => ({ route, params: matchPath(route.template, request.path) })).find((item) => item.params !== null);
      if (!matched || matched.route.method !== request.method) return response(404, "NOT_FOUND");
      const { route, params } = matched;
      if (route.auth !== "none") {
        try { validateRequestContext(request.context); } catch { return response(401, "UNAUTHENTICATED"); }
      }
      if (route.auth === "bearer_session_and_owner" && params.userId !== request.context.actorUserId) return response(403, "CROSS_USER_ACCESS");
      if (route.operationId === "health") return response(200, "OK", { service: "backend-api-harness", mode: contract.mode });
      if (route.operationId === "catalogSummary") return response(200, "OK", { catalog: deepFreeze({ ...catalogSummary }) });
      return response(503, "PERSISTENCE_UNAVAILABLE", { deferredTo: "L34/B133", operationId: route.operationId });
    }
  });
}

export function buildBackendApiProjection({ contract, surface, sync, catalogSummary }) {
  const harness = createDisconnectedApiHarness({ contract, surface, sync, catalogSummary });
  return deepFreeze({
    schema: "BAUMAN_ROADMAP_V2_BACKEND_API_PROJECTION_V1",
    version: "2.13.0-l33-b131",
    status: "PASS_B131_DISCONNECTED_FAIL_CLOSED_HARNESS",
    provider: harness.provider,
    counts: { endpoints: 7, inMemoryReadOnly: 2, persistenceBlocked: 5, productionRoutes: 0, databaseConnections: 0, persistentStores: 0 },
    catalogSummary: { ...catalogSummary },
    security: {
      defaultCredentialsAllowed: false,
      plaintextPasswordsAllowed: false,
      frontendSecretsAllowed: false,
      ownerChecksRequired: true,
      corsMode: contract.securityBoundary.corsMode
    },
    sync: {
      maxEventsPerBatch: sync.writeEnvelope.maxEventsPerBatch,
      staleBasePolicy: sync.writeEnvelope.staleBasePolicy,
      crossUserPolicy: sync.writeEnvelope.crossUserPolicy,
      partialWritePolicy: sync.writeEnvelope.partialWritePolicy,
      writesAllowed: false
    },
    safety: { productionServerStarts: 0, productionRoutesCreated: 0, databaseConnections: 0, databaseMigrations: 0, userRecords: 0, sessions: 0, tokens: 0, eventWrites: 0, syncWrites: 0 },
    acceptance: { step: 131, result: "PASS_DISCONNECTED_FAIL_CLOSED_REFERENCE_HARNESS" }
  });
}

export function validateBackendApiManifest(manifest, readBytes) {
  assert(manifest?.schema === "BAUMAN_ROADMAP_V2_BACKEND_API_MANIFEST_V1", "Backend API manifest schema drift");
  assert(manifest.status === "PASS_B131_DETERMINISTIC_BACKEND_API_PACKAGE", "Backend API manifest status drift");
  assert(typeof readBytes === "function", "Backend API manifest reader missing");
  const descriptors = [...Object.values(manifest.sources || {}), manifest.generatedProjection].filter(Boolean);
  assert(descriptors.length === 7, "Backend API manifest descriptor count drift");
  for (const descriptor of descriptors) {
    let bytes;
    try { bytes = readBytes(descriptor.path); } catch { throw new Error(`Backend API manifest file missing: ${descriptor.path}`); }
    assert(Buffer.isBuffer(bytes), `Backend API manifest reader did not return bytes: ${descriptor.path}`);
    const digest = crypto.createHash("sha256").update(bytes).digest("hex");
    assert(bytes.length === descriptor.bytes && digest === descriptor.sha256, `Backend API manifest fingerprint drift: ${descriptor.path}`);
  }
  sameJson(manifest.counts, { endpoints: 7, inMemoryReadOnly: 2, persistenceBlocked: 5, productionRoutes: 0, databaseConnections: 0, persistentStores: 0 }, "Backend API manifest counts");
  assert(Object.values(manifest.safety || {}).every((value) => value === 0), "Backend API manifest mutation/write count drift");
  assert(manifest.acceptance?.step === 131 && manifest.acceptance?.result === "PASS_BACKEND_API_PACKAGE", "B131 manifest acceptance drift");
  return true;
}

export const backendApiConstants = deepFreeze({ STATIC_DATA, DYNAMIC_DATA, ENDPOINTS });
