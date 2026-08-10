import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "roadmap_v2/spec/Bauman_Roadmap_V2_Syllabus_Luot18.md");
const BASELINE = path.join(ROOT, "roadmap_v2/baseline/math-main-e383912-inventory.json");
const LEGACY_LESSONS = path.join(ROOT, "roadmap_v2/baseline/math-legacy-lessons-inventory.json");
const OUTPUT = path.join(ROOT, "roadmap_v2/registry/roadmap-v2.registry.json");

const sourceText = fs.readFileSync(SOURCE, "utf8");
const baseline = JSON.parse(fs.readFileSync(BASELINE, "utf8"));
const legacyLessons = JSON.parse(fs.readFileSync(LEGACY_LESSONS, "utf8"));
const sourceSha256 = crypto.createHash("sha256").update(sourceText).digest("hex");

const courseIds = {
  "01": "01-russian",
  "02": "02-math-ai-data",
  "03": "03-python-oop",
  "04": "04-algorithms-data-structures",
  "05": "05-database-information-systems",
  "06": "06-linux-os-networks",
  "07": "07-operations-research-system-modeling",
  "08": "08-machine-learning-research",
  "09": "09-current-bauman-subjects",
  "10": "10-nir-thesis"
};

const lines = sourceText.split(/\r?\n/);
const courses = [];
let course = null;
let levelHeading = null;
let chapter = null;

function inferredLevel(chapterId) {
  const match = chapterId.match(/-(R\d|L\d)-C\d+$/);
  if (match) return match[1];
  const middle = chapterId.match(/-(R\d|L\d)-C\d+/);
  return middle ? middle[1] : "UNSPECIFIED";
}

function flushChapter() {
  if (!chapter) return;
  const rawLessons = chapter.fields.lessonPlan || "";
  const numbered = [];
  for (const part of rawLessons.split(";").map((item) => item.trim()).filter(Boolean)) {
    const match = part.match(/^L(\d{2})\s+(.+?)[.]?$/);
    if (match) numbered.push({ localId: `L${match[1]}`, title: match[2].trim() });
  }

  let deliveryMode = "static";
  if (chapter.lessonFieldLabel === "Bài động") deliveryMode = "dynamic";
  else if (/giữ nguyên|legacy|E15 hiện có/i.test(rawLessons) && numbered.length === 0) deliveryMode = "legacy_preserve";

  const prerequisite = {
    raw: chapter.fields.prerequisite,
    refs: [],
    resolutionStatus: "pending_graph_resolution"
  };
  const sharedContract = {
    theory: { seed: chapter.fields.theory, status: "planned_or_reused" },
    exercises: {
      seed: chapter.fields.exercises,
      defaultMinimum: { recall: 4, application: 4, analysis: 3, challenge: 1 },
      status: "planned_or_reused"
    },
    application: { seed: chapter.fields.application, status: "planned_or_reused" },
    simulationOrLab: { seed: chapter.fields.simulationOrLab, required: true, status: "planned_or_reused" },
    assessment: {
      seed: chapter.fields.assessment,
      defaultPassPercent: 80,
      criticalItemFloorPercent: 70,
      status: "planned_or_reused"
    },
    projectCheckpoint: { seed: chapter.fields.projectCheckpoint, status: "planned_or_reused" },
    masterReadyEvidence: { seed: chapter.fields.masterReadyEvidence, status: "planned_or_reused" }
  };

  chapter.deliveryMode = deliveryMode;
  chapter.prerequisites = prerequisite;
  chapter.learningContract = structuredClone(sharedContract);
  chapter.lessons = numbered.map((item, index) => ({
    id: `${chapter.id}-${item.localId}`,
    localId: item.localId,
    order: index + 1,
    title: item.title,
    deliveryMode: "static",
    prerequisites: structuredClone(prerequisite),
    theory: structuredClone(sharedContract.theory),
    exercises: structuredClone(sharedContract.exercises),
    application: structuredClone(sharedContract.application),
    simulationOrLab: structuredClone(sharedContract.simulationOrLab),
    assessment: structuredClone(sharedContract.assessment),
    projectCheckpoint: structuredClone(sharedContract.projectCheckpoint),
    masterReadyEvidence: structuredClone(sharedContract.masterReadyEvidence),
    status: "chua_hoc",
    competencySource: course.order === 2 && chapter.order <= 7 ? "existing_competency" : "new_gap",
    linkedRussianLessonIds: [],
    baumanSubjectInstanceIds: [],
    version: 1
  }));
  chapter.dynamicLessonTemplates = deliveryMode === "dynamic"
    ? rawLessons.split(";").map((item) => item.trim().replace(/[.]$/, "")).filter(Boolean)
    : [];
  chapter.legacyBinding = null;
  if (deliveryMode === "legacy_preserve" && chapter.id === "MATH-L2-C07") {
    const physicalLessons = legacyLessons.roadmapV2Composite.lessons;
    chapter.legacyBinding = {
      baselineCommit: baseline.repository.headCommit,
      physicalSourcePath: legacyLessons.repository.path,
      physicalSourceGitBlobSha: legacyLessons.repository.gitBlobSha,
      physicalChapterIds: [...new Set(physicalLessons.map((item) => item.chapterId))],
      mappingStatus: "verified_minimum_set",
      preservePhysicalIds: true,
      physicalLessonCandidates: physicalLessons,
      secondaryFrameworkCandidateIds: ["m_p07"],
      sidecarGaps: legacyLessons.roadmapV2Composite.sidecarGaps
    };
  }
  delete chapter.fields;
  delete chapter.lessonFieldLabel;

  let level = course.levels.find((item) => item.id === chapter.levelId);
  if (!level) {
    level = {
      id: chapter.levelId,
      order: course.levels.length + 1,
      title: chapter.levelHeading || chapter.levelId,
      chapters: []
    };
    course.levels.push(level);
  }
  level.chapters.push(chapter);
  chapter = null;
}

