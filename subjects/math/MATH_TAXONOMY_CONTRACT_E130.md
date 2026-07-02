# Math Program Frame Contract E130

Status: Contract-only revision for building an integrated Mathematics lecture program frame for Bauman 09.04.01.

This document supersedes the earlier generic Pure/Applied taxonomy wording. E130 is not merely a list of 21 standalone lectures. E130 defines a program frame that must aggregate and route all existing Math lecture content, chapters, and future content bundles into a tighter Bauman-oriented structure.

No runtime, UI, or data migration patch is implied by this document alone.

## 1. Purpose

E130 adds a second organization layer for Math:

1. Existing Bauman learning route:

   `stage -> discipline -> chapter -> lesson/content`

2. New integrated lecture-program route:

   `block -> section -> program lecture anchor -> mapped existing chapters/lessons -> Bauman focus -> lab work`

The 21 lecture anchors are not the full content limit. They are organizing containers. Each anchor may absorb multiple existing chapters, existing theory records, formulas, exercises, simulations, applications, professor QA records, and future content bundles.

The new program frame must complement the Bauman route, not replace it.

## 2. Program identity

Vietnamese title:

`KHUNG CHƯƠNG TRÌNH BÀI GIẢNG: MÔN TOÁN HỌC`

Orientation:

`Định hướng chuyên sâu cho Thạc sĩ Kỹ thuật Máy tính & CNTT - Mã ngành 09.04.01 Bauman`

Runtime planning version:

`E130_MATH_PROGRAM_FRAME_INTEGRATED`

## 3. Non-negotiable rule

Do not replace the existing chapter spine.

The current `chapterId`, `stageId`, `disciplineId`, and `lessonId` values are runtime anchors. They must remain stable unless a dedicated migration round explicitly remaps all dependent content.

Existing content must be aggregated into the new program frame by mapping, not by destructive renaming.

## 4. Existing sources that remain authoritative

The following files remain authoritative for the Bauman learning route:

- `subjects/math/data/curriculum.json`
- `subjects/math/data/discipline_spine.json`
- `subjects/math/data/chapter_spine.json`
- `subjects/math/data/theory_lecture_frame.json`

The following file remains authoritative for Theory content:

- `subjects/math/data/theory_lecture_content.json`

The following files remain authoritative for other content domains when present:

- `subjects/math/data/formula_content.json`
- `subjects/math/data/exercise_content.json`
- `subjects/math/data/simulation_content.json`
- `subjects/math/data/application_content.json`
- `subjects/math/data/professor_qa_content.json`
- `subjects/math/data/question_bank_content.json`
- `subjects/math/data/review_pack_content.json`

Legacy files remain fallback only:

- `subjects/math/data/lessons.json`
- `subjects/math/data/formulas.json`
- `subjects/math/data/exercises.json`
- `subjects/math/data/simulations.json`
- `subjects/math/data/applications.json`
- `subjects/math/data/professor_qa.json`

## 5. New E130 sources

E130 should add, not replace:

- `subjects/math/data/math_program_frame.json`
- `subjects/math/data/math_program_map.json`

Previous names `math_taxonomy_frame.json` and `math_taxonomy_map.json` are deprecated before creation. Do not create those names unless a later compatibility reason appears.

Recommended roles:

- `math_program_frame.json`: defines the two blocks, sections A-G, program lecture anchors, Bauman focus, lab-work requirement, and roadmap relevance.
- `math_program_map.json`: maps each program lecture anchor to existing `chapterId`, `lessonId`, content-domain records, and Bauman learning stages.

## 6. Program frame structure

Top-level subject:

`MÔN TOÁN HỌC`

Orientation:

`Định hướng chuyên sâu cho Thạc sĩ Kỹ thuật Máy tính & CNTT - Mã ngành 09.04.01 Bauman`

Blocks:

1. `pure_foundation` / `Khối 1: Toán học Thuần túy (Nền tảng lý thuyết)`
2. `applied_tools_practice` / `Khối 2: Toán học Ứng dụng (Công cụ & Thực hành)`

Sections:

- A: Đại số và Cấu trúc
- B: Giải tích toán học
- C: Hình học và Không gian
- D: Logic và Cấu trúc số
- E: Xác suất và Thống kê dữ liệu
- F: Toán rời rạc và Máy tính
- G: Tối ưu hóa và Mô hình hóa chuyên ngành

## 7. Lecture anchors

### Block 1 · Pure Foundation

#### Section A · Algebra and Structures

1. `MATH-PROG-L01-linear-algebra-basic`
   - Title: `Đại số tuyến tính cơ bản`
   - Bauman focus: Thuật toán khử Gauss, tính toán ma trận mật độ cao, định thức của các ma trận lớn trong hệ thống lưu trữ dữ liệu.

