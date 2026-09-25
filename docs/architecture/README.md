# Bauman Next-Generation Platform — Architecture Blueprint v1

Status: **DESIGN BASELINE / NO RUNTIME CHANGE**  
Baseline: `main@c195f2abc4fe0ee6a6cf3f05aab04e814a07d0b2`  
Program: `BAUMAN_NEXT_GENERATION_PLATFORM_PROGRAM`

## Purpose

This folder is the construction dossier for evolving Bauman from a collection of capable subject applications into a long-lived learning platform.

It is intentionally written before the next implementation wave. No document in this folder authorizes a production mutation by itself.

Roadmap V2 remains terminal at L35. This program must not be named L36.

## Building analogy

| Building | Bauman |
| --- | --- |
| Owner brief | Product Charter |
| Geological survey | As-Is audit |
| Structural drawings | Target architecture |
| Foundation | Domain model, identity, contracts, registries |
| Structural frame | Platform Kernel and capability runtime |
| Electrical/plumbing/fire systems | Security, data, events, storage, deployment |
| Floors | Subjects, learning experiences, admin surfaces |
| Interior system | Design system and UI/UX |
| Inspection | QA, regression, human UX acceptance |
| Building operations | Observability, backup, rollback, release |
| Renovation rules | Governance, versioning, ADR, deprecation |

## Dossier

1. [00 Product Charter](00-PRODUCT-CHARTER.md)
2. [01 As-Is Architecture](01-AS-IS-ARCHITECTURE.md)
3. [02 Target System Architecture](02-TARGET-SYSTEM-ARCHITECTURE.md)
4. [03 Platform Foundation](03-PLATFORM-FOUNDATION.md)
5. [04 Domain and Data Contracts](04-DOMAIN-DATA-CONTRACTS.md)
6. [05 Extension and Content Architecture](05-EXTENSION-CONTENT-ARCHITECTURE.md)
7. [06 Real Learning Architecture](06-REAL-LEARNING-ARCHITECTURE.md)
8. [07 UI/UX Architecture](07-UI-UX-ARCHITECTURE.md)
9. [08 Security and Trust Model](08-SECURITY-TRUST-MODEL.md)
10. [09 Runtime and Deployment Topology](09-RUNTIME-DEPLOYMENT-TOPOLOGY.md)
11. [10 Quality Attributes and Gates](10-QUALITY-ATTRIBUTES-AND-GATES.md)
12. [11 Observability and Operations](11-OBSERVABILITY-OPERATIONS.md)
13. [12 Migration Strategy](12-MIGRATION-STRATEGY.md)
14. [13 Evolution and Governance](13-EVOLUTION-GOVERNANCE.md)
15. [14 Master Dependency Roadmap](14-MASTER-DEPENDENCY-ROADMAP.md)
16. [15 Architecture Ready Gate](15-ARCHITECTURE-READY-GATE.md)
17. [ADR template](adr/0000-template.md)
18. [Machine-readable blueprint manifest](BLUEPRINT_MANIFEST.v1.json)

## Four existing constitutions retained

Future implementation must simultaneously respect:

- **Extensible Platform Architecture** — Core-stable, add-on/content-first.
- **Future Professional UI/UX** — one coherent premium interaction language.
- **Professional QA + Auto-Fix** — reproduce → root cause → fix → regression.
- **Real Learning & Outcome System** — learn → practice → evidence → mastery → output.

This dossier supplies the missing system-level blueprints around those constitutions.

## Prime rule

**Blueprint before construction. Contract before component. Evidence before mastery. Preview before production.**

