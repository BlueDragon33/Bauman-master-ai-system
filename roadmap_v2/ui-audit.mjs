import crypto from "node:crypto";

const MODULE_IDS = Object.freeze(["ai", "foundation", "math", "programming", "research", "russian", "signal", "systems"]);
const SHARED_IDS = Object.freeze(["ai", "foundation", "research", "signal", "systems"]);
const VIEWPORTS = Object.freeze({ desktop: [1440, 900], mobile: [390, 844] });
const REQUIRED_FINDING_IDS = Object.freeze(Array.from({ length: 16 }, (_, index) => `L31-F${String(index + 1).padStart(3, "0")}`));
const SEVERITY_ORDER = Object.freeze({ critical: 0, high: 1, medium: 2, low: 3 });

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

function validSha(value, label) {
  assert(/^[0-9a-f]{40}$/.test(value || ""), `Invalid Git blob SHA: ${label}`);
}

export function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

export function validateUiAuditContract(contract) {
  assert(contract?.schema === "BAUMAN_ROADMAP_V2_UI_AUDIT_CONTRACT_V1", "UI audit contract schema drift");
  assert(contract.version === "2.11.0-l31-b121", "UI audit contract version drift");
  assert(contract.status === "PASS_B121_CONTRACT_ONLY", "UI audit contract status drift");
  assert(contract.auditMode === "READ_ONLY", "L31 audit must remain read-only");
  assert(contract.baselineCommit === "e383912354673bdce7a0059d6b9a23799d74e689", "UI audit baseline drift");
  assert(contract.headBeforeL31 === "a1eece596c198f48cdd84f77c59986f59eb2eb3d", "Pre-L31 head drift");
  assert(contract.targets?.main === "/index.html", "Main audit target drift");
  sameMembers(contract.targets?.subjects || [], MODULE_IDS, "UI audit subject targets");
  assert(contract.viewports?.length === 2, "UI audit viewport count drift");
  for (const [id, dimensions] of Object.entries(VIEWPORTS)) {
    const viewport = contract.viewports.find((item) => item.id === id);
    assert(viewport?.width === dimensions[0] && viewport?.height === dimensions[1], `${id} viewport drift`);
  }
  assert(contract.findingPolicy?.allowedStatuses?.length === 1 && contract.findingPolicy.allowedStatuses[0] === "OPEN", "L31 finding resolution boundary drift");
  assert(contract.findingPolicy?.productionFixAuthorized === false, "L31 production fix was authorized");
  assert(Object.keys(contract.capabilities || {}).length >= 7, "L31 capability boundary incomplete");
  assert(Object.values(contract.capabilities || {}).every((value) => value === false), "L31 must have zero write/activation capability");
  assert(contract.acceptance?.step === 121 && contract.acceptance?.result === "PASS_CONTRACT_ONLY", "B121 contract acceptance drift");
  return true;
}

