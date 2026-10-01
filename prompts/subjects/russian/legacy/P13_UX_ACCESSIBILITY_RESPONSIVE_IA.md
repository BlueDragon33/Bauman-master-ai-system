# P13 — UX · ACCESSIBILITY · RESPONSIVE · INFORMATION ARCHITECTURE CONSTITUTION
## LEARNER EXPERIENCE · AUTHOR EXPERIENCE · NAVIGATION · STATES · DEVICE ADAPTATION · CONSISTENCY · ACCESSIBILITY

Repository: `BlueDragon33/Bauman-master-ai-system`

Primary scope: `subjects/russian/`

Execution mode:

**AUTONOMOUS · USER-JOURNEY-FIRST · ACCESSIBLE-BY-DESIGN · RESPONSIVE · STATE-AWARE · CONSISTENT · LOW-COGNITIVE-LOAD · FOUNDATION-PRESERVING · TOKEN-EFFICIENT**

---

# P13 CHANGELOG

- 2026-09-30 — Full deep P13 constitution created.

---

# 0. MISSION

P13 is the final product/learning-floor layer.

It converts the capabilities built in P1–P12 into one coherent experience for learner, author, reviewer and administrator.

P13 is not a visual repaint.

It is responsible for ensuring that:

- the next action is obvious;
- system state is truthful;
- content remains readable;
- errors are recoverable;
- mobile/tablet/desktop preserve capability;
- keyboard/touch/accessibility work;
- learning semantics are not mutated by presentation;
- authoring workflows remain safe and understandable.

> **CLARITY BEFORE DECORATION · STATE TRUTH BEFORE ANIMATION · ACCESSIBILITY BEFORE POLISH**

---

# 1. FOUNDATION DEPENDENCIES

P13 consumes and must preserve:

- P2 curriculum hierarchy;
- P3 canonical entity relations;
- P4 completion/mastery/assessment semantics;
- P5 Today/SRS/recommendation semantics;
- P6 listening/speaking/audio states;
- P7 stress/register/linguistic annotations;
- P8 technical content/formulas/diagrams;
- P9 reading/writing/НИР/ВКР workflows;
- P10 AI Mentor states, uncertainty and source boundaries;
- P11 scenario state/objective/debrief semantics;
- P12 authoring/review/approval/activation semantics.

P13 may recompose presentation.

P13 may not silently change those meanings.

---

# 2. P13 OWNERSHIP

P13 owns:

- learner information architecture;
- author/admin information architecture;
- navigation;
- search presentation;
- responsive layout;
- typography;
- spacing/density;
- component consistency;
- UI state presentation;
- accessibility;
- keyboard/touch behavior;
- focus management;
- loading/error/offline UX;
- lesson UX;
- listening/speaking UX;
- assessment UX;
- AI Mentor UX;
- scenario UX;
- reading/writing/research UX;
- authoring/review UX;
- settings UX;
- visual regression baselines;
- critical user journey acceptance.

P13 does NOT own:

- canonical content truth;
- mastery calculation;
- SRS;
- AI permissions;
- scenario engine state;
- content governance decisions;
- production deployment.

---

# 3. PRESENTATION TRUTH PRINCIPLE

The UI must never invent a domain state.

Examples:

- `Saved` only after actual persistence;
- `Published/Active` only when canonical activation succeeded;
- `Completed` only according to P4 completion semantics;
- mastery display only from P4 evidence;
- `Offline` only when runtime is actually offline/degraded;
- `AI unavailable` when AI is unavailable, not generic silent fallback;
- `Recording` only while P6 recorder is active.

No decorative state simulation.

---

# 4. USER GROUPS

Primary UX contexts:

`LEARNER`

`AUTHOR/EDITOR`

`REVIEWER`

`ADMIN/QA`

Do not place all roles inside one overloaded dashboard.

Role-specific density and controls are allowed while design tokens remain consistent.

---

# 5. LEARNER CORE QUESTIONS

Within seconds, learner should be able to answer:

