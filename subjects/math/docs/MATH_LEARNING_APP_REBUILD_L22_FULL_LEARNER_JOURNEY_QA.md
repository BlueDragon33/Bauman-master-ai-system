# Math Learning Application Rebuild — LƯỢT 22 Full Learner Journey QA

## Result
**PASS — FULL LEARNER JOURNEY GATE**

The learner journey is now executed in Chromium by `tests/math-learning-journey-browser.mjs` and is part of `Math Learning App Gate`.

Verified green evidence before final L23 cleanup:
- workflow: Math Learning App Gate
- run: 35886715013
- browser job: 107268686715
- conclusion: success

## Journeys covered

### 1. First visit / navigation
- exactly five canonical learner routes;
- Tổng quan;
- Lộ trình;
- Học;
- Luyện tập;
- Ôn tập;
- Roadmap can be opened from the canonical navigation.

### 2. Open a real lesson
The test opens the accepted source-backed lesson:
`MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140`

It uses the E186 lesson route and verifies that Reader + Lesson Player resolve the same canonical lesson.

### 3. Learn through semantic steps
- waits for durable E240 theory content;
- requires at least five source-driven semantic steps;
- visits every available lesson step;
- no fabricated step completion.

### 4. Lesson Check + completion
- loads the real assessment source;
- requires at least one source-backed Lesson Check item;
- records one `review` state and the remaining items as `understood`;
- verifies the completion gate becomes eligible;
- persists a real completion timestamp.

### 5. Review recovery
- verifies the weak item creates exactly one review-queue entry;
- verifies that entry has a recovery step;
- opens the canonical Review route and Activity Studio.

### 6. Resume after reload
- reloads the page intentionally;
- preserves the canonical lesson pointer;
- preserves lesson completion;
- reopens the same lesson through the Learn route.

### 7. Offline learner state
- switches the browser context offline;
- requires explicit Offline UI state;
- verifies locally persisted learner progress remains readable.

### 8. Mobile regression
- switches to 390 × 844 viewport;
- rejects horizontal page overflow;
- captures a full-page mobile evidence screenshot.

## Defects found and repaired during L22
1. Browser acceptance was missing from Math CI.
2. E240 durable theory payload was not retained for shared consumers.
3. E240 durable caching initially altered fetch timing and was separated from interception.
4. E186 left a competing activity modal open after lesson selection.
5. Study Command Center used single-element helpers as collections.
6. Learner journey test had stale timing assumptions and one page-context constant reference.
7. Presenter identity / route-lock regressions were hardened.
8. Simulation resolution was aligned with the durable E240 lesson source.

## Gate
- JSON validation: PASS
- manifest/reference validation: PASS
- learning relationship validation: PASS
- Math runtime syntax: PASS
- real Chromium learner journey: PASS
- console/page/request/HTTP error assertions: PASS
- reload persistence: PASS
- offline learner-state check: PASS
- mobile overflow check: PASS

L22 is closed. Any later code cleanup must keep this browser journey green.
