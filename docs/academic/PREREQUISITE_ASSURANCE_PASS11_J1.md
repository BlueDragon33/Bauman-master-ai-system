# Prerequisite Assurance · Pass 11 · J1 Information-System Architecture

Date: 2026-09-10
Branch: `temp/bauman-master-hub-prereq-2026`
Status: `J1_BLUEPRINT_VALIDATED_CI_PASS`
Validated SHA: `a1cc0b010808c9c4777fa6bbf5bdbc4c17d4d91f`
CI run: `34483358181`

## Goal

Build a neutral ASOIU information-system architecture bridge before semester 1. The purpose is to stop the prerequisite route from treating autonomous robot/sensor/controller architecture as the default meaning of АСОИУ.

J1 is a competency bridge inferred by Bauman Master Hub. It is not an administrative prerequisite declared by Bauman.

## Audit finding

The existing Systems curriculum is strongly biased toward autonomous systems: its title, target, outcomes and first preparation module explicitly center UGV/USV, sensors, controllers and feedback. The reusable concepts are system boundary, component responsibility, interface/message contracts, failure modes and fallback. Those concepts are retained; the autonomous-system case is no longer allowed to control the default prerequisite route.

## J1 pack

`assets/data/prerequisite-packs/j01-information-system-architecture.json` defines the neutral default case:

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

Global formula remains `M = 0.25*D0 + 0.50*D1 + 0.25*D2`.

J1 target = 85, D1 application minimum = 80, critical misconceptions allowed = 0. The pack contains D0=18, D1=12, D2=8, 12 critical misconceptions and 8 targeted repair routes.

D1 requires actual architecture work: context/component/sequence/deployment views, API/data contract, latency budget, bottleneck evidence, failure/degradation matrix, observability map and a compact architecture dossier.

## Scope guard

The default route excludes robot-specific architecture, UGV/USV sensor-control pipelines, PID/LQR/Kalman, ROS specialization, FPGA/PLC/SCADA, Kubernetes/service mesh and cloud-certification architecture. These may exist later as topic-specific extensions only when an official course, practice or confirmed NIR/VKR direction requires them.

## Validator and CI

`scripts/validate-j01-information-system-architecture.js` is wired into the Academic 2026 CI workflow. It checks J1 registry integrity, official course identities, neutral default case, concept-only legacy reuse, DAG integrity, D0/D1/D2, Russian oral prompts, misconceptions/repair routes, scope guards and independent cycle/latency/availability/bottleneck invariants.

The first fully wired run correctly stopped because the neutrality assertion inspected the explanatory `whyNeutral` field itself; that field necessarily mentioned the excluded robot domain in a negative explanation. The validator was corrected to test only positive active-case fields while preserving explicit exclusion documentation. The subsequent run `34483358181` passed J1 and the entire Academic 2026 regression chain.

## Runtime policy

Pass 11 does not write diagnostic scores, mutate the adaptive scheduler, overwrite Systems lessons, create a new top-level subject or merge into `main`.

## Next

Pass 12 should implement P0 Technical Russian mapping by official course rather than creating another general-Russian curriculum: terminology, command verbs, exam/credit phrasing, oral explanation templates and course-specific mini glossaries for semester-1 priority subjects.
