import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync('roadmap_v2/manifest.json', 'utf8'));
if (manifest.productionIntegration !== 'disconnected') throw new Error('Roadmap sidecar must remain disconnected');
if (manifest.mode !== 'read_only_sidecar') throw new Error('Roadmap sidecar is not read-only');

const consumerManifest = JSON.parse(fs.readFileSync('roadmap_v2/consumer/manifest.json', 'utf8'));
if (consumerManifest.productionIntegration !== 'disconnected') throw new Error('Roadmap consumer must remain disconnected');
if (consumerManifest.mode !== 'read_only_consumer_bridge') throw new Error('Roadmap consumer is not read-only');

const diagnosticManifest = JSON.parse(fs.readFileSync('roadmap_v2/diagnostic/manifest.json', 'utf8'));
if (diagnosticManifest.productionIntegration !== 'disconnected') throw new Error('Roadmap diagnostic must remain disconnected');
if (diagnosticManifest.mode !== 'read_only_diagnostic_harness') throw new Error('Roadmap diagnostic is not a read-only harness');
if (diagnosticManifest.counts.executablePlans !== 0) throw new Error('Roadmap diagnostic contains executable production plans');
if (diagnosticManifest.safety.runtimeWrites !== 0) throw new Error('Roadmap diagnostic permits runtime writes');

const masteryManifest = JSON.parse(fs.readFileSync('roadmap_v2/mastery/manifest.json', 'utf8'));
if (masteryManifest.productionIntegration !== 'disconnected') throw new Error('Roadmap mastery must remain disconnected');
if (masteryManifest.mode !== 'in_memory_append_only_evidence_harness') throw new Error('Roadmap mastery is not an in-memory harness');
if (masteryManifest.counts.persistentStores !== 0) throw new Error('Roadmap mastery contains a production store');
if (masteryManifest.safety.persistentStoreWrites !== 0 || masteryManifest.safety.runtimeWrites !== 0) throw new Error('Roadmap mastery permits persistent or runtime writes');

const priorityManifest = JSON.parse(fs.readFileSync('roadmap_v2/priority/manifest.json', 'utf8'));
if (priorityManifest.productionIntegration !== 'disconnected') throw new Error('Roadmap Priority must remain disconnected');
if (priorityManifest.mode !== 'in_memory_priority_scoring_harness') throw new Error('Roadmap Priority is not an in-memory scoring harness');
if (priorityManifest.counts.schedulerWrites !== 0 || priorityManifest.counts.runtimeWrites !== 0) throw new Error('Roadmap Priority permits scheduler or runtime writes');
if (priorityManifest.safety.existingCompetencyGrantsMasterReady !== false) throw new Error('Roadmap Priority grants Master-ready from Existing Competency');

const schedulerManifest = JSON.parse(fs.readFileSync('roadmap_v2/scheduler/manifest.json', 'utf8'));
if (schedulerManifest.productionIntegration !== 'disconnected') throw new Error('Roadmap Scheduler must remain disconnected');
if (schedulerManifest.mode !== 'in_memory_weekly_projection_harness') throw new Error('Roadmap Scheduler is not an in-memory projection harness');
if (schedulerManifest.counts.productionCalendarConnections !== 0) throw new Error('Roadmap Scheduler has a production calendar connection');
if (schedulerManifest.counts.persistentStores !== 0 || schedulerManifest.counts.calendarWrites !== 0 || schedulerManifest.counts.runtimeWrites !== 0) throw new Error('Roadmap Scheduler permits persistence, calendar or runtime writes');
if (schedulerManifest.counts.generatedDynamicContent !== 0) throw new Error('Roadmap Scheduler contains generated dynamic content');
if (schedulerManifest.safety.reviewOnDemandGrantsMasterReady !== false) throw new Error('Roadmap Scheduler grants Master-ready from review-on-demand');