2. `MATH-PROG-L02-vector-spaces-linear-maps`
   - Title: `Không gian vectơ và Ánh xạ tuyến tính`
   - Bauman focus: Các phép biến đổi không gian, không gian trạng thái hệ thống, trị riêng, nén dữ liệu và giảm chiều dữ liệu bằng PCA.

3. `MATH-PROG-L03-abstract-structures`
   - Title: `Đại số cấu trúc trừu tượng`
   - Bauman focus: Nhóm tuần hoàn, trường hữu hạn `GF(2^n)`, mã hóa bảo mật mạng, sửa lỗi truyền tin, CRC, Reed-Solomon.

#### Section B · Mathematical Analysis

4. `MATH-PROG-L04-single-variable-analysis`
   - Title: `Giải tích hàm một biến`
   - Bauman focus: Đạo hàm và tích phân số, xấp xỉ số, chuỗi Taylor để tính toán sai số thuật toán trên máy tính.

5. `MATH-PROG-L05-multivariable-analysis-differential-geometry`
   - Title: `Giải tích hàm nhiều biến và Hình học vi phân sơ cấp`
   - Bauman focus: Gradient, Hessian, tối ưu, mạng thần kinh, neural networks.

6. `MATH-PROG-L06-differential-equations-dynamical-systems`
   - Title: `Phương trình vi phân và Hệ động lực`
   - Bauman focus: Mô hình hóa trạng thái liên tục của phần cứng, hệ thống điều khiển tự động, feedback loops.

7. `MATH-PROG-L07-complex-functions-functional-analysis`
   - Title: `Lý thuyết hàm phức và Cơ sở giải tích hàm`
   - Bauman focus: Biến đổi Laplace, biến đổi Z, phân tích tính ổn định hệ thống số và bộ lọc tín hiệu.

#### Section C · Geometry and Space

8. `MATH-PROG-L08-euclidean-computational-geometry`
   - Title: `Hình học sơ cấp và Hình học Euclid nâng cao`
   - Bauman focus: Hình học tính toán cho đồ họa máy tính, xử lý ảnh, thị giác máy tính.

9. `MATH-PROG-L09-topology-metric-spaces`
   - Title: `Cơ sở Tôpô học`
   - Bauman focus: Không gian metric, khoảng cách dữ liệu Euclidean, Manhattan, Cosine, phân cụm dữ liệu trong Data Mining.

#### Section D · Logic and Number Structures

10. `MATH-PROG-L10-logic-set-theory-boolean`
    - Title: `Cơ sở Logic toán và Lý thuyết tập hợp`
    - Bauman focus: Đại số Boolean, tối thiểu hóa hàm logic, bản đồ Karnaugh, thiết kế mạch số, kiến trúc máy tính, logic mờ.

11. `MATH-PROG-L11-number-theory-cryptography-basics`
    - Title: `Lý thuyết số và Ứng dụng số nguyên tố cơ bản`
    - Bauman focus: Hàm số học, đồng dư thức, kiểm tra số nguyên tố lớn, RSA, Diffie-Hellman.

### Block 2 · Applied Tools and Practice

#### Section E · Probability and Data Statistics

12. `MATH-PROG-L12-probability-random-variables`
    - Title: `Lý thuyết Xác suất và Biến ngẫu nhiên`
    - Bauman focus: Luồng dữ liệu ngẫu nhiên đi vào hệ thống, phân phối Poisson và Exponential của gói tin mạng.

13. `MATH-PROG-L13-mathematical-statistics`
    - Title: `Thống kê toán học`
    - Bauman focus: Kiểm định giả thuyết về hiệu năng phần mềm, ước lượng thời gian phản hồi của hệ thống phân tán dưới tải cao.

14. `MATH-PROG-L14-stochastic-processes-time-series`
    - Title: `Các quá trình ngẫu nhiên và Phân tích chuỗi thời gian`
    - Bauman focus: Markov Chains, dự báo trạng thái hệ thống, reliability engineering cho phần cứng.

#### Section F · Discrete Mathematics and Computing

15. `MATH-PROG-L15-discrete-math-graph-theory`
    - Title: `Toán rời rạc và Lý thuyết đồ thị`
    - Bauman focus: Network topologies, Dijkstra, A*, Ford-Fulkerson, luồng cực đại trong mạng.

16. `MATH-PROG-L16-numerical-methods-computing`
    - Title: `Phương pháp tính và Giải tích số`
    - Bauman focus: FFT, thuật toán xấp xỉ số song song trên kiến trúc đa lõi hoặc GPU.

17. `MATH-PROG-L17-ai-machine-learning-math-foundations`
    - Title: `Cơ sở toán học cho Trí tuệ nhân tạo và Học máy`
    - Bauman focus: Đại số tuyến tính, xác suất, tối ưu hóa, backpropagation, deep learning.

