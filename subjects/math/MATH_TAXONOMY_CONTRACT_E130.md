# Math Taxonomy Contract E130

Status: Contract-only for adding a Pure/Applied mathematics taxonomy layer to the Math subject.

This document defines the source-of-truth rules before any runtime, UI, or data migration patch.

## 1. Purpose

E130 adds a second navigation/organization layer for Math:

1. Existing Bauman learning route:

   `stage -> discipline -> chapter -> lesson/content`

2. New academic taxonomy route:

   `domain -> branch -> topic -> linked chapters`

The new taxonomy must complement the Bauman route, not replace it.

## 2. Non-negotiable rule

Do not replace the existing chapter spine.

The current `chapterId`, `stageId`, `disciplineId`, and `lessonId` values are runtime anchors. They must remain stable unless a dedicated migration round explicitly remaps all dependent content.

## 3. Existing sources that remain authoritative

The following files remain authoritative for the Bauman learning route:

- `subjects/math/data/curriculum.json`
- `subjects/math/data/discipline_spine.json`
- `subjects/math/data/chapter_spine.json`
- `subjects/math/data/theory_lecture_frame.json`

The following file remains authoritative for Theory content:

- `subjects/math/data/theory_lecture_content.json`

The following file remains legacy fallback only:

- `subjects/math/data/lessons.json`

## 4. New E130 sources

E130 should add, not replace:

- `subjects/math/data/math_taxonomy_frame.json`
- `subjects/math/data/math_taxonomy_map.json`

Recommended roles:

- `math_taxonomy_frame.json`: defines the Pure/Applied taxonomy tree.
- `math_taxonomy_map.json`: maps taxonomy nodes to existing `chapterId` values and optional discipline/stage hints.

## 5. Proposed taxonomy tree

Top-level subject:

`MÔN TOÁN HỌC`

Domains:

1. `pure_mathematics` / `TOÁN HỌC THUẦN TÚY`
2. `applied_mathematics` / `TOÁN HỌC ỨNG DỤNG`

### 5.1 Pure Mathematics

Branches and topics:

1. `algebra_structures` / `Đại số và Cấu trúc`
   - `abstract_general_algebra` / `Đại số đại cương & Trừu tượng`
   - `pure_linear_algebra` / `Đại số tuyến tính thuần túy`

2. `mathematical_analysis` / `Giải tích toán học`
   - `real_complex_analysis` / `Giải tích thực & Giải tích phức`
   - `functional_analysis_differential_equations` / `Giải tích hàm & Phương trình vi phân`

3. `geometry_topology` / `Hình học và Tôpô học`
   - `differential_algebraic_geometry` / `Hình học vi phân & Hình học đại số`
   - `topological_spaces` / `Tôpô học không gian`

4. `number_theory_logic` / `Lý thuyết số và Logic toán`
   - `algebraic_analytic_number_theory` / `Lý thuyết số đại số & Giải tích số`
   - `foundations_set_theory` / `Cơ sở toán học & Lý thuyết tập hợp`

### 5.2 Applied Mathematics

Branches and topics:

1. `probability_statistics` / `Xác suất và Thống kê toán học`
   - `probability_stochastic_processes` / `Lý thuyết xác suất & Quá trình ngẫu nhiên`
   - `theoretical_statistics_data_analysis` / `Thống kê lý thuyết & Phân tích dữ liệu`

2. `computational_mathematics` / `Toán học tính toán`
   - `numerical_analysis_methods` / `Giải tích số & Phương pháp tính`
   - `mathematical_simulation_discretization` / `Mô phỏng toán học & Rời rạc hóa`

3. `optimization_operations_research` / `Tối ưu hóa và Vận trù học`
   - `mathematical_programming_game_theory` / `Quy hoạch toán học & Lý thuyết trò chơi`
   - `optimal_control_theory` / `Lý thuyết điều khiển tối ưu`

4. `mathematical_modeling` / `Các mô hình toán học chuyên ngành`
   - `economics_quantitative_finance` / `Toán kinh tế & Tài chính định lượng`
   - `mathematical_physics_theoretical_mechanics` / `Vật lý toán & Cơ học lý thuyết`
   - `mathematical_biology` / `Sinh học toán học`

## 6. Recommended `math_taxonomy_frame.json` schema

```json
{
  "id": "bauman_math_taxonomy_frame_e130",
  "schema": "bauman_math_taxonomy_frame_v1",
  "version": "E130_MATH_TAXONOMY_LAYER",
  "subject": "math",
  "title": "Môn Toán học · Taxonomy Pure/Applied",
  "routePolicy": {
    "baumanRoute": "stage -> discipline -> chapter",
    "taxonomyRoute": "domain -> branch -> topic -> linkedChapterIds",
    "rule": "taxonomy is an overlay; it must not replace stage/discipline/chapter"
  },
  "domains": []
}
```

Domain schema:

```json
{
  "domainId": "pure_mathematics",
  "domainTitle": "TOÁN HỌC THUẦN TÚY",
  "domainTitleEn": "Pure Mathematics",
  "order": 1,
  "branches": []
}
```

Branch schema:

