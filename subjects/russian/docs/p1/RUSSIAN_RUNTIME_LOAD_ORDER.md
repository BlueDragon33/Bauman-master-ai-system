# Russian P1 Runtime Load Order

Base SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`

## CSS load order
1. `assets/core.css`
2. `assets/russian.css`
3. `assets/russian-future-ui.css`
4. `assets/learning-state.css`
5. `assets/content-contract.css`
6. `assets/learning-flow.css`
7. `assets/vocab-srs.css`
8. `assets/speaking-coach.css`
9. `assets/academic-language.css`
10. `assets/capability-progression.css`
11. `assets/runtime-optimizer.css`
12. `../../platform/ui/bauman-ui.css?v=1`

## JavaScript load order
1. `assets/subject-adapter.js`
2. `assets/ui-cleanup-contract.js`
3. `assets/content-contract.js`
4. `../shared/host-bridge.js`
5. `../../foundation/domain-model/canonical-identity-runtime.js`
6. `../../foundation/domain-model/identity-overlay-store.js`
7. `../../foundation/domain-model/legacy-snapshot-extractor.js`
8. `../../foundation/domain-model/canonical-read-projection.js`
9. `../shared/foundation-identity-bootstrap.js`
10. `../shared/foundation-identity-persistence.js`
11. `../shared/foundation-identity-projection.js`
12. `../shared/foundation-canonical-context.js`
13. `assets/planning-bridge.js`
14. `assets/russian-optional-data-loader.js`
15. `assets/listen-write-factory.js`
16. `assets/core.js`
17. `assets/learning-state.js`
18. `assets/learning-flow.js`
19. `assets/handwriting-glyph-authority.js`
20. `assets/handwriting-recognition.js`
21. `assets/vocab-srs.js`
22. `assets/speaking-coach.js`
23. `assets/academic-language.js`
24. `assets/capability-progression.js`
25. `assets/ai-mentor-guard.js`
26. `assets/runtime-optimizer.js`
27. `assets/russian-future-ui.js`
28. `../../platform/ui/bauman-ui.js?v=1`

## Direct observations
- `index.html` directly loads 12 stylesheet(s) and 28 script(s).
- The Russian subject manifest declares tabs: `overview`, `learning`, `dialogue`, `writing`, `media`, `vocab`, `grammar`, `mindmap`, `storage`.
- Direct-load order is evidence of bootstrap order only. Async work, DOMContentLoaded handlers, observers and post-render mutations still require browser/runtime tracing.
- P1 status for timing/race ownership remains `VALIDATING` until browser evidence is attached.
