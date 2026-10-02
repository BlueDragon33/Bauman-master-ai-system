# HCI06 — ACCEPTANCE · HARDENING · LEGACY CLOSURE · RC READINESS
Mode: `TASK-REGRESSION · ACCESSIBILITY-RED-TEAMED · EVIDENCE-SKEPTICAL · NO-KNOWN-BLOCKER`

# TEST MATRIX
- User/task/context mismatch and wrong success criteria.
- Ambiguous labels, missing units/state, poor hierarchy, information overload.
- Destructive/irreversible controls and recovery.
- Loading/success/error/save/mode feedback.
- Keyboard access, tab order, visible focus, traps, focus restoration.
- Accessible names/roles/states, headings, errors, status announcements.
- Contrast/text-resize/zoom/target/motion using applicable configured criteria.
- Desktop/tablet/mobile task preservation.
- Memory-heavy flow, mode error, preventable repeated error.
- Alarm priority/flood/false alarm if in scope.
- Reject aesthetic-only claims, one-metric overclaims, fabricated participants and universal claims from tiny samples.
- Distinguish heuristic evidence from observed-user evidence.
- Accept multiple valid redesigns when criteria/evidence support them.
- Human-AI: correct/wrong/uncertain suggestion, override, automation bias, explanation gap, recovery.
- AI cannot fabricate study evidence or certify accessibility from one checker.
- Logs minimize personal data.

# AUTHORING ACCEPTANCE
Author creates task case, interface audit, accessibility case, walkthrough, usability-study task and human-AI case without app-code edits.

# LEGACY / OWNER GATE
Resolve duplicate accessibility checker, task-flow registry, heuristic evaluator, interaction logger, case registry and stale routes. Do not duplicate global design-token/component owner.

# RC FREEZE
Freeze SHA, content snapshot, subject pack, interface-case revisions, accessibility/evaluation profiles, config and lockfile.

# PRODUCTION SMOKE
Open HCI subject → canonical task/interface case → inspect user/task/context → run accessibility audit → run heuristic/walkthrough/evidence task → inspect redesign → verify subject pack/revision/evaluation profile → verify optional AI fallback → offline static case if supported.

# BLOCKERS
Inaccessible core learning flow; keyboard trap; hidden focus; fabricated usability evidence; automated score mislabeled as full accessibility proof; unresolved high-risk destructive action; AI fabricates participant/result; duplicate Design-System owner; migration corrupts learner evidence.

# DELIVERABLES
`HCI_ACCEPTANCE_MATRIX.md`, `HCI_TASK_INTERFACE_REGRESSION.json`, `HCI_ACCESSIBILITY_REGRESSION.json`, `HCI_USABILITY_EVIDENCE_ACCEPTANCE.md`, `HCI_HUMAN_AI_ACCEPTANCE.md`, `HCI_SECURITY_PRIVACY_REPORT.md`, `HCI_RESPONSIVE_REPORT.md`, `HCI_OFFLINE_PERFORMANCE_REPORT.md`, `HCI_LEGACY_CLOSURE_REPORT.md`, `HCI_RC_MANIFEST.json`, `HCI_PRODUCTION_SMOKE_PROFILE.md`, `HCI06_EVIDENCE_INDEX.md`.

# PASS
PASS only when user/task/context, ergonomic reasoning, accessibility, evaluation evidence, redesign and AI agree; no blocker remains; exact RC exists.