const readinessManifest = JSON.parse(fs.readFileSync('roadmap_v2/readiness/manifest.json', 'utf8'));
if (readinessManifest.productionIntegration !== 'disconnected') throw new Error('Roadmap Readiness must remain disconnected');
if (readinessManifest.mode !== 'read_only_readiness_projection_harness') throw new Error('Roadmap Readiness is not a read-only projection harness');
if (readinessManifest.counts.persistentStores !== 0 || readinessManifest.counts.dashboardUiRenders !== 0 || readinessManifest.counts.runtimeWrites !== 0 || readinessManifest.counts.notificationWrites !== 0) throw new Error('Roadmap Readiness permits persistence, UI, runtime or notification writes');
if (readinessManifest.safety.missingEvidenceFailsClosed !== true || readinessManifest.safety.masterReadyRequiredForGreen !== true) throw new Error('Roadmap Readiness safety semantics drift');
if (readinessManifest.safety.manualColorOverrideAllowed !== false) throw new Error('Roadmap Readiness accepts manual color override');

const integrationManifest = JSON.parse(fs.readFileSync('roadmap_v2/integration/manifest.json', 'utf8'));
if (integrationManifest.productionIntegration !== 'disconnected') throw new Error('Roadmap Integration must remain disconnected in Lượt 28');
if (integrationManifest.mode !== 'read_only_activation_planning_harness') throw new Error('Roadmap Integration is not a read-only planning harness');
if (integrationManifest.counts.defaultOffFlags !== integrationManifest.counts.featureFlags) throw new Error('Roadmap Integration has a feature flag enabled by default');
if (integrationManifest.counts.productionImports !== 0 || integrationManifest.counts.persistentStores !== 0 || integrationManifest.counts.runtimeWrites !== 0 || integrationManifest.counts.legacyMutations !== 0) throw new Error('Roadmap Integration crossed the L28 production boundary');
if (integrationManifest.safety.anyEnabledFlagBlockedInL28 !== true || integrationManifest.safety.atomicKillSwitch !== true) throw new Error('Roadmap Integration fail-closed or rollback semantics drift');
if (integrationManifest.safety.legacyEntrypointsPreserved !== true || integrationManifest.safety.productionWrites !== 0) throw new Error('Roadmap Integration mutates production or legacy entrypoints');

const productionEntrypoints = [
  'subjects/math/index.html',
  'subjects/math/subject-manifest.json',
  'subjects/math/subject-manifest.js'
];
for (const file of productionEntrypoints) {
  const text = fs.readFileSync(file, 'utf8');
  if (/roadmap_v2|roadmap-v2|loader\.mjs|integration\.mjs/i.test(text)) throw new Error(`Premature Roadmap production integration: ${file}`);
}

console.log(JSON.stringify({
  status: 'PASS_B112_PRODUCTION_DISCONNECTED',
  checkedEntrypoints: productionEntrypoints.length,
  sidecarMode: manifest.mode,
  consumerMode: consumerManifest.mode,
  diagnosticMode: diagnosticManifest.mode,
  diagnosticExecutablePlans: diagnosticManifest.counts.executablePlans,
  masteryMode: masteryManifest.mode,
  masteryPersistentStores: masteryManifest.counts.persistentStores,
  priorityMode: priorityManifest.mode,
  prioritySchedulerWrites: priorityManifest.counts.schedulerWrites,
  schedulerMode: schedulerManifest.mode,
  schedulerCalendarConnections: schedulerManifest.counts.productionCalendarConnections,
  schedulerCalendarWrites: schedulerManifest.counts.calendarWrites,
  readinessMode: readinessManifest.mode,
  readinessPersistentStores: readinessManifest.counts.persistentStores,
  readinessDashboardUiRenders: readinessManifest.counts.dashboardUiRenders,
  integrationMode: integrationManifest.mode,
  integrationDefaultOffFlags: integrationManifest.counts.defaultOffFlags,
  integrationRuntimeWrites: integrationManifest.counts.runtimeWrites,
  productionIntegration: manifest.productionIntegration
}));
