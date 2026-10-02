# ERGONOMICS / HCI PROMPT SYSTEM
## Bauman IU5 · Эргономический анализ систем обработки и отображения информации
## Canonical execution runbook

Repository: `BlueDragon33/Bauman-master-ai-system`

Primary scope: `subjects/ergonomics-hci/` or the actual scope discovered by HCI01.

# 0. PURPOSE

This package defines the subject architecture for **Ergonomic Analysis of Information Processing and Display Systems**. It reuses C1 Architecture, C2 UI/UX, C3 QA/Auto-Fix and C4 Learning/Outcome. This README is the single execution runbook.

Academic chain:
`Human → Goal → Task → Context → Information Need → Display/Control → Feedback → Performance → Error/Workload → Evidence → Redesign → Re-evaluation`.

This is not a “make the UI beautiful” course. It studies human performance, usability, accessibility, error, workload and human-AI interaction.

# 1. FOUNDATION DEPENDENCIES
Reuse shared C2 Design System, Research Methodology, OOP/Software Engineering, Math/Statistics where measurement is needed, AI/ML where human-AI interaction is relevant, and Analytical Models where human-system models apply. Do not duplicate their canonical truth.

# 2. SUBJECT OWNERSHIP
HCI owns user/task/context modeling; ergonomic requirements; task/workflow analysis; information needs; perception/attention/memory/cognitive-load concepts where supported; mental models; information-display design; control-display compatibility; feedback; error prevention/recovery; alarms where supported; usability; accessibility; physical/environmental ergonomics only to actual scope; heuristic inspection; cognitive walkthrough; usability testing; human-performance measures; evidence-based redesign; human-in-the-loop AI.

HCI does not automatically own frontend implementation, visual branding, software architecture, medical diagnosis, occupational-health regulation, generic psychology/statistics, or generic AI-model development.

# 3. ACTIVE MODULES
- `HCI_MASTER_PROMPT.md` — HCI00
- `HCI01_FORENSIC_BASELINE.md`
- `HCI02_ACADEMIC_BLUEPRINT_CANONICAL_MODEL.md`
- `HCI03_HUMAN_FACTORS_REASONING_ASSESSMENT.md`
- `HCI04_EVALUATION_SIMULATION_INSTRUMENTATION_AI.md`
- `HCI05_LEARNING_EXPERIENCE_AUTHORING_INTEGRATION.md`
- `HCI06_ACCEPTANCE_HARDENING_RC_READINESS.md`
- `HCI_CONSTITUTION_ROUTER.json`
- `HCI_ARCHITECTURE_MAP.md`
- `STATUS.md`

# 4. EXECUTION COMMAND
> Thực thi môn Ergonomics / HCI theo `ERGONOMICS_HCI_PROMPT_SYSTEM/00_README.md`. Đọc STATUS, xác định module active, chỉ nạp điều khoản Hiến pháp do router chỉ định, tiếp tục từ evidence hiện tại, không re-audit toàn hệ nếu diff không yêu cầu, chỉ chuyển bước khi exit gate PASS.

# 5. EXECUTION ORDER
`HCI00 context → HCI01 → HCI02 → HCI03 → HCI04 → HCI05 → HCI06 → shared production release`.

# 6. SESSION START
1. README. 2. STATUS. 3. Active module only. 4. Router. 5. Routed constitution clauses only. 6. Current-main diff. 7. Existing evidence. 8. Targeted tests. 9. Required regression. 10. Advance only on PASS.

Token rule: `README → STATUS → ACTIVE MODULE → ROUTER → DIFF → TESTS`.

# 7. HCI01 — FORENSIC BASELINE
Audit actual users, tasks, context, display/control examples, evaluation methods, accessibility, workload/cognitive content, alarms, human-AI interaction, assessments, authoring, legacy and duplicate owners. Possible topics are audit targets, not assumptions about the exact syllabus.

Exit only when actual scope, task/interface artifacts, evaluation paths, C2 boundary, grader ownership, risks and HCI02 input contract are evidenced.

