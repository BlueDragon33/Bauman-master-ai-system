'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const curriculumPath = path.join(root, 'assets/data/official-curriculum-iu5-2026.json');
const prereqPath = path.join(root, 'assets/data/prerequisite-registry-iu5-2026.json');

const curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));
const prereq = JSON.parse(fs.readFileSync(prereqPath, 'utf8'));
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const unique = values => new Set(values).size === values.length;

assert(curriculum.program.directionCode === '09.04.01', 'directionCode must be 09.04.01');
assert(curriculum.program.durationYears === 2, 'durationYears must be 2');
assert(curriculum.program.totalCredits === 120, 'program totalCredits must be 120');
assert(curriculum.program.totalHours === 4320, 'program totalHours must be 4320');
assert(curriculum.program.disciplineCredits === 80, 'disciplineCredits must be 80');
assert(curriculum.program.practiceCredits === 31, 'practiceCredits must be 31');
assert(curriculum.program.giaCredits === 9, 'giaCredits must be 9');

const mandatory = curriculum.disciplines.filter(x => x.part === 'mandatory');
const participant = curriculum.disciplines.filter(x => x.part === 'participant_formed');
const sum = (items, key='credits') => items.reduce((acc, item) => acc + Number(item[key] || 0), 0);
const electiveCredits = sum(curriculum.electiveGroups);
const disciplineCredits = sum(curriculum.disciplines) + electiveCredits;
const practiceCredits = sum(curriculum.practices);
const giaCredits = sum(curriculum.gia);

assert(sum(mandatory) === 52, `mandatory discipline credits expected 52, got ${sum(mandatory)}`);
assert(sum(participant) + electiveCredits === 28, `participant-formed credits expected 28, got ${sum(participant) + electiveCredits}`);
assert(disciplineCredits === 80, `discipline total expected 80, got ${disciplineCredits}`);
assert(practiceCredits === 31, `practice total expected 31, got ${practiceCredits}`);
assert(giaCredits === 9, `GIA total expected 9, got ${giaCredits}`);
assert(disciplineCredits + practiceCredits + giaCredits === 120, '80 + 31 + 9 must equal 120');

const disciplineIds = curriculum.disciplines.map(x => x.id);
const practiceIds = curriculum.practices.map(x => x.id);
const giaIds = curriculum.gia.map(x => x.id);
const electiveGroupIds = curriculum.electiveGroups.map(x => x.id);
const electiveOptionIds = curriculum.electiveGroups.flatMap(x => x.options.map(o => o.id));
const allCourseIds = [...disciplineIds, ...practiceIds, ...giaIds, ...electiveGroupIds, ...electiveOptionIds];
assert(unique(allCourseIds), 'official curriculum IDs must be unique');

const nir = curriculum.practices.find(x => x.id === 'p02');
assert(Boolean(nir), 'p02 NIR record is required');
assert(JSON.stringify(nir?.semesters) === JSON.stringify([1,2,3,4]), 'NIR must span semesters 1-4');
assert(nir?.credits === 21 && nir?.hours === 756, 'NIR must be 21 credits / 756 hours');

const gateIds = [...prereq.coreGates, ...prereq.jitBridgeGates].map(x => x.id);
assert(unique(gateIds), 'prerequisite gate IDs must be unique');
const gateSet = new Set(gateIds);
const courseSet = new Set(allCourseIds);
for (const dep of prereq.courseDependencies) {
  assert(courseSet.has(dep.courseId), `dependency references missing course ${dep.courseId}`);
  for (const gate of [...dep.critical, ...dep.support]) {
    assert(gateSet.has(gate), `dependency ${dep.courseId} references missing gate ${gate}`);
  }
}
for (const stage of prereq.stageActivationPolicy) {
  for (const gate of [...(stage.active || []), ...(stage.secondary || []), ...(stage.locked || [])]) {
    assert(gateSet.has(gate), `stage ${stage.stage} references missing gate ${gate}`);
  }
}

assert(prereq.notOfficialAdministrativePrerequisites === true, 'registry must explicitly state that gates are competency prerequisites, not official administrative prerequisites');
assert(prereq.masteryPolicy.readyRules.overallMinimum === 90, 'READY threshold must be 90');
assert(prereq.masteryPolicy.readyRules.applicationMinimum === 85, 'application threshold must be 85');
assert(prereq.masteryPolicy.readyRules.criticalMisconceptionsAllowed === 0, 'critical misconceptions allowed must be 0');

const officialText = JSON.stringify(curriculum);
assert(!/cần xác minh/i.test(officialText), 'official curriculum mirror must not contain candidate/cần xác minh labels');
assert(!/UGV|USV|PID|LQR|FPGA|PLC|SCADA/i.test(officialText), 'official curriculum mirror must remain free of optional project-track assumptions');

if (errors.length) {
  console.error(`ACADEMIC_2026_VALIDATION_FAIL (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('ACADEMIC_2026_VALIDATION_PASS');
console.log(JSON.stringify({
  mandatoryCredits: sum(mandatory),
  participantFixedCredits: sum(participant),
  electiveCredits,
  disciplineCredits,
  practiceCredits,
  giaCredits,
  totalCredits: disciplineCredits + practiceCredits + giaCredits,
  officialCourseIds: allCourseIds.length,
  prerequisiteGates: gateIds.length,
  dependencyMappings: prereq.courseDependencies.length
}, null, 2));
