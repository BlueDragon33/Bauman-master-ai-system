# Russian P6 Phase Record

1. **Mission:** establish one truthful Listening · Speaking · Audio interaction layer without creating a second mastery, SRS, dialogue, or assessment engine.
2. **Preconditions:** P1–P5 PASS on main; P4 mastery truth and P5 adaptive ownership remain authoritative.
3. **Inputs:** P2/P3 speaking/dialogue content, P4 evidence boundary, P5 adaptation contract, current core/Speaking Coach runtime.
4. **Canonical owners affected:** `speech-interaction-engine.js` owns audio/TTS, SpeechRecognition adapter and transient MediaRecorder; core owns dialogue orchestration; Speaking Coach owns learner workflow/presentation. P4/P5 ownership unchanged.
5. **Allowed changes:** adapter extraction, signal-policy repair, local transient recording, offline/fallback integration, owner-aligned regression tests.
6. **Forbidden changes:** synthetic mastery, ASR pronunciation authority, duplicate recorder/recognition engines, destructive learner-state migration, P4/P5 ownership changes.
7. **Required deliverables:** P6 constitution, audio owner map, recording contract, recognition adapter contract, pronunciation signal policy, dialogue/deep-speaking contracts, offline policy, browser matrix, performance baseline, acceptance report and evidence index.
8. **Runtime tests:** P6 speech interaction runtime PASS; source and packaged Russian browser acceptance PASS.
9. **Static/schema tests:** P6 interaction constitution, Russian Reference UI, listening/visual-first, handwriting/audio compatibility and system integration PASS.
10. **Data/state migration tests:** additive runtime only; existing speaking state retained; voice blobs remain transient and are not migrated/persisted.
11. **Regression scope:** P1 browser forensic, P4 mastery, P5 adaptive, Future UI, handwriting/listen-write, offline shell, whole-system source/package parity.
12. **Evidence index:** `RUSSIAN_P6_EVIDENCE_INDEX.md`; Actions run `36711679569`; performance baseline file.
13. **Risk register delta:** direct browser ASR ownership removed; false pronunciation authority removed; local recorder added with denial/unsupported fallback. External Cloudflare branch build remains P14/P17 follow-up.
14. **Rollback plan:** revert P6 commits, remove interaction-engine include/cache entry and restore prior core/coach adapter calls; no voice/state migration rollback is required.
15. **Exit gate:** **PASS** — required P6 static/runtime/browser/package evidence is complete with no unresolved scoped BLOCKER/CRITICAL.
16. **PR/merge rule:** PR #173 may merge only with the validated final head and clean GitHub phase gates; Cloudflare feature-branch deployment is not P6 production authority.
17. **Production effect:** none. P17 remains the only production publish/verification authority.

- **Phase:** P6 — Listening · Speaking · Audio Interaction Engine
- **State:** PASS
- **Base main SHA:** `40186868af15edd9215d5a4e0e8bb939fd0779ba`
- **Validated runtime head:** `b48a43364f975fa33a75022bc4e0636b52753ef0`
- **Change class:** E — architecture/owner hardening, with no production publish.
- **Known limitations:** browser speech/recognition quality and API support vary; P6 intentionally treats these as optional/non-authoritative.
- **Next-phase contract:** after merge, P0–P6 may be declared `FOUNDATION_LOCKED`. P7 may validate linguistic truth but may not casually alter P1–P6 contracts.