# 8. HCI02 — CANONICAL MODEL
Build:
`UserRole → Goal → Task → ContextOfUse → InformationRequirement → DisplayElement/ControlElement → Interaction → SystemState → Feedback → HumanError/ErgonomicRisk → Evaluation → Finding → Redesign → Re-evaluation`.

After PASS: `ERGONOMICS HCI FOUNDATION LOCKED`.

# 9. HCI03 — REASONING & ASSESSMENT
Learner workflow:
`identify user → task → context → information/control needs → inspect interaction → predict error/workload → gather evidence → root cause → redesign → re-evaluate`.

Critical rule: **visual attractiveness does not prove usability, accessibility or safety**.

After PASS: `ERGONOMICS HCI REASONING & ASSESSMENT CONTRACT LOCKED`.

# 10. HCI04 — EVALUATION / INSTRUMENTATION / AI
Potential capabilities: task-flow inspector, interaction logger, heuristic review, cognitive walkthrough, usability-study runner, accessibility checker, keyboard/focus inspection, contrast checks, display/alarm simulation, interface comparison, human-AI scenario runner, AI Ergonomics Tutor.

Rules: automated accessibility score ≠ complete accessibility; heuristic finding ≠ observed-user evidence; one study ≠ universal proof; completion time alone ≠ usability; AI cannot fabricate participants or results.

# 11. HCI05 — LEARNING EXPERIENCE / AUTHORING
Possible surfaces: user/task canvas, workflow map, information-requirement matrix, display/control critique, accessibility audit, heuristic checklist, usability protocol, observation timeline, before/after redesign, human-AI scenario, ergonomic report. Reuse App Shell, C2 Design System, Research Methodology and shared authoring/mastery/evidence.

# 12. HCI06 — ACCEPTANCE
Test keyboard/focus, semantics, applicable contrast/text criteria, ambiguous labels, missing feedback, mode confusion, destructive action recovery, information overload, alarms if in scope, responsive mismatch, accessibility, small-study overclaim, timing-only overclaim, automation bias, AI-fabricated evidence and exact RC.

# 13. SHARED RELEASE
After HCI06 PASS do not create HCI07. Use `../../constitution/C3_RELEASE_ANNEX_SHARED.md` with HCI06 smoke profile.

# 14. FAILURE ROUTING
Canonical truth → HCI02. Reasoning/grader → HCI03. Evaluation/instrumentation/AI → HCI04. UX/authoring → HCI05. Regression/security/RC → HCI06. Generic Design-System implementation → C2/platform owner.

# 15. REVALIDATION
HCI02 change → HCI03–HCI06. HCI03 → HCI04–HCI06. HCI04 protocol → HCI05–HCI06. HCI05 interaction → HCI06 affected UX/a11y. HCI06 semantic defect routes upstream.

# 16. COMPLETE
Prompt architecture complete when HCI00–HCI06 exist. Repository implementation complete only after `HCI01 PASS → HCI02 PASS → HCI03 PASS → HCI04 PASS → HCI05 PASS → HCI06 PASS → shared production verification`.

# 17. FINAL PRINCIPLE
**USER BEFORE INTERFACE. TASK BEFORE SCREEN. INFORMATION NEED BEFORE VISUAL DENSITY. ERROR PREVENTION BEFORE ERROR MESSAGE. MEASUREMENT BEFORE USABILITY CLAIM. ACCESSIBILITY IS NOT OPTIONAL. AI ASSISTANCE MUST PRESERVE HUMAN UNDERSTANDING AND CONTROL.**

---

# NORMAL CHAT / WORK / CODEX ENTRY

This prompt system is channel-neutral. It may be used from an ordinary ChatGPT chat, ChatGPT Work, or Codex.

For a new ordinary chat, read only:

1. `prompts/CONSTITUTION.md`;
2. exact C1–C4 clauses routed by this subject's Constitution Router;
3. this `README.md`;
4. the subject Master Prompt;
5. `PROJECT_STATE.json`;
6. the active module prompt;
7. current repository diff/evidence only when repository work is requested.

Chat history is context, not project authority. Repository state is the durable handoff.

If the task is discussion/planning only, do not pretend repository changes were executed. If repository modification is explicitly requested and GitHub access is available, use the same state/evidence rules.