```json
{
  "branchId": "algebra_structures",
  "branchTitle": "Đại số và Cấu trúc",
  "branchTitleEn": "Algebra & Structures",
  "order": 1,
  "topics": []
}
```

Topic schema:

```json
{
  "topicId": "pure_linear_algebra",
  "topicTitle": "Đại số tuyến tính thuần túy",
  "topicTitleEn": "Pure Linear Algebra",
  "order": 2,
  "linkedDisciplineIds": [],
  "linkedChapterIds": [],
  "stageHints": [],
  "baumanRelevance": "",
  "contentStatus": "map_pending"
}
```

## 7. Recommended `math_taxonomy_map.json` schema

```json
{
  "id": "bauman_math_taxonomy_map_e130",
  "schema": "bauman_math_taxonomy_map_v1",
  "version": "E130_MATH_TAXONOMY_LAYER",
  "subject": "math",
  "mapPolicy": {
    "chapterIdStable": true,
    "allowMultipleTaxonomyPaths": true,
    "primaryPathRequired": true,
    "secondaryPathsAllowed": true
  },
  "chapterMappings": []
}
```

Chapter mapping schema:

```json
{
  "chapterId": "MATH-VN-C01-vector_trong_khong_gian_",
  "chapterTitle": "Chương 1 · Vector trong không gian dữ liệu",
  "stageId": "vn",
  "disciplineId": "linear_algebra_data_space",
  "primaryTaxonomyPath": "pure_mathematics/algebra_structures/pure_linear_algebra",
  "secondaryTaxonomyPaths": [
    "applied_mathematics/computational_mathematics/mathematical_simulation_discretization"
  ],
  "mappingReason": "Vector belongs to pure linear algebra but is also used as data representation in computation and AI.",
  "mappingStatus": "draft"
}
```

## 8. Runtime/UI contract

E130 UI must support two views:

1. `Bauman route`: current E129 view.
   - Stage tabs.
   - Discipline groups.
   - Chapter list.

2. `Taxonomy route`: new E130 view.
   - Pure/Applied domains.
   - Branches.
   - Topics.
   - Linked chapters.

The user should be able to switch between:

- `Lộ trình Bauman`
- `Cây Toán học`

The default route should remain `Lộ trình Bauman` until the taxonomy map is verified.

## 9. Import/DataVault contract

Do not import content into taxonomy frame/map files.

Taxonomy files are metadata/navigation files only.

Lesson content still goes to:

- `theory_lecture_content`

Formula/exercise/simulation/application/QA content still goes to their own `*_content` files.

## 10. Mapping principles

A chapter can belong to more than one taxonomy path.

Examples:

- Vector chapters can map to Pure Linear Algebra and Computational/Data modeling.
- Probability chapters can map to Probability & Statistics and Sensor Fusion.
- ODE chapters can map to Mathematical Analysis and Mathematical Modeling.
- Optimization chapters can map to Applied Mathematics/Operations Research and Control.

Use:

- one `primaryTaxonomyPath`
- zero or more `secondaryTaxonomyPaths`

## 11. Active scope

Active Bauman learning scope remains:

- Stage 0 to Stage 5
- Chapters 1 to 40

Framework-only scope remains:

- Chapters 41 to 56
- PhD bridge/PhD stages

Taxonomy may display framework-only chapters, but must clearly label them as framework-only if shown.

## 12. Forbidden changes

Do not:

- Rename existing `chapterId` values.
- Delete the Bauman stage route.
- Replace `chapter_spine.json` with taxonomy structure.
- Store lecture slides inside taxonomy files.
- Make `lessons.json` primary again.
- Hard-code the Pure/Applied tree directly into JS.
- Rewrite `subject-manifest.json` during the contract/mapping rounds.
- Break E129 Theory import/export.

## 13. Implementation sequence after this contract

Recommended next rounds:

1. Round 3: Create `math_taxonomy_frame.json` and `math_taxonomy_map.json` as draft sources.
2. Round 4: Map existing active chapters 1-40 to taxonomy paths without changing chapter IDs.
3. Round 5: Register taxonomy sources in adapter/metadata if needed.
4. Round 6: Add E130 taxonomy view to E129 Theory UI behind a route toggle.
5. Round 7: Verify taxonomy view and Bauman route regression.
6. Round 8: Add content authoring/import guidance for taxonomy-linked lessons.
7. Round 9: Add one real sample content bundle for Chapter 1 through `theory_lecture_content`.
8. Round 10: Final handoff and manifest cleanup decision.

## 14. Verification gates

Before runtime UI patch:

- `math_taxonomy_frame.json` parses as valid JSON.
- `math_taxonomy_map.json` parses as valid JSON.
- Every `linkedChapterId` exists in `chapter_spine.json` or `theory_lecture_frame.json`.
- Every `primaryTaxonomyPath` exists in `math_taxonomy_frame.json`.
- No existing `chapterId` is modified.
- E129 self-check still passes.

After UI patch:

- Bauman route still renders.
- Taxonomy route renders.
- Switching routes does not lose current chapter selection.
- Import to `theory_lecture_content` still works.
- E126 remains suppressed by E129.
- E128 does not appear inside E129 Theory storage.

End of contract.
