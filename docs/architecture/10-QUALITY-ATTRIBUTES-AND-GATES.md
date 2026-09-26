# 10 — Quality Attributes and Gates

Quality must be specified as engineering constraints, not adjectives.

## Quality attributes

### Correctness
Business and academic contracts behave as specified.

### Truthfulness
Progress/report/mastery claims never exceed evidence/authority.

### Reliability
Retry, refresh and repeated commands do not create corrupt duplicate state.

### Security
Protected operations/data fail closed.

### Usability
Critical journeys are understandable to a non-technical user without developer guidance.

### Accessibility
Keyboard/focus/semantic/contrast/reduced-motion requirements are first-class.

### Performance
Unused extensions are not loaded; large data is paginated/virtualized/lazy; interaction provides immediate feedback.

### Compatibility
Published content and learner state survive supported platform versions through adapters/migrations.

### Observability
A production failure can be traced to revision, runtime, route and bounded context without exposing secrets.

## Severity

- P0: security bypass, data loss/corruption, production outage, destructive migration.
- P1: critical learner/admin journey blocked, false mastery/authority, protected resource unavailable.
- P2: major secondary flow or UX/state defect.
- P3: minor visual/copy/inconsistency.
- P4: enhancement/polish.

No unresolved P0/P1 at release.

## Construction gates

### A0 — Architecture Ready
Blueprint complete and coherent.

### A1 — Foundation Ready
Identity/contracts/registry/capability/storage/event contracts validated.

### A2 — Vertical Slice Ready
One real learning slice passes end-to-end.

### A3 — Platform Ready
Content/extension path proven without Core-specific workaround.

### A4 — Migration Ready
Legacy can move incrementally with compatibility/rollback.

### A5 — Product Ready
Professional UX, academic truthfulness, security, operations and QA pass.

## Release gates

`Targeted → affected subsystem → whole system → post-merge → Preview exact SHA → Production exact SHA → production smoke`

## Human UX gate

Automation passing is necessary, not sufficient.

A major UI flow fails acceptance if it remains confusing, visually incoherent, excessively long, inaccessible or dependent on technical knowledge.