1. What should I do now?
2. Why is it recommended?
3. Where am I in the course?
4. What needs review?
5. What did I just complete?
6. What can I do offline?
7. How do I search a topic?
8. How do I practice speaking?
9. How do I review errors?
10. How do I continue after interruption?

---

# 6. AUTHOR/ADMIN CORE QUESTIONS

Author/admin should quickly answer:

1. What is blocked?
2. What needs review?
3. What changed?
4. What is the impact?
5. What can be previewed?
6. What is active?
7. What validation failed?
8. What can be rolled back?
9. What is stale/duplicate/orphaned?
10. Which action am I authorized to perform?

---

# 7. LEARNER TOP-LEVEL IA

Keep top-level destinations small and stable.

Conceptual options:

- Home / Today;
- Course;
- Review;
- Practice;
- Progress;
- Search;
- Settings.

Inside Russian subject:

- Overview;
- Roadmap;
- Lessons;
- Speaking/Practice;
- Review;
- Progress.

Do not duplicate the same functionality across many tabs.

---

# 8. HOME / TODAY

Consumes P5 canonical plan.

May show:

- MUST DO;
- SHOULD DO;
- OPTIONAL;
- session estimate;
- concise recommendation reason.

P13 must not rank tasks independently.

---

# 9. TODAY PRIORITY VISUAL LANGUAGE

Use calm hierarchy.

Reserve danger/red for real error/critical blocker.

Do not turn every overdue review into an alarm.

---

# 10. WHY THIS TASK

Expose concise reason where useful:

- current lesson;
- overdue review;
- prerequisite repair;
- speaking deficit;
- stage preparation;
- learner-selected focus.

Do not expose opaque internal scoring formula.

---

# 11. COURSE OVERVIEW

Show:

- current stage;
- current macro module;
- next major milestone;
- recent activity;
- high-value next action.

Do not show every micro-lesson at once.

---

# 12. ROADMAP

Represent canonical stage progression.

Roadmap answers:

`WHERE AM I?`

`WHAT COMES NEXT?`

It does not claim mastery merely because learner has navigated to a stage.

---

# 13. MODULE CARDS

May display:

- title;
- purpose;
- skills;
- status;
- next action;
- rough workload.

Keep metadata secondary.

---

# 14. UNIT/MICRO-LESSON DISCLOSURE

Use progressive disclosure.

Do not render hundreds of lessons as one massive page.

---

# 15. MICRO-LESSON PAGE ORDER

Prefer:

1. context/objective;
2. input/model;
3. interaction;
4. feedback;
5. retry/remediation;
6. next action.

---

# 16. LEARNING OBJECTIVE COPY

Learner-facing wording should be functional.

Internal objective/competency IDs remain hidden unless debug/admin.

---

# 17. HIERARCHY

Use more than font size:

- placement;
- spacing;
- headings;
- grouping;
- labels.

---

# 18. BREADCRUMBS

Useful on desktop for deep navigation.

Compact on mobile.

Do not duplicate side nav + breadcrumb + giant route title unnecessarily.

---

# 19. BACK BEHAVIOR

Back navigation must not silently lose:

- writing draft;
- recording;
- official assessment;
- scenario state.

---

# 20. DEEP LINKS

Meaningful lesson/task/scenario routes should be stable where architecture permits.

Opening a deep link must resolve current canonical content/state safely.

---

# 21. SEARCH GOALS

Search should find:

- Russian lemma;
- stressless spelling;
- Vietnamese support term;
- English technical alias;
- abbreviation;
- lesson title;
- technical concept;
- grammar/function.

---

# 22. SEARCH RESULT TYPES

Label results:

`LESSON`

`VOCAB`

`GRAMMAR`

`TECHNICAL CONCEPT`

`SCENARIO`

`WRITING/RESEARCH`.

Avoid indistinguishable mixed results.

---

# 23. SEARCH FILTERS

Optional filters:

- type;
- stage;
- skill;
- technical domain.

Default should remain simple.

---

# 24. SEARCH EMPTY STATE

Offer:

- spelling alternative;
- remove filter;
- related concept;
- browse path.

Never show blank white area.

---

# 25. SEARCH NORMALIZATION UX

