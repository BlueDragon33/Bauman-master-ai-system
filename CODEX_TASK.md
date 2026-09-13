# CODEX_TASK

Task: `THEORY_C01_L06_CHROMIUM_FINAL_ACCEPTANCE_PASS_19`
Mode: current-main local HTTP and Chromium final runtime acceptance; no publication.

## Work handoff execution order — mandatory
When this project is continued in ChatGPT Work, do not jump directly to implementation or publishing. Execute in this order:

### Phase W0 · GitHub reconciliation first
Before changing runtime or the wider system:
- inspect the current `main` HEAD, `CODEX_STATE.md`, `CODEX_TASK.md`, accepted reports, active/merged PR state and relevant CI/workflow results;
- reconcile what has actually been committed with the project state recorded in the repo;
- identify stale/duplicate branches, obsolete temporary versions, unmerged work and any mismatch between claimed state and GitHub evidence;
- preserve accepted §1.4/§1.5 behavior and the academically accepted §1.6 package;
- produce a concise reconciliation checkpoint before proceeding.

Do not redo accepted work merely because an older branch/file exists. GitHub `main` plus accepted reports are the primary operational truth unless a verified inconsistency is found.

### Phase W1 · Finish the current §1.6 runtime workflow
After W0 reconciliation, execute Pass 15 → Pass 19 sequentially with gates:
1. Pass 15 · Durable merge + static verification.
2. Pass 16 · Runtime source registration.
3. Pass 17 · Multi-lesson Reader/Reader Pro richness integration and verification.
4. Pass 18 · Selection/route/identity synchronization verification.
5. Pass 19 · Chromium/browser revalidation and final runtime acceptance.

If any pass fails, stop at that gate, repair it and re-verify before advancing.

### Phase W2 · Whole-system comprehensive work
Only after §1.6 runtime acceptance, review and improve the project as one integrated system rather than treating §1.6 in isolation. Cover the repository-level architecture and the active Bauman system end-to-end, including:
- Bauman Master Hub and subject Web Apps;
- Math and Russian subject integration/data contracts;
- shared navigation, identity, state/progress handshakes and subject boundaries;
- runtime packaging/deployment readiness;
- responsive behavior, offline/PWA behavior where already part of the architecture, error states and recovery;
- existing administration/device/access flows that belong to this repository/system;
- consistency of UI/content/runtime contracts;
- removal or quarantine of stale temporary paths/duplicate versions when safe;
- regression protection for already accepted lessons/apps.

Do not perform cosmetic rewrites that break accepted contracts. Prefer clean, unified architecture and explicit compatibility checks.

### Phase W3 · Whole-system QA gate
Before any ChatGPT Site publication:
- run the strongest available static, integration and browser checks;
- verify critical routes and subject entry points;
- verify there are no blocking console/page/network errors in tested flows;
- verify accepted lesson slide counts and identities remain intact;
- verify no regression in previously accepted §1.4/§1.5 and completed §1.6 runtime;
- record remaining non-blocking limitations separately from blockers.

Publishing is prohibited while a blocking defect remains.

### Phase W4 · Publish to ChatGPT Site last
Only after W0–W3 are complete and the whole-system QA gate is PASS:
- publish the approved final system to ChatGPT Site using the existing project/site workflow available in Work;
- do not publish an intermediate/debug build as the final site;
- after publication, verify the live site/critical routes and record the published state.

The required order is therefore:
`GitHub reconciliation → §1.6 runtime completion → whole-system comprehensive work → whole-system QA → ChatGPT Site publication`.

## Read only what is needed
1. `CODEX_STATE.md`
2. `subjects/math/THEORY_C01_L06_RUNTIME_PASS18.json`
3. `subjects/math/THEORY_C01_L05_RUNTIME_PASS19.json` only as browser-suite precedent
4. the active Math index/runtime load order and existing E129/E202/E210/E211/E240-E245 public self-check APIs
5. the accepted L04-L06 durable/slideshow artifacts only as needed to compare counts and identities.

## Goal
Revalidate the current committed §1.6 runtime in Chromium, together with §1.4/§1.5 regressions, and issue final runtime acceptance only when all browser gates pass.

## Preconditions
- Pass 18 status is `PASS_18_SELECTION_ROUTE_SYNC_STATIC_VERIFY_PASS`.
- Selection/route/identity synchronization is deterministic for §1.4–§1.6.
- Current `main` contains the exact Pass 15–18 commits and the working tree is clean before browser execution.
- Publication remains blocked until W2 and W3 also pass.

## Chromium requirements
- Serve the repository over local HTTP; do not test from `file://` and do not publish.
- Test §1.4, §1.5 and §1.6 from the active lesson selection into the existing Reader/Reader Pro presentation flow.
- For every lesson verify 22 visible runtime slides, first/last navigation, exact route/deck/chip/actions/richness identity and required richness markers with no stale cross-lesson residue.
- For §1.6 verify the eight-area Reference view, twelve-section Full View, separate E235 formula modal and accepted-field richness behavior.
- Run desktop plus narrow responsive smoke and confirm primary controls remain usable.
- Capture console errors, page errors and failed local HTTP/network requests.
- Verify E235 is present and E236/E237/E238 are absent.

## Browser acceptance report
Create `subjects/math/THEORY_C01_L06_RUNTIME_PASS19.json` containing:
- exact tested commit, local URL, browser engine and execution time;
- per-lesson reader count, identity, richness, slide navigation and modal evidence;
- §1.6 desktop and narrow responsive smoke evidence;
- console/page/local-HTTP error arrays;
- final protected-runtime state and explicit no-new-engine/no-compression/no-prohibited-inference assertions.

## Runtime protection
Do not modify during Pass 19 unless browser evidence exposes a defect. If it does, stop the gate, make the narrowest repair and rerun the entire affected browser matrix before acceptance. Preserve:
- durable theory content;
- accepted Reference, Full View, Normalization or Slideshow artifacts;
- E202/E211 and the established reader/slideshow architecture;
- E235.

Keep E236, E237 and E238 disabled.

## Acceptance
Pass only when the full Chromium suite is clean and §1.6 is browser accepted with §1.4/§1.5 regressions intact.
Then set status `ACADEMIC_14_OF_14_PASS_RUNTIME_5_OF_5_BROWSER_ACCEPTED`, advance to `WHOLE_SYSTEM_COMPREHENSIVE_AUDIT_W2`, and keep publication blocked until W2/W3 PASS.
