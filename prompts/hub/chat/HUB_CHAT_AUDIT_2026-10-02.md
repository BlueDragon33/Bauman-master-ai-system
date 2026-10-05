# BAUMAN HUB CHAT AUDIT — 2026-10-02

Scope: Bauman Hub only. This audit intentionally does not read or modify `prompts/subjects/**` or subject-app internals.

Runtime baseline reviewed: `main@dc7fd3d8d90b6a84504f35ae2049752c6f339462`.

## User execution choice

The user explicitly chose to skip the Codex execution step for now and continue in the normal Chat plane.

`HUB-BOOTSTRAP-RECONCILE-001` remains a prepared implementation packet, but it is not treated as executed and no Codex evidence is fabricated.

## Current Hub findings

### 1. Subjects page contains presentation-time sample truth

`assets/js/subjects-reference-v1.js` still contains hard-coded reference data such as:
- a 2025 semester selector;
- example teacher names;
- example session counts;
- fallback progress values;
- March 2025 deadlines;
- March 2025 notes;
- prewritten AI suggestions.

Some rows now read live Hub state, but the reference constants can still appear as if they were real learner data.

Decision:
- normal runtime must not present fabricated/sample academic facts as current truth;
- subject cards should consume registered descriptors and exported Hub-normalized summaries;
- missing values must render as unavailable/not yet supplied rather than invented progress, teacher, deadline or session counts;
- demo/reference fixtures, if retained for visual tests, must be isolated from production runtime.

### 2. Subjects page exposes a direct subject editor launch

The Hub presentation currently exposes `Dữ liệu môn` and routes to `openSubjectEditor(id)`, which resolves subject `editorPath`.

This conflicts with the new Hub boundary.

Decision:
- normal learner Hub must not open subject private authoring/editor surfaces directly;
- any future subject authoring launch requires an explicit registered versioned capability/launch descriptor;
- otherwise the action is absent/disabled and the Hub reports that the external capability is unavailable.

### 3. Schedule page is closest to the desired ownership model

`assets/js/schedule-reference-v1.js` primarily derives:
- current week/date dynamically;
- events from Hub-owned `state.schedule.entries`;
- subject names from Hub state;
- progress from current Hub scheduler state;
- notes from a clearly local Hub notes store.

Decision:
- keep Schedule as a Hub-owned canonical surface;
- presentation may derive summaries from Hub schedule state;
- it must not infer subject mastery or mutate private subject state;
- launching a subject from a scheduled item must go through the registered subject launch/command boundary.

### 4. Thesis/Research page is still largely a reference/mock workspace

`assets/js/thesis-reference-v1.js` contains static March/April 2025 tasks, milestones, chapter percentages, heatmap data, notes and AI items.

Decision:
- replace mock progress with Hub-owned research workspace state;
- new users start with empty/explicitly unconfigured research state, not fake 65% progress;
- Hub may own planning metadata, notes, milestones, attachments and cross-course research summary;
- research subject/module internals remain external and API/Contract-only.

### 5. Legacy Hub runtime still contains direct subject paths

`assets/js/main.js` currently maintains `mainPath` / `editorPath` and launches subject pages directly, although it also has a bounded `postMessage` bridge.

Decision:
- treat direct path maps as legacy compatibility only;
- the target architecture is a registered Subject Descriptor + Launch Descriptor + versioned capability contract;
- Hub UI consumes a normalized read model;
- direct subject editor access is not part of normal Hub UX;
- no new integration may depend on subject DOM, localStorage, private DB or private runtime files.

## Canonical Hub read model target

Each registered subject should be normalized to a Hub-side record with only approved fields, for example:

- `subjectId`
- `displayName`
- `icon`
- `stage/semester metadata`
- `health/status`
- `progressSummary` when explicitly exported
- `resumeSummary` when explicitly exported
- `assessmentSummary` only when explicitly exported
- `launchDescriptor`
- `contractVersion`
- `lastUpdatedAt`
- `freshness/stale state`

Missing data must remain missing/unavailable; do not substitute fabricated zeroes or demo values.

## UX truth states

Hub cards/panels should distinguish:
1. **Current** — live/valid contract data;
2. **Stale** — cached summary with provenance and freshness warning;
3. **Unavailable** — capability/data is not exported or subject app is unavailable;
4. **Local Hub data** — user-created Hub notes/plans that belong to Hub itself.

These states should be visible but visually calm.

## Chat-plane continuation order

### HUB-C1 — Truth-source map
Map every visible field on Home, Subjects, Schedule and Research/Thesis to:
- Hub canonical state;
- registered subject contract;
- derived Hub value;
- local Hub-only user data;
- forbidden sample/mock source.

### HUB-C2 — Primary-page UX contract
Define the stable information architecture and component contract for:
- Home;
- Roadmap;
- Subjects;
- Schedule;
- Research/Thesis.

### HUB-C3 — Subject integration contract cleanup
Specify the migration from direct `mainPath/editorPath` assumptions to registered launch/capability descriptors, without touching subject internals.

### HUB-C4 — Acceptance matrix
Define browser/mobile/accessibility/data-truth/boundary tests before any future implementation or release.

## Non-negotiable boundary

Do not read or modify:
- `prompts/subjects/**`;
- `subjects/**`;
- subject private runtime/database/content/assessment/mastery internals.

Subject interaction is contract-only.
