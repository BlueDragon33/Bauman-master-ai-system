# Russian Learning App Refactor Audit

Date: 2026-09-23
Branch: `refactor/russian-learning-app-clean-20260923`
Scope: `subjects/russian/`

## Status

- PASS 1 — Source + UX audit: completed and browser/package-green at checkpoint `2abb7983aea58f8fda0353b347355ddf2fc681e6`.
- PASS 2 — Design system consolidation: in progress; begin from the green checkpoint and remove redundant presentation inheritance in bounded slices.
- Production publish: not authorized by this branch.

## PASS 1 findings

### KEEP

- Existing learner storage key and persisted learner state.
- Full route registry/deep-link compatibility.
- SRS, learning-state, learning-flow and capability progression runtimes.
- Handwriting Listen+Write, glyph authority and deterministic recognition.
- Speaking Coach, Academic Language bridge and AI Mentor read-only boundary.
- Offline/service-worker behavior and package materialization contracts.
- Foundation identity/context integration.

### REFACTOR

- Russian presentation shell and overview hierarchy.
- Vocabulary presentation and learning flow.
- Search presentation.
- Core CSS shell history and repeated layout generations.
- Static/browser acceptance tests that still described removed UI.

### MERGE

The former presentation stack was consolidated into one canonical Future UI layer.

Removed presentation assets:

- `assets/russian-reference-ui.css`
- `assets/russian-reference-ui-polish.css`
- `assets/russian-reference-ui.js`

Canonical presentation assets:

- `assets/russian-future-ui.css`
- `assets/russian-future-ui.js`

### REMOVE / stale contracts fixed

Stale preview, production, learning-flow, academic-language, AI-runtime and promotion validators that still required the deleted Reference UI assets were aligned to the canonical Future UI.

The browser acceptance contract was also corrected so it now:

- asserts the fixed right rail is absent;
- tests the compact primary learner navigation instead of removed secondary sidebar entries;
- validates the current Home hierarchy;
- validates vocabulary progressive disclosure as collapsed-by-default;
- exercises the real vocabulary audio control.

No deleted legacy presentation asset was restored to make CI pass.

## Green checkpoint before PASS 2

Checkpoint: `2abb7983aea58f8fda0353b347355ddf2fc681e6`.

All relevant gates passed together:

- Foundation Domain Model Gate;
- Windows checkout safety;
- Russian Reference UI Gate;
- Whole System Integration Gate, including direct and packaged Russian Future UI browser acceptance;
- Bauman Cloudflare Preview CI;
- Bauman Cloudflare Production Publish Gate CI.

The browser sequence also established these architectural corrections:

- primary **Nghe & Nói** uses the required/core `speaking.json` path via `learning/practice`;
- advanced `dialogue` remains a preserved deep-link route and keeps its optional/lazy A-Z dataset boundary;
- the 8,000-word vocabulary dataset stays deferred until Vocabulary is opened;
- Future UI repeated upgrade remains DOM-idempotent after queued render work settles;
- desktop uses the 220 px sidebar token, laptop widths through 1320 px use the 190 px compact token, and tablet/mobile keep the full-width navigation transition.


## Technical debt inventory

Current audit snapshot before deeper PASS 2/PASS 17 cleanup:

- `core.css`: ~735 KB.
- `core.css`: more than 10,000 `!important` declarations.
- `russian-future-ui.css`: ~48 KB and 329 `!important` declarations before PASS 2 tokenization.
- Repeated shell definitions found in `core.css`:
  - `.app`: 13 definitions;
  - `.sidebar`: 16 definitions;
  - `.main`: 20 definitions;
  - `.nav button`: 7 definitions.
- The canonical Future UI owns exactly one MutationObserver.
- `core.js` owns no MutationObserver.
- Speaking Coach owns a separate view-scoped MutationObserver; it is not merged without runtime evidence because it has a distinct learning responsibility.

These numbers are audit evidence, not a reason to mass-delete CSS blindly. The cleanup rule is root-cause-first with browser regression coverage.

## PASS 2 design-system direction

A canonical token contract is being introduced for:

- spacing scale;
- radius scale;
- font scale;
- content max width;
- desktop and compact sidebar widths;
- card padding;
- section gap;
- control height;
- motion duration.

The first tokenized invariants keep the accepted geometry:

- desktop sidebar: 220 px;
- compact/laptop sidebar: 190 px;
- content max width: 1500 px;
- section rhythm: 12 px;
- canonical fast motion: 180 ms.

Browser geometry remains the authority for rendered behavior; static tests only lock architectural invariants.

## Safety invariants

This refactor must not:

- reset learner storage;
- mutate mastery from presentation code;
- reintroduce Vietnamese/English translation as the visible vocabulary meaning;
- duplicate SRS/audio/progress engines;
- break direct or packaged routes;
- break offline/package behavior;
- weaken CI to hide missing runtime behavior;
- deploy production implicitly.

## Next controlled work

1. Finish PASS 2 token consolidation and validate browser geometry.
2. PASS 3 application shell cleanup without a second presentation layer.
3. PASS 4 information architecture confirmation around six primary destinations.
4. Continue the requested PASS sequence with focused gates.
5. Defer broad legacy-core deletion to evidence-backed cleanup; do not mass-delete by filename or version label alone.
