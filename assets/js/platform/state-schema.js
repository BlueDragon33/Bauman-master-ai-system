(function (global) {
  'use strict';

  const schema = {
    schemaVersion: 1,
    recordKinds: {
      profile: { ownership: 'user', conflict: 'server-revision' },
      progress: { ownership: 'user', conflict: 'monotonic-completion' },
      testResult: { ownership: 'user', conflict: 'append-only' },
      reviewState: { ownership: 'user', conflict: 'server-revision' },
      scheduleEntry: { ownership: 'user', conflict: 'record-revision' },
      studyActivity: { ownership: 'user', conflict: 'append-only' },
      settings: { ownership: 'user', conflict: 'last-write-server-time' },
      aiLearningState: { ownership: 'user', conflict: 'server-revision' },
      staticContent: { ownership: 'content', conflict: 'version-authoritative' }
    },
    legacyMainState: {
      sourceKey: 'bauman_main_all_phases_subjects_v1',
      dynamicFields: [
        'progress',
        'subjectReports',
        'reviewQueue',
        'activeTask',
        'activity',
        'schedule',
        'lastStudy',
        'researchChecks',
        'researchFiles',
        'theme',
        'font',
        'fontSize'
      ],
      staticOrConfigurationFields: [
        'subjects',
        'roadmapStage',
        'subject',
        'subjectStage',
        'researchTopic'
      ]
    }
  };

  function describeLegacyState(state) {
    const source = state && typeof state === 'object' ? state : {};
    const dynamic = {};
    const staticOrConfiguration = {};

    schema.legacyMainState.dynamicFields.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(source, key)) dynamic[key] = source[key];
    });

    schema.legacyMainState.staticOrConfigurationFields.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(source, key)) staticOrConfiguration[key] = source[key];
    });

    return {
      schemaVersion: schema.schemaVersion,
      dynamic,
      staticOrConfiguration,
      untouchedKeys: Object.keys(source).filter((key) =>
        !schema.legacyMainState.dynamicFields.includes(key) &&
        !schema.legacyMainState.staticOrConfigurationFields.includes(key)
      )
    };
  }

  global.BaumanStateSchema = Object.freeze({
    ...schema,
    describeLegacyState
  });
})(window);
