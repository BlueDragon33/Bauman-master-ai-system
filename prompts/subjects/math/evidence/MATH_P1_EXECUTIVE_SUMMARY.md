# MATH01 · FORENSIC BASELINE — EXECUTIVE SUMMARY

Status: PASS  
Subject: Mathematics  
Base main: `b2b62fe610aa34229581d3d00f9fbc4cdb6d9b9b`  
Runtime-equivalent verified main: `db747b1e6c65e5eb2a28cfd7ea2aeee8e3f9872c`  
Current PR: #227  
Production/runtime mutation in MATH01: **NO**

## 1. Scope proven

The current learner entry is `subjects/math/index.html`. It loads 40 unique JavaScript files and 23 unique CSS files before lazy/runtime data activity. The loaded source-weight baseline is 591,392 bytes JavaScript + 1,261,061 bytes CSS = 1,852,453 bytes uncompressed source, excluding JSON, fonts and images.

The runtime is layered rather than single-owner:
- E129 owns the primary theory shell/import surface;
- E240 mediates the durable theory-content source;
- E244/E245/E241 own optional theory artifact registry, authoritative lesson routing and artifact reading;
- Math Navigation owns primary learner routes;
- Math Learning Flow owns local lesson progress/completion;
- Activity Studio owns deterministic per-exercise feedback for a narrow answer contract;
- Activity Mastery is a UI projection only and explicitly declares no grading/academic-write authority;
- Workspace owns generic local vector/matrix/function visualization tools;
- service worker owns the Math offline shell cache.

`core-subject.js` exists but is not loaded by current `index.html`; it is legacy/non-current unless another entry proves otherwise.

## 2. Curriculum/data reality

Current structural curriculum:
- 10 stages;
- 56 chapter-spine entries;
- 12 disciplines;
- chapter distribution: vn 6, prep 12, hk1 6, hk2 6, hk3 6, hk4 4, phd_bridge 4, phd_y1 4, phd_y2 4, phd_thesis 4.

Current split-content sidecars share the same set of **86 lesson IDs across 17 chapter IDs**:
- formula: 264 records;
- exercise: 704;
- application: 176;
- simulation: 176;
- professor Q&A: 88;
- review packs: 88;
- question bank: 528.

The professor-QA and review-pack files each contain three records for `MATH-VN-C02-ma_tran_va_phep_bien_oi_-L06-matrix-to-pca-linear-model-e143`; this explains 88 records over 86 unique lesson IDs.

The very large `theory_lecture_content.json` record count is deliberately marked **UNRESOLVED BY CONNECTOR** rather than inferred. Runtime tests prove the durable theory source is usable and the accepted L05 lesson has 22 slides, but MATH01 does not fabricate a whole-file record count.

## 3. Metadata drift

Two metadata layers are stale relative to current sidecars:
- `data/content-manifest.json` (updated 2026-06-22) still reports many content counts as 18 and `activeStatus.content = empty_by_design`;
- `subject-manifest.json` still contains historical/planned bulk counts while its newer integration metadata describes a different active theory footprint.

Therefore planned/legacy manifest counts are **not accepted as current mathematical-content truth**.

## 4. Mathematical truth/evaluator reality

### Formula rendering
Current Reader formula rendering is custom JavaScript, not MathJax/KaTeX:
- E224 parses formula/note segments and applies textual symbol transforms;
- E234 uses a small balanced parser for relations, additive terms, fractions, radicals, groups and selected notation;
- E235 applies semantic subscript/alignment corrections.

This is a finite renderer, not a CAS.

### Answer evaluation
Activity Studio auto-grades only when the source contract declares:
- `multiple_choice`;
- `numeric`;
- `exact_text`.

Numeric answers use `Number(...)` and `numericTolerance`; the others use normalized string equality. No current general symbolic equivalence engine or external CAS was proven.

Therefore equivalence cases such as `x+x` vs `2x`, factorized vs expanded forms, set/interval notation, ±, units and domain-equivalent expressions remain unsupported unless a specific source contract handles them.

### Mastery truthfulness
A concrete C4 mismatch exists:
- Lesson Check is self-report (`understood` / `review`);
- lesson completion requires visited source-backed steps + a completed Lesson Check;
- Activity Mastery labels an `understood` item as `mastered` after lesson completion;
- the same module declares `gradingAuthority:false` and `academicWrites:false`.

This is not accepted as canonical mastery evidence. MATH03/MATH05 must rename/redefine the projection or connect it to real evidence under C4.

## 5. State/persistence reality

Current local stores proven:
- `bauman_math_learning_flow_v1`;
- `bauman_math_learning_notes_v1`;
- `bauman_math_learning_bookmarks_v1`;
- `bauman_math_workspace_v1`;
- `bauman_math_formula_favorites_v1`;
- `bauman_math_professor_drill_v1`;
- `bauman_math_activity_notes_v1`;
- `bauman_math_activity_session_v1`;
- `bauman_math_e129_theory_content_overlay_v1`;
- `bauman_math_e129_theory_content_report_v1`.

