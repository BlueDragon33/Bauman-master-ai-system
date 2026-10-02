import fs from 'node:fs';
import assert from 'node:assert/strict';

const routerPath = 'prompts/subjects/russian/RUSSIAN_CONSTITUTION_ROUTER.json';
const router = JSON.parse(fs.readFileSync(routerPath, 'utf8'));

const canonical = {
  C1: 'prompts/constitution/C1_EXTENSIBLE_PLATFORM_ARCHITECTURE.md',
  C2: 'prompts/constitution/C2_FUTURE_PROFESSIONAL_UI_UX.md',
  C3: 'prompts/constitution/C3_PROFESSIONAL_QA_AUTO_FIX.md',
  C4: 'prompts/constitution/C4_REAL_LEARNING_OUTCOME_SYSTEM.md',
  C3_RELEASE: 'prompts/constitution/C3_RELEASE_ANNEX_SHARED.md',
};

assert.deepEqual(router.globalConstitutions, canonical, 'Russian router must point to the canonical detailed Constitution library');
const source = {};
for (const [key, file] of Object.entries(canonical)) {
  assert(fs.existsSync(file), 'Constitution source missing: ' + file);
  source[key] = fs.readFileSync(file, 'utf8').toUpperCase();
}

const missing = [];
for (const [moduleId, module] of Object.entries(router.modules || {})) {
  assert(module.prompt, moduleId + ' prompt route missing');
  if (moduleId !== 'RELEASE') {
    const promptPath = 'prompts/subjects/russian/' + module.prompt;
    assert(fs.existsSync(promptPath), moduleId + ' prompt file missing: ' + promptPath);
  } else {
    assert.equal(module.prompt, canonical.C3_RELEASE);
  }
  for (const [constitution, clauses] of Object.entries(module.load || {})) {
    assert(source[constitution], moduleId + ' routes unknown Constitution key ' + constitution);
    for (const clause of clauses) {
      if (!source[constitution].includes(String(clause).toUpperCase())) {
        missing.push({ moduleId, constitution, clause });
      }
    }
  }
}

assert.deepEqual(missing, [], 'Russian Constitution router contains stale/nonexistent clause names');
console.log(JSON.stringify({ ok: true, modules: Object.keys(router.modules).length, constitutionSources: Object.keys(canonical).length }));