export function validateSourceInventory(inventory) {
  assert(inventory?.schema === "BAUMAN_ROADMAP_V2_UI_SOURCE_INVENTORY_V1", "UI source inventory schema drift");
  assert(inventory.version === "2.11.0-l31-b121", "UI source inventory version drift");
  assert(inventory.ref?.endsWith("@a1eece596c198f48cdd84f77c59986f59eb2eb3d"), "UI source inventory ref drift");
  assert(inventory.main?.route === "/index.html", "Main route drift");
  validSha(inventory.main?.entrypoint?.gitBlobSha, "main entrypoint");
  assert(inventory.main.sources?.length === 4, "Main source count drift");
  for (const source of inventory.main.sources) validSha(source.gitBlobSha, source.path);
  assert(!inventory.main.acceptedProgressMessageTypes?.includes(inventory.sharedRuntimeFamily?.emittedProgressMessageType), "Progress mismatch disappeared without an authorized production change");
  sameMembers(inventory.main.acceptedProgressMessageTypes || [], ["BAUMAN_SUBJECT_PROGRESS", "BAUMAN_PROGRESS_REPORT"], "Main progress types");
  sameMembers(inventory.main.declaredStages || [], ["GĐ1", "GĐ2", "GĐ3"], "Main stage labels");
  assert(inventory.modules?.length === 8, "Physical UI module count drift");
  sameMembers(inventory.modules.map((module) => module.id), MODULE_IDS, "physical UI module IDs");
  unique(inventory.modules.map((module) => module.route), "physical UI routes");
  for (const module of inventory.modules) {
    assert(module.route === `/subjects/${module.id}/index.html`, `Unexpected module route: ${module.id}`);
    assert(module.entrypoint?.path === `subjects/${module.id}/index.html`, `Unexpected module entrypoint: ${module.id}`);
    validSha(module.entrypoint.gitBlobSha, `${module.id} entrypoint`);
    assert(Array.isArray(module.directScripts) && module.directScripts.length >= 2, `Direct script inventory incomplete: ${module.id}`);
  }
  sameMembers(inventory.sharedRuntimeFamily?.moduleIds || [], SHARED_IDS, "shared runtime members");
  validSha(inventory.sharedRuntimeFamily?.javaScriptGitBlobSha, "shared runtime JavaScript");
  validSha(inventory.sharedRuntimeFamily?.cssGitBlobSha, "shared runtime CSS");
  assert(inventory.sharedRuntimeFamily?.emittedProgressMessageType === "SUBJECT_FEEDBACK", "Shared progress evidence drift");
  assert(inventory.sharedRuntimeFamily?.quizImplementationMaximum === 10, "Shared quiz implementation evidence drift");
  assert(Math.max(...inventory.sharedRuntimeFamily.quizCopyQuestionCounts) === 50, "Shared quiz copy evidence drift");
  assert(inventory.sharedRuntimeFamily?.directCompletionEvidenceGate === false, "Shared completion evidence gate was overclaimed");
  for (const id of SHARED_IDS) {
    const module = inventory.modules.find((item) => item.id === id);
    assert(module.runtimeFamily === "shared_subject_module_v2", `Shared runtime family drift: ${id}`);
    assert(module.runtimeGitBlobSha === inventory.sharedRuntimeFamily.javaScriptGitBlobSha, `Shared runtime JavaScript SHA drift: ${id}`);
    assert(module.styleGitBlobSha === inventory.sharedRuntimeFamily.cssGitBlobSha, `Shared runtime CSS SHA drift: ${id}`);
  }
  const math = inventory.modules.find((module) => module.id === "math");
  assert(math.runtimeFamily === "math_patch_stack", "Math runtime family drift");
  assert(math.planningBridge?.entrypointLoad === "not_directly_loaded_by_entrypoint", "Math planning bridge load status overclaim");
  assert(math.roadmapBridgeDefault === "OFF", "Math Roadmap bridge default drift");
  assert(inventory.counts?.mainRoutes === 1 && inventory.counts?.physicalSubjectRoutes === 8 && inventory.counts?.targetRoadmapCourses === 10, "UI source inventory count drift");
  assert(inventory.acceptance?.step === 121 && inventory.acceptance?.result === "PASS_PINNED_INVENTORY", "B121 inventory acceptance drift");
  return true;
}

