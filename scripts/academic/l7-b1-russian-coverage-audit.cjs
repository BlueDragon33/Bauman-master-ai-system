'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const DATA_ROOT = 'subjects/russian/data';
const REPORT_PATH = 'docs/migration/L7_B1_RUSSIAN_COVERAGE_AUDIT.generated.json';
const STAGES = ['vn', 'prep', 'hk1', 'hk2', 'hk3', 'hk4'];
const EXPECTED_LESSONS = { vn: 6, prep: 4, hk1: 4, hk2: 4, hk3: 4, hk4: 4 };
const TIERS = {
  preparatory: ['vn', 'prep'],
  technical: ['hk1', 'hk2'],
  academic: ['hk3'],
  defense: ['hk4']
};

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function stable(value) {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + stable(value[key])).join(',') + '}';
  }
  return JSON.stringify(value);
}

function digest(value) {
  return crypto.createHash('sha256').update(stable(value)).digest('hex');
}

function countByStage(items, stageOf) {
  return Object.fromEntries(STAGES.map((stage) => [stage, items.filter((item) => stageOf(item) === stage).length]));
}

const curriculum = readJson(`${DATA_ROOT}/curriculum.json`);
const lessons = readJson(`${DATA_ROOT}/lessons.json`);
const grammar = readJson(`${DATA_ROOT}/grammar.json`);
const writing = readJson(`${DATA_ROOT}/writing.json`);
const tests = readJson(`${DATA_ROOT}/tests.json`);
const simulations = readJson(`${DATA_ROOT}/simulations.json`);
const speakingLinkIndex = readJson(`${DATA_ROOT}/speaking-link-index.json`);
const speakingLinks = Array.isArray(speakingLinkIndex)
  ? speakingLinkIndex
  : Object.keys(speakingLinkIndex);
const knowledgeIndex = readJson(`${DATA_ROOT}/knowledge-index.json`);
const roadmap = readJson('assets/data/roadmap/iu5-090401-11-v3.json');

const checks = [];
function check(id, title, ok, evidence) {
  checks.push({ id, title, ok: Boolean(ok), evidence });
}

const lessonIds = lessons.map((lesson) => lesson.id);
const modules = curriculum.modules || [];
const moduleLessonIds = modules.flatMap((module) => module.lessonIds || []);
const lessonCounts = countByStage(lessons, (item) => item.stage);
const support = {
  grammar: countByStage(grammar, (item) => item.stage),
  writing: countByStage(writing, (item) => item.stage),
  assessment: countByStage(tests.questions || [], (item) => item.stage),
  simulation: countByStage(simulations, (item) => item.stage),
  speakingLinks: countByStage(speakingLinks, (item) => String(item).split('|')[0]),
  knowledgeIndex: countByStage(knowledgeIndex, (item) => item.stage)
};

check('PROGRAM-IDENTITY', 'Roadmap keeps official and personalized direction codes distinct',
  roadmap.officialPublishedDirectionCode === '09.04.01' && roadmap.displayCode === '09.04.01/11',
  { official: roadmap.officialPublishedDirectionCode, display: roadmap.displayCode });
check('STAGE-ORDER', 'Russian curriculum has the exact six ordered stages',
  JSON.stringify((curriculum.stages || []).map((stage) => stage.id)) === JSON.stringify(STAGES),
  (curriculum.stages || []).map((stage) => stage.id));
check('MODULE-ORDER', 'Russian modules cover the same six stages in order',
  JSON.stringify(modules.map((module) => module.stage)) === JSON.stringify(STAGES),
  modules.map((module) => module.stage));
check('LESSON-COUNT', 'Russian keeps exactly 26 legacy lessons', lessons.length === 26, lessons.length);
check('LESSON-ID-UNIQUE', 'Russian lesson IDs are unique', new Set(lessonIds).size === lessonIds.length, lessonIds);
check('MODULE-MAP-EXACT', 'Curriculum module mapping covers every lesson exactly once',
  moduleLessonIds.length === lessonIds.length
    && new Set(moduleLessonIds).size === moduleLessonIds.length
    && lessonIds.every((id) => moduleLessonIds.includes(id)),
  { lessonCount: lessonIds.length, mappedCount: moduleLessonIds.length });
