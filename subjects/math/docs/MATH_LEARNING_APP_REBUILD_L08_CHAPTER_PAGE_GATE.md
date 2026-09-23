# Math Learning Application Rebuild — LƯỢT 8 Chapter Page Gate

## Goal
Insert a real Chapter page between Roadmap and Lesson Player.

A learner should understand the chapter before entering an individual lesson.

## Chapter page
Roadmap chapter CTA now opens a chapter overview instead of jumping directly into E129 Reader.

The chapter page shows only source-supported information:
- stage
- discipline
- chapter title
- target outcome
- why the chapter matters via `bridgeQuestion`
- core knowledge tags from `pureLayer`
- engineering links from `appliedLayer`
- number of lessons with real content
- chapter learning activity recorded so far
- ordered lesson list

If prerequisite or duration is not present in the authoritative frame, the UI explicitly states that the source has not declared it. No estimate is fabricated.

## Lesson rows
Each real theory record becomes one lesson row with:
- ordered number
- lesson title
- actual slide/content count
- learner status: Chưa học / Đang học
- percentage of lesson steps already opened
- current active step when started
- CTA: Bắt đầu / Tiếp tục

No mastery or completion label is fabricated before the later completion/mastery passes.

## Progress ownership
No second progress engine.

`math-learning-flow.js` now exposes a read-only `lessonSnapshot(lessonId)` over the existing local learner state. Chapter UI only consumes it.

## Routing
Lesson CTA uses:
Stage → canonical E129 chapterId → exact theory record lessonId.

Back action returns to the same roadmap stage.

## Gate checks
- navigation JS syntax: PASS
- learning-flow JS syntax: PASS
- lessonSnapshot exported: PASS
- chapter overview renderer present: PASS
- exact lesson CTA route present: PASS
- E129 exposes `data-e129-lesson`: PASS
- E129 click handler reads exact lesson ID: PASS
- chapter CSS braces balanced: PASS
- chapter/navigation CSS `!important`: 0
- academic data writes: none

## Result
**PASS**

Next: LƯỢT 9 hardens the Lesson Player shell itself: breadcrumb, objective, compact step progress, contextual tools and one dominant content area.
