(function (global) {
  'use strict';

  const SCHEMA_VERSION = 1;
  const KIND = 'bauman-personal-learning-state';
  const SHADOW_KEY = 'bauman_personal_learning_state_v1_shadow';

  const sections = Object.freeze({
    identity: { ownership: 'user', sync: 'server-revision', sensitive: true },
    preferences: { ownership: 'user', sync: 'last-write-server-time' },
    navigation: { ownership: 'user', sync: 'last-write-server-time', priority: 'low' },
    progress: { ownership: 'user', sync: 'monotonic-completion' },
    assessments: { ownership: 'user', sync: 'append-only' },
    reviews: { ownership: 'user', sync: 'record-revision' },
    schedule: { ownership: 'user', sync: 'record-revision' },
    studyActivity: { ownership: 'user', sync: 'append-only' },
    planning: { ownership: 'user', sync: 'record-revision' },
    research: { ownership: 'user', sync: 'record-revision' },
    configuration: { ownership: 'user-admin', sync: 'server-revision' },
    sourceSnapshot: { ownership: 'migration', sync: 'never' }
  });

  const conflictPolicy = Object.freeze({
    progress: 'monotonic-completion',
    assessmentResult: 'append-only',
    reviewItem: 'record-revision',
    scheduleEntry: 'record-revision',
    studyActivity: 'append-only',
    settings: 'last-write-server-time',
    planningRecord: 'record-revision',
    researchCheck: 'record-revision',
    attachmentPayload: 'external-object-reference',
    staticContent: 'version-authoritative'
  });

  function emptyState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      kind: KIND,
      source: {
        type: 'legacy-main-state',
        key: 'bauman_main_all_phases_subjects_v1',
        schema: 'legacy-main-v1'
      },
      identity: {
        userRef: null,
        email: null,
        name: null,
        role: null
      },
      preferences: {
        appearance: { theme: 'academic', font: 'system', fontSize: 'normal' },
        timezone: 'utc7'
      },
      navigation: {
        page: 'home',
        homePanel: 'matrix',
        roadmapStage: 'prepare',
        subject: 'russian',
        subjectStage: 'prepare',
        researchTopic: 'ugv',
        lastStudy: null
      },
      progress: {
        subjects: {}
      },
      assessments: {
        results: []
      },
      reviews: {
        queue: []
      },
      schedule: {
        settings: {},
        entries: []
      },
      studyActivity: {
        events: []
      },
      planning: {
        activeTask: null,
        warnings: [],
        missions: [],
        plans: [],
        actions: []
      },
      research: {
        checks: [],
        attachments: []
      },
      configuration: {
        subjectOverrides: []
      },
      sourceSnapshot: {
        legacyFields: [],
        unclassifiedFields: [],
        attachmentPayloadPolicy: 'metadata-and-legacy-reference-only',
        counts: {}
      }
    };
  }

  function isPersonalLearningState(value) {
    return !!(
      value &&
      typeof value === 'object' &&
      value.kind === KIND &&
      Number(value.schemaVersion) === SCHEMA_VERSION
    );
  }

  global.BaumanPersonalLearningSchema = Object.freeze({
    schemaVersion: SCHEMA_VERSION,
    kind: KIND,
    shadowKey: SHADOW_KEY,
    sections,
    conflictPolicy,
    emptyState,
    isPersonalLearningState
  });
})(window);