#### Section G · Optimization and Specialized Modeling

18. `MATH-PROG-L18-linear-programming-operations-research`
    - Title: `Quy hoạch tuyến tính và Tối ưu hóa vận trù`
    - Bauman focus: Phân bổ tài nguyên hệ thống CPU/RAM/băng thông, tối ưu chi phí vận hành cloud computing.

19. `MATH-PROG-L19-game-theory-decision-math`
    - Title: `Lý thuyết trò chơi và Ra quyết định toán học`
    - Bauman focus: Nash equilibrium trong định tuyến mạng, quyết định cho hệ tự hành hoặc AI agents.

20. `MATH-PROG-L20-quantitative-finance-econometrics`
    - Title: `Toán tài chính định lượng và Kinh tế lượng`
    - Bauman focus: Rủi ro và chi phí khi phát triển dự án phần mềm/hệ thống thông tin lớn.

21. `MATH-PROG-L21-mathematical-physics-system-modeling`
    - Title: `Phương trình Vật lý toán và Mô hình hóa hệ thống thực tế`
    - Bauman focus: Monte Carlo, fault tolerance, an toàn thông tin của hệ thống máy tính.

## 8. Required lab-work layer

Every program lecture anchor must include a child section:

`Ứng dụng lập trình (Lab Work)`

The lab-work layer must support at least:

- Python with NumPy/SciPy.
- C++ when appropriate.
- Optional GPU/parallel computing notes when relevant.
- Formula-to-code transformation.
- Small runnable tasks, not only conceptual explanation.
- Links to simulations/applications if available.

Lab work must not replace theory. It is a bridge from formula to executable implementation.

## 9. Required aggregation behavior

E130 must synthesize existing content into the program frame.

Each lecture anchor must be able to aggregate:

- existing `chapterId` values from `chapter_spine.json` and `theory_lecture_frame.json`;
- existing Theory records from `theory_lecture_content.json` when present;
- formula records from `formula_content.json`;
- exercises from `exercise_content.json`;
- simulations from `simulation_content.json`;
- applications from `application_content.json`;
- professor QA records from `professor_qa_content.json`;
- question-bank and review-pack records when available;
- future imported content bundles.

This aggregation must be done by mapping IDs, not by copying large content into the program frame.

## 10. Recommended `math_program_frame.json` schema

```json
{
  "id": "bauman_math_program_frame_e130",
  "schema": "bauman_math_program_frame_v1",
  "version": "E130_MATH_PROGRAM_FRAME_INTEGRATED",
  "subject": "math",
  "title": "KHUNG CHƯƠNG TRÌNH BÀI GIẢNG: MÔN TOÁN HỌC",
  "orientation": "Định hướng chuyên sâu cho Thạc sĩ Kỹ thuật Máy tính & CNTT - Mã ngành 09.04.01 Bauman",
  "routePolicy": {
    "baumanRoute": "stage -> discipline -> chapter",
    "programRoute": "block -> section -> lectureAnchor -> linkedChapterIds",
    "rule": "program frame is an overlay; it must not replace stage/discipline/chapter"
  },
  "blocks": []
}
```

Lecture anchor schema:

```json
{
  "programLectureId": "MATH-PROG-L01-linear-algebra-basic",
  "lectureNo": 1,
  "title": "Đại số tuyến tính cơ bản",
  "baumanFocus": "Thuật toán khử Gauss, tính toán ma trận mật độ cao...",
  "labWork": {
    "required": true,
    "languages": ["Python/NumPy/SciPy", "C++"],
    "taskTypes": ["formula_to_code", "simulation", "performance_check"]
  },
  "linkedChapterIds": [],
  "linkedDisciplineIds": [],
  "stageHints": [],
  "contentStatus": "map_pending"
}
```

## 11. Recommended `math_program_map.json` schema

```json
{
  "id": "bauman_math_program_map_e130",
  "schema": "bauman_math_program_map_v1",
  "version": "E130_MATH_PROGRAM_FRAME_INTEGRATED",
  "subject": "math",
  "mapPolicy": {
    "chapterIdStable": true,
    "allowMultipleProgramAnchors": true,
    "primaryProgramLectureRequired": true,
    "secondaryProgramLecturesAllowed": true,
    "mustEventuallyCoverAllActiveChapters": true
  },
  "coverageTargets": {
    "activeChapters": "1-40",
    "frameworkOnlyChapters": "41-56 optional display with framework label"
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
  "primaryProgramLectureId": "MATH-PROG-L02-vector-spaces-linear-maps",
  "secondaryProgramLectureIds": [
    "MATH-PROG-L01-linear-algebra-basic",
    "MATH-PROG-L17-ai-machine-learning-math-foundations"
  ],
  "mappedContentDomains": ["theory", "formula", "exercise", "simulation", "application", "professor_qa"],
  "roadmapRole": "foundation_before_prep",
  "mappingReason": "Vector spaces support both pure linear algebra and AI/data representation.",
  "mappingStatus": "draft"
}
```

