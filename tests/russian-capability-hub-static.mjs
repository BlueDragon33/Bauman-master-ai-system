import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('assets/js/main.js','utf8');
const hub=fs.readFileSync('assets/js/hub-safe-shell.js','utf8');
const css=fs.readFileSync('assets/css/hub-safe-shell.css','utf8');
const russian=fs.readFileSync('subjects/russian/assets/capability-progression.js','utf8');

assert.ok(main.includes("capability:'BAUMAN_SUBJECT_CAPABILITY_STATE'"),'Main capability message contract missing');
assert.ok(main.includes("capabilityRequest:'BAUMAN_REQUEST_SUBJECT_CAPABILITY_STATE'"),'Main capability request contract missing');
assert.ok(main.includes('subjectCapabilities:{}'),'Main default capability store missing');
assert.ok(main.includes('out.subjectCapabilities ='),'Main capability store normalization missing');
assert.ok(main.includes('function normalizeSubjectCapability'),'Main capability sanitizer missing');
assert.ok(main.includes("normalized.schema!=='RUSSIAN_CAPABILITY_BRIDGE_V1'"),'Main must require Russian capability schema');
assert.ok(main.includes('state.subjectCapabilities[subjectId]=normalized'),'Main capability snapshot persistence missing');
assert.ok(main.includes('sendCapabilityRequestToSubject(event.source,activeSubjectId)'),'Main must recover capability state after subject READY');
assert.ok(main.includes("msg.type===BRIDGE_TYPES.capability"),'Main capability consumer branch missing');
assert.ok(!/state\.progress\[[^\]]+\]\s*=.*capabil/i.test(main),'Capability consumer must not synthesize canonical progress');

assert.ok(hub.includes('function capabilityState'),'Hub capability state reader missing');
assert.ok(hub.includes('function capabilityHTML'),'Hub capability surface missing');
assert.ok(hub.includes('S().subjectCapabilities?.[id]'),'Hub must read Main summary state');
assert.ok(hub.includes("sub?.id!=='russian'"),'Russian capability card must stay subject-scoped');
assert.ok(hub.includes('data-safe-capability="russian"'),'Hub Russian capability marker missing');
assert.ok(hub.includes('Snapshot từ Russian Sub Web App'),'Hub provenance disclosure missing');
assert.ok(hub.includes("if(id==='capability')return a.openSubjectInPage?.('russian')"),'Capability CTA must return to Russian subject');
assert.ok(css.includes('.hub-safe-capability'),'Capability Hub styling missing');

assert.ok(russian.includes("type:'BAUMAN_SUBJECT_CAPABILITY_STATE'"),'Russian producer missing');
assert.ok(russian.includes("schema:'RUSSIAN_CAPABILITY_BRIDGE_V1'"),'Russian producer schema missing');
console.log('RUSSIAN_CAPABILITY_HUB_STATIC_GATE=PASS');