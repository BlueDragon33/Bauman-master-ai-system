# BAUMAN MASTER CURRICULUM 2026 — MASTER PROMPT
## BMSTU IU5 · 09.04.01/11 · Shell-only implementation

Repository: `BlueDragon33/Bauman-master-ai-system`

Authority order:
1. repository enforced authority: `.blueprint/constitution-adoption.json`
2. shared prompt Constitution: `prompts/CONSTITUTION.md`
3. this Master Prompt
4. current state/evidence

Mode:
`AUTONOMOUS · EVIDENCE-FIRST · ROOT-CAUSE-FIRST · TOKEN-EFFICIENT`

## Scope
Build the official 2026 master's curriculum shell and Hub integration only:
program/semesters/academic units, Subject Factory shell, Hub↔Subapp contracts,
Roadmap, Schedule shell, Research/Practice/Thesis, Documents/Notes/Search/AI metadata,
UI projection, QA, hardening, release.

Do NOT generate subject lesson content in this run.

## Global rules
- Inspect before modify.
- Architecture before implementation.
- Dependency before roadmap.
- Canonical source first.
- Additive migration and backward compatibility.
- One registry; UI/roadmap/schedule/search are projections.
- No fake content, schedule, teacher, deadline, score, mastery or progress.
- NULL != 0%.
- Russian titles and official workload are canonical; Vietnamese names are localization.
- Facultatives do not count toward core 120 credits.
- Electives keep selectedOption=null until user decides.
- Multi-semester unit = one canonical AcademicUnit + multiple offerings.
- Preserve Russian/Math/Preparation tracks.
- Do not merge/publish mid-process.
- Do not claim PASS without evidence.

## State / token rule
At each new session read:
1. `prompts/CONSTITUTION.md`
2. `prompts/PROMPT_REGISTRY.json`
3. this file
4. `PROJECT_STATE.json`
5. current HEAD + diff from last validated SHA
6. only impacted files/tests/evidence.

Do not full-scan the repository unless state/owner map/architecture is stale or invalid.

## Execution loop
For every phase:
`inspect → implement → validate → test → root-cause fix → retest → regression → evidence → state update → next phase`

If a phase FAILS, stay in that phase until fixed or a real blocker exists.

---

# P01 — CONSTITUTION PREFLIGHT
- Read current repository Constitution/Blueprint authority and shared prompt Constitution.
- Record revisions/digests, branch and HEAD.
- Identify canonical owners for app registry, subject registry, routes, design system, contracts and release authority.
- Detect authority conflict.
PASS only when authority and canonical owners are explicit.
BLOCK if a conflict needs human ratification.

# P02 — REPOSITORY AUDIT & DEPENDENCY MAP
Audit targeted areas: Hub shell, Subjects, Roadmap, Schedule/Calendar, Research, Thesis,
Documents, Notes, Search, AI context, app/subject manifests, Russian/Math subapps,
routing, state persistence, tests/CI/deploy.
Classify KEEP / ADAPT / MIGRATE / ADD / DEPRECATE.
Map duplication/hard-code and subject-ID dependencies.
Do not rewrite broadly here.

# P03 — OFFICIAL ACADEMIC SOURCE LOCK
Use `source/curriculum_official_snapshot.json` as the implementation source.
Import into one canonical academic source in the repo.
Preserve assessment codes exactly: Зчт, Экз, ДЗчт, ГЭК, РЭкз, КуР.
Do not expand СТС without authoritative source.
Keep facultatives separate; electives unselected.
Keep `НИР по обработке и анализу данных` distinct from longitudinal `Научно-исследовательская работа`.
Validate 4 semesters, 30 core credits each, 120 total, 4320 hours.

# P04 — ACADEMIC SCHEMA & REGISTRY
Program fields: programId/code/name/specialization/startYear/duration/studyMode/faculty/department/credits/hours/sourceRevision.
AcademicUnit: stable ID, type, nameRu/nameVi, mandatory, credits/hours, offerings, contentStatus, launch, progress.
Offering: semester, credits, hours, assessmentCode, coursework, timetableEligibility.
ElectiveGroup: groupId, semester, credits/hours, options, selectedOption=null.
Shell defaults: contentStatus=shell, contentVersion=null, progress/mastery/score=null.
No parallel registry.

# P05 — CURRICULUM MIGRATION
Use additive migration.
Preserve existing stable IDs/data and Russian/Math/Preparation.
Tracks: TRACK_PREMASTER, TRACK_MASTER_OFFICIAL, TRACK_FACULTATIVE.
Program ID: `bmstu-iu5-09040111-2026`.
Add four semesters and official academic units.
Do not auto-merge same-name preparation vs official units.
Produce migration report and rollback procedure.

# P06 — SUBJECT FACTORY & EMPTY SHELLS
Generate shell packages from AcademicUnit manifests.
Default:
contentStatus=shell
lessonCount=0
exerciseCount=0
simulationCount=0
assessmentContentCount=0
launch.status=not_provisioned
contentVersion=null
progress=null
UI empty state: "Khung học phần đã sẵn sàng. Nội dung sẽ được bổ sung ở giai đoạn tiếp theo."
No fake lesson/quiz/lorem ipsum.
Use stable kernel + manifest-driven packages. Must be idempotent.

