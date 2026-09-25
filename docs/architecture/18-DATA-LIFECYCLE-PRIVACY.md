# 18 — Data Lifecycle, Classification and Privacy

## Purpose

Define what data exists, who owns it, how long it lives, and what may be deleted or exported.

## Data classes

### Public content
Approved resources intended for public/learner distribution.

### Protected learning content
Content requiring authenticated/device-gated access.

### Learner state
Bookmarks, resume positions, notes, non-authoritative progress and preferences.

### Academic evidence
Assessment submissions, evidence records, rubric outcomes and related lineage.

### Operational/control data
Devices, control commands, review metadata, audit records.

### Secrets/credentials
Never stored in content packages, client logs, reports or telemetry.

## Lifecycle states

Where applicable:

`draft → active/published → superseded → archived → eligible-for-deletion`

Deletion eligibility is not the same as automatic deletion.

## Retention

Retention policies must be defined per bounded context, not globally.

Historical evidence and audit data may require longer retention than transient session/cache data.

## Deletion

Destructive deletion requires:

- authority check;
- explicit target scope;
- confirmation for high-impact user actions;
- audit record where appropriate;
- no misleading success before persistence completes.

Delete does not silently rewrite historical meaning.

## Export and portability

Learner-owned notes/artifacts and portfolio data should have a future-safe export path.

Export must distinguish source content from learner-created content and preserve provenance where useful.

## Privacy by design

- collect only necessary data;
- separate analytics from academic authority;
- avoid storing raw secrets/tokens;
- avoid sending protected learner content to external providers unless explicitly allowed;
- redact telemetry payloads by default.

## AI boundary

Sending content to an AI provider is a data-flow decision and must respect source/content classification and user/organizational policy.

AI-generated derivatives retain source lineage but do not inherit source authority automatically.

