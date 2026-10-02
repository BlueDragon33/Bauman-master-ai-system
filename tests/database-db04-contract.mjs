import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));

const registry=json('subjects/database/docs/db04/DB_ENGINE_PROFILE_REGISTRY.json');
const state=json('prompts/subjects/database/PROJECT_STATE.json');
const handoff=read('CODEX_HANDOFF.md');
const security=read('subjects/database/docs/db04/DB_SECURITY_BOUNDARY.md');
const sandbox=read('subjects/database/docs/db04/DB_SQL_EXECUTION_SANDBOX_CONTRACT.md');

assert.equal(registry.schemaVersion,'1.0.0');
assert(registry.profiles.length>=2);
assert(registry.profiles.every(p=>p.executable===false),'No DB04 provider may be claimed executable before implementation evidence');
for(const forbidden of ['bauman-control-preview-db','bauman-control-db'])
  assert(registry.forbiddenBindings.includes(forbidden),'missing forbidden binding '+forbidden);

assert.equal(state.activeModule,'DB04');
assert.equal(state.status,'DB04_IMPLEMENTATION_PENDING');
assert(!state.completedModules.includes('DB04'));

for(const needle of ['fail closed','control-service','hidden','timeout'])
  assert((security+'\n'+sandbox).toLowerCase().includes(needle),'missing DB04 security contract signal: '+needle);

for(const needle of ['TASK-DB04-001','Status: READY','DB04','control-service D1'])
  assert(handoff.includes(needle),'handoff missing '+needle);

console.log('DATABASE_DB04_CONTRACT_PASS');
