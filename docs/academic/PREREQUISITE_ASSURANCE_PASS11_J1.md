# Prerequisite Assurance · Pass 11 · J1 Information-System Architecture

Date: 2026-09-10
Branch: `temp/bauman-master-hub-prereq-2026`
Status: `J1_PACK_IMPLEMENTED_GATE_PENDING`

## Goal

Build a neutral ASOIU information-system architecture bridge before semester 1. The purpose is to stop the prerequisite route from treating autonomous robot/sensor/controller architecture as the default meaning of АСОИУ.

J1 is a competency bridge inferred by Bauman Master Hub. It is not an administrative prerequisite declared by Bauman.

## Audit finding

The existing Systems curriculum is strongly biased toward autonomous systems: its title, target, outcomes and first preparation module explicitly center UGV/USV, sensors, controllers and feedback. The reusable concepts are system boundary, component responsibility, interface/message contracts, failure modes and fallback. Those concepts are retained; the autonomous-system case is no longer allowed to control the default prerequisite route.

## New J1 pack

Added `assets/data/prerequisite-packs/j01-information-system-architecture.json` with a neutral default case:

`web client → application service → database → analytics worker → observability`

The route contains 10 nodes:

1. system boundary, actors and responsibilities;
2. components, layers and decomposition;
3. interfaces and data contracts;
4. end-to-end data flow and state ownership;
5. deployment and runtime topology;
6. latency, throughput and capacity;
7. bottleneck and dependency analysis;
8. availability, failure modes and graceful degradation;
9. observability and operational evidence;
10. architecture documentation and trade-off defense.

## Official-course mapping

J1 supports semester-1 d03 Analytical Models, d05 OOP Design and d15 Software Development; it bridges later d09 Reliability. It is a primary bridge for d14 IS Project Management, d19 Lifecycle Processes and p03 Operational Practice.

The official 2026 curriculum mirror remains the source of truth for course identity, credits and semesters.

## Reuse before rebuild

Pass 11 reuses `s_p01_l1` only at concept level. Its UGV/USV and sensor-estimator-planner-controller example is explicitly blocked from becoming the J1 default.

## Diagnostic

Global formula remains:

`M = 0.25*D0 + 0.50*D1 + 0.25*D2`

J1 target = 85, D1 application minimum = 80, critical misconceptions allowed = 0. The pack contains:

- D0: 18 recall items;
- D1: 12 application tasks;
- D2: 8 bilingual VI/RU oral prompts;
- 12 critical misconceptions;
- 8 targeted repair routes.

D1 requires actual architecture work: context/component/sequence/deployment views, API/data contract, latency budget, bottleneck evidence, failure/degradation matrix, observability map and a compact architecture dossier.

## Scope guard

The default route excludes robot-specific architecture, UGV/USV sensor-control pipelines, PID/LQR/Kalman, ROS specialization, FPGA/PLC/SCADA, Kubernetes/service mesh and cloud-certification architecture. These may exist later as topic-specific extensions only when an official course, practice or confirmed NIR/VKR direction requires them.

## Validator

Added `scripts/validate-j01-information-system-architecture.js` and wired it into the Academic 2026 CI workflow.

The validator checks:

- J1 registry target and pre-semester-1 activation;
- exact official identities for d03/d05/d09/d14/d15/d19/p03;
- neutral default reference case;
- concept-only reuse policy for `s_p01_l1`;
- 10-node unique ordered acyclic dependency graph;
- architecture concept coverage;
- D0/D1/D2 counts, references and Russian prompts;
- misconception/repair-route integrity;
- scope guards against robotics/control/platform detours;
- independent dependency-cycle, serial-latency, serial-availability and bottleneck-measurement sanity invariants.

## Runtime policy

Pass 11 does not write diagnostic scores, mutate the adaptive scheduler, overwrite Systems lessons, create a new top-level subject or merge into `main`.

## Next

Pass 12 should implement P0 Technical Russian mapping by official course rather than creating another general-Russian curriculum: terminology, command verbs, exam/credit phrasing, oral explanation templates and course-specific mini glossaries for semester-1 priority subjects.