No current Math IndexedDB or Math-owned backend write path was proven in the loaded learner runtime. The offline service worker caches the shell and uses network-first for JSON, stale-while-revalidate for static assets.

## 6. AI reality

`#aiBtn` / “AI Mentor” exists in the shell, but no loaded Math provider/context/scoring implementation was proven. It is classified as **UNPROVEN PLACEHOLDER SURFACE**, not a mathematical or assessment authority.

## 7. Test trust

Current-main Whole System Integration Gate run **37094380012** succeeded on runtime-equivalent SHA `db747b1...`. Its browser-system job explicitly passed:
- Math Study Command Center browser acceptance;
- Math learner journey browser acceptance.

What these prove:
- real E186 lesson selection;
- durable theory source use;
- Lesson Check/completion persistence;
- reload resume;
- offline-readable learner state;
- review projection;
- local-only/no-academic-write Command Center policy;
- 1440 / 768 / 390 responsive checks in Command Center;
- 390 mobile overflow check in learner journey.

What they do not prove:
- symbolic equivalence/CAS;
- proof grading;
- complete C2 viewport matrix;
- screen-reader acceptance;
- WCAG conformance;
- real AI tutor behavior;
- production performance targets.

PR #227 forensic run **37096211260** captured the missing baseline and PASSed:
- 7 viewports (1920/1440/1280/1024/768/430/390): **0 horizontal overflow** at every size;
- controls below 44px: 10–15 depending on viewport — accessibility/touch debt, not hidden;
- keyboard focus smoke: first 12 focusable controls showed a visible 3px solid outline;
- buttons without accessible name: 0/481;
- inputs without an associated label: **19/30**;
- math semantic nodes with `role="math"`: **0**;
- Math Lab SVG exposes `role="img"` and `aria-label="Mô phỏng Toán"`.

Browser-run performance baseline on GitHub Actions:
- navigation load event: **281.7 ms**; DOMContentLoaded: **203.2 ms**;
- 95 resources; decoded resource total: **18,425,035 bytes**;
- largest/slowest observed resource: `data/lessons.json`, **7,822,102 decoded bytes**, ~289.7 ms;
- Roadmap route: **104.62 ms**;
- accepted L05 lesson open: **184.03 ms**;
- E234 custom formula render, 500 iterations: **35.4 ms total / 0.0708 ms average** in this probe;
- Math Lab open: **42.34 ms**;
- Formula Library open: **64.81 ms**, 325 visible/listed items;
- eight Roadmap↔Learn cycles showed the same coarse Chromium `performance.memory.usedJSHeapSize` snapshot (64 MB before/after). This is a smoke baseline, not proof of absence of leaks.

Capability probe confirmed `symbolicEvaluator:false`, `externalCAS:false`, `aiMathProvider:false`.

## 8. Root causes grouped

1. **Architecture / ownership layering** — many historical override layers remain in one runtime and some responsibilities are split by load order.
2. **Metadata drift** — manifests/planned counts are not synchronized with current split-content records.
3. **Curriculum truth duplication** — JSON spines coexist with hard-coded hierarchy/routing metadata in presentation JavaScript.
4. **Expression/equivalence gap** — evaluator is narrow deterministic matching, not mathematical equivalence.
5. **Assessment/mastery semantics** — self-report + completion is displayed using mastery language without mastery authority.
6. **Renderer specialization debt** — custom formula parser covers selected notation only and is patched by multiple generations.
7. **Capability placeholders** — AI entry exists without a proven Math AI provider.
8. **Baseline coverage gaps** — current tests are strong for key journeys but not complete accessibility/performance/math-equivalence evidence.

## 9. Keep / refactor / retire direction

**KEEP**
- durable E240 theory-source bridge until MATH02 defines replacement migration;
- source-backed Lesson Flow completion guard;
- local-only/no-academic-write boundaries;
- deterministic exercise grading only where contract-ready;
- current browser journeys and offline test.

**REFACTOR LATER**
- curriculum/content ownership into one MATH02 canonical model;
- formula rendering/provider boundary;
- evaluator/equivalence semantics under MATH03;
- computation/visualization provider boundary under MATH04;
- mastery wording/evidence projection under MATH03/MATH05;
- performance/accessibility acceptance under MATH05/MATH06.

**RETIRE ONLY AFTER REPLACEMENT PASSES**
- unused legacy runtime files;
- stale manifest count fields;
- hard-coded duplicate academic hierarchy;
- obsolete override generations proven redundant by owner tests.

## 10. MATH01 gate

1. Runtime scope known — PASS  
2. Curriculum/data mapped — PASS, with theory whole-file count explicitly unresolved  
3. Truth owners known/unresolved — PASS  
4. Evaluator/computation/visualization mapped — PASS  
5. Learner-state writes mapped — PASS  
6. UI/accessibility/performance baseline — PASS (baseline captured; accessibility/performance debts routed downstream)  
7. Test blind spots known — PASS  
8. Root causes grouped — PASS  
9. MATH02 input contract — PASS

MATH01 is **PASS** as a forensic phase. PR merge remains independently gated by required checks on the final PR head. Production remains unchanged.
