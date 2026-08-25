(function (global) {
  'use strict';

  const RELEASE = 'L7-B3-RUSSIAN-TWIN-GENERATOR-V1';

  function isRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function text(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function stableStringify(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
    return '{' + Object.keys(value).sort().map(function (key) {
      return JSON.stringify(key) + ':' + stableStringify(value[key]);
    }).join(',') + '}';
  }

  function resolveLessonType(subjectProfile, lessonId) {
    const allowed = Array.isArray(subjectProfile.lessonTypes) ? subjectProfile.lessonTypes : [];
    const rules = Array.isArray(subjectProfile.lessonTypeRules) ? subjectProfile.lessonTypeRules : [];
    const matched = rules.find(function (rule) {
      return isRecord(rule) && Array.isArray(rule.lessonIds) && rule.lessonIds.includes(lessonId);
    });
    if (matched && allowed.includes(matched.lessonType)) return matched.lessonType;
    return allowed.includes(subjectProfile.defaultLessonType) ? subjectProfile.defaultLessonType : null;
  }

  function normalizeProfile(subjectId, registry) {
    const source = registry && registry.subjectProfiles && registry.subjectProfiles[subjectId];
    if (!isRecord(source)) return null;
    return Object.assign({ id: subjectId }, source);
  }

  function missing(reason, details) {
    return {
      ok: false,
      available: false,
      code: 'ALIGNMENT_MISSING',
      reason,
      details: details || null,
      sourceLessonContinues: true
    };
  }

  function buildGlossaryRecord(subjectId, lesson, registry) {
    const profile = normalizeProfile(subjectId, registry);
    if (!profile) return missing('SUBJECT_NOT_REGISTERED', subjectId);
    if (!isRecord(lesson)) return missing('LESSON_NOT_RECORD', null);

    const lessonId = text(lesson.id || lesson.lessonId);
    const stageId = text(lesson.stage);
    const title = text(lesson.title);
    const terminology = isRecord(lesson.terminology) ? lesson.terminology : {};
    const surfaces = { vi: text(terminology.vi), ru: text(terminology.ru), en: text(terminology.en) };
    const absent = Object.keys(surfaces).filter(function (language) { return !surfaces[language]; });
    if (!lessonId || !stageId || !title || absent.length) {
      return missing('EXPLICIT_TRILINGUAL_TERMINOLOGY_REQUIRED', {
        lessonId: lessonId || null,
        missingLanguages: absent,
        missingLessonFields: [
          !lessonId ? 'id' : null,
          !stageId ? 'stage' : null,
          !title ? 'title' : null
        ].filter(Boolean)
      });
    }

    const lessonType = resolveLessonType(profile, lessonId);
    if (!lessonType || !profile.lessonTypes.includes(lessonType)) {
      return missing('LESSON_TYPE_NOT_REGISTERED', { subjectId, lessonId });
    }
    const termId = [subjectId, lessonId, 'terminology'].join(':');
    const sourceAnchor = profile.sourcePath + '#lessonId=' + lessonId + '&field=terminology';
    const usageContext = { subjectId, lessonId, stageId, lessonType };
    const meaningRef = 'lesson-title:' + lessonId;
    const terms = ['vi', 'ru', 'en'].map(function (language) {
      return {
        surface: surfaces[language],
        language,
        partOfSpeechOrSymbolClass: 'technical-term',
        meaningRef,
        usageNote: 'Use only in the registered lesson and subject context until broader review.'
      };
    });
    return {
      ok: true,
      available: true,
      code: 'SOURCE_ALIGNED',
      record: {
        termId,
        conceptRef: 'lesson-concept:' + lessonId,
        subjectRefs: [subjectId],
        terms,
        usageContexts: [usageContext],
        sourceRefs: [sourceAnchor],
        falseFriendRefs: [],
        reviewStatus: 'source-aligned',
        contentVersion: registry.registryVersion,
        provenance: {
          origin: 'provided-source',
          adapterRelease: RELEASE,
          sourceLessonRef: lessonId,
          aiInferenceRefs: []
        }
      }
    };
  }

  function buildTwinUnit(subjectId, lesson, registry) {
    const glossary = buildGlossaryRecord(subjectId, lesson, registry);
    if (!glossary.ok) return glossary;
    const record = glossary.record;
    const context = record.usageContexts[0];
    const ruTerm = record.terms.find(function (term) { return term.language === 'ru'; });
    const viTerm = record.terms.find(function (term) { return term.language === 'vi'; });
    return {
      ok: true,
      available: true,
      code: 'SOURCE_ALIGNED',
      glossary: record,
      twinUnit: {
        twinUnitId: context.subjectId + ':' + context.lessonId + ':technical-terminology',
        sourceLessonRef: context.lessonId,
        sourceAnchorRefs: record.sourceRefs.slice(),
        mode: 'technical-terminology',
        ruOutputRef: record.termId + '#ru',
        viRescueRef: record.termId + '#vi',
        terminologyRefs: [record.termId],
        learnerAction: 'Recognize and retrieve “' + ruTerm.surface + '” for “' + viTerm.surface + '” in this lesson context.',
        evidenceKind: 'term-retrieval',
        reviewStatus: record.reviewStatus,
        offlineRef: 'russian-twin-glossary-subject-pack',
        activationState: 'declared',
        visible: false,
        autoActivate: false,
        specialistPracticeRef: 'subjects/russian/index.html'
      }
    };
  }

  function buildSubjectPack(subjectId, lessons, registry) {
    const results = (Array.isArray(lessons) ? lessons : []).map(function (lesson, sourceIndex) {
      return { sourceIndex, result: buildTwinUnit(subjectId, lesson, registry) };
    });
    return {
      schema: 'bauman-russian-twin-glossary-pack-v1',
      registryVersion: registry && registry.registryVersion || null,
      subjectId,
      status: 'reviewed-source-alignments-only',
      records: results.filter(function (item) { return item.result.ok; }).map(function (item) { return item.result.glossary; }),
      twinUnits: results.filter(function (item) { return item.result.ok; }).map(function (item) { return item.result.twinUnit; }),
      unavailable: results.filter(function (item) { return !item.result.ok; }).map(function (item) {
        return {
          sourceIndex: item.sourceIndex,
          code: item.result.code,
          reason: item.result.reason,
          details: item.result.details
        };
      }),
      activation: {
        state: 'declared',
        visible: false,
        autoActivate: false
      },
      offline: {
        availability: 'subject-pack',
        generativeAiRequired: false,
        fallback: 'source-lesson-without-twin'
      }
    };
  }

  global.BaumanRussianTwinGenerator = Object.freeze({
    release: RELEASE,
    stableStringify,
    resolveLessonType,
    buildGlossaryRecord,
    buildTwinUnit,
    buildSubjectPack
  });
})(typeof window !== 'undefined' ? window : globalThis);
