# Math Lesson-First Redesign · Foundation Audit L01→L03

Date: 2026-09-23  
Repository: `BlueDragon33/Bauman-master-ai-system`  
Baseline main audited: `dd00057d48634725f8fd7e336c1e359d1a6a15cd`  
Working branch: `fix/math-e16r-mp07-recovery-20260923`  
Scope: `subjects/math`

## Status

- L01 Source audit: **PASS with blockers documented**
- L02 Learner-journey audit: **PASS with redesign requirements locked**
- L03 Information Architecture: **DECISION LOCKED, implementation pending**
- Merge/publish: **BLOCKED** until later redesign gates are green.

This document is intentionally architectural. It does not declare the Math Site complete.

---

# L01 · Authoritative source audit

## 1. Source-of-truth findings

Current Math runtime is not one application shell. It is a composition of multiple generations of UI/runtime layers.

Observed entry load in `subjects/math/index.html`:

- 23 CSS assets.
- 40 JavaScript assets.
- E129 theory shell.
- E186 lesson-first path.
- E202/E210/E211/E212/E224/E234/E235/E239/E240/E241/E242/E243/E244/E245 theory/presenter layers.
- Math Workspace.
- Premium UI.
- Dashboard V2.
- Unified Navigation.
- Learning Flow.
- Study Library.
- Activity Studio.
- Activity Mastery.
- Study Command Center.
- Formula Library/Context.
- Simulation Source.
- Professor Drill.
- Integration Sync.
- Runtime Health.
- Regression Gate.

The system therefore has many useful capabilities but too many independent presentation/state coordinators.

## 2. Navigation inventory

There are several simultaneous navigation models.

### A. Subject adapter navigation

`subject-adapter.js` still exposes nine equal-level routes:

1. Tổng quan
2. Học tập
3. Vấn đáp
4. Mô phỏng
5. Video/Tài nguyên
6. Công thức
7. Công thức sâu
8. Mind map
9. Dữ liệu

This is resource-oriented rather than learner-task-oriented.

### B. Unified Navigation V2

`math-navigation.js` adds eleven route buttons:

- Tổng quan
- Lý thuyết
- Bài tập
- Thực hành
- Ứng dụng
- Ôn tập
- Kiểm tra
- Mô phỏng Lab
- Công thức
- Điều khiển
- Kho dữ liệu

This is a second route hierarchy competing with the first.

### C. E129 host navigation

E129 appends its own:

- Lý thuyết E129
- Kho Lý thuyết

### D. E186 hierarchy selector

E186 adds another breadcrumb/modal route:

- Khối
- Học phần
- Chương
- Bài
- Phân mục

### E. Learning Flow

`math-learning-flow.js` renders another nine-step strip:

- Lý thuyết
- Công thức
- Ví dụ
- Bài tập
- Mô phỏng
- Ứng dụng
- Vấn đáp
- Ôn tập
- Kiểm tra

Conclusion: the current learner is exposed to multiple competing ways to answer the same question, “where do I go next?”

## 3. Authoritative hierarchy mismatch

E186/E169 currently hard-code an academic hierarchy that is not authoritative.

A comparison against `theory_lecture_frame.json` found **21/21 hard-coded chapter labels differ from the authoritative chapter frame**.

Examples:

- E186 `c01`: “Đại số tuyến tính nâng cao...”  
  Authoritative: “Chương 1 · Vector trong không gian dữ liệu”.
- E186 `c03`: “Đại số trừu tượng...”  
  Authoritative: “Chương 3 · Hàm số, đạo hàm và gradient cơ bản”.
- E186 `c05`: “Giải tích hàm nhiều biến...”  
  Authoritative: “Chương 5 · Thống kê mô tả và dữ liệu thực nghiệm”.
- E186 `c07`: “Lý thuyết hàm phức...”  
  Authoritative global chapter 7 is the first preparatory-stage chapter: “Ngôn ngữ toán kỹ thuật Nga...”.
- E186 `c15`: “Toán rời rạc...”  
  Authoritative global chapter 15 is preparatory probability.

This is a blocker. UI labels must be derived from the current frame/data model, not from the old hard-coded Pure/Applied tree.

## 4. CSS debt

Measured on the current working source:

| File | Lines | `!important` |
|---|---:|---:|
| `assets/core.css` | 10,345 | 12,167 |
| `assets/math.css` | 1,653 | 1,847 |
| `assets/math-premium.css` | 262 | 220 |
| `assets/math-navigation.css` | 100 | 49 |
| `assets/math-learning-flow.css` | 58 | 4 |
| `assets/math-responsive-pro.css` | 33 | 66 |

This confirms cascading override debt is structural, not cosmetic.

Rule for redesign:

- no V-next override file to “win” the cascade;
- remove/replace obsolete selectors at their owner;
- establish a compact token layer and component ownership;
- use `!important` only for narrowly documented interoperability exceptions.

## 5. Data architecture inventory

