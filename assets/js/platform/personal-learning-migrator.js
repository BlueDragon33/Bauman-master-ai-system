(function (global) {
  'use strict';

  const schema = global.BaumanPersonalLearningSchema;
  if (!schema) throw new Error('BaumanPersonalLearningMigrator requires BaumanPersonalLearningSchema');

  const KNOWN_LEGACY_FIELDS = new Set([
    'page', 'homePanel', 'roadmapStage', 'subject', 'subjectStage',
    'schedule', 'progress', 'subjectReports', 'reviewQueue', 'activeTask', 'activity',
    'theme', 'font', 'fontSize', 'lastStudy', 'researchTopic', 'researchChecks',
    'researchFiles', 'subjects', 'planningWarnings', 'planningMissions',
    'planningPlans', 'planningActions'
  ]);

  function obj(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function clone(value, fallback) {
    try {
      if (value === undefined) return fallback;
      return JSON.parse(JSON.stringify(value));
    } catch (_) {
      return fallback;
    }
  }

  function stableStringify(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
    return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + stableStringify(value[key])).join(',') + '}';
  }

  function hash32(text) {
    let hash = 0x811c9dc5;
    const value = String(text || '');
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
  }

  function stableId(prefix, parts) {
    return String(prefix || 'record') + '_' + hash32(stableStringify(parts));
  }

  function mapObjectRecords(source, prefix) {
    return Object.keys(obj(source)).sort().map((id) => ({
      id,
      recordId: stableId(prefix, [id, source[id]]),
      revision: 0,
      data: clone(source[id], null)
    }));
  }

  function normalizeAssessmentResults(subjectReports) {
    const results = [];
    Object.keys(obj(subjectReports)).sort().forEach((subjectId) => {
      arr(subjectReports[subjectId]).forEach((report, index) => {
        const raw = clone(report, {});
        const timestamp = raw.receivedAt || raw.generatedAt || raw.submittedAt || raw.completedAt || null;
        results.push({
          id: stableId('assessment', [subjectId, index, timestamp, raw]),
          subjectId,
          courseId: raw.courseId || raw.itemId || null,
          kind: raw.kind || raw.type || 'subject-report',
          score: Number.isFinite(Number(raw.score)) ? Number(raw.score) : null,
          percent: Number.isFinite(Number(raw.percent)) ? Number(raw.percent) : null,
          answered: Number.isFinite(Number(raw.answered)) ? Number(raw.answered) : null,
          total: Number.isFinite(Number(raw.total || raw.questions)) ? Number(raw.total || raw.questions) : null,
          targetScore: Number.isFinite(Number(raw.targetScore)) ? Number(raw.targetScore) : null,
          occurredAt: timestamp,
          conflictPolicy: schema.conflictPolicy.assessmentResult,
          raw
        });
      });
    });
    return results;
  }

  function normalizeReviewQueue(reviewQueue) {
    return arr(reviewQueue).map((item, index) => {
      const raw = clone(item, {});
      return {
        id: raw.id || raw.reviewId || stableId('review', [index, raw]),
        revision: 0,
        conflictPolicy: schema.conflictPolicy.reviewItem,
        data: raw
      };
    });
  }

  function normalizeSchedule(schedule) {
    const source = obj(schedule);
    const entries = obj(source.entries);
    const settings = clone(source, {});
    delete settings.entries;
    return {
      settings,
      entries: Object.keys(entries).sort().map((key) => {
        const raw = clone(entries[key], {});
        const split = key.split('|');
        return {
          id: key,
          date: split[0] || raw.date || null,
          slotId: split[1] || raw.slotId || null,
          revision: 0,
          conflictPolicy: schema.conflictPolicy.scheduleEntry,
          data: raw
        };
      })
    };
  }

  function normalizeActivity(activity) {
    return arr(activity).map((event, index) => {
      const raw = clone(event, {});
      const occurredAt = raw.at || raw.date || raw.receivedAt || raw.generatedAt || null;
      return {
        id: raw.id || stableId('activity', [index, occurredAt, raw]),
        occurredAt,
        conflictPolicy: schema.conflictPolicy.studyActivity,
        data: raw
      };
    });
  }

  function normalizeResearchChecks(checks) {
    return Object.keys(obj(checks)).sort().map((id) => ({
      id,
      revision: 0,
      done: !!checks[id]
    }));
  }

  function normalizeResearchAttachments(researchFiles) {
    const out = [];
    Object.keys(obj(researchFiles)).sort().forEach((itemId) => {
      arr(researchFiles[itemId]).forEach((file, index) => {
        const raw = obj(file);
        const content = typeof raw.content === 'string' ? raw.content : '';
        out.push({
          id: stableId('attachment', [itemId, index, raw.name || '', raw.addedAt || '']),
          itemId,
          index,
          name: raw.name || '',
          mime: raw.mime || '',
          typeLabel: raw.typeLabel || '',
          addedAt: raw.addedAt || null,
          hasInlinePayload: content.length > 0,
          inlinePayloadChars: content.length,
          payloadPolicy: schema.conflictPolicy.attachmentPayload,
          legacyRef: {
            sourceKey: 'bauman_main_all_phases_subjects_v1',
            field: 'researchFiles',
            itemId,
            index
          }
        });
      });
    });
    return out;
  }

  function normalizeSubjectOverrides(subjects) {
    return Object.keys(obj(subjects)).sort().map((subjectId) => {
      const source = obj(subjects[subjectId]);
      return {
        subjectId,
        mainPath: source.mainPath || '',
        editorPath: source.editorPath || '',
        priority: source.priority || null
      };
    });
  }

  function sanitizedIdentity(currentUser) {
    const user = obj(currentUser);
    const email = typeof user.email === 'string' ? user.email.trim().toLowerCase() : null;
    return {
      userRef: email ? 'email:' + email : null,
      email,
      name: typeof user.name === 'string' ? user.name : null,
      role: typeof user.role === 'string' ? user.role : null
    };
  }

  function countReports(subjectReports) {
    return Object.values(obj(subjectReports)).reduce((sum, list) => sum + arr(list).length, 0);
  }

  function countResearchFiles(researchFiles) {
    return Object.values(obj(researchFiles)).reduce((sum, list) => sum + arr(list).length, 0);
  }

  function fromLegacyMainState(legacyState, currentUser) {
    const legacy = obj(legacyState);
    const out = schema.emptyState();
    const schedule = normalizeSchedule(legacy.schedule);
    const attachments = normalizeResearchAttachments(legacy.researchFiles);

    out.identity = sanitizedIdentity(currentUser);
    out.preferences = {
      appearance: {
        theme: legacy.theme || 'academic',
        font: legacy.font || 'system',
        fontSize: legacy.fontSize || 'normal'
      },
      timezone: obj(legacy.schedule).timezone || 'utc7'
    };
    out.navigation = {
      page: legacy.page || 'home',
      homePanel: legacy.homePanel || 'matrix',
      roadmapStage: legacy.roadmapStage || 'prepare',
      subject: legacy.subject || 'russian',
      subjectStage: legacy.subjectStage || 'prepare',
      researchTopic: legacy.researchTopic || 'ugv',
      lastStudy: clone(legacy.lastStudy, null)
    };
    out.progress = {
      subjects: clone(legacy.progress, {})
    };
    out.assessments = {
      results: normalizeAssessmentResults(legacy.subjectReports)
    };
    out.reviews = {
      queue: normalizeReviewQueue(legacy.reviewQueue)
    };
    out.schedule = schedule;
    out.studyActivity = {
      events: normalizeActivity(legacy.activity)
    };
    out.planning = {
      activeTask: clone(legacy.activeTask, null),
      warnings: mapObjectRecords(legacy.planningWarnings, 'planning-warning'),
      missions: mapObjectRecords(legacy.planningMissions, 'planning-mission'),
      plans: mapObjectRecords(legacy.planningPlans, 'planning-plan'),
      actions: mapObjectRecords(legacy.planningActions, 'planning-action')
    };
    out.research = {
      checks: normalizeResearchChecks(legacy.researchChecks),
      attachments
    };
    out.configuration = {
      subjectOverrides: normalizeSubjectOverrides(legacy.subjects)
    };

    const legacyFields = Object.keys(legacy).sort();
    const unclassifiedFields = legacyFields.filter((key) => !KNOWN_LEGACY_FIELDS.has(key));
    out.sourceSnapshot = {
      legacyFields,
      unclassifiedFields,
      attachmentPayloadPolicy: 'metadata-and-legacy-reference-only',
      counts: {
        progressSubjects: Object.keys(obj(legacy.progress)).length,
        assessmentReports: countReports(legacy.subjectReports),
        reviewItems: arr(legacy.reviewQueue).length,
        scheduleEntries: Object.keys(obj(obj(legacy.schedule).entries)).length,
        activityEvents: arr(legacy.activity).length,
        researchChecks: Object.keys(obj(legacy.researchChecks)).length,
        researchAttachments: countResearchFiles(legacy.researchFiles),
        planningWarnings: Object.keys(obj(legacy.planningWarnings)).length,
        planningMissions: Object.keys(obj(legacy.planningMissions)).length,
        planningPlans: Object.keys(obj(legacy.planningPlans)).length,
        planningActions: Object.keys(obj(legacy.planningActions)).length
      }
    };

    return out;
  }

  function hasForbiddenCredentialKey(value) {
    let found = false;
    const seen = new Set();
    function visit(node) {
      if (found || node === null || typeof node !== 'object') return;
      if (seen.has(node)) return;
      seen.add(node);
      Object.keys(node).forEach((key) => {
        if (/^(password|passwd|admin_pass)$/i.test(key)) found = true;
        else visit(node[key]);
      });
    }
    visit(value);
    return found;
  }

  function integrityReport(legacyState, personalState) {
    const legacy = obj(legacyState);
    const personal = obj(personalState);
    const expected = {
      progressSubjects: Object.keys(obj(legacy.progress)).length,
      assessmentReports: countReports(legacy.subjectReports),
      reviewItems: arr(legacy.reviewQueue).length,
      scheduleEntries: Object.keys(obj(obj(legacy.schedule).entries)).length,
      activityEvents: arr(legacy.activity).length,
      researchChecks: Object.keys(obj(legacy.researchChecks)).length,
      researchAttachments: countResearchFiles(legacy.researchFiles),
      planningWarnings: Object.keys(obj(legacy.planningWarnings)).length,
      planningMissions: Object.keys(obj(legacy.planningMissions)).length,
      planningPlans: Object.keys(obj(legacy.planningPlans)).length,
      planningActions: Object.keys(obj(legacy.planningActions)).length
    };
    const actual = {
      progressSubjects: Object.keys(obj(obj(personal.progress).subjects)).length,
      assessmentReports: arr(obj(personal.assessments).results).length,
      reviewItems: arr(obj(personal.reviews).queue).length,
      scheduleEntries: arr(obj(personal.schedule).entries).length,
      activityEvents: arr(obj(personal.studyActivity).events).length,
      researchChecks: arr(obj(personal.research).checks).length,
      researchAttachments: arr(obj(personal.research).attachments).length,
      planningWarnings: arr(obj(personal.planning).warnings).length,
      planningMissions: arr(obj(personal.planning).missions).length,
      planningPlans: arr(obj(personal.planning).plans).length,
      planningActions: arr(obj(personal.planning).actions).length
    };

    const countChecks = {};
    Object.keys(expected).forEach((key) => { countChecks[key] = expected[key] === actual[key]; });
    const attachments = arr(obj(personal.research).attachments);
    const noInlineAttachmentPayloadCopied = attachments.every((item) => !Object.prototype.hasOwnProperty.call(obj(item), 'content'));
    const allAttachmentRefsPresent = attachments.every((item) => obj(item).legacyRef.sourceKey && obj(item).legacyRef.itemId !== undefined);
    const schemaValid = schema.isPersonalLearningState(personal);
    const credentialSafe = !hasForbiddenCredentialKey(personal);
    const allCountsMatch = Object.values(countChecks).every(Boolean);
    const unclassifiedFields = arr(obj(personal.sourceSnapshot).unclassifiedFields);

    return {
      passed: schemaValid && credentialSafe && allCountsMatch && noInlineAttachmentPayloadCopied && allAttachmentRefsPresent,
      shadowSafe: schemaValid && credentialSafe && allCountsMatch && noInlineAttachmentPayloadCopied && allAttachmentRefsPresent,
      cutoverReady: schemaValid && credentialSafe && allCountsMatch && unclassifiedFields.length === 0 && attachments.every((item) => !item.hasInlinePayload),
      checks: {
        schemaValid,
        credentialSafe,
        allCountsMatch,
        noInlineAttachmentPayloadCopied,
        allAttachmentRefsPresent,
        countChecks
      },
      expected,
      actual,
      unclassifiedFields,
      attachmentPayloadsStillLegacy: attachments.filter((item) => item.hasInlinePayload).length
    };
  }

  global.BaumanPersonalLearningMigrator = Object.freeze({
    version: 1,
    knownLegacyFields: Object.freeze([...KNOWN_LEGACY_FIELDS]),
    fromLegacyMainState,
    integrityReport,
    stableId
  });
})(window);
