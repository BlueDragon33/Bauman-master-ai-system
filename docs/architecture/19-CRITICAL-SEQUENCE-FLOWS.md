# 19 — Critical Sequence Flows

These sequences are architectural reference flows. Implementations may vary internally but must preserve the authority boundaries.

## Learner opens protected lesson

```mermaid
sequenceDiagram
  participant U as Learner
  participant R as Learning Runtime
  participant C as Control Service
  participant P as Subject/Content Package
  U->>R: Open lesson
  R->>C: Validate learner/device session
  C-->>R: Allowed / fail-closed
  alt allowed
    R->>P: Resolve manifest/resources
    P-->>R: Resource descriptors
    R-->>U: Render lesson
  else denied
    R-->>U: Access recovery state
  end
```

## Extension produces evidence

```mermaid
sequenceDiagram
  participant X as Extension
  participant H as Extension Host
  participant A as Assessment/Evidence Service
  participant M as Mastery Policy
  X->>H: Submit candidate evidence
  H->>A: Validate capability + schema + actor
  A-->>H: Evidence recorded
  A->>M: Evidence available
  M-->>A: Policy decision when applicable
  Note over X,M: Extension cannot directly set mastery
```

## Content import

```mermaid
sequenceDiagram
  participant A as Author
  participant I as Import Center
  participant V as Validators
  participant R as Registry
  participant P as Publisher
  A->>I: Upload PDF/URL/HTML/package
  I->>V: Detect + validate + derive draft manifest
  V-->>I: Errors/warnings/draft mapping
  A->>I: Review academic mapping
  I->>R: Stage versioned content
  P->>R: Approve/publish
```

## Production promotion

```mermaid
sequenceDiagram
  participant G as GitHub main SHA
  participant P as Preview
  participant X as Exact Revision Gate
  participant D as Production
  G->>P: Manual deploy
  P->>X: Control + Runtime read-back
  X-->>G: PASS only on exact SHA
  G->>D: Manual production deploy
  D-->>G: Exact revision + readiness smoke
```

## Retry rule

Any sequence containing a retryable mutation must document idempotency semantics before implementation.