Search can normalize `ё/е`, stress marks and aliases.

Canonical display remains precise.

---

# 26. NAVIGATION LABEL CONSISTENCY

One destination uses one stable human label.

Do not rename the same destination differently across dashboard/settings/mobile navigation.

---

# 27. ICON CONSISTENCY

Use one coherent icon family.

Critical actions include labels.

Icons never carry meaning alone.

---

# 28. RESPONSIVE PHILOSOPHY

Responsive is composition change, not shrinking desktop.

Preserve capability while adapting hierarchy.

---

# 29. DESKTOP COMPOSITION

Desktop can use:

- side navigation;
- main content;
- secondary contextual panel.

Main learning task remains visually dominant.

---

# 30. TABLET COMPOSITION

Tablet may collapse side/context panels.

Touch targets become primary.

Portrait and landscape must both work.

---

# 31. MOBILE COMPOSITION

Prefer:

- one primary column;
- compact navigation;
- bottom sheet/drawer for secondary data;
- sticky primary action only when useful.

No normal horizontal page scroll.

---

# 32. NO EXACT-ASPECT DEPENDENCY

The system may be optimized visually for common desktop/tablet/mobile proportions but must not depend on exact aspect ratio.

Content-driven breakpoints are preferred.

---

# 33. BREAKPOINT PRINCIPLE

Change composition when content no longer fits comfortably.

Do not select breakpoints solely by named device models.

---

# 34. CONTENT WIDTH

Long prose uses readable maximum width.

Tables, code and technical diagrams may intentionally use wider workspace.

---

# 35. ULTRAWIDE

Use spare width for secondary context/notes.

Do not make paragraphs span the full monitor.

---

# 36. SMALL SCREEN

Collapse secondary metadata first.

Never hide task instruction or required action.

---

# 37. ORIENTATION CHANGE

Rotation preserves:

- draft;
- scenario;
- recorder state where platform safely supports;
- current task.

---

# 38. TEXT ZOOM

Large text must not clip essential controls.

Layout should reflow.

---

# 39. TYPOGRAPHY REQUIREMENTS

Font system must support:

- Cyrillic;
- Vietnamese diacritics;
- stress marks;
- math symbols;
- code.

---

# 40. TYPOGRAPHIC SCALE

Use a small tokenized scale.

Avoid per-component arbitrary font sizing.

---

# 41. USER FONT SIZE

If setting exists:

`SMALLER`

`DEFAULT`

`LARGER`.

All key layouts must survive each.

---

# 42. LINE HEIGHT

Reading content gets comfortable line height.

Tables/code may be denser.

---

# 43. FONT WEIGHT

Avoid overly light learning text.

---

# 44. STRESS MARK RENDERING

Combining stress marks must remain visible, selectable and copyable.

Do not create stress through CSS decoration alone.

---

# 45. CYRILLIC ITALIC CAUTION

Italic Cyrillic can change letter shapes strongly.

Use intentionally, especially for beginners.

---

# 46. HANDWRITING FONT

Use only within handwriting practice/model.

Never globally.

---

# 47. CODE FONT

Monospace for code only.

Russian explanatory prose remains standard reading font.

---

# 48. FORMULA RENDERING

No clipped equations.

Allow wrapping/scroll where appropriate and accessible textual explanation when needed.

---

# 49. DESIGN TOKENS

Tokenize:

- colors;
- spacing;
- font sizes;
- radii;
- shadows;
- breakpoints;
- z-index.

No random values scattered across components.

---

# 50. SEMANTIC COLOR

Use tokens:

background;
surface;
text;
muted;
accent;
success;
warning;
danger;
info.

---

# 51. COLOR NOT SOLE SIGNAL

Every critical status also uses label/icon/structure.

---

# 52. CONTRAST

Ensure readable:

- text;
- focus;
- borders;
- disabled state;
- error/success.

---

# 53. DARK MODE

If supported, test all:

- formula;
- code;
- audio;
- recorder;
- editor;
- charts;
- tables.

---

# 54. HIGH-CONTRAST MODE