export function validateUiAuditFindings(findings, inventory) {
  assert(findings?.schema === "BAUMAN_ROADMAP_V2_UI_AUDIT_FINDINGS_V1", "UI findings schema drift");
  assert(findings.version === "2.11.0-l31-b122", "UI findings version drift");
  assert(findings.status === "PASS_B122_STATIC_AUDIT_WITH_OPEN_FINDINGS", "UI findings status drift");
  assert(findings.auditHead === "a1eece596c198f48cdd84f77c59986f59eb2eb3d", "UI findings audit head drift");
  assert(findings.productionFixAuthorized === false, "B122 production fix was authorized");
  assert(findings.findings?.length === 16, "UI finding count drift");
  sameMembers(findings.findings.map((finding) => finding.id), REQUIRED_FINDING_IDS, "UI finding IDs");
  const knownTargets = new Set(["main", ...inventory.modules.map((module) => module.id)]);
  for (const finding of findings.findings) {
    assert(Object.hasOwn(SEVERITY_ORDER, finding.severity), `Unknown severity: ${finding.id}`);
    assert(finding.status === "OPEN", `L31 finding was prematurely resolved: ${finding.id}`);
    assert(typeof finding.title === "string" && finding.title.length >= 12, `Finding title incomplete: ${finding.id}`);
    assert(typeof finding.evidence === "string" && finding.evidence.length >= 24, `Finding evidence incomplete: ${finding.id}`);
    assert(Array.isArray(finding.sourceRefs) && finding.sourceRefs.length > 0, `Finding source refs missing: ${finding.id}`);
    assert(finding.sourceRefs.every((ref) => /^[^:]+(?::\d+)?$/.test(ref)), `Invalid finding source ref: ${finding.id}`);
    assert(Array.isArray(finding.affectedTargets) && finding.affectedTargets.length > 0, `Finding targets missing: ${finding.id}`);
    assert(finding.affectedTargets.every((target) => knownTargets.has(target)), `Unknown finding target: ${finding.id}`);
    assert(typeof finding.recommendedDisposition === "string" && finding.recommendedDisposition.length >= 24, `Finding disposition incomplete: ${finding.id}`);
  }
  assert(findings.findings.some((finding) => finding.severity === "critical"), "Critical credential finding missing");
  assert(findings.findings.filter((finding) => finding.severity === "high").length >= 8, "High-risk findings were underreported");
  for (const requiredArea of ["security", "integration", "information_architecture", "curriculum_semantics", "assessment", "mastery", "accessibility", "maintainability", "data_portability"]) {
    assert(findings.findings.some((finding) => finding.area === requiredArea), `Audit area missing: ${requiredArea}`);
  }
  const accessibility = findings.findings.find((finding) => finding.id === "L31-F014");
  sameMembers(accessibility?.affectedTargets || [], ["main", ...MODULE_IDS], "browser-confirmed accessibility targets");
  assert(accessibility?.evidence?.includes("17 visible unlabeled controls"), "Browser-confirmed accessibility evidence drift");
  assert(findings.acceptance?.step === 122 && findings.acceptance?.result === "PASS_STATIC_AUDIT_WITH_OPEN_FINDINGS", "B122 findings acceptance drift");
  return true;
}

export function buildStaticAuditSummary({ contract, inventory, findings }) {
  validateUiAuditContract(contract);
  validateSourceInventory(inventory);
  validateUiAuditFindings(findings, inventory);
  const severityCounts = {};
  const areaCounts = {};
  for (const finding of findings.findings) {
    severityCounts[finding.severity] = (severityCounts[finding.severity] || 0) + 1;
    areaCounts[finding.area] = (areaCounts[finding.area] || 0) + 1;
  }
  const priorities = [...findings.findings]
    .sort((left, right) => SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity] || left.id.localeCompare(right.id))
    .map(({ id, severity, area, title, affectedTargets }) => ({ id, severity, area, title, affectedTargets }));
  return deepFreeze({
    schema: "BAUMAN_ROADMAP_V2_STATIC_UI_AUDIT_SUMMARY_V1",
    version: "2.11.0-l31-b122",
    status: "PASS_B122_DETERMINISTIC_STATIC_AUDIT_WITH_FINDINGS",
    auditHead: contract.headBeforeL31,
    scope: { routes: 9, viewportsDeferredToBrowser: 2, physicalModules: 8, targetCourses: 10 },
    counts: { findings: findings.findings.length, open: findings.findings.length, resolved: 0, bySeverity: severityCounts, byArea: areaCounts },
    observedRuntimeFamilies: [
      { id: "shared_subject_module_v2", modules: [...SHARED_IDS] },
      { id: "large_core_with_planning_bridge", modules: ["programming", "russian"] },
      { id: "math_patch_stack", modules: ["math"] }
    ],
    priorities,
    safety: { productionFilesChanged: 0, findingsAutoResolved: 0, runtimeActivated: 0, persistenceWrites: 0 },
    acceptance: { step: 122, result: "PASS_DETERMINISTIC_STATIC_AUDIT_WITH_OPEN_FINDINGS" }
  });
}

