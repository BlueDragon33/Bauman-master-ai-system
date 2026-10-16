# Tiếng Nga · Tổng quan — Approved Visual Direction (2026-10-16)

## Authorization
The owner approved the generated Russian Overview **visual concept** in the conversation on 2026-10-16 (“duyệt mẫu này”). Approval covers **design direction**, not a claim that the app is visually identical, manually tested, merged, or authorized for Production release.

## Layout hierarchy
1. Consistent sidebar and top search/status header inherited from the Russian Future UI shell.
2. Premium, light, Russian-inspired **capability hero**. Show canonical current R0–R4 band and true stage-exit readiness/blocker, with one informative progress bar. Illustrated Moscow backdrop is presentation-only.
3. Five equally important capability cards **R0, R1, R2, R3, R4**, with exact evidence counts, due reviews, writing evidence and genuine locked/available actions. This is **not CEFR** and must never claim a mastery score inferred from activity counts.
4. “Tiếp tục đúng nơi vừa học”: primary call-to-action uses existing recent route, no invented learner session or hardcoded lesson completion.
5. “Hôm nay”, Review Queue, existing eight phone-style learning shortcuts, Learning Path, personal report and secondary metrics remain accessible without displacing the primary learning decision.
6. Responsive: five columns on wide desktop, fewer columns on smaller viewports, one column on mobile. Keyboard focus and actionable controls remain visible and legible.

## Architecture and data authority
- `assets/capability-progression.js` remains the **only owner** of R0–R4 evidence, status, unlock and routing. Its existing `lessonEvidence`, `stageExitStatus`, `allBands` and `routeForStep` determine all quantities and actions.
- `assets/capability-progression.css` owns approved Overview presentation, not a new CSS framework or copied dashboard.
- `assets/russian-future-ui.js` retains existing search, launcher, learning continuation, reports and mobile navigation.
- The core `russian:core-render` lifecycle replaces observer loops, preserving idempotent behavior across navigation.
- Service-worker shell version changes with user-visible assets. No persistent state, curriculum, identity or administrative model is changed.

## Release and acceptance
- Static review: title, exact count of five canonical bands, progress semantics, real data provenance, no synthetic mastery, no global DOM observer feedback loops.
- Browser: 1672×941 and mobile, tabs/navigation, correct hierarchy, focus/scroll, card actions, screenshot and calculated contrast.
- Independent UX review remains separate from automated CI and cannot be assumed PASS from this design approval.
- Preview is non-Production. Exact-SHA CI and authorization gates must pass before release/promotion.