If supported, adapt tokens rather than creating a parallel app.

---

# 55. BACKGROUND SETTING

Constrain appearance choices so readability remains safe.

---

# 56. TYPEFACE SETTING

If exposed, use curated supported fonts.

Do not allow arbitrary learner font uploads.

---

# 57. UI LANGUAGE SETTING

Interface/support language can switch independently from canonical Russian target content.

---

# 58. BILINGUAL COMPOSITION

Desktop may use paired columns.

Mobile should stack/collapse.

Do not compress bilingual text into tiny side-by-side columns.

---

# 59. TRANSLATION REVEAL

Progressive reveal follows pedagogy.

Advanced content should not always show full Vietnamese translation by default.

---

# 60. READING MODE

Provide distraction-reduced reading with:

- readable width;
- glossary access;
- notes/annotation where supported.

---

# 61. FOCUS MODE

Optional.

Hide secondary chrome while retaining escape/back.

---

# 62. DASHBOARD DENSITY

Primary dashboard should prioritize:

- next action;
- urgent review;
- current stage;
- meaningful alerts.

Secondary analytics go lower.

---

# 63. CARD DISCIPLINE

Use cards for coherent groups.

Do not wrap every sentence in a card.

---

# 64. PAGE LENGTH

Avoid endlessly long home pages.

Use progressive disclosure and bounded scroll areas only when discoverability remains clear.

---

# 65. PRIMARY ACTION

One action should normally dominate a task context.

---

# 66. SECONDARY ACTION

Lower visual priority.

---

# 67. DESTRUCTIVE ACTION

Clear visual distinction and consequence.

---

# 68. DISABLED ACTION

If disabled for a non-obvious prerequisite, explain why.

---

# 69. CLICK/TAP FEEDBACK

Immediate interaction feedback.

Prevent accidental double submit.

---

# 70. TOUCH TARGETS

Core controls must be comfortably tappable.

No tiny icon-only buttons.

---

# 71. HOVER

Supplemental only.

Never required to discover essential action/information.

---

# 72. KEYBOARD

All core flows work by keyboard.

---

# 73. FOCUS VISIBLE

Never remove visible focus without accessible replacement.

---

# 74. FOCUS MANAGEMENT

After route/modal/error/dialogue transition, focus moves to logical target.

---

# 75. MODAL

Use for focused temporary tasks only.

Avoid nested modal workflows.

---

# 76. DRAWER / BOTTOM SHEET

Useful for:

- glossary;
- filter;
- notes;
- settings;
- mobile secondary panels.

Must support focus/keyboard semantics.

---

# 77. TOOLTIP

Supplemental only.

Never the only location for critical instructions.

---

# 78. TOAST

For transient confirmation.

Not for detailed critical failures.

---

# 79. ALERT

Persistent actionable state.

---

# 80. ERROR MESSAGE CONTRACT

An error should communicate:

- what failed;
- what remains safe;
- next action;
- retry/fallback.

---

# 81. ERROR LIFECYCLE

Resolved errors clear.

Never leave stale red banner indefinitely.

---

# 82. INLINE ERROR

Form/task validation near field.

---

# 83. GLOBAL ERROR

Reserved for app/system-level issues.

---

# 84. LOADING

Show only for real pending state.

No indefinite spinner.

---

# 85. SKELETON

Use for predictable layout only.

Never imply fake content.

---

# 86. PROGRESSIVE LOAD

Load essential current content before large supporting datasets/media.

---

# 87. EMPTY STATE

Explain why empty and what next.

Example:

“No reviews due.”

---

# 88. SUCCESS STATE

Confirm meaningful completion without excessive celebration.

---

# 89. OFFLINE STATE

Clearly show offline/degraded mode and available features.

---

# 90. SYNC STATE

If sync exists, distinguish:

- synced;
- pending;
- failed;
- conflict.

---

# 91. UNSAVED / SAVING / SAVED

Truthful status only.

---

# 92. CONFLICT

Preserve both revisions and provide resolution.

---

# 93. PROGRESS DISPLAY

Distinguish:

`EXPOSURE`