The E112/E113 Content Vault model is useful and should be preserved:

- frame/content pairs;
- stable content IDs;
- legacy files as compatibility fallback;
- explicit import/export metadata;
- lesson-linked formula/simulation/exercise/application/Q&A/review/question sources.

The problem is presentation and loading policy, not the existence of those datasets.

Current adapter initial/background lists still cause a broad set of content stores to be treated as initial runtime dependencies. The lesson-first redesign must load:

1. shell + learner state;
2. stage/module/chapter/lesson metadata needed for the current route;
3. current lesson theory;
4. sidecars required by the current step;
5. secondary resources lazily.

## 6. State/persistence inventory

Current learner-related state is split across several stores:

- core/adapter state and current view;
- E129 lesson/chapter state;
- E169 compatibility path;
- E186 path;
- `bauman_math_learning_flow_v1`;
- `bauman_math_learning_notes_v1`;
- `bauman_math_learning_bookmarks_v1`;
- `bauman_math_activity_mastery_v1`;
- `bauman_math_mastery_history_v1`;
- `bauman_math_activity_notes_v1`;
- `bauman_math_activity_session_v1`;
- dashboard/recent-visit telemetry.

The meanings also differ:

- “visited/opened” in Learning Flow;
- manually marked “Đã nắm” in Activity Mastery;
- current route in E186/E169/E129;
- session status in Study Command Center.

These must not be presented as one mastery/progress truth.

## 7. Race defects found and fixed during L01

The audit immediately exposed production-relevant route races.

### Fx A · Browser route test hierarchy

The m_p07 acceptance previously injected lesson/activity without a complete hierarchy route. It was corrected to set module/course/chapter/lesson/activity coherently.

### Fx B · E186 durable lesson source

E186 depended on transient DB hydration for lesson options. The path now falls back to the durable E240 theory content source when available.

### Fx C · E129 delayed destructive rerender

E129 scheduled a second render 650 ms after startup even though the first load pipeline already resolves asynchronously. That delayed render could replace a learner-selected activity surface. The duplicate delayed render was removed.

### Fx D · Canonical lesson identity fail-safe

If lesson metadata is temporarily unavailable, E186 must not downgrade a real canonical lesson ID to `cXX-overview`. It now preserves the canonical lesson until a substantive option list exists.

### Fx E · Acceptance stability

The m_p07 browser acceptance now checks route identity again after settling instead of accepting a transient momentary pass.

Result after these fixes:

- Math m_p07 E16R recovery gate: PASS.
- Windows checkout safety: PASS.
- Cloudflare Preview CI: PASS.
- Production Publish Gate CI: PASS.
- Whole System Integration Gate: pending at the time this audit record was prepared.

## 8. Keep / refactor / merge / remove from learner surface

### KEEP

- `theory_lecture_frame/content` authority.
- E240 durable theory source.
- stable `chapterId`, `lessonId`, formula/exercise/simulation/application/question IDs.
- Content Vault frame/content separation.
- Activity Studio lesson-linked canonical-source matching.
- Formula Library canonical + compatibility merge.
- provenance/static validators.
- fail-closed CI approach.
- advanced Data Vault/admin capability.

### REFACTOR

- E186 hierarchy into data-driven Stage → Module/Discipline → Chapter → Lesson → Step.
- Home into Continue Learning first.
- Learning Flow into true lesson completion steps, not “opened step” progress.
- learner-state persistence into one authoritative progress store with explicit derived views.
- mastery into evidence-aware state; manual confidence remains a separate signal.
- load policy into lesson-scoped lazy loading.
- chapter/lesson routing so physical IDs and learner hierarchy never diverge.

### MERGE

- Unified Navigation + Subject Adapter learner navigation.
- Dashboard V2 + Study Command Center learner summary.
- Formula/Simulation/Professor tools into contextual Resource Drawer.
- legacy E169 compatibility behind E186/next route owner rather than visible navigation.

### REMOVE FROM PRIMARY LEARNER NAV

Do not delete capability, but remove equal-level exposure of:

- Vấn đáp
- Mô phỏng Lab
- Công thức
- Công thức sâu
- Mind map
- Kho dữ liệu
- Điều khiển

These become contextual resources or advanced/admin tools.

---

# L02 · Learner-journey audit

## Scenario A · New learner

Current risk:

- too many route choices before the learner knows what the course expects;
- hierarchy labels can contradict authoritative content;
- several dashboards compete for attention.

Required future first screen:

1. Continue/Start learning.
2. Current stage/module/chapter.
3. This week/current target.
4. Small progress summary.
5. Weak-point/review prompt only when relevant.

PASS criterion:

A new learner can start the recommended lesson without learning the application architecture.

## Scenario B · Returning learner

Current risk:

- multiple local stores know different pieces of “where I was”;
- route identity can drift between E129/E169/E186;
- recent visit does not equal resumable progress.

Required:

