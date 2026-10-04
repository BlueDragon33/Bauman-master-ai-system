# ALG01 EXECUTIVE SUMMARY

Status: **FORENSIC BASELINE CANDIDATE**

Base SHA: `13f781a34c3de240e64c71d87c5a7497e34a9d3c`

## Actual scope discovered

There is **no learner runtime at `subjects/algorithms/`** on the baseline SHA. Current Algorithms/Data Structures material is distributed across three existing owners:

1. `subjects/programming/` — learner-facing Programming shell and the legacy lessons PR02, PR10, PR11.
2. `assets/data/prerequisite-packs/p04-discrete-algorithms-data-structures.json` — the strongest current structured prerequisite blueprint for algorithms/data structures.
3. `subjects/math/data/discipline_spine.json` — adjacent Math owner for generic discrete logic, relations, graph/tree foundations and mathematical complexity context.

The new `subjects/algorithms/docs/alg01/` directory is audit evidence only. ALG01 does not create a new learner runtime or change current teaching behavior.

## Current content summary

Programming currently has 48 lessons, 144 exercises, 384 multiple-choice test items and 96 simulation records. The directly algorithm-related reusable lessons are:

- PR02 — Tư duy thuật toán và độ phức tạp
- PR10 — Pseudocode và giải thích thuật toán bằng tiếng Nga
- PR11 — Cấu trúc dữ liệu nhập môn

Together they provide 3 lessons, 9 exercises, 24 MCQ items and 6 simulation records. Their learner-facing treatment is shallow: PR02 stores the naked formula `T(n)=O(n log n); space=O(n)` without binding it to one algorithm, size measure, case or assumptions; PR11 lists `array, stack, queue, dict, graph` without an ADT/representation contract.

The P4 prerequisite pack is substantially stronger than the Programming lessons: 10 nodes, 38 diagnostic items (18 recall, 12 application, 8 oral), 10 critical misconceptions and at least 8 repair routes. It covers complexity, linear structures, hashing, tree/BST, recursion, sorting/binary search, graph representation, BFS/DFS and application trade-offs. It is explicitly diagnostic/prerequisite content, not an official administrative prerequisite and not a dedicated Algorithms subject runtime.

## Assessment/grader reality

The Programming test bank contains 384 items but only 192 unique prompt texts; every prompt is duplicated exactly once. The 24 items attached to PR02/PR10/PR11 contain only 12 unique prompt texts. All are `multiple_choice`; none grade traces, invariants, correctness arguments, algorithm implementations, complexity contracts or alternative valid outputs.

The existing P4 diagnostic pack has richer open/application/oral prompts, but no dedicated automated Algorithms grader, hidden-test boundary, property grader or trace grader exists for the subject.

## Runtime / visualization reality

The accepted shared Python runtime exists in the Programming product and can later be consumed as a capability. ALG01 found no separate Algorithms execution provider and no algorithm trace engine.

The file named `sim_algorithm_complexity_lab.html` is **not an algorithm-complexity model**. Its computation is a generic demo-risk/reproducibility formula based on “dataSize” and “quality”; it does not count algorithm operations or model O/Ω/Θ. PR10 also reuses that file, while PR11 reuses a dataframe-cleaning simulation. These are presentation placeholders and must not be treated as algorithmic truth.

## Learner state / AI reality

The Programming shell stores exam/review/remediation state in localStorage under `bauman_programming_roadmap_v1_same_ui`. It can locally mark exam passes and stage gates. No evidence in the audited scope proves that this is the canonical C4 mastery owner; therefore ALG must not promote this local state to official mastery.

The existing Programming “AI Mentor” is deterministic local template generation. It is not a model-backed correctness or complexity authority and does not qualify as an Algorithms tutor.

## Highest risks

1. No canonical Algorithms owner/runtime exists yet.
2. Current complexity visualization is semantically misleading.
3. Algorithm-related assessment is duplicate MCQ-only and cannot prove algorithmic competence.
4. Current learner content does not model ADT vs representation, invariants, correctness or preconditions.
5. Structured P4 knowledge and learner-facing Programming content are disconnected and can drift.
6. Subject-local exam gating can become a duplicate mastery authority if reused incorrectly.
7. No canonical trace/properties/golden algorithm fixtures exist.

## ALG02 readiness

**READY**, with one constraint: ALG02 must use the P4 prerequisite pack and Math boundary as evidence, but create language-neutral canonical Algorithms entities rather than promoting Programming lesson text, generic simulations or MCQ answers to algorithmic truth.
