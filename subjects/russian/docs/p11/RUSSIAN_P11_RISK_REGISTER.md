# Russian P11 Risk Register

| ID | Severity | Risk | Control / owner |
|---|---|---|---|
| P11-R001 | CRITICAL | Scenario layer creates a second speech/dialogue engine | Validator forbids duplicate owners; P6 remains sole runtime owner |
| P11-R002 | HIGH | Scenario completion is mistaken for mastery | Registry writesMastery=false; P4 remains authority |
| P11-R003 | HIGH | Branches reference missing dialogue contexts | Validator checks every contextRef against speaking-link-index |
| P11-R004 | HIGH | Scenario dead-end after mic/ASR failure | P6 fallback contract is mandatory |
| P11-R005 | MEDIUM | AI-generated turn becomes canonical silently | P10/P12 lifecycle preserved |
| P11-R006 | MEDIUM | Scenario catalog overfits one stage | Coverage spans vn, prep, hk1, hk3 and hk4 |
