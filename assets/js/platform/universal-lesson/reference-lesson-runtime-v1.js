(function (global) {
  'use strict';

  const validator = global.BaumanUniversalLessonValidator;
  const migrator = global.BaumanUniversalLessonMigrator;
  const factory = global.BaumanSubjectFactoryRegistry;
  const renderer = global.BaumanUniversalLessonRenderer;
  if (!validator || !migrator || !factory || !renderer) {
    throw new Error('BaumanReferenceLessonRuntime requires the locked B8-B10 Universal Lesson modules');
  }

  const RELEASE = 'L6-B11-REFERENCE-LESSON-RUNTIME-V1';
  const CONTRACT_ID = 'bauman-reference-lesson-activation';
  const CONTRACT_VERSION = '1.0.0';
  const REFERENCE_SUBJECT = 'foundation';
  const REFERENCE_LESSON = 'f_s01_l1';
  const REFERENCE_WIDGET = 'foundation-oral-rehearsal';
  const REFERENCE_CAPABILITY = 'speech-recording';
  const SHA256 = /^[0-9a-f]{64}$/;
  const currentScript = typeof document !== 'undefined' ? document.currentScript : null;
  const autoConfig = currentScript ? {
    manifest: currentScript.dataset.activationManifest || '',
    root: currentScript.dataset.appRoot || ''
  } : null;
  const runtime = {
    ready: false,
    code: 'NOT_BOOTSTRAPPED',
    errorCode: null,
    plan: null,
    manifest: null,
    legacy: null,
    active: null,
    bootstrapPromise: null
  };

  function isObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function clone(value, fallback) {
    try {
      if (value === undefined) return fallback;
      return JSON.parse(JSON.stringify(value));
    } catch (_) {
      return fallback;
    }
  }

  function unique(values) {
    return Array.from(new Set(Array.isArray(values) ? values : []));
  }

  function sameArray(left, right) {
    return Array.isArray(left)
      && Array.isArray(right)
      && left.length === right.length
      && left.every(function (value, index) { return value === right[index]; });
  }

  function safeId(value) {
    return typeof value === 'string'
      && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)
      && !value.includes('..');
  }

  function safePath(value) {
    return typeof value === 'string'
      && value.length > 0
      && value.length < 420
      && !value.startsWith('/')
      && !value.includes('..')
      && !/[\\?#]/.test(value)
      && !/^[a-z][a-z0-9+.-]*:/i.test(value);
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[character];
    });
  }

  function blocked(code, message, details) {
    return {
      ok: false,
      blocked: true,
      code,
      message,
      details: details === undefined ? null : details,
      legacyFallbackRequired: true
    };
  }

  function validateManifest(manifest) {
    const errors = [];
    if (!isObject(manifest)
      || manifest.contractId !== CONTRACT_ID
      || manifest.contractVersion !== CONTRACT_VERSION
      || manifest.status !== 'L6-B11-REVIEWED-REFERENCE-ACTIVATION') {
      errors.push({ code: 'INVALID_ACTIVATION_CONTRACT' });
    }
    const identity = manifest?.programIdentity;
    if (identity?.department !== 'ИУ-5'
      || identity?.officialPublishedDirectionCode !== '09.04.01'
      || identity?.personalizedDisplayCode !== '09.04.01/11') {
      errors.push({ code: 'PROGRAM_IDENTITY_MISMATCH' });
    }
    const boundary = manifest?.runtimeBoundary;
    if (boundary?.activationMode !== 'exact-allowlist-opt-in'
      || boundary?.sourceMutationAllowed !== false
      || boundary?.learnerStateMigrationAllowed !== false
      || boundary?.automaticMasterReadyAllowed !== false
      || boundary?.audioPersistenceAllowed !== false
      || boundary?.networkUploadAllowed !== false
      || boundary?.legacyFallbackRequired !== true
      || boundary?.specialistCutoverAllowed !== false) {
      errors.push({ code: 'RUNTIME_BOUNDARY_BROKEN' });
    }
    for (const key of ['schema', 'blockPolicy', 'subjectFactory']) {
      const dependency = manifest?.dependencies?.[key];
      if (!isObject(dependency)
        || !safePath(dependency.path)
        || !SHA256.test(dependency.stableJsonSha256 || '')) {
        errors.push({ code: 'INVALID_DEPENDENCY_PIN', key });
      }
    }
    const widget = manifest?.widgets?.[REFERENCE_WIDGET];
    if (!isObject(widget)
      || widget.availability !== 'existing-b11'
      || widget.owner !== 'foundation-reference-runtime'
      || !sameArray(widget.capabilityRefs, [REFERENCE_CAPABILITY])
      || widget.implementation !== 'browser-media-recorder-memory-only'
      || widget.masterReadyAuthority !== 'none'
      || widget.privacy?.recordingLifetime !== 'current-modal-memory-only'
      || widget.privacy?.upload !== false
      || widget.privacy?.persistence !== false
      || typeof widget.prompt !== 'string'
      || typeof widget.languageCue !== 'string'
      || !Array.isArray(widget.selfCheck)
      || widget.selfCheck.length !== 3) {
      errors.push({ code: 'INVALID_REFERENCE_WIDGET' });
    }
    const references = manifest?.referenceLessons;
    if (!Array.isArray(references) || references.length !== 1) {
      errors.push({ code: 'EXACT_REFERENCE_ALLOWLIST_REQUIRED' });
    }
    const reference = references?.[0];
    if (!isObject(reference)
      || reference.enabled !== true
      || reference.subjectId !== REFERENCE_SUBJECT
      || reference.lessonId !== REFERENCE_LESSON
      || reference.lessonType !== 'language'
      || reference.factoryRuleId !== 'foundation-classroom-and-study') {
      errors.push({ code: 'INVALID_REFERENCE_IDENTITY' });
    }
    if (reference?.source?.family !== 'elearning-v1.1'
      || reference?.source?.recordId !== REFERENCE_LESSON
      || !safePath(reference?.source?.path)
      || !SHA256.test(reference?.source?.stableRecordSha256 || '')) {
      errors.push({ code: 'INVALID_REFERENCE_SOURCE_PIN' });
    }
    const projection = reference?.projection;
    if (!isObject(projection?.context)
      || projection.context.subjectId !== REFERENCE_SUBJECT
      || projection.context.lessonId !== REFERENCE_LESSON
      || projection.context.lessonType !== 'language'
      || projection.context.sourcePath !== reference?.source?.path
      || projection.context.sourceVersion !== 'elearning-v1.1'
      || projection.context.adapterId !== 'l6-b11-reviewed-foundation-reference') {
      errors.push({ code: 'INVALID_PROJECTION_CONTEXT' });
    }
    for (const key of [
      'stableContextSha256',
      'stableOutputSha256',
      'stableRenderModelSha256',
      'stableHtmlSha256'
    ]) {
      if (!SHA256.test(projection?.[key] || '')) {
        errors.push({ code: 'INVALID_PROJECTION_PIN', key });
      }
    }
    const review = projection?.review;
    if (review?.status !== 'reviewed-for-exact-b11-reference'
      || review?.authority !== 'deterministic-source-preservation-and-capability-audit'
      || review?.scope !== 'mapping-policy-capability-runtime-only'
      || review?.academicApproval !== 'not-claimed'
      || review?.masterReadyApproval !== 'not-claimed'
      || !Array.isArray(review?.allowedMigrationWarnings)) {
      errors.push({ code: 'INVALID_REVIEW_BOUNDARY' });
    }
    const provider = reference?.capabilityProviders?.[REFERENCE_CAPABILITY];
    if (Object.keys(reference?.capabilityProviders || {}).length !== 1
      || provider?.capabilityRef !== REFERENCE_CAPABILITY
      || provider?.widgetId !== REFERENCE_WIDGET
      || provider?.availability !== 'existing') {
      errors.push({ code: 'INVALID_CAPABILITY_PROVIDER' });
    }
    if (reference?.expectedRender?.state !== 'CANONICAL_RENDER_READY'
      || reference?.expectedRender?.externalCapability !== REFERENCE_CAPABILITY
      || reference?.expectedRender?.masterReadyClaimed !== false
      || !sameArray(reference?.expectedRender?.sectionKinds, [
        'orientation',
        'theory',
        'worked-example',
        'exercise',
        'lab-simulation',
        'misconception',
        'oral',
        'review',
        'mastery',
        'project-nir-evidence'
      ])) {
      errors.push({ code: 'INVALID_EXPECTED_RENDER' });
    }
    if (reference?.rollback?.behavior !== 'restore-unchanged-foundation-engine-route'
      || reference?.rollback?.route !== 'subjects/foundation/index.html'
      || reference?.rollback?.requiresSourceDigestMatch !== true
      || reference?.rollback?.learnerStateWritePerformed !== false
      || reference?.rollback?.cacheWritePerformed !== false) {
      errors.push({ code: 'INVALID_REFERENCE_ROLLBACK' });
    }
    for (const subjectId of ['russian', 'math']) {
      const guard = manifest?.specialistGuards?.[subjectId];
      if (guard?.route !== 'subjects/' + subjectId + '/index.html'
        || guard?.behavior !== 'delegate-unchanged'
        || guard?.activationAllowed !== false) {
        errors.push({ code: 'SPECIALIST_GUARD_BROKEN', subjectId });
      }
    }
    return {
      valid: errors.length === 0,
      code: errors.length ? 'INVALID_ACTIVATION_MANIFEST' : 'ACTIVATION_MANIFEST_VALID',
      errors,
      digest: errors.length ? null : validator.hash256(manifest)
    };
  }

  function supportsCapability(capabilityRef, input) {
    const options = isObject(input) ? input : {};
    if (Array.isArray(options.availableCapabilities)) {
      return options.availableCapabilities.includes(capabilityRef);
    }
    if (capabilityRef !== REFERENCE_CAPABILITY) return false;
    return typeof global.MediaRecorder === 'function'
      && typeof global.Blob === 'function'
      && typeof global.URL?.createObjectURL === 'function'
      && typeof global.navigator?.mediaDevices?.getUserMedia === 'function';
  }

  function verifyDependencyPins(manifest, schema, blockPolicy, registry) {
    const values = { schema, blockPolicy, subjectFactory: registry };
    const actual = {};
    const errors = [];
    for (const key of Object.keys(values)) {
      actual[key] = validator.hash256(values[key]);
      if (actual[key] !== manifest.dependencies[key].stableJsonSha256) {
        errors.push({
          code: 'DEPENDENCY_DIGEST_MISMATCH',
          key,
          expected: manifest.dependencies[key].stableJsonSha256,
          actual: actual[key]
        });
      }
    }
    return { ok: errors.length === 0, errors, actual };
  }

  function buildReferencePlan(input) {
    const options = isObject(input) ? input : {};
    const manifest = options.manifest;
    const manifestValidation = validateManifest(manifest);
    if (!manifestValidation.valid) {
      return blocked('INVALID_ACTIVATION_MANIFEST', 'B11 reference activation manifest failed validation.', manifestValidation.errors);
    }
    const schema = options.schema;
    const blockPolicy = options.blockPolicy;
    const registry = options.registry;
    const pinCheck = verifyDependencyPins(manifest, schema, blockPolicy, registry);
    if (!pinCheck.ok) {
      return blocked('DEPENDENCY_DIGEST_MISMATCH', 'A locked B8-B9 dependency differs from the reviewed B11 pins.', pinCheck.errors);
    }
    const registryValidation = factory.validateRegistry(registry);
    if (!registryValidation.valid) {
      return blocked('INVALID_SUBJECT_FACTORY', 'Subject Factory registry is not valid.', registryValidation.errors);
    }
    const reference = manifest.referenceLessons[0];
    const resolvedSubject = factory.resolveSubject(registry, reference.subjectId);
    if (!resolvedSubject.ok
      || resolvedSubject.subject.compatibility?.factoryPilot !== true
      || resolvedSubject.subject.compatibility?.directFactoryRender !== false) {
      return blocked('FACTORY_PILOT_NOT_AUTHORIZED', 'The selected subject is not the locked B9 Factory pilot.', resolvedSubject);
    }
    const sourceResolution = factory.resolveDataSource(registry, reference.subjectId, 'lessons');
    if (!sourceResolution.ok || sourceResolution.relativePath !== reference.source.path) {
      return blocked('SOURCE_ROUTE_MISMATCH', 'Factory source routing differs from the reviewed reference path.', sourceResolution);
    }
    if (!Array.isArray(options.sourceRecords)) {
      return blocked('INVALID_SOURCE_FILE', 'Reference source must be the unchanged lessons array.', null);
    }
    const matches = options.sourceRecords.filter(function (record) {
      return isObject(record) && record.id === reference.lessonId;
    });
    if (matches.length !== 1) {
      return blocked('REFERENCE_RECORD_NOT_UNIQUE', 'Exact reference lesson lookup must return one stable record.', matches.length);
    }
    const source = clone(matches[0], null);
    const sourceDigest = validator.hash256(source);
    if (sourceDigest !== reference.source.stableRecordSha256) {
      return blocked('SOURCE_DIGEST_MISMATCH', 'The reviewed source record has changed; use the unchanged legacy lesson.', {
        expected: reference.source.stableRecordSha256,
        actual: sourceDigest
      });
    }
    const typeResolution = factory.resolveLessonType(registry, reference.subjectId, source, {});
    if (!typeResolution.ok
      || typeResolution.lessonType !== reference.lessonType
      || typeResolution.ruleId !== reference.factoryRuleId
      || typeResolution.authority !== 'subject-classification-rule') {
      return blocked('FACTORY_TYPE_MISMATCH', 'Factory no longer resolves the exact reviewed lesson type.', typeResolution);
    }
    const projectionContext = clone(reference.projection.context, {});
    const contextDigest = validator.hash256(projectionContext);
    if (contextDigest !== reference.projection.stableContextSha256) {
      return blocked('PROJECTION_CONTEXT_MISMATCH', 'Projection context differs from its review pin.', {
        expected: reference.projection.stableContextSha256,
        actual: contextDigest
      });
    }
    const migration = migrator.migrate(
      source,
      projectionContext,
      schema,
      { sourceFamily: reference.source.family }
    );
    if (!migration.ok
      || migration.sourceUnchanged !== true
      || migration.inputDigest !== sourceDigest
      || migration.outputDigest !== reference.projection.stableOutputSha256) {
      return blocked('REVIEWED_PROJECTION_MISMATCH', 'Deterministic projection differs from the exact reviewed output.', {
        code: migration.code,
        sourceUnchanged: migration.sourceUnchanged,
        inputDigest: migration.inputDigest,
        outputDigest: migration.outputDigest
      });
    }
    const allowedWarnings = reference.projection.review.allowedMigrationWarnings;
    if (!sameArray(migration.warnings, allowedWarnings)) {
      return blocked('UNREVIEWED_MIGRATION_WARNING', 'Projection produced a warning outside the exact review record.', migration.warnings);
    }
    const providers = {};
    for (const capabilityRef of Object.keys(reference.capabilityProviders)) {
      const provider = reference.capabilityProviders[capabilityRef];
      const widget = manifest.widgets[provider.widgetId];
      if (!widget?.capabilityRefs?.includes(capabilityRef)
        || !supportsCapability(capabilityRef, options)) {
        return blocked('CAPABILITY_UNAVAILABLE', 'Reviewed external capability is unavailable; keep the legacy lesson active.', {
          capabilityRef,
          widgetId: provider.widgetId
        });
      }
      providers[capabilityRef] = clone(provider, {});
    }
    const renderResult = renderer.buildRenderModel(
      migration.output,
      schema,
      blockPolicy,
      {
        capabilityProviders: providers,
        preferSpecialist: false
      }
    );
    if (!renderResult.ok
      || renderResult.model.state !== reference.expectedRender.state
      || renderResult.model.masterReadyClaimed !== false
      || renderResult.modelDigest !== reference.projection.stableRenderModelSha256
      || !sameArray(renderResult.model.sections.map(function (section) { return section.kind; }), reference.expectedRender.sectionKinds)) {
      return blocked('REVIEWED_RENDER_MISMATCH', 'B3 policy render differs from the reviewed B11 reference model.', {
        code: renderResult.code,
        modelDigest: renderResult.modelDigest,
        policyErrors: renderResult.policy?.errors || []
      });
    }
    const oralSection = renderResult.model.sections.find(function (section) {
      return section.kind === 'oral';
    });
    if (oralSection?.mode !== 'external'
      || oralSection.capabilityRef !== reference.expectedRender.externalCapability
      || oralSection.widgetId !== REFERENCE_WIDGET) {
      return blocked('ORAL_CAPABILITY_NOT_BOUND', 'Language oral policy is not bound to the reviewed recording widget.', oralSection || null);
    }
    const htmlResult = renderer.renderToHtml(renderResult.model, {});
    if (!htmlResult.ok || htmlResult.htmlDigest !== reference.projection.stableHtmlSha256) {
      return blocked('REVIEWED_HTML_MISMATCH', 'Safe semantic HTML differs from the reviewed output.', {
        code: htmlResult.code,
        htmlDigest: htmlResult.htmlDigest
      });
    }
    return {
      ok: true,
      blocked: false,
      code: 'REFERENCE_RUNTIME_READY',
      release: RELEASE,
      activationId: reference.activationId,
      subjectId: reference.subjectId,
      lessonId: reference.lessonId,
      lessonType: reference.lessonType,
      source,
      sourceDigest,
      sourceUnchanged: true,
      dependencyDigests: pinCheck.actual,
      factory: {
        engineRef: resolvedSubject.subject.engineRef,
        typeAuthority: typeResolution.authority,
        ruleId: typeResolution.ruleId,
        sourcePath: sourceResolution.relativePath
      },
      projection: {
        outputDigest: migration.outputDigest,
        warningCount: migration.warnings.length,
        reviewStatus: reference.projection.review.status,
        academicApproval: reference.projection.review.academicApproval
      },
      capabilityProviders: providers,
      model: renderResult.model,
      modelDigest: renderResult.modelDigest,
      html: htmlResult.html,
      htmlDigest: htmlResult.htmlDigest,
      masterReadyClaimed: false,
      learnerStateMigrationPerformed: false,
      sourceMutationPerformed: false,
      rollback: clone(reference.rollback, {})
    };
  }

  function rollback(plan, currentSource) {
    if (!isObject(plan)
      || plan.code !== 'REFERENCE_RUNTIME_READY'
      || !SHA256.test(plan.sourceDigest || '')
      || plan.rollback?.requiresSourceDigestMatch !== true) {
      return blocked('INVALID_REFERENCE_PLAN', 'Rollback requires a valid B11 reference plan.', null);
    }
    const currentDigest = validator.hash256(currentSource);
    if (currentDigest !== plan.sourceDigest) {
      return blocked('SOURCE_INTEGRITY_FAILED', 'Current source differs from the reviewed rollback snapshot.', {
        expected: plan.sourceDigest,
        actual: currentDigest
      });
    }
    return {
      ok: true,
      blocked: false,
      code: 'UNCHANGED_FOUNDATION_ROUTE_RESTORED',
      route: plan.rollback.route,
      sourceDigest: currentDigest,
      sourceUnchanged: true,
      learnerStateWritePerformed: false,
      cacheWritePerformed: false
    };
  }

  async function fetchJson(url) {
    const response = await global.fetch(url, { credentials: 'same-origin' });
    if (!response || !response.ok) {
      throw new Error('Reference dependency fetch failed: ' + url + ' (' + (response?.status || 'network') + ')');
    }
    return response.json();
  }

  function wrapLegacyEntry() {
    if (runtime.legacy) return true;
    if (typeof global.openLesson !== 'function'
      || typeof global.closeModal !== 'function'
      || typeof global.markLessonDone !== 'function') {
      runtime.code = 'LEGACY_ENTRY_UNAVAILABLE';
      return false;
    }
    runtime.legacy = {
      openLesson: global.openLesson,
      closeModal: global.closeModal,
      markLessonDone: global.markLessonDone
    };
    const legacyOpen = runtime.legacy.openLesson;
    const wrappedOpen = function (lessonId) {
      if (tryOpen(lessonId)) return true;
      return legacyOpen.apply(this, arguments);
    };
    wrappedOpen.release = RELEASE;
    wrappedOpen.legacyOpenLesson = legacyOpen;
    global.openLesson = wrappedOpen;
    return true;
  }

  async function bootstrap(input) {
    const options = isObject(input) ? input : {};
    if (runtime.bootstrapPromise) return runtime.bootstrapPromise;
    runtime.bootstrapPromise = (async function () {
      if (!wrapLegacyEntry()) {
        return blocked('LEGACY_ENTRY_UNAVAILABLE', 'Foundation legacy lesson entry is unavailable.', null);
      }
      if (typeof global.fetch !== 'function') {
        runtime.code = 'FETCH_UNAVAILABLE';
        return blocked('FETCH_UNAVAILABLE', 'Reference dependencies cannot be loaded.', null);
      }
      try {
        const appRoot = new URL(options.appRoot || '../../', global.document.baseURI);
        const manifestUrl = new URL(options.manifestUrl, global.document.baseURI);
        const manifest = await fetchJson(manifestUrl.href);
        const validation = validateManifest(manifest);
        if (!validation.valid) {
          runtime.code = 'INVALID_ACTIVATION_MANIFEST';
          runtime.errorCode = validation.errors[0]?.code || runtime.code;
          return blocked(runtime.code, 'Activation manifest failed closed.', validation.errors);
        }
        const dependencyUrls = Object.fromEntries(Object.entries(manifest.dependencies).map(function (entry) {
          return [entry[0], new URL(entry[1].path, appRoot).href];
        }));
        const reference = manifest.referenceLessons[0];
        const sourceUrl = new URL(reference.source.path, appRoot).href;
        const loaded = await Promise.all([
          fetchJson(dependencyUrls.schema),
          fetchJson(dependencyUrls.blockPolicy),
          fetchJson(dependencyUrls.subjectFactory),
          fetchJson(sourceUrl)
        ]);
        const plan = buildReferencePlan({
          manifest,
          schema: loaded[0],
          blockPolicy: loaded[1],
          registry: loaded[2],
          sourceRecords: loaded[3]
        });
        if (!plan.ok) {
          runtime.code = plan.code;
          runtime.errorCode = plan.code;
          return plan;
        }
        runtime.manifest = manifest;
        runtime.plan = plan;
        runtime.ready = true;
        runtime.code = plan.code;
        runtime.errorCode = null;
        try {
          global.document.dispatchEvent(new CustomEvent('bauman:l6-reference-ready', {
            detail: { subjectId: plan.subjectId, lessonId: plan.lessonId, release: RELEASE }
          }));
        } catch (_) { }
        return plan;
      } catch (error) {
        runtime.ready = false;
        runtime.code = 'BOOTSTRAP_FAILED';
        runtime.errorCode = 'BOOTSTRAP_FAILED';
        return blocked('BOOTSTRAP_FAILED', 'B11 reference bootstrap failed; legacy lesson remains active.', String(error?.message || error));
      }
    })();
    return runtime.bootstrapPromise;
  }

  function setWidgetStatus(root, message, tone) {
    const status = root?.querySelector('[data-l6-oral-status]');
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone || 'neutral';
  }

  function stopMedia(active) {
    const media = active?.media;
    if (!media) return;
    media.generation += 1;
    if (media.timer) global.clearInterval(media.timer);
    media.timer = null;
    if (media.recorder) {
      media.recorder.ondataavailable = null;
      media.recorder.onstop = null;
      try {
        if (media.recorder.state !== 'inactive') media.recorder.stop();
      } catch (_) { }
    }
    (media.stream?.getTracks?.() || []).forEach(function (track) {
      try { track.stop(); } catch (_) { }
    });
    if (media.objectUrl) {
      try { global.URL.revokeObjectURL(media.objectUrl); } catch (_) { }
    }
    media.recorder = null;
    media.stream = null;
    media.objectUrl = null;
    media.chunks = [];
  }

  function closeReference() {
    const active = runtime.active;
    if (!active) return;
    stopMedia(active);
    active.root.removeEventListener('click', active.handler);
    active.root.innerHTML = '';
    runtime.active = null;
  }

  function renderOralWidget(section) {
    const widget = runtime.manifest.widgets[REFERENCE_WIDGET];
    const checks = widget.selfCheck.map(function (item) {
      return '<li>' + escapeHtml(item) + '</li>';
    }).join('');
    section.innerHTML = '<header><span>Capability thật · thiết bị cục bộ</span><h2>Giải thích và bảo vệ</h2></header>'
      + '<div class="ul-oral-widget" data-l6-oral-widget="' + escapeHtml(REFERENCE_WIDGET) + '">'
      + '<div class="ul-oral-copy"><span class="ul-local-pill">Không tải âm thanh lên mạng</span>'
      + '<h3>Luyện trình bày 90 giây</h3><p>' + escapeHtml(widget.prompt) + '</p>'
      + '<blockquote lang="ru">' + escapeHtml(widget.languageCue) + '</blockquote>'
      + '<h4>Tự kiểm sau khi nghe lại</h4><ul>' + checks + '</ul></div>'
      + '<div class="ul-recorder"><div class="ul-record-status" data-l6-oral-status data-tone="neutral">Sẵn sàng thu âm trên thiết bị này.</div>'
      + '<div class="ul-record-timer" data-l6-oral-timer>00:00</div>'
      + '<div class="ul-recorder-actions">'
      + '<button type="button" class="btn primary" data-l6-reference-action="record-start">Bắt đầu thu</button>'
      + '<button type="button" class="btn" data-l6-reference-action="record-stop" disabled>Dừng</button>'
      + '<button type="button" class="btn" data-l6-reference-action="record-reset" disabled>Xóa bản thu</button>'
      + '</div><audio controls hidden data-l6-oral-audio></audio>'
      + '<small>Bản thu chỉ tồn tại trong bộ nhớ của modal hiện tại và bị xóa khi đóng.</small>'
      + '</div></div>';
    section.dataset.widgetReady = 'true';
  }

  async function startRecording() {
    const active = runtime.active;
    if (!active || active.media.recorder) return;
    const widgetRoot = active.root.querySelector('[data-l6-oral-widget]');
    const start = widgetRoot?.querySelector('[data-l6-reference-action="record-start"]');
    const stop = widgetRoot?.querySelector('[data-l6-reference-action="record-stop"]');
    const reset = widgetRoot?.querySelector('[data-l6-reference-action="record-reset"]');
    const timer = widgetRoot?.querySelector('[data-l6-oral-timer]');
    if (!widgetRoot || !supportsCapability(REFERENCE_CAPABILITY, {})) {
      setWidgetStatus(widgetRoot, 'Thiết bị này không hỗ trợ thu âm; bài cũ vẫn là đường dự phòng.', 'error');
      return;
    }
    setWidgetStatus(widgetRoot, 'Đang xin quyền micro…', 'working');
    const generation = ++active.media.generation;
    try {
      const stream = await global.navigator.mediaDevices.getUserMedia({ audio: true });
      if (!runtime.active || active.media.generation !== generation) {
        stream.getTracks().forEach(function (track) { track.stop(); });
        return;
      }
      const recorder = new global.MediaRecorder(stream);
      active.media.stream = stream;
      active.media.recorder = recorder;
      active.media.chunks = [];
      const startedAt = Date.now();
      recorder.ondataavailable = function (event) {
        if (event.data && event.data.size > 0) active.media.chunks.push(event.data);
      };
      recorder.onstop = function () {
        if (!runtime.active || active.media.generation !== generation) return;
        if (active.media.timer) global.clearInterval(active.media.timer);
        active.media.timer = null;
        (active.media.stream?.getTracks?.() || []).forEach(function (track) { track.stop(); });
        const blob = new global.Blob(active.media.chunks, {
          type: recorder.mimeType || 'audio/webm'
        });
        if (active.media.objectUrl) global.URL.revokeObjectURL(active.media.objectUrl);
        active.media.objectUrl = global.URL.createObjectURL(blob);
        const audio = widgetRoot.querySelector('[data-l6-oral-audio]');
        if (audio) {
          audio.src = active.media.objectUrl;
          audio.hidden = false;
        }
        active.media.recorder = null;
        active.media.stream = null;
        if (start) start.disabled = false;
        if (stop) stop.disabled = true;
        if (reset) reset.disabled = false;
        setWidgetStatus(widgetRoot, 'Đã thu xong. Nghe lại và tự kiểm theo rubric.', 'success');
      };
      recorder.start(100);
      if (start) start.disabled = true;
      if (stop) stop.disabled = false;
      if (reset) reset.disabled = true;
      setWidgetStatus(widgetRoot, 'Đang thu âm cục bộ…', 'recording');
      active.media.timer = global.setInterval(function () {
        const seconds = Math.floor((Date.now() - startedAt) / 1000);
        if (timer) timer.textContent = String(Math.floor(seconds / 60)).padStart(2, '0')
          + ':' + String(seconds % 60).padStart(2, '0');
      }, 250);
    } catch (_) {
      active.media.recorder = null;
      active.media.stream = null;
      if (start) start.disabled = false;
      if (stop) stop.disabled = true;
      setWidgetStatus(widgetRoot, 'Không có quyền micro. Bạn có thể quay lại bài cũ hoặc cấp quyền rồi thử lại.', 'error');
    }
  }

  function stopRecording() {
    const active = runtime.active;
    const recorder = active?.media?.recorder;
    if (!recorder) return;
    try {
      if (recorder.state !== 'inactive') recorder.stop();
    } catch (_) { }
  }

  function resetRecording() {
    const active = runtime.active;
    if (!active) return;
    const widgetRoot = active.root.querySelector('[data-l6-oral-widget]');
    const audio = widgetRoot?.querySelector('[data-l6-oral-audio]');
    if (active.media.objectUrl) global.URL.revokeObjectURL(active.media.objectUrl);
    active.media.objectUrl = null;
    active.media.chunks = [];
    if (audio) {
      audio.removeAttribute('src');
      audio.load();
      audio.hidden = true;
    }
    const reset = widgetRoot?.querySelector('[data-l6-reference-action="record-reset"]');
    if (reset) reset.disabled = true;
    const timer = widgetRoot?.querySelector('[data-l6-oral-timer]');
    if (timer) timer.textContent = '00:00';
    setWidgetStatus(widgetRoot, 'Bản thu đã được xóa khỏi bộ nhớ modal.', 'neutral');
  }

  function handleReferenceClick(event) {
    const universalAction = event.target.closest?.('[data-universal-action="open-specialist"]');
    if (universalAction) {
      event.preventDefault();
      const section = universalAction.closest('.ul-block-external');
      if (universalAction.dataset.capabilityRef === REFERENCE_CAPABILITY
        && universalAction.dataset.widgetId === REFERENCE_WIDGET
        && section) {
        renderOralWidget(section);
      }
      return;
    }
    const actionTarget = event.target.closest?.('[data-l6-reference-action]');
    if (!actionTarget) return;
    event.preventDefault();
    const action = actionTarget.dataset.l6ReferenceAction;
    if (action === 'close') closeReference();
    if (action === 'legacy') {
      const lessonId = runtime.plan.lessonId;
      closeReference();
      runtime.legacy.openLesson.call(global, lessonId);
    }
    if (action === 'complete') {
      const lessonId = runtime.plan.lessonId;
      closeReference();
      runtime.legacy.markLessonDone.call(global, lessonId);
    }
    if (action === 'record-start') startRecording();
    if (action === 'record-stop') stopRecording();
    if (action === 'record-reset') resetRecording();
  }

  function tryOpen(lessonId) {
    if (!runtime.ready || !runtime.plan || lessonId !== runtime.plan.lessonId) return false;
    if (validator.hash256(runtime.plan.source) !== runtime.plan.sourceDigest) {
      runtime.ready = false;
      runtime.code = 'SOURCE_INTEGRITY_FAILED';
      runtime.errorCode = runtime.code;
      return false;
    }
    const root = global.document.getElementById('modalRoot');
    if (!root) return false;
    closeReference();
    root.innerHTML = '<div class="modal universal-reference-backdrop" data-l6-reference-modal="true">'
      + '<div class="dialog universal-reference-dialog" role="dialog" aria-modal="true" aria-labelledby="l6-reference-title">'
      + '<header class="dialog-head universal-reference-head"><div><span class="ul-reference-kicker">Universal Lesson · reference pilot</span>'
      + '<h2 id="l6-reference-title">Bài học chuẩn hóa có rollback</h2></div>'
      + '<button type="button" class="btn sm" data-l6-reference-action="close">Đóng</button></header>'
      + '<div class="dialog-body universal-reference-body">' + runtime.plan.html
      + '<section class="ul-reference-boundary" aria-label="Giới hạn bằng chứng"><b>Giới hạn bằng chứng</b>'
      + '<span>Mở bài hoặc thu âm không tự tạo Master-ready. Policy B5 và verifier bên ngoài vẫn quyết định.</span></section>'
      + '<div class="ul-reference-actions">'
      + '<button type="button" class="btn green" data-l6-reference-action="complete">Đánh dấu hoàn thành bài</button>'
      + '<button type="button" class="btn" data-l6-reference-action="legacy">Mở giao diện bài cũ</button>'
      + '<button type="button" class="btn" data-l6-reference-action="close">Đóng</button>'
      + '</div></div></div></div>';
    const active = {
      root,
      handler: handleReferenceClick,
      media: {
        recorder: null,
        stream: null,
        chunks: [],
        objectUrl: null,
        timer: null,
        generation: 0
      }
    };
    root.addEventListener('click', active.handler);
    runtime.active = active;
    root.querySelector('.universal-reference-dialog')?.focus?.();
    return true;
  }

  function selfCheck() {
    return {
      ok: runtime.ready === true
        && runtime.plan?.code === 'REFERENCE_RUNTIME_READY'
        && runtime.plan?.masterReadyClaimed === false,
      release: RELEASE,
      ready: runtime.ready,
      code: runtime.code,
      errorCode: runtime.errorCode,
      subjectId: runtime.plan?.subjectId || null,
      lessonId: runtime.plan?.lessonId || null,
      lessonType: runtime.plan?.lessonType || null,
      factoryRuleId: runtime.plan?.factory?.ruleId || null,
      sourceUnchanged: runtime.plan?.sourceUnchanged === true,
      capabilityRefs: Object.keys(runtime.plan?.capabilityProviders || {}),
      modelDigest: runtime.plan?.modelDigest || null,
      htmlDigest: runtime.plan?.htmlDigest || null,
      masterReadyClaimed: runtime.plan?.masterReadyClaimed === true,
      legacyFallbackReady: !!runtime.legacy?.openLesson
    };
  }

  global.BaumanL6ReferenceLessonRuntime = Object.freeze({
    release: RELEASE,
    validateManifest,
    supportsCapability,
    buildReferencePlan,
    rollback,
    bootstrap,
    tryOpen,
    close: closeReference,
    selfCheck
  });

  if (typeof document !== 'undefined' && autoConfig?.manifest && autoConfig?.root) {
    wrapLegacyEntry();
    bootstrap({ manifestUrl: autoConfig.manifest, appRoot: autoConfig.root });
  }
})(typeof window !== 'undefined' ? window : globalThis);
