# 17 — Non-Functional Requirements and Capacity Budgets

Numbers below are initial design budgets, not immutable guarantees. They must be measured on representative devices and revised through evidence.

## Performance budgets

### App shell
- meaningful shell feedback should appear quickly even before heavy subject content is loaded;
- avoid blocking initial render on optional packages;
- no unused subject/extension bundle should be eagerly loaded by default.

### Interaction
- user actions should either complete quickly or show immediate pending/loading feedback;
- long operations require progress or clear state, not silent waiting.

### Large data
- thousands of vocabulary/questions/resources must use lazy loading, indexing, pagination or virtualization;
- never render tens of thousands of DOM nodes as a normal view.

### Layout
- no critical cumulative layout shift caused by late insertion of known shell regions;
- resource viewers must reserve stable workspace geometry where possible.

## Reliability budgets

- release P0/P1 defects: zero known unresolved;
- duplicate destructive command caused by normal retry: zero tolerance;
- false mastery/false official authority: zero tolerance;
- production revision mismatch: zero tolerance.

## Compatibility budgets

- published content contracts receive explicit compatibility windows;
- deprecated public SDK/schema versions must publish migration guidance before retirement;
- historical evidence remains readable across supported migrations.

## Accessibility budgets

Critical learner/admin journeys must be operable with keyboard and preserve visible focus.

Design targets WCAG AA-style contrast and semantics as the default quality bar.

## Offline/package budgets

A package marked offline-capable must identify all required local assets and pass offline acceptance; the flag cannot be aspirational metadata.

## Capacity model

Capacity planning must measure at least:

- content objects per subject;
- learner-state records;
- evidence growth;
- artifact metadata;
- search index size;
- package size;
- D1 query/read/write patterns.

Do not design authoritative stores from current small dataset assumptions.

## Budget governance

Any work package that materially exceeds a budget must either:
- optimize;
- prove why the budget is unrealistic and revise it through ADR/evidence;
- reduce scope.