export function validateUiAuditManifest(manifest, readBytes) {
  assert(manifest?.schema === "BAUMAN_ROADMAP_V2_UI_AUDIT_MANIFEST_V1", "UI audit manifest schema drift");
  assert(manifest.status === "PASS_B122_DETERMINISTIC_STATIC_AUDIT", "UI audit manifest status drift");
  assert(typeof readBytes === "function", "UI audit manifest reader missing");
  const descriptors = [...Object.values(manifest.sources || {}), manifest.generatedSummary].filter(Boolean);
  assert(descriptors.length === 4, "UI audit manifest descriptor count drift");
  for (const descriptor of descriptors) {
    let bytes;
    try { bytes = readBytes(descriptor.path); } catch { throw new Error(`UI audit manifest file missing: ${descriptor.path}`); }
    assert(Buffer.isBuffer(bytes), `UI audit manifest reader did not return bytes: ${descriptor.path}`);
    const digest = crypto.createHash("sha256").update(bytes).digest("hex");
    assert(bytes.length === descriptor.bytes && digest === descriptor.sha256, `UI audit manifest fingerprint drift: ${descriptor.path}`);
  }
  assert(manifest.counts?.routes === 9 && manifest.counts?.viewports === 2 && manifest.counts?.observationsRequired === 18, "UI audit manifest coverage drift");
  assert(manifest.counts?.findings === 16 && manifest.counts?.open === 16 && manifest.counts?.resolved === 0, "UI audit manifest finding count drift");
  assert(Object.values(manifest.safety || {}).every((value) => value === 0), "UI audit manifest mutation/write count drift");
  assert(manifest.acceptance?.step === 122 && manifest.acceptance?.result === "PASS_STATIC_AUDIT_PACKAGE", "UI audit manifest acceptance drift");
  return true;
}

export function validateBrowserAudit(report) {
  assert(report?.schema === "BAUMAN_ROADMAP_V2_BROWSER_UI_AUDIT_V1", "Browser audit schema drift");
  assert(report.status === "PASS_B123_REAL_CHROMIUM_AUDIT_WITH_FINDINGS", "Browser audit status drift");
  assert(report.auditHead === "a1eece596c198f48cdd84f77c59986f59eb2eb3d", "Browser audit head drift");
  assert(report.browser?.name === "chromium", "B123 did not use Chromium");
  assert(report.observations?.length === 18, "Browser audit observation count drift");
  const expected = [];
  for (const target of ["main", ...MODULE_IDS]) for (const viewport of Object.keys(VIEWPORTS)) expected.push(`${target}:${viewport}`);
  sameMembers(report.observations.map((item) => `${item.target}:${item.viewport}`), expected, "browser audit target/viewport pairs");
  for (const observation of report.observations) {
    assert(observation.httpStatus === 200, `Browser entrypoint unavailable: ${observation.target}:${observation.viewport}`);
    assert(typeof observation.title === "string" && observation.title.length > 0, `Browser page title missing: ${observation.target}:${observation.viewport}`);
    assert(Array.isArray(observation.pageErrors), `Browser page errors were not captured: ${observation.target}:${observation.viewport}`);
    assert(Array.isArray(observation.requestFailures), `Browser request failures were not captured: ${observation.target}:${observation.viewport}`);
    assert(typeof observation.horizontalOverflow === "boolean", `Browser overflow result missing: ${observation.target}:${observation.viewport}`);
    assert(typeof observation.keyboardFocusTag === "string", `Browser keyboard result missing: ${observation.target}:${observation.viewport}`);
    assert(Number.isInteger(observation.headingCount) && Number.isInteger(observation.unlabeledControlCount), `Browser semantic counts missing: ${observation.target}:${observation.viewport}`);
  }
  const sharedDesktop = report.observations.filter((item) => SHARED_IDS.includes(item.target) && item.viewport === "desktop");
  assert(sharedDesktop.length === 5, "Shared desktop behavior coverage drift");
  assert(sharedDesktop.every((item) => item.progressMessages.includes("SUBJECT_FEEDBACK")), "Shared progress mismatch was not behaviorally observed");
  const mainDesktop = report.observations.find((item) => item.target === "main" && item.viewport === "desktop");
  assert(mainDesktop.loginPrefill?.email === true && mainDesktop.loginPrefill?.password === true, "Main credential prefill was not behaviorally observed");
  assert(report.safety?.domMutationsPersisted === 0 && report.safety?.storageWritesByAudit === 0 && report.safety?.productionFilesChanged === 0, "Browser audit safety boundary drift");
  assert(report.acceptance?.step === 123 && report.acceptance?.result === "PASS_REAL_BROWSER_AUDIT_WITH_FINDINGS", "B123 browser acceptance drift");
  return true;
}

export const uiAuditConstants = deepFreeze({ MODULE_IDS, SHARED_IDS, VIEWPORTS, REQUIRED_FINDING_IDS, SEVERITY_ORDER });
