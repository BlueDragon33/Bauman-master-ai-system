# Prerequisite Assurance · Pass 07 · P7 Linux / OS / Networks

Date: 2026-09-10
Branch: `temp/bauman-master-hub-prereq-2026`
Status: `P7_BLUEPRINT_VALIDATED_CI_PASS`
CI run: `34453120930`
Head SHA validated: `ea0830b741a5ea3017ba36eb94221dad8115881c`

## Goal

Close the clearest missing active prerequisite path: `P7 · Linux, hệ điều hành & mạng`. Keep it developer/system oriented and compact so it supports databases, software engineering, post-relational databases, security, Big Data and NIR without turning into a sysadmin/network-certification track.

P7 is a competency prerequisite inferred by Bauman Master Hub. It is not an administrative prerequisite declared by Bauman.

## Reuse before rebuild

The current Programming vault does not contain a complete Linux/OS/network route. Pass 07 reuses only adjacent material:

- `PR01 · Thiết lập môi trường Python, VS Code và Live Server` for environment/venv basics;
- `PR27 · API inference với FastAPI` only as a later HTTP/client-server application bridge;
- `PR30 · Docker nhập môn cho môi trường tái lập` is explicitly deferred and is not required for P7 READY.

## New P7 pack

Added `assets/data/prerequisite-packs/p07-linux-os-networks.json` with 10 nodes:

1. Linux shell, paths and files.
2. Users, permissions and environment variables.
3. Process, thread, stdin/stdout/stderr and pipes.
4. Memory and filesystem basics for developers.
5. Package/virtual-environment/CLI workflow.
6. SSH and remote workflow.
7. TCP/IP, IPv4, DNS and ports.
8. TCP, UDP and sockets/client-server.
9. HTTP request-response and API system view.
10. End-to-end service ↔ database ↔ network troubleshooting and official-course bridge.

## Official-course mapping

P7 is mapped as competency support/bridge to the locked IU5 2026 curriculum:

- d06 Database Optimization — support;
- d10 Post-relational Databases — support;
- d15 Software Development Technologies — support;
- e01 Security elective group — critical bridge;
- e02a Big Data — critical bridge;
- p03 Operational Practice — support.

## Diagnostic design

Global formula remains `M = 0.25*D0 + 0.50*D1 + 0.25*D2`.

P7 target is 85, D1 minimum is 85, and zero critical misconceptions are allowed. Broad study stops at MASTERED (`>=95`, D1 `>=90`, zero critical misconceptions).

The pack contains:

- D0: 18 recall items;
- D1: 12 application tasks;
- D2: 8 bilingual VI/RU oral prompts;
- 10 critical misconceptions;
- 8 targeted repair routes.

D1 focuses on real troubleshooting rather than trivia: safe file operations, permission 640, stdin/stdout/stderr pipelines, OOM vs disk-full, venv/PATH diagnosis, SSH error-layer classification, /24 subnet reasoning, TCP-vs-UDP choice, socket workflow, URL/HTTP decomposition and ordered diagnosis of client→service→database failures.

## Scope guard

The active route excludes kernel compilation/modules, advanced scheduler/virtual-memory internals, firewall administration deep dives, CCNA/CCNP, Kubernetes administration, cloud networking certification and penetration testing. It also keeps UGV/USV/control/hardware-specific material out of the prerequisite route.

## Validator and CI

Added `scripts/validate-p07-linux-os-networks.js` and wired it into the Academic 2026 workflow.

The validator checks registry target/topic integrity, official target identities, actual PR01/PR27/PR30 existence before reuse, 10 unique ordered acyclic nodes, required Linux/OS/network signals, D0/D1/D2 integrity, Russian oral prompts, critical misconceptions, repair routes and scope guards. Independent sanity checks validate Unix permission 0640, /24 subnet matching, URL decomposition and valid port ranges.

The first strict CI run correctly stopped in the P7 gate because the scope regex treated the operating-system term `PID` (process identifier) as if it were the control-theory term PID. This was a validator false positive, not an academic-content error. The validator was corrected narrowly: operating-system PID remains valid, while PID controller/control terminology remains blocked from the active prerequisite path. No content requirement was weakened.

CI run `34453120930` completed successfully for head `ea0830b741a5ea3017ba36eb94221dad8115881c`, including official curriculum, prerequisite coverage, P9, P6, P4, P7 and runtime checks.

## Runtime policy

Pass 07 still does not write diagnostic scores, mutate the adaptive scheduler, require Docker for READY, create a new top-level subject, overwrite existing Programming lessons or merge into `main`.

## Next pass

Pass 08 should implement `P8 · Software Engineering` by reusing PR07/PR14/PR17/PR18/PR19/PR22/PR23/PR24 and filling only the remaining gaps: explicit requirements quality, UML views, SOLID, architecture quality attributes, lifecycle models, integration/regression/system testing and configuration/release management.