check('STAGE-DISTRIBUTION', 'Lesson distribution matches the reviewed 6/4/4/4/4/4 route',
  STAGES.every((stage) => lessonCounts[stage] === EXPECTED_LESSONS[stage]), lessonCounts);
check('RUSSIAN-TITLES', 'Every lesson keeps a non-empty Russian title',
  lessons.every((lesson) => typeof lesson.ruTitle === 'string' && /[А-Яа-яЁё]/.test(lesson.ruTitle)),
  { covered: lessons.filter((lesson) => /[А-Яа-яЁё]/.test(lesson.ruTitle || '')).length });
check('RICH-LESSON-SOURCE', 'Every legacy lesson remains a rich source with at least 16 slides',
  lessons.every((lesson) => Array.isArray(lesson.slides) && lesson.slides.length >= 16),
  { minimumSlides: Math.min(...lessons.map((lesson) => lesson.slides?.length || 0)) });

for (const [name, counts] of Object.entries(support)) {
  check(`SUPPORT-${name.toUpperCase()}`, `${name} has coverage in every Russian stage`,
    STAGES.every((stage) => counts[stage] > 0), counts);
}

const tierEvidence = Object.entries(TIERS).map(([tier, stages]) => {
  const tierLessons = lessons.filter((lesson) => stages.includes(lesson.stage));
  return {
    tier,
    stages,
    lessonIds: tierLessons.map((lesson) => lesson.id),
    lessonCount: tierLessons.length,
    totalSlides: tierLessons.reduce((sum, lesson) => sum + lesson.slides.length, 0),
    support: Object.fromEntries(Object.entries(support).map(([name, counts]) => [
      name,
      stages.reduce((sum, stage) => sum + counts[stage], 0)
    ]))
  };
});

for (const tier of tierEvidence) {
  check(`TIER-${tier.tier.toUpperCase()}`, `${tier.tier} has lessons and every support family`,
    tier.lessonCount > 0 && Object.values(tier.support).every((count) => count > 0), tier);
}

const roadmapRussian = roadmap.tracks?.russian;
check('ROADMAP-RUSSIAN', 'Roadmap declares classroom technical academic and twin Russian',
  roadmapRussian?.modules?.includes('classroom-russian')
    && roadmapRussian.modules.includes('technical-russian')
    && roadmapRussian.modules.includes('academic-russian')
    && roadmapRussian.modules.includes('russian-twin-lesson'),
  roadmapRussian?.modules || []);
check('NO-SOURCE-MUTATION', 'Audit is read-only and records source digests', true, {
  curriculum: digest(curriculum),
  lessons: digest(lessons),
  tests: digest(tests)
});

const failures = checks.filter((item) => !item.ok);
const report = {
  schema: 'L7_B1_RUSSIAN_COVERAGE_AUDIT_V1',
  status: failures.length ? 'FAIL' : 'PASS',
  scope: 'Read-only Russian coverage inventory; no adapter projection, runtime wiring, content rewrite or learner-state write.',
  programIdentity: {
    department: roadmap.department,
    officialPublishedDirectionCode: roadmap.officialPublishedDirectionCode,
    personalizedDisplayCode: roadmap.displayCode
  },
  summary: {
    checks: checks.length,
    passed: checks.length - failures.length,
    failed: failures.length,
    lessons: lessons.length,
    stages: STAGES.length,
    tiers: tierEvidence.length
  },
  lessonCounts,
  support,
  tiers: tierEvidence,
  sourceDigests: {
    curriculum: digest(curriculum),
    lessons: digest(lessons),
    grammar: digest(grammar),
    writing: digest(writing),
    tests: digest(tests),
    simulations: digest(simulations),
    speakingLinks: digest(speakingLinkIndex),
    knowledgeIndex: digest(knowledgeIndex),
    roadmap: digest(roadmap)
  },
  checks,
  failures: failures.map((item) => item.id)
};

fs.writeFileSync(path.join(ROOT, REPORT_PATH), JSON.stringify(report, null, 2) + '\n');
console.log(`L7-B1 Russian coverage audit: ${report.status} (${report.summary.passed}/${report.summary.checks})`);
console.log(`Russian lessons: ${lessons.length}/26; tiers: ${tierEvidence.length}/4`);
console.log(`Report: ${REPORT_PATH}`);
if (failures.length) process.exit(2);
