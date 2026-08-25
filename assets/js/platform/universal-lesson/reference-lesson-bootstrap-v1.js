(function (global) {
  'use strict';

  const RELEASE = 'L6-B11-REFERENCE-LESSON-BOOTSTRAP-V1';
  const script = document.currentScript;
  const appRoot = new URL(script?.dataset.appRoot || '../../', document.baseURI);
  const manifestUrl = new URL(script?.dataset.activationManifest || '', document.baseURI);
  const state = {
    ready: false,
    code: 'LOADING',
    error: null,
    release: RELEASE
  };
  const modules = [
    ['BaumanUniversalLessonValidator', 'assets/js/platform/universal-lesson/lesson-schema-validator-v1.js'],
    ['BaumanUniversalLessonMigrator', 'assets/js/platform/universal-lesson/lesson-version-migrator-v1.js'],
    ['BaumanSubjectFactoryRegistry', 'assets/js/platform/universal-lesson/subject-factory-registry-v1.js'],
    ['BaumanUniversalLessonRenderer', 'assets/js/platform/universal-lesson/universal-lesson-renderer-v1.js']
  ];

  function loadModule(globalName, path, attributes) {
    if (global[globalName]) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      const element = document.createElement('script');
      element.src = new URL(path, appRoot).href;
      element.async = false;
      Object.entries(attributes || {}).forEach(function (entry) {
        element.dataset[entry[0]] = entry[1];
      });
      element.onload = function () {
        if (global[globalName]) resolve();
        else reject(new Error(globalName + ' did not register'));
      };
      element.onerror = function () {
        reject(new Error('Cannot load ' + path));
      };
      document.head.appendChild(element);
    });
  }

  async function start() {
    try {
      for (const entry of modules) await loadModule(entry[0], entry[1]);
      await loadModule(
        'BaumanL6ReferenceLessonRuntime',
        'assets/js/platform/universal-lesson/reference-lesson-runtime-v1.js',
        {
          appRoot: appRoot.href,
          activationManifest: manifestUrl.href
        }
      );
      const plan = await global.BaumanL6ReferenceLessonRuntime.bootstrap({
        appRoot: appRoot.href,
        manifestUrl: manifestUrl.href
      });
      state.ready = plan?.ok === true;
      state.code = plan?.code || 'BOOTSTRAP_FAILED';
      state.error = plan?.ok ? null : state.code;
      return plan;
    } catch (error) {
      state.ready = false;
      state.code = 'BOOTSTRAP_FAILED';
      state.error = String(error?.message || error);
      return { ok: false, blocked: true, code: state.code };
    }
  }

  global.BaumanL6ReferenceBootstrap = Object.freeze({
    release: RELEASE,
    start,
    selfCheck: function () {
      return {
        ok: state.ready,
        ready: state.ready,
        code: state.code,
        error: state.error,
        release: RELEASE
      };
    }
  });

  start();
})(window);
