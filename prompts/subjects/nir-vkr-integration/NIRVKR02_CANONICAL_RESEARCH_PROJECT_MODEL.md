# NIRVKR02 — CANONICAL RESEARCH PROJECT & CAPSTONE MODEL

Mode:

`ONE-PROJECT-IDENTITY · REVISIONED · PROVENANCE-FIRST · STAGE-AWARE · CANONICAL-OWNER`

# ENTRY

Requires NIRVKR01.

# CANONICAL ENTITIES

`ResearchProject`
`ProjectIdentity`
`TopicRevision`
`ResearchProblem`
`ResearchQuestion`
`ResearchObjective`
`ResearchTask`
`SupervisorContext`
`InstitutionalStage`
`Milestone`
`ResearchPlan`
`LiteratureSourceRef`
`ResearchActivity`
`ExperimentRef`
`DatasetRef`
`CodeRevisionRef`
`ModelRef`
`ConfigurationRef`
`ResearchArtifact`
`ResearchResult`
`ResearchClaim`
`Limitation`
`StageDeliverable`
`ApprovalRecord`
`FeedbackItem`
`RevisionAction`
`ReadinessCriterion`
`ReadinessGate`
`VKRSection`
`FigureRef`
`TableRef`
`PresentationArtifact`
`DemoArtifact`
`DefensePackage`
`FinalArchive`
`AIUseRecord`
`Misconception`
`Remediation`

# ONE PROJECT IDENTITY

One capstone project persists across all stages.

# TOPIC REVISION

Record:
title,
language variant if required,
scope,
date,
reason,
approval/status.

Never overwrite history.

# RESEARCH QUESTION / OBJECTIVE

Reference RSW canonical semantics.

# SUPERVISOR CONTEXT

Record actual advisor/supervisor relation and feedback source.
No fabricated approval state.

# INSTITUTIONAL STAGE

Actual evidence-derived stage only.

# MILESTONE

Stage-local checkpoint with criteria/evidence.

# RESEARCH PLAN

Timeline/work coordination may reference PDM artifacts.

# RESEARCH ACTIVITY

Literature review, modeling, experiment, implementation, validation, etc.

# EXPERIMENT REF

Reference RSW/technical-subject experiment rather than copy truth.

# DATASET REF

Exact data identity/version/provenance.

# CODE REVISION REF

Commit/SHA or equivalent exact revision.

# MODEL REF

Exact model/config/checkpoint identity.

# RESEARCH ARTIFACT

Typed artifact:
document,
code,
data,
model,
figure,
table,
diagram,
prototype,
demo,
other actual scope.

# RESULT

Observed/analyzed result with provenance.

# CLAIM

Scientific statement supported by results/evidence.

# LIMITATION

Explicit scope/validity limitation.

# STAGE DELIVERABLE

Required/optional artifact package for one actual institutional stage.

# APPROVAL RECORD

Real authority/action/date/evidence only.

# FEEDBACK ITEM

Source:
supervisor,
reviewer,
department,
peer,
other actual authority.

Fields:
issue,
severity/type,
evidence,
requested action,
status.

# REVISION ACTION

Maps feedback to changed artifact/revision.

# READINESS CRITERION

Exact evidence-backed criterion.

# READINESS GATE

Possible actual gates:
NIR stage,
practice,
pre-diploma,
VKR submission,
pre-defense,
defense
only if institutional evidence supports.

# VKR SECTION

Actual template/structure discovered in NIRVKR01.

# FIGURE / TABLE

Bind to source result/data/script revision.

# PRESENTATION

Claims link back to final manuscript/evidence.

# DEMO

Exact code/model/data revision.

# DEFENSE PACKAGE

Actual required artifacts only.

# FINAL ARCHIVE

Immutable manifest of final project evidence.

# AI USE RECORD

If disclosure policy exists or for internal provenance:
task,
tool/model,
input category,
output usage,
verification,
final human responsibility.

# DELIVERABLES

Create:
- `NIRVKR_CANONICAL_PROJECT_SCHEMA.json`
- `NIRVKR_STAGE_MODEL.md`
- `NIRVKR_TOPIC_REVISION_CONTRACT.md`
- `NIRVKR_ARTIFACT_PROVENANCE_CONTRACT.md`
- `NIRVKR_RESULT_CLAIM_TRACE_CONTRACT.md`
- `NIRVKR_FEEDBACK_REVISION_CONTRACT.md`
- `NIRVKR_READINESS_GATE_CONTRACT.md`
- `NIRVKR_DEFENSE_ARCHIVE_CONTRACT.md`
- `NIRVKR03_INPUT_CONTRACT.md`

# PASS

PASS when all stages can reference one canonical project history without duplicating technical/research truth.

# FINAL PRINCIPLE

**EVERY CAPSTONE ARTIFACT MUST KNOW WHICH PROJECT, TOPIC REVISION, STAGE AND EVIDENCE HISTORY IT BELONGS TO.**