# P07 — HUB ↔ SUBAPP CONTRACTS
Versioned contract fields:
subjectId, programId, semester, stage, status, progress, currentUnit, currentTask,
lastActivity, resumeTarget, masterySummary, upcomingAssessment, contentVersion, contractVersion.
Hub must not read subject DB internals or share credentials.
Use exact-origin checks where messaging applies.
Test shell handshake, missing optional fields, incompatible version, unavailable subapp,
stale status, bad origin, retry/fallback.

# P08 — SEMESTER & ROADMAP PROJECTION
Roadmap is projection of canonical registry, not a second database.
PRE-MASTER separate from OFFICIAL MASTER TRACK.
Year 1: S1/S2. Year 2: S3/S4.
Multi-semester unit = continuation, not clone.
Elective: "Chưa chọn học phần" until user decision.
Facultatives optional.
Research longitudinal across S1–S4.
Thesis official 9-credit assessment in S4.
Statuses only from evidence: planned / shell_ready / available / active / completed.

# P09 — SCHEDULE & ACADEMIC CALENDAR SHELL
Curriculum != timetable.
Known semester lengths: 17/17/17/11 weeks.
Do not invent start/end dates, date/time, room, teacher or deadline.
If no official timetable: "Chưa nhập lịch chính thức".
Schedule session subjectId must reference registry.
Future timetable import must not require curriculum migration.

# P10 — RESEARCH, PRACTICE & THESIS
Longitudinal NIR:
S1 3cr/108h, S2 4/144, S3 7/252, S4 7/252.
Separate S3 `НИР по обработке и анализу данных`: 2cr/72h.
Practice:
Project-technological S2 2cr;
Operational S2 3cr;
Pedagogical S2 1cr + S3 1cr;
Prediploma S4 3cr.
Thesis `Подготовка и защита ВКР`: S4 9cr/324h/ГЭК.
Workspace fields may exist but default EMPTY/NULL.
Link Research → Prediploma → ВКР.
Do not fake topic/supervisor/paper/result.

# P11 — DOCUMENTS, NOTES, SEARCH & AI CONTEXT
Document namespace by track/semester/subject plus research/thesis.
Notes may link programId/semester/subjectId and optional lesson/research/thesis anchors.
Search indexes shell metadata, not fake content.
AI may know official metadata and real learner/research state.
AI must not infer lesson content, prerequisites, exam questions, teacher demand or deadline.
All subsystems null-safe.

# P12 — UI/UX PROJECTION
Use shared C2 design system.
Calm, academic, technical, modern, readable; no neon/harsh colors.
Responsive desktop/tablet/mobile; no horizontal overflow; accessible focus/contrast.
Subjects filters:
All / S1 / S2 / S3 / S4 / mandatory / elective / practice / research / thesis / facultative.
Cards prioritize names, semester, credits, assessment, type, content status, subapp status.
All counts/filters read registry. No hard-code duplication.

# P13 — DATA INTEGRITY & ACADEMIC GATES
Automate:
S1=30, S2=30, S3=30, S4=30 core credits.
Core total=120 credits, 4320 hours.
Weeks=17/17/17/11.
Facultatives excluded.
Multi-semester unit canonical uniqueness.
S3 elective group=3cr, S4 elective group=3cr, both selectedOption=null.
Longitudinal NIR != data-processing NIR.
No fake lesson/quiz/schedule/progress/deadline/teacher.
Never adjust official numbers merely to make tests pass; fix mapping/root cause.

# P14 — PROFESSIONAL QA + AUTO-FIX
Use C3:
TEST → DEFECT → ROOT CAUSE → FIX → RETEST → REGRESSION → UX REVIEW → WHOLE SYSTEM.
Test build/lint/typecheck/schema/migration/registry/routes/factory/contracts/roadmap/
schedule empty state/research-practice-thesis/docs-notes-search/AI null safety/
filters/buttons/navigation/refresh/deep links/responsive/keyboard/console/
offline-cache where relevant/Russian-Math regression.
Exit: 0 blocker, 0 critical. Known minor issues explicit.

# P15 — HARDENING & FINAL SYSTEM AUDIT
Check duplicate sources/IDs, dead routes/buttons, filter-count mismatch, mobile overflow,
Russian encoding, null/undefined rendering, shell states, old links, stale manifests/contracts,
terminology, cache/version mismatch, error/loading/empty states, unexpected writes,
secret/log exposure and release evidence completeness.
PASS only on exact current HEAD.

# P16 — MERGE & RELEASE
Run only after P01–P15 PASS.
Freeze exact HEAD/SHA, rerun required CI/tests, verify diff/migration/rollback/authority.
No force push/history rewrite.
Merge by repo rules.
Publish only with explicit valid production authority.
Post-deploy smoke root/Subjects/Roadmap/Schedule/Research/Thesis/deep links/subject shell/console/mobile.
Report pre-merge SHA, merge SHA, production SHA, changed files, migration, tests, integrity,
regression, deployment and unverified items.

# P17 — POST-RELEASE AUDIT & STABLE BASELINE
Verify deployed SHA equals authorized release SHA.
Smoke again.
Confirm 4 semesters/120 credits/no fake content/preparation preserved/Subject Factory shell works.
Set releaseStatus=stable_shell_baseline.
Create completion report.
STOP. Do not generate subject content.

# P18 — FUTURE CONTENT ONBOARDING
FUTURE ONLY. DO NOT RUN IN THIS PHASE.
Per subject:
source lock → subject blueprint → content schema → authoring → validation → subject QA →
contract test → Hub projection → regression → release.
Never change official credits/AcademicUnit IDs to fit content. Never fabricate sources.
