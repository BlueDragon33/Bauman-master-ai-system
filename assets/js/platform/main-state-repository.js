(function (global) {
  'use strict';

  const config = global.BAUMAN_RUNTIME_CONFIG || {};
  const storage = global.BaumanPlatformStorage;
  const compatibility = config.compatibility || {};

  if (!storage) {
    throw new Error('BaumanMainStateRepository requires BaumanPlatformStorage');
  }

  const keys = Object.freeze({
    mainState: compatibility.legacyMainStateKey || 'bauman_main_all_phases_subjects_v1',
    users: compatibility.legacyUsersKey || 'bauman_main_users_fullcode_v1',
    currentUser: compatibility.legacyCurrentUserKey || 'bauman_current_user_fullcode_v1'
  });

  function readJSON(key, fallback) {
    return storage.getJSON(key, fallback);
  }

  function writeJSON(key, value, metadata) {
    storage.setJSON(key, value, metadata || null);
    return value;
  }

  function readMainState(fallback) {
    return readJSON(keys.mainState, fallback);
  }

  function writeMainState(value, metadata) {
    return writeJSON(keys.mainState, value, {
      kind: 'main-state',
      ...(metadata || {})
    });
  }

  function readUsers(fallback) {
    return readJSON(keys.users, fallback);
  }

  function writeUsers(value, metadata) {
    return writeJSON(keys.users, value, {
      kind: 'legacy-users-cache',
      ...(metadata || {})
    });
  }

  function readCurrentUser(fallback) {
    return readJSON(keys.currentUser, fallback);
  }

  function writeCurrentUser(value, metadata) {
    return writeJSON(keys.currentUser, value, {
      kind: 'legacy-session-cache',
      ...(metadata || {})
    });
  }

  function clearCurrentUser(metadata) {
    storage.removeItem(keys.currentUser, {
      kind: 'legacy-session-cache',
      ...(metadata || {})
    });
  }

  function mutateMainState(mutator, fallback, metadata) {
    if (typeof mutator !== 'function') throw new TypeError('mutator must be a function');
    const current = readMainState(fallback);
    const draft = current && typeof current === 'object'
      ? JSON.parse(JSON.stringify(current))
      : current;
    const next = mutator(draft);
    const value = next === undefined ? draft : next;
    return writeMainState(value, {
      kind: 'main-state-mutation',
      ...(metadata || {})
    });
  }

  function rawSnapshot() {
    return {
      mainState: storage.getItem(keys.mainState),
      users: storage.getItem(keys.users),
      currentUser: storage.getItem(keys.currentUser)
    };
  }

  global.BaumanMainStateRepository = Object.freeze({
    version: 1,
    keys,
    readMainState,
    writeMainState,
    readUsers,
    writeUsers,
    readCurrentUser,
    writeCurrentUser,
    clearCurrentUser,
    mutateMainState,
    rawSnapshot
  });
})(window);