function flushCourse() {
  flushChapter();
  if (!course) return;
  course.chapterCount = course.levels.reduce((sum, level) => sum + level.chapters.length, 0);
  course.staticLessonCount = course.levels.reduce(
    (sum, level) => sum + level.chapters.reduce((inner, item) => inner + item.lessons.length, 0),
    0
  );
  course.dynamicChapterCount = course.levels.reduce(
    (sum, level) => sum + level.chapters.filter((item) => item.deliveryMode === "dynamic").length,
    0
  );
  course.legacyPreserveChapterCount = course.levels.reduce(
    (sum, level) => sum + level.chapters.filter((item) => item.deliveryMode === "legacy_preserve").length,
    0
  );
  courses.push(course);
  course = null;
}

for (const line of lines) {
  const courseMatch = line.match(/^##\s+(\d{2})\s+—\s+(.+)$/);
  if (courseMatch) {
    flushCourse();
    const order = Number(courseMatch[1]);
    course = {
      id: courseIds[courseMatch[1]],
      order,
      title: courseMatch[2].trim(),
      levels: []
    };
    levelHeading = null;
    continue;
  }
  if (!course) continue;

  const levelMatch = line.match(/^###\s+(.+)$/);
  if (levelMatch) {
    const text = levelMatch[1].trim();
    if (/^(R\d|L\d|L\d[–-]L\d)/.test(text)) levelHeading = text;
    continue;
  }

  const chapterMatch = line.match(/^####\s+([^\s]+)\s+—\s+(.+)$/);
  if (chapterMatch) {
    flushChapter();
    const chapterId = chapterMatch[1].trim();
    chapter = {
      id: chapterId,
      order: Number(chapterId.match(/-C(\d+)$/)?.[1] || 0),
      title: chapterMatch[2].trim(),
      levelId: inferredLevel(chapterId),
      levelHeading,
      fields: {}
    };
    continue;
  }

  if (!chapter) continue;
  const fieldMatch = line.match(/^- \*\*(Bài động|Bài|Prerequisite|LT|BT|UD|MP\/Lab|MP|KT|PJ|MR):\*\*\s*(.+)$/);
  if (!fieldMatch) continue;
  const label = fieldMatch[1];
  const value = fieldMatch[2].trim();
  const key = {
    "Bài": "lessonPlan",
    "Bài động": "lessonPlan",
    "Prerequisite": "prerequisite",
    "LT": "theory",
    "BT": "exercises",
    "UD": "application",
    "MP": "simulationOrLab",
    "MP/Lab": "simulationOrLab",
    "KT": "assessment",
    "PJ": "projectCheckpoint",
    "MR": "masterReadyEvidence"
  }[label];
  chapter.fields[key] = value;
  if (label === "Bài" || label === "Bài động") chapter.lessonFieldLabel = label;
}
flushCourse();

const flatChapters = courses.flatMap((item) => item.levels.flatMap((level) => level.chapters));
const flatLessons = flatChapters.flatMap((item) => item.lessons);
const dynamicChapters = flatChapters.filter((item) => item.deliveryMode === "dynamic");
const legacyChapters = flatChapters.filter((item) => item.deliveryMode === "legacy_preserve");
const requiredChapterKeys = [
  "lessonPlan", "prerequisite", "theory", "exercises", "application",
  "simulationOrLab", "assessment", "projectCheckpoint", "masterReadyEvidence"
];

const missingContracts = [];
for (const item of flatChapters) {
  const checks = {
    lessonPlan: item.lessons.length > 0 || item.dynamicLessonTemplates.length > 0 || item.deliveryMode === "legacy_preserve",
    prerequisite: Boolean(item.prerequisites?.raw),
    theory: Boolean(item.learningContract?.theory?.seed),
    exercises: Boolean(item.learningContract?.exercises?.seed),
    application: Boolean(item.learningContract?.application?.seed),
    simulationOrLab: Boolean(item.learningContract?.simulationOrLab?.seed),
    assessment: Boolean(item.learningContract?.assessment?.seed),
    projectCheckpoint: Boolean(item.learningContract?.projectCheckpoint?.seed),
    masterReadyEvidence: Boolean(item.learningContract?.masterReadyEvidence?.seed)
  };
  for (const key of requiredChapterKeys) if (!checks[key]) missingContracts.push({ chapterId: item.id, field: key });
}

const duplicateIds = [];
const seen = new Set();
for (const id of [...flatChapters.map((item) => item.id), ...flatLessons.map((item) => item.id)]) {
  if (seen.has(id)) duplicateIds.push(id);
  seen.add(id);
}

const expected = {
  courses: 10,
  chapters: 85,
  numberedLessons: 304,
  dynamicChapters: 8,
  legacyPreserveChapters: 1
};
const expectedLegacyRefs = [
  "MATH-VN-PS-C05-L05",
  "MATH-PREP-LA2-C10-L05",
  "MATH-PREP-LA2-C10-L06",
  "MATH-PREP-LA2-C10-L07",
  "MATH-PREP-PS2-C15-L06"
];
const actual = {
  courses: courses.length,
  chapters: flatChapters.length,
  numberedLessons: flatLessons.length,
  dynamicChapters: dynamicChapters.length,
  legacyPreserveChapters: legacyChapters.length
};
for (const key of Object.keys(expected)) {
  if (actual[key] !== expected[key]) throw new Error(`Registry count mismatch ${key}: expected ${expected[key]}, got ${actual[key]}`);
}
if (missingContracts.length) throw new Error(`Missing chapter contracts: ${JSON.stringify(missingContracts)}`);
if (duplicateIds.length) throw new Error(`Duplicate registry IDs: ${duplicateIds.join(", ")}`);
if (sourceSha256 !== "22b1bbbf900f2b0fb34db2d683944495dd3d34805ee28ac63de312a6ec648b5d") {
  throw new Error(`Unexpected Lượt 18 source SHA-256: ${sourceSha256}`);
}
if (!baseline.step.status.startsWith("PASS_")) throw new Error("Step 73 baseline is not PASS");
if (legacyLessons.acceptance.result !== "PASS") throw new Error("Legacy lesson inventory is not PASS");
if (legacyLessons.counts.lessons !== 347 || legacyLessons.counts.uniqueLessonIds !== 347) {
  throw new Error("Legacy lesson preservation count drift");
}
const actualLegacyRefs = legacyLessons.roadmapV2Composite.lessons.map((item) => item.id);
if (JSON.stringify(actualLegacyRefs) !== JSON.stringify(expectedLegacyRefs)) {
  throw new Error(`MATH-L2-C07 verified refs drift: ${JSON.stringify(actualLegacyRefs)}`);
}
const logicalComposite = legacyChapters.find((item) => item.id === "MATH-L2-C07");
if (!logicalComposite || logicalComposite.title !== "Covariance, correlation và PCA — LEGACY COMPOSITE") {
  throw new Error("Corrected MATH-L2-C07 logical composite was not parsed");
}

const registry = {
  schema: "BAUMAN_ROADMAP_V2_SYLLABUS_REGISTRY_V1",
  version: 2,
  generatedAt: "2026-08-10T21:00:00+07:00",
  source: {
    round: 18,
    steps: [69, 70, 71, 72],
    file: "roadmap_v2/spec/Bauman_Roadmap_V2_Syllabus_Luot18.md",
    sha256: sourceSha256,
    mathBaselineInventory: "roadmap_v2/baseline/math-main-e383912-inventory.json",
    mathLegacyLessonInventory: "roadmap_v2/baseline/math-legacy-lessons-inventory.json",
    mathBaselineCommit: baseline.repository.headCommit
  },
  baseline: {
    mathLegacyLessonsPreserved: legacyLessons.counts.lessons,
    mathLegacySlidesPreserved: legacyLessons.counts.slides,
    mathSourceChapters: legacyLessons.counts.sourceChapters,
    mathPhysicalContentGroups: legacyLessons.counts.physicalContentGroups,
    mathTheoryOverlayRecordsPreserved: baseline.durableTheoryContent.recordCount,
    runtimeModified: false
  },
  program: {
    institution: "BMSTU",
    department: "ИУ-5",
    programCode: "09.04.01",
    target: "Master AI, signal processing and automation",
    learnerBaseline: "HUTECH Control and Automation",
    phases: [
      { id: "GD0", title: "Hiện tại → trước dự bị", mode: "russian_parallel_foundation" },
      { id: "GD1", title: "Khóa dự bị Nga", mode: "russian_dominant" },
      { id: "GD2", title: "Pre-Master Acceleration", mode: "prerequisite_acceleration" },
      { id: "GD3", title: "Master Mode", mode: "preview_2_4_weeks_and_nir" }
    ]
  },
  knowledgeStates: [
    "chua_hoc", "dang_hoc", "dat_prerequisite", "master_ready", "can_on", "gap"
  ],
  competencySources: ["existing_competency", "new_gap", "bauman_current"],
  priorityEngine: {
    formula: "0.35*masterRelevance + 0.30*knowledgeGap + 0.20*prerequisiteUrgency + 0.15*forgettingRisk",
    weights: {
      masterRelevance: 0.35,
      knowledgeGap: 0.30,
      prerequisiteUrgency: 0.20,
      forgettingRisk: 0.15
    },
    criticalOverride: "A prerequisite needed in <=4 weeks with status gap is Critical.",
    existingCompetencyRule: "Confirmed >=80% with retention >=75% becomes review_on_demand.",
    russianTwinRule: "Each selected technical lesson in GD2/GD3 creates a linked Russian twin lesson."
  },
  globalMasterReadyGate: {
    chapterAssessmentPercent: 80,
    criticalPrerequisiteFloorPercent: 70,
    labExplanationRequired: true,
    projectRubricMinimumPerDimension: 3,
    projectRubricDimensions: ["correctness", "clarity", "verification", "reproducibility"],
    retentionWindowDays: [14, 21],
    retentionPercent: 75,
    russianTechnicalTermsRequiredInGD2GD3: [5, 10]
  },
  existingCompetencyDomains: [
    "control", "digital_control", "electrical_electronics", "measurement",
    "mcu", "plc_scada", "automation", "engineering_mathematics"
  ],
  counts: {
    ...actual,
    preservedLegacyLessons: legacyLessons.counts.lessons,
    preservedTheoryOverlayRecords: baseline.durableTheoryContent.recordCount,
    preservedLegacyLessonCandidates: legacyChapters.reduce(
      (sum, item) => sum + (item.legacyBinding?.physicalLessonCandidates?.length || 0),
      0
    )
  },
  courses,
  acceptance: {
    step: 74,
    sourceFingerprintMatched: true,
    baselineStep73Passed: baseline.step.status.startsWith("PASS_"),
    allCountsMatched: true,
    allChapterContractsPresent: missingContracts.length === 0,
    allRegistryIdsUnique: duplicateIds.length === 0,
    legacyCompositeRefsVerified: legacyChapters[0]?.legacyBinding?.mappingStatus === "verified_minimum_set",
    runtimeModified: false,
    result: "PASS"
  }
};

fs.writeFileSync(OUTPUT, JSON.stringify(registry, null, 2) + "\n", "utf8");
console.log(JSON.stringify({
  output: path.relative(ROOT, OUTPUT),
  sourceSha256,
  counts: registry.counts,
  missingContracts: missingContracts.length,
  duplicateIds: duplicateIds.length,
  status: "PASS"
}, null, 2));
