# 15 — Gate A0: Architecture Ready

This gate decides whether the project is sufficiently designed to begin Foundation implementation.

Status at creation: **CANDIDATE — REVIEW REQUIRED**

## Required dossier

- [x] Product Charter
- [x] As-Is Architecture
- [x] Target System Architecture
- [x] Platform Foundation definition
- [x] Domain/Data contract blueprint
- [x] Extension/Content blueprint
- [x] Real Learning architecture
- [x] UI/UX architecture
- [x] Security/Trust model
- [x] Runtime/Deployment topology
- [x] Quality attributes/gates
- [x] Observability/Operations
- [x] Migration strategy
- [x] Evolution/Governance
- [x] Dependency roadmap
- [x] ADR process

## Review questions

### Product
- Is Bauman's purpose explicit enough to reject out-of-scope features?
- Are learner/admin/author responsibilities clear?

### Structure
- Are bounded contexts and ownership clear?
- Are Core/package/plugin boundaries explicit?
- Are direct forbidden dependencies documented?

### Foundation
- Is durable identity stable?
- Are schema/version/migration rules explicit?
- Can old subject stores coexist during migration?

### Learning
- Are progress, evidence and mastery separated?
- Is AI authority constrained?
- Can real learner outputs be represented?

### UX
- Can future extensions inherit a single shell/design system?
- Is mobile/accessibility part of architecture rather than polish?

### Security
- Are trust zones, Device Gate, role authority and extension sandbox explicit?
- Is secret ownership unambiguous?

### Operations
- Is exact-preview-first production still protected?
- Can failure be diagnosed and rolled back?

### Quality
- Are P0/P1 release blockers?
- Is human UX acceptance required?
- Does each wave have an exit gate?

## A0 PASS condition

A0 may be marked PASS only after:

1. dossier review finds no structural contradiction with current-main protected contracts;
2. any required architecture corrections are incorporated;
3. a first vertical slice is selected;
4. Wave 1 work packages are decomposed with explicit dependencies;
5. no implementation work has to invent missing foundational policy during coding.

A0 PASS authorizes **Foundation Wave implementation**, not production deployment.

