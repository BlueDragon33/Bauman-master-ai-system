import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root='subjects/mivar';
for(const file of ['index.html','editor.html','subject-manifest.json','subject-manifest.js','data/curriculum.json','data/lessons.json','data/formulas.json','data/exercises.json','data/tests.json','data/simulations.json','data/knowledge-index.json']){
  assert.ok(fs.existsSync(root+'/'+file),'missing '+file);
}

const manifest=JSON.parse(fs.readFileSync(root+'/subject-manifest.json','utf8'));
assert.equal(manifest.id,'mivar');
assert.deepEqual(manifest.studyPlan?.courseIds,['mivar']);
assert.equal(manifest.officialCourse?.credits,4);
assert.equal(manifest.officialCourse?.hours,144);
assert.equal(manifest.officialCourse?.contactHours,33);

const curriculum=JSON.parse(fs.readFileSync(root+'/data/curriculum.json','utf8'));
const lessons=JSON.parse(fs.readFileSync(root+'/data/lessons.json','utf8'));
const tests=JSON.parse(fs.readFileSync(root+'/data/tests.json','utf8'));
assert.equal(curriculum.modules.length,6);
assert.equal(lessons.length,12);
assert.ok(tests.questions.length>=60);

const contract=JSON.parse(fs.readFileSync('control/application-management.contract.json','utf8'));
assert.ok(contract.subclients.some(x=>x.id==='mivar'&&x.sourcePath==='subjects/mivar'));

const data=fs.readFileSync('assets/js/data.js','utf8');
assert.ok(data.includes("id:'c21',stage:'m4',subject:'mivar'"));
assert.ok(data.includes("hours:'144 giờ (33 giờ tiếp xúc)'"));

const main=fs.readFileSync('assets/js/main.js','utf8');
const configWindow={BAUMAN_DATA:{subjects:[{id:'mivar',name:'Mivar'}]}};
vm.runInNewContext(fs.readFileSync('assets/js/platform/hub-subject-config.js','utf8'),{window:configWindow,structuredClone});
const configuration=configWindow.BAUMAN_HUB_SUBJECT_CONFIG.getConfiguration('mivar');
assert.equal(configuration.entry,'subjects/mivar/index.html');
assert.equal(configuration.editor,'subjects/mivar/editor.html');
assert.equal(configWindow.BAUMAN_HUB_SUBJECT_CONFIG.getDescriptor('mivar').authoring,null,'Admin editor path must not imply learner authoring capability');
assert.ok(main.includes("'ergonomics','mivar'"));

console.log('MIVAR_SUBJECT_STATIC_GATE=PASS');
