import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const input = path.resolve(root, process.argv[2] || 'Bauman_Roadmap_V2_Syllabus_Luot18.md');
const output = path.resolve(root, process.argv[3] || 'docs/roadmap_v2/roadmap_registry.json');
const text = fs.readFileSync(input, 'utf8');
const lines = text.split(/\r?\n/);

const fieldMap = {
  'Prerequisite': 'prerequisiteText',
  'LT': 'theory',
  'BT': 'exercises',
  'UD': 'applications',
  'MP': 'simulationLab',
  'MP/Lab': 'simulationLab',
  'KT': 'assessment',
  'PJ': 'project',
  'MR': 'masterReady'
};

const subjects = [];
const nodes = [];
let subject = null;
let level = null;
let node = null;

function clean(value = '') {
  return value.trim().replace(/\s+/g, ' ');
}

function inferLevel(id) {
  const match = id.match(/-(R\d|L\d|L\d-L\d|L\d–L\d)-/);
  return match ? match[1].replace('-', '–') : 'L4';
}

function parseLessons(raw, dynamic) {
  const numbered = [];
  const re = /(?:^|;\s*)(L\d{2})\s+(.+?)(?=;\s*L\d{2}\s+|$)/g;
  let match;
  while ((match = re.exec(raw)) !== null) {
    numbered.push({ code: match[1], title: clean(match[2]) });
  }
  if (numbered.length) return { mode: 'numbered', numbered, dynamicTemplates: [] };
  if (dynamic) {
    return {
      mode: 'dynamic',
      numbered: [],
      dynamicTemplates: raw.split(';').map(clean).filter(Boolean)
    };
  }
  return { mode: 'legacy_composite', numbered: [], dynamicTemplates: [] };
}

function dispositionFor(item) {
  if (item.subjectId === '01') return item.lessonMode === 'dynamic' ? 'create_dynamic' : 'adapt_legacy_module';
  if (item.subjectId === '02') return item.id === 'MATH-L2-C07' ? 'reuse_composite_verified' : 'map_legacy_before_reuse';
  if (item.subjectId === '09') return 'create_dynamic';
  return 'create_new_academic_content';
}

function flushNode() {
  if (!node) return;
  const lessonField = node.rawFields['Bài'] ?? node.rawFields['Bài động'] ?? '';
  const parsed = parseLessons(lessonField, Object.hasOwn(node.rawFields, 'Bài động'));
  const item = {
    id: node.id,
    subjectId: node.subjectId,
    level: node.level || inferLevel(node.id),
    order: nodes.length + 1,
    title: node.title.replace(/\s+—\s+(?:BASELINE E15|LEGACY COMPOSITE)$/i, ''),
    annotations: /LEGACY COMPOSITE/i.test(node.title) ? ['legacy_composite'] : [],
    lessonMode: parsed.mode,
    lessons: parsed.numbered.map((lesson, index) => ({
      id: `${node.id}-${lesson.code}`,
      code: lesson.code,
      order: index + 1,
      title: lesson.title
    })),
    dynamicTemplates: parsed.dynamicTemplates,
    prerequisiteText: clean(node.rawFields.Prerequisite || ''),
    learningContract: {
      theory: clean(node.rawFields.LT || ''),
      exercises: clean(node.rawFields.BT || ''),
      applications: clean(node.rawFields.UD || ''),
      simulationLab: clean(node.rawFields['MP/Lab'] || node.rawFields.MP || ''),
      assessment: clean(node.rawFields.KT || ''),
      project: clean(node.rawFields.PJ || ''),
      masterReady: clean(node.rawFields.MR || '')
    },
    sourceDisposition: null,
    legacyRefs: node.id === 'MATH-L2-C07' ? [
      'MATH-VN-PS-C05-L05',
      'MATH-PREP-LA2-C10-L05',
      'MATH-PREP-LA2-C10-L06',
      'MATH-PREP-LA2-C10-L07',
      'MATH-PREP-PS2-C15-L06'
    ] : []
  };
  item.sourceDisposition = dispositionFor(item);
  nodes.push(item);
  node = null;
}

for (const line of lines) {
  const subjectMatch = line.match(/^## (\d{2}) — (.+)$/);
  if (subjectMatch) {
    flushNode();
    subject = { id: subjectMatch[1], title: clean(subjectMatch[2]), order: Number(subjectMatch[1]) };
    subjects.push(subject);
    level = null;
    continue;
  }
  if (!subject) continue;

  const levelMatch = line.match(/^### (.+)$/);
  if (levelMatch && !/^Quy tắc/.test(levelMatch[1])) {
    flushNode();
    level = clean(levelMatch[1].split(' — ')[0]);
    continue;
  }

  const nodeMatch = line.match(/^#### ([A-Z0-9-]+) — (.+)$/);
  if (nodeMatch) {
    flushNode();
    node = {
      id: nodeMatch[1],
      subjectId: subject.id,
      level: level || inferLevel(nodeMatch[1]),
      title: clean(nodeMatch[2]),
      rawFields: {}
    };
    continue;
  }

  if (!node) continue;
  const fieldMatch = line.match(/^- \*\*(.+?):\*\*\s*(.*)$/);
  if (fieldMatch) node.rawFields[clean(fieldMatch[1])] = clean(fieldMatch[2]);
}
flushNode();

for (const item of nodes) {
  const missing = Object.values(item.learningContract).some(value => !value);
  if (missing || !item.prerequisiteText) throw new Error(`Incomplete learning contract: ${item.id}`);
}

const numberedLessonCount = nodes.reduce((sum, item) => sum + item.lessons.length, 0);
const dynamicNodeCount = nodes.filter(item => item.lessonMode === 'dynamic').length;
const legacyCompositeNodeCount = nodes.filter(item => item.lessonMode === 'legacy_composite').length;

if (subjects.length !== 10) throw new Error(`Expected 10 subjects, received ${subjects.length}`);
if (nodes.length !== 85) throw new Error(`Expected 85 nodes, received ${nodes.length}`);
if (numberedLessonCount !== 304) throw new Error(`Expected 304 numbered lessons, received ${numberedLessonCount}`);
if (dynamicNodeCount !== 8) throw new Error(`Expected 8 dynamic nodes, received ${dynamicNodeCount}`);
if (legacyCompositeNodeCount !== 1) throw new Error(`Expected 1 legacy composite node, received ${legacyCompositeNodeCount}`);

const registry = {
  schema: 'BAUMAN_ROADMAP_V2_REGISTRY_V1',
  version: '2.0.0-l19-b74',
  status: 'PASS_B74',
  source: {
    path: path.relative(root, input),
    sha256: crypto.createHash('sha256').update(text).digest('hex'),
    correctedBy: 'L19_B73_BASELINE_INVENTORY'
  },
  baselineRef: 'main@e383912354673bdce7a0059d6b9a23799d74e689',
  namespace: 'roadmap_v2',
  priorityWeights: {
    masterRelevance: 0.35,
    knowledgeGap: 0.30,
    prerequisiteUrgency: 0.20,
    forgettingRisk: 0.15
  },
  masteryStates: ['Chưa học', 'Đang học', 'Đạt prerequisite', 'Master-ready', 'Cần ôn', 'Gap'],
  subjects,
  nodes,
  counts: {
    subjects: subjects.length,
    nodes: nodes.length,
    numberedLessons: numberedLessonCount,
    dynamicNodes: dynamicNodeCount,
    legacyCompositeNodes: legacyCompositeNodeCount
  }
};

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(registry, null, 2)}\n`);
console.log(JSON.stringify(registry.counts));

