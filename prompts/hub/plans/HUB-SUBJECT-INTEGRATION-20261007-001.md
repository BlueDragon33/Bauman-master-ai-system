# Hub subject integration r1 implementation plan

Spec: `prompts/hub/CURRENT_WORK_PACKET.json`, HUB-SUBJECT-INTEGRATION-20261007-001 r1.
Execute inline with superpowers:executing-plans, TDD, and one fresh whole-branch review.
Before SHA: ffd1db07a7fd121aede14a08fceab6a9d0698235. Initial observed main: 84215c8b1ec32a29dd9f72291060418ad292d575.

Goal: separate application launch/editor configuration from personal learner data while preserving declared public launch/task/capability contracts and accepted storage r5.
Architecture: a Hub-owned descriptor/config module keeps device-global configuration in IndexedDB independently of the unchanged personal database schema. A launch adapter consumes safe descriptors and existing Hub task/render callbacks. Compatibility wrappers preserve existing callers. No subject files or APIs are inspected or invented.
Tech: existing browser JavaScript, IndexedDB, Node and Playwright; no new dependencies.

## Constraints

- No read/edit of subjects/** or prompts/subjects/**; local servers reject both before filesystem access.
- Preserve accepted storage r5, Device Gate, profile authority, five primary routes and all original CI tests.
- Portable learner restore must never change application/device configuration.
- First successful legacy custom-configuration claim is global, atomic and retry-safe; existing explicit device overrides win.
- Invalid or missing launch configuration yields UNAVAILABLE. An editor path is not an authoring capability.
- LOCAL_STABLE only. No main merge or production deployment.

## Review focus

- Migration failure retains the original recovery source and does not fabricate a successful launch configuration.
- Multiple tabs/scopes cannot overwrite the first successful global migration or lose unrelated admin edits.
- A malicious or old learner backup cannot reintroduce transport fields or alter device configuration.
- Missing/unsafe targets cause no frame/window navigation and preserve source/origin checks.
- Admin editor access remains permission-gated; learner surfaces expose none.

## Tasks

### Task 1: Rebaseline and ownership inventory
- [x] Fetch current main, create a new Codex branch, verify accepted storage owners unchanged since merge ec970ccf.
- [x] Inventory raw configuration readers/writers in allowed Hub files and current regression fixtures.
- [x] Record preflight and lifecycle in the execution ledger.

### Task 2: Descriptor/config ownership and migration
- [x] Write failing normalization, credential-free/config-free backup and real IndexedDB migration tests.
- [x] Implement hub-subject-config.js with canonical declared targets, safe descriptors, independent device-global persistence and one-time legacy override claim.
- [x] Strip application transport data from normalized/persisted/exported learner records; do not migrate configuration from imported learner backups.
- [x] Verify RED then GREEN, failure/retry, reload, profile isolation and accepted storage regressions.

### Task 3: Launch adapter and presentation integration
- [x] Write failing real-browser valid/missing/unsafe descriptor and task-handoff tests.
- [x] Implement hub-subject-launch.js using existing task query, rendering and window/origin contracts.
- [x] Delegate legacy app launch wrappers; remove raw path fields and learner editor actions; isolate admin config/editor access.
- [x] Retest Home/continue/search/mentor/Schedule/reference launch paths with public fixtures only.

### Task 4: Regression gates
- [x] Adapt the existing learner-path injection test to prove configuration independence; add invalid application-target rejection tests.
- [x] Add new static/browser suites to the original workflow without deleting or reducing any existing steps.
- [ ] Run targeted and full Hub local source/package/managed regressions; run the original full-system gate on GitHub.

### Task 5: Review and exact-head evidence
- [ ] Fresh whole-branch review restricted to allowed Hub files, followed by RED/GREEN fixes for material findings.
- [ ] Update result/state, packet/registry lifecycle consistency and all acceptance evidence.
- [ ] Validate exact final code and completion HEAD locally and on GitHub; record exact SHA through the existing non-self-referential evidence convention.
- [ ] Stop pending Chat review; keep any review PR draft; no main merge/deploy.
