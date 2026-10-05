# Hub truth UX cleanup implementation plan

Goal: execute HUB-TRUTH-UX-CLEANUP-002 revision 3 on fresh current main.
Spec: CURRENT_WORK_PACKET.json. Architecture: retain existing truth cleanup; add one Hub subject adapter for descriptors, approved summaries, freshness, coverage and legacy launch. Route owners project this adapter; Research owns a versioned workspace in the existing Hub state.

Baseline: ddcc314d0cbbcb61026a5be21fb425ff0f614ba5. Packet baseline b6df392c5ab935bed4924b07b9bbe2e95efb2c8e is an ancestor. Main already includes HUB-TRUTH-20261003-001; never replace its fixes with old branch runtime. Bootstrap only missing Hub entries/bridge/schema/audit files. Preserve main Constitution and existing Hub documents.

Constraints: five routes; subject internals and prompts never read/edited; no production publish or main merge; default-deny unregistered external capabilities. User explicitly requests continuous native execution without phase approval.

Review focus: invalid numeric values; stale external snapshots; disabled/unsafe launches; persisted older local research data; competing route renders.

- [x] Adapter: tests/hub-subject-adapter-unit.mjs reproduces empty/boolean-as-zero, freshness, aggregate coverage and denied authoring. assets/js/hub-subject-adapter.js exposes progress, averageProgress, read, resolveLaunch. Load before main. Replace direct learner launch transport in main; remove Subjects editor control. Preserve existing validated query/postMessage transport.
- [x] Owners: Home, Overview, Roadmap, Subjects and primary chrome consume approved read-model progress, show status and coverage; remove redundant Roadmap render from V6. Browser tests verify zero/missing/stale across five routes and settled mutation behavior.
- [x] Research: versioned state.researchWorkspace contains configured topic, tasks, notes, milestones, attachments and work packages; migrate older user-created local tasks/notes without sample IDs and preserve originals. Explicit setup and local persistence, no mastery. Browser verifies setup, reload and local work-package statuses.
- [x] QA: unit/static gates then Subjects/Schedule/Thesis and Hub responsive regression; screenshots at all packet widths; focus/contrast and Hub auth/offline checks. Serve Hub with subject paths blocked so acceptance cannot read internals. Whole-system gates requiring subject internals are not run; record scope limitation honestly.
- [x] Evidence: exact before/after runtime SHA, commands and exit codes, acceptance/boundary matrix and blockers; review diff, commit, retest exact HEAD; preserve result and state in bridge for Chat review.

Late reconciliation: main advanced to 3b541d76b0ee16208a5835073cbce42bf2f0d440 during validation. Hub runtime/contracts unchanged; accepted prior packet governance preserved in history. Fresh implementation rebased onto this main; final beforeSha is this reconciled baseline. No old prompt branch merge/rebase/cherry-pick.

Final main reconciliation: governance-only main@68024789d38f5c1f35d74fe818ad117125feb43f preserved; Hub runtime/contracts/tests unchanged. Exact full regression passed at 5023752bb2dfa66012090ff3419a1c58a3128717 before rebase. Blob identity is checked and full acceptance will run again at final review HEAD.

Completion: exact runtime 5023752bb2dfa66012090ff3419a1c58a3128717 (byte-identical after reconciliation at bf9b9e1f4d5ab97f73caf6ce43642aa27ae8b02b) passed all 19 affected static/unit/security/browser gates and 55 route/viewport observations. All five Important review findings received failing regression cases and passing fixes. See CURRENT_EXECUTION_RESULT.json for limitations and provenance. The final metadata-only review HEAD is independently certified with unchanged runtime/test blobs and stored in local final-head evidence plus a Git note. No main merge or production publish.
