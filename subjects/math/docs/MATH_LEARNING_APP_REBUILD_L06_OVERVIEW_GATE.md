# Math Learning Application Rebuild — LƯỢT 6 Overview/Home Gate

## Goal
Rebuild Tổng quan around the learner's next decision, not around available features.

Required order:
1. Continue Learning
2. Current Goal
3. Roadmap Position
4. Compact Progress
5. Weak Points / Review

## Changes
- Replaced the previous dashboard that promoted Math Lab, DataVault and runtime counts.
- The largest card is now **Tiếp tục học**.
- Added current learning goal.
- Added roadmap-position summary with direct route to Lộ trình.
- Progress now reads the canonical read-only snapshot from `BAUMAN_MATH_LEARNING_FLOW.snapshot()`.
- Local visit telemetry is shown only as “Bài đã mở”; it is no longer converted into mastery/completion percentage.
- Weak-point panel does not fabricate data. Until Lesson Check produces evidence it explicitly shows an empty state.
- Advanced Lab/Vault/Control/Export actions were removed from Home.

## Progress ownership
No second progress engine was created.

`math-learning-flow.js` remains the current local learner-flow owner and exposes only a read-only snapshot:
- lessonId
- lessonTitle
- chapterId
- activeStep
- activeStepLabel
- activeStepIndex
- visitedCount
- totalSteps
- percent
- lastAt

The dashboard consumes that snapshot.

## Regression found and fixed
During L05/L06 hardening, collection selectors in the new navigation controller were found using the single-element helper in three places. This could break `.find()` / `.forEach()` at runtime.

Fixed and reverified on branch HEAD:
- active navigation collection: PASS
- E129 stage collection: PASS
- E129 chapter collection: PASS

## Gate checks on HEAD
- `math-navigation.js` syntax: PASS
- exactly five primary items: PASS
- navigation primary-route state exposed: PASS
- `math-learning-flow.js` syntax: PASS
- canonical snapshot exported: PASS
- `math-dashboard.js` syntax: PASS
- dashboard uses canonical snapshot: PASS
- old prominent Lab block absent: PASS
- old prominent DataVault block absent: PASS
- fake visited/record progress formula absent: PASS
- dashboard CSS `!important`: 0
- touched modular JS/CSS academic writes: none

## Result
**PASS**

Next: LƯỢT 7 must harden the Roadmap mapping and display only progress/status that can be proven from learner state. It must not invent prerequisites, duration, mastery or completion.