## 12. Runtime/UI contract

E130 UI must eventually support two views:

1. `Lộ trình Bauman`: current E129 view.
   - Stage tabs.
   - Discipline groups.
   - Chapter list.

2. `Khung bài giảng Bauman`: new E130 view.
   - Block 1 / Block 2.
   - Sections A-G.
   - Lecture anchors 1-21.
   - Aggregated existing chapters and content under each anchor.
   - Bauman focus.
   - Lab Work.

The default route should remain `Lộ trình Bauman` until the program map is verified.

The UI must not imply that only 21 lessons exist. It must communicate that 21 lecture anchors organize the full content base.

## 13. Import/DataVault contract

Do not import lecture content into program frame/map files.

Program frame/map files are metadata/navigation/mapping files only.

Lesson content still goes to:

- `theory_lecture_content`

Formula/exercise/simulation/application/QA content still goes to their own `*_content` files.

## 14. Mapping principles

A chapter can belong to more than one program lecture anchor.

Examples:

- Vector chapters can map to Lecture 1, Lecture 2, and Lecture 17.
- Matrix chapters can map to Lecture 1, Lecture 2, Lecture 16, and Lecture 17.
- Probability chapters can map to Lecture 12, Lecture 13, Lecture 14, and sensor/data topics.
- ODE/control chapters can map to Lecture 6, Lecture 7, Lecture 18, and Lecture 21.
- Graph/discrete chapters can map to Lecture 10, Lecture 15, and network/computing applications.

Use:

- one `primaryProgramLectureId`
- zero or more `secondaryProgramLectureIds`

## 15. Roadmap integration principles

The program frame must stay tightly aligned with the learner roadmap:

- Stage `vn`: foundation before preparatory year.
- Stage `prep`: Russian preparatory math-language and core technique consolidation.
- Stage `hk1`: core graduate math for AI/computing/control.
- Stage `hk2`: probability, statistics, signals, machine learning, control, fusion.
- Stage `hk3`: NIR research support.
- Stage `hk4`: VKR thesis, defense, metrics, validation.

Every program lecture anchor should have `stageHints` and `roadmapRole` values.

## 16. Active scope

Active Bauman learning scope remains:

- Stage 0 to Stage 5
- Chapters 1 to 40

Framework-only scope remains:

- Chapters 41 to 56
- PhD bridge/PhD stages

Program frame may display framework-only chapters, but must clearly label them as framework-only if shown.

## 17. Forbidden changes

Do not:

- Treat the 21 anchors as the only available lessons.
- Rename existing `chapterId` values.
- Delete the Bauman stage route.
- Replace `chapter_spine.json` with the program frame.
- Store lecture slides inside program frame/map files.
- Make `lessons.json` primary again.
- Hard-code the program frame directly into JS.
- Rewrite `subject-manifest.json` during contract/mapping rounds.
- Break E129 Theory import/export.

## 18. Implementation sequence after this contract

Recommended next rounds:

1. Round 3: Create `math_program_frame.json` and `math_program_map.json` as draft sources.
2. Round 4: Map existing active chapters 1-40 to program lecture anchors without changing chapter IDs.
3. Round 5: Add adapter metadata if needed for JSON visibility, but do not rewrite the large manifest.
4. Round 6: Add E130 program-frame view to E129 Theory UI behind a route toggle.
5. Round 7: Verify program-frame view and Bauman route regression.
6. Round 8: Add content-authoring/import guidance for program-linked lessons and Lab Work.
7. Round 9: Add one real sample content bundle through `theory_lecture_content`, mapped to a program lecture anchor.
8. Round 10: Final handoff and manifest cleanup decision.

## 19. Verification gates

Before runtime UI patch:

- `math_program_frame.json` parses as valid JSON.
- `math_program_map.json` parses as valid JSON.
- Every `linkedChapterId` exists in `chapter_spine.json` or `theory_lecture_frame.json`.
- Every `primaryProgramLectureId` exists in `math_program_frame.json`.
- Every active chapter 1-40 has at least a draft mapping before production UI is declared complete.
- No existing `chapterId` is modified.
- E129 self-check still passes.

After UI patch:

- Bauman route still renders.
- Program-frame route renders.
- Switching routes does not lose current chapter selection.
- Import to `theory_lecture_content` still works.
- E126 remains suppressed by E129.
- E128 does not appear inside E129 Theory storage.

End of contract.