- one persisted `currentLessonId + currentStepId`;
- explicit save success/failure;
- resume only from persisted truth;
- no fake completion.

## Scenario C · Wrong exercise answer

Current risk:

- manual mastery and “visited” indicators are not correctness evidence;
- content sources are linked by lesson but remediation is not yet one flow.

Required:

answer → correctness/explanation → error cause → related concept → targeted retry/review.

## Scenario D · Lesson completion

Current risk:

Opening nine Learning Flow sections can look like progress even if nothing was learned or checked.

Required:

- step completion criteria per step type;
- lesson completion only after mandatory steps + lesson check;
- next lesson CTA generated from route/prerequisite rules.

## Scenario E · Weak mastery

Current risk:

Manual “Cần ôn / Đã nắm” is useful confidence data but must not masquerade as measured mastery.

Required:

- separate `confidence` from `masteryEvidence`;
- review queue can combine wrong answers, stale concepts and manual “Cần ôn”;
- UI explains why a review item was chosen.

## Scenario F · Mobile/tablet

Current risk:

Several shells, sidebars and overlays were built independently.

Required:

- mobile single content column;
- chapter navigation drawer;
- persistent but compact previous/next;
- exercise input kept above fold when possible;
- no desktop three-column compression.

## Scenario G · Data source incomplete/error

Current strength:

Current canonical/legacy fallback architecture is relatively resilient.

Required hardening:

- preserve current canonical lesson identity;
- show meaningful empty/error state;
- never silently replace a real lesson with a placeholder because one async source is late.

---

# L03 · Information Architecture decision

## 1. Canonical learner hierarchy

The new learner hierarchy is:

**Giai đoạn → Module/Phân môn → Chương → Bài → Bước học → Hoạt động**

Mapping:

- Giai đoạn: `theory_lecture_frame.stageId`.
- Module/Phân môn: `disciplineId` / discipline spine.
- Chương: authoritative frame `chapterId`.
- Bài: canonical theory `lessonId`.
- Bước học: generated lesson-step model based on available canonical sidecars.
- Hoạt động: exercise/question/simulation/application/Q&A/review item.

Do not create a second hard-coded Pure/Applied chapter tree.

## 2. Primary navigation

Learner-facing primary navigation is locked to:

1. **Tổng quan**
2. **Lộ trình**
3. **Học**
4. **Luyện tập**
5. **Ôn tập**

Rules:

- `Học` opens/resumes the current lesson player.
- `Luyện tập` is a learner task view, not a raw dataset browser.
- `Ôn tập` is generated from review needs.
- Search is global utility, not a sixth academic hierarchy.
- Data Vault/admin/health tools live under Advanced/Manage, not primary learning navigation.

## 3. Lesson Player ownership

One Lesson Player owns the learning surface.

Default step model:

1. Mục tiêu
2. Khởi động
3. Hiểu khái niệm
4. Trực quan/Mô phỏng
5. Ví dụ mẫu
6. Công thức cốt lõi
7. Ứng dụng
8. Luyện tập
9. Kiểm tra nhanh
10. Tóm tắt
11. Hoàn thành
12. Bài tiếp theo

Only steps with real content are rendered.

Desktop:

- compact lesson/chapter navigation left when useful;
- main lesson content dominant;
- optional contextual resource panel right.

Tablet/mobile:

- left navigation becomes drawer;
- contextual resources become drawer/bottom sheet;
- main content remains the only dominant surface.

## 4. Contextual Resource Drawer

Move these capabilities out of equal-level primary navigation:

- Công thức
- Mô phỏng
- Mind map
- Concept Map
- Vấn đáp
- Ghi chú
- supplemental media

They are opened in the context of the current lesson/chapter.

## 5. Learner-state target contract

Future single learner progress store must distinguish:

- route: current stage/module/chapter/lesson/step;
- completion: completed steps/lessons;
- assessment evidence: question attempts/correctness;
- mastery evidence: derived from accepted evidence rules;
- confidence: manual learner self-rating;
- review queue;
- bookmarks/notes;
- timestamps/last activity.

Compatibility stores may be migrated/read temporarily, but only one owner may write authoritative progress after migration.

## 6. Home contract

Home is not a KPI dashboard.

Order:

1. Continue Learning.
2. Current target.
3. Current route.
4. Minimal progress.
5. Weak points/review.
6. Secondary utilities.

## 7. L03 implementation guardrails

Before visual polish:

- remove semantic dependence on the E169/E186 hard-coded Pure/Applied tree;
- introduce a normalized lesson/route adapter;
- migrate visible navigation to the five primary routes;
- keep old route handlers only as compatibility adapters;
- do not create a new parallel V-next UI stack.

---

# Next execution

L04 will normalize the design system and CSS ownership while preserving current runtime behavior.

Before L04 can be called green:

- Whole System Integration on the latest functional head must pass;
- the L01/L02/L03 architectural decisions above must remain compatible with current canonical content IDs;
- no merge to `main`;
- no production publish.
