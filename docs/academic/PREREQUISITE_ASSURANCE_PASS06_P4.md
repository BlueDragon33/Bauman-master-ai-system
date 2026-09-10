# Prerequisite Assurance · Pass 06 · P4 Discrete / Algorithms / Data Structures

Date: 2026-09-10
Branch: `temp/bauman-master-hub-prereq-2026`
Status: `P4_BLUEPRINT_VALIDATED_CI_PASS`
CI run: `34452679592`
Head SHA validated: `72cc9ef475b2e483d5c48a055694bd0e8dbf6bb2`

## Goal

Close only the audited gaps in `P4 · Toán rời rạc, thuật toán & cấu trúc dữ liệu` before semester-1/semester-2 official IU5 work, without creating a competitive-programming detour.

P4 is a competency-readiness layer inferred by Bauman Master Hub. It is not an administrative prerequisite declared by Bauman.

## Reuse before rebuild

Pass 06 reuses verified content already present in the Programming app:

- `PR02 · Tư duy thuật toán và độ phức tạp`;
- `PR10 · Pseudocode và giải thích thuật toán bằng tiếng Nga`;
- `PR11 · Cấu trúc dữ liệu nhập môn`.

It also reuses the existing Math discipline spines `math_language_logic` and `discrete_graph_db_knowledge` as conceptual references. No duplicate broad discrete-math course is created.

## New P4 pack

Added `assets/data/prerequisite-packs/p04-discrete-algorithms-data-structures.json` with 10 nodes:

1. Logic, sets, relations and mappings.
2. Time/space complexity — reuse/extend PR02.
3. Array, linked list, stack and queue — reuse/extend PR11.
4. Hash tables and collision handling.
5. Trees, BST and traversal.
6. Recursion and call stack.
7. Sorting and binary search.
8. Graph representation, BFS and DFS.
9. Tree/graph complexity and data-structure selection.
10. Bridge to OOP, databases, Mivar and Big Data.

## Official-course mapping

P4 is mapped to official curriculum targets only as a competency dependency:

- `d05 · Объектно-ориентированное проектирование АСОИУ` — primary, semester 1;
- `d06 · Оптимизация баз данных систем машинного обучения` — support, semester 1;
- `d10 · Постреляционные базы данных` — primary, semester 2;
- `d18 · Миварные технологии логического искусственного интеллекта` — primary, semester 4;
- `e02a · Технологии обработки больших данных` — elective bridge, semester 4.

The locked official curriculum remains `assets/data/official-curriculum-iu5-2026.json`.

## Diagnostic design

P4 follows the global mastery formula `M = 0.25*D0 + 0.50*D1 + 0.25*D2`.

Registry target is 88, with D1 application minimum 85 and zero critical misconceptions. Broad P4 study stops at MASTERED (`>=95`, D1 `>=90`, zero critical misconceptions) and only reopens a narrower node when an official course exposes a real gap.

Pack contents:

- D0: 18 recall items;
- D1: 12 application tasks;
- D2: 8 bilingual VI/RU oral prompts;
- 10 critical misconceptions;
- 8 targeted repair routes.

D1 emphasizes actual use: workload-based array/list choice, collision reasoning, BST traversal, recursion tracing, correct binary search, sort trade-offs, BFS/DFS, shortest paths in unweighted graphs, adjacency-list vs matrix choice and representation/complexity decisions for system data.

## Scope guard

The default P4 path explicitly excludes competitive-programming expansion such as segment/Fenwick trees, suffix structures, advanced flow tricks and computational geometry. It also keeps UGV/USV, PID/LQR, Kalman, FPGA, PLC/SCADA and robot-specific material out of active P4 content.

## Validator and CI

Added `scripts/validate-p04-discrete-algorithms-data-structures.js` and wired it into the Academic 2026 workflow.

The validator checks P4 registry/topic integrity, exact official targets, actual PR02/PR10/PR11 reuse, Math spine IDs, 10 unique ordered acyclic nodes, required topic signals, D0/D1/D2 integrity, Russian oral prompts, misconception/repair-route integrity and scope guards. Independent sanity checks execute binary search, BFS shortest-path-by-edge-count, DFS reachability and a hash-collision case.

CI run `34452679592` completed successfully for head `72cc9ef475b2e483d5c48a055694bd0e8dbf6bb2`, including official curriculum, prerequisite coverage, P9, P6, P4 and runtime checks.

## Runtime policy

Pass 06 still does not write diagnostic scores, mutate the scheduler, overwrite existing Programming lessons, create a new top-level subject or merge into `main`.

## Next pass

Pass 07: implement `P7 · Linux / OS / Networks`, currently the clearest missing active prerequisite path. Keep it compact and practical: shell/files/permissions → process/thread → memory/filesystem → SSH → TCP/IP/TCP-UDP → ports/sockets → HTTP → client/server → environment/package management.
