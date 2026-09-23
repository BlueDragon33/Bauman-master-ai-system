# Math Learning Application Rebuild — LƯỢT 5 Navigation Shell Hardening

## Goal
Make the five-route learner shell the only visible primary navigation and verify Chapter → Lesson routing.

Primary routes:
1. Tổng quan
2. Lộ trình
3. Học
4. Luyện tập
5. Ôn tập

## Runtime defect found
`openChapterLesson()` used:
- `$('[data-e129-stage]').find(...)`
- `$('[data-e129-chapter]').find(...)`
- `$('[data-e129-lesson]').find(...)`

The local `$()` helper returns one Element, so `.find()` is invalid and can throw at runtime when opening a lesson from a chapter overview.

## Fix
Replaced those collection lookups with `$$().find(...)`, where `$$()` returns an Array.

## Ownership rules now enforced
- `math-navigation.js` owns visible primary navigation.
- old direct `#nav > button` entries are hidden once learner navigation is ready.
- advanced tools remain command/context actions.
- roadmap opens a chapter overview.
- chapter overview opens the existing authoritative Reader route instead of creating a duplicate lesson renderer.
- Home/roadmap/practice/review route state updates `data-math-primary-route`.

## Gate
- exactly five canonical primary items declared: PASS
- premium duplicate nav removed: PASS
- workspace duplicate nav removed: PASS
- Chapter → Lesson selector defect fixed: PASS
- existing Reader reused rather than duplicated: PASS
- contextual advanced tools retained: PASS
- no academic data writes introduced: PASS

## LƯỢT 5 result
**PASS**

The shell is ready for LƯỢT 6 Home/Tổng quan hardening.
