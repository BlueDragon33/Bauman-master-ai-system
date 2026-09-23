# Math Learning Application Rebuild — LƯỢT 3 Information Architecture Contract

## Purpose
Freeze one learner-first information architecture before visual redesign.

This contract replaces navigation-by-dataset and navigation-by-feature with one hierarchy:

`Stage → Module → Chapter → Lesson → Step → Activity`

No competing hierarchy may be introduced in the primary learner UI.

## 1. Primary navigation

Exactly five primary destinations:

1. **Tổng quan**
2. **Lộ trình**
3. **Học**
4. **Luyện tập**
5. **Ôn tập**

Rules:
- no Formula, Simulation, Mind map, Concept map, Professor Q&A, Storage or Data as peer primary routes;
- no second persistent primary tab bar inside the page;
- advanced/admin tools remain accessible through contextual actions or an advanced resource drawer.

## 2. Route semantics

### /overview — Tổng quan
Answers:
- Tôi đang ở đâu?
- Hôm nay nên học gì?
- Tôi còn điểm yếu nào cần xử lý?

Content order:
1. Continue Learning
2. Current Goal
3. Current Roadmap Position
4. Compact Progress
5. Weak Points / Review Queue

### /roadmap — Lộ trình
Shows:
Stage → Module → Chapter.

Each chapter exposes:
- title
- purpose
- prerequisites
- lesson count
- estimated time
- progress
- status

It does not dump lesson resources.

### /learn — Học
Resolves directly to:
- current lesson if resumable;
- otherwise recommended next lesson;
- otherwise first valid lesson in current roadmap position.

This route opens the Lesson Player, not a resource browser.

### /practice — Luyện tập
Shows practice grouped by learner need:
- Cơ bản
- Hiểu bản chất
- Áp dụng
- Tổng hợp
- Liên hệ kỹ thuật/Bauman

It may aggregate exercises across lessons but always shows the owning lesson/chapter.

### /review — Ôn tập
Shows targeted review queue:
- why selected
- estimated time
- related skill
- lesson/step destination
- status

No review item may be an unexplained resource link.

## 3. Contextual resource drawer

Available from lesson/chapter context, not the primary nav.

May contain:
- Công thức
- Mô phỏng
- Mindmap
- Concept Map
- Vấn đáp
- Ghi chú
- Tài nguyên bổ sung

Rules:
- drawer content is filtered to the current lesson/chapter by default;
- global browse mode is secondary;
- opening the drawer must not change learner progress;
- closing the drawer returns to the same lesson/step.

## 4. Lesson Player information architecture

### Header
- breadcrumb: Stage → Module → Chapter → Lesson
- §x.x lesson title
- concise objective
- estimated time
- step progress
- Continue CTA when resuming

### Main step flow
Default semantic step order:
1. Mục tiêu
2. Khởi động
3. Hiểu khái niệm
4. Trực quan / Mô phỏng
5. Ví dụ mẫu
6. Công thức cốt lõi
7. Ứng dụng
8. Luyện tập
9. Kiểm tra nhanh
10. Tóm tắt
11. Hoàn thành
12. Bài tiếp theo

Only steps with real mapped content are rendered.

### Desktop layout
- left: compact lesson/chapter outline, collapsible
- center: primary learning content
- right: optional contextual panel, closed by default unless needed

### Mobile/tablet
- main content first
- outline becomes drawer
- contextual tools become bottom sheet/drawer
- previous/next and exercise input remain reachable without desktop multi-column compression

## 5. Canonical UI state

Primary route state:
- route
- stageId
- moduleId
- chapterId
- lessonId
- stepId

Learner persistence state is separate from transient UI state.

Transient examples:
- resourceDrawerOpen
- chapterOutlineOpen
- searchQuery
- focusMode

These must never masquerade as learning progress.

## 6. Canonical navigation ownership

A single navigation controller owns:
- primary nav rendering;
- active primary route;
- breadcrumb generation;
- route-to-lesson resolution;
- back/forward handling.

Other modules may request navigation through an API/event but may not append persistent peer navigation controls.

This explicitly prohibits modules such as workspace/simulation/formula tools from appending new primary nav buttons.

## 7. Source mapping model

Data sources are normalized into a lesson aggregate:

```
LessonAggregate {
  lesson
  chapter
  module
  stage
  theory[]
  formulas[]
  examples[]
  applications[]
  simulations[]
  exercises[]
  questions[]
  reviewLinks[]
  masterySkills[]
}
```

No physical data duplication is required. References use stable IDs.

The adapter may resolve from:
- canonical content dataset;
- frame/content pair;
- legacy alias;
- generated index.

But the UI receives one normalized aggregate.

## 8. Search placement

Search is global utility, not a primary destination.

Result groups:
- Bài học
- Khái niệm
- Công thức
- Bài tập
- Mô phỏng

Every result includes:
Stage → Module → Chapter → Lesson context.

Selecting a result opens the owning lesson/context, not an orphan resource page by default.

## 9. Empty/error state rules

- never render an empty data table to a learner;
- optional missing resource: omit the step/tool and continue;
- missing required lesson content: show recoverable lesson error with retry/back-to-chapter;
- no review items: show “Hiện chưa có nội dung cần ôn”;
- locked prerequisite: explain exactly what is required and link to it.

## 10. Migration rules from current runtime

### Primary nav items to remove from learner-level peer navigation
- storage/data
- standalone formula
- standalone simulation
- mindmap/concept map
- professor drill
- generic workspace/tool launcher as persistent navigation

### Preserve as advanced/admin
Content import/export and data-vault tooling stays available but leaves the default learner path.

### Preserve bridges
Host/planning bridge remains, but it must navigate through the canonical route controller.

## 11. Gate checks

1. One primary hierarchy only: PASS by contract.
2. Five primary routes only: PASS by contract.
3. Lesson is the core UX unit: PASS by contract.
4. Resource types demoted to contextual tools: PASS by contract.
5. Canonical nav owner defined: PASS by contract.
6. Canonical lesson aggregate defined: PASS by contract.
7. Responsive behavior defined: PASS by contract.
8. Empty/error behavior defined: PASS by contract.

## LƯỢT 3 result
**PASS — IA FROZEN**

Implementation from LƯỢT 4 onward must not reintroduce peer navigation by dataset/feature without a documented architecture exception.
