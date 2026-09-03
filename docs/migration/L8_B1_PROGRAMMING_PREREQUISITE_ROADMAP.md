# L8-B1 · Programming prerequisite roadmap

Gate: `L8-B1`  
Release: `L8-B1-PROGRAMMING-PREREQUISITE-ROADMAP-V1`  
Graph status: `review-candidate-not-runtime-active`

## Quyết định

L8-B1 giữ nguyên 48 bài Programming, curriculum, specialist engine, route,
lesson type, dữ liệu phụ trợ và learner state hiện có. Nguồn bài học không có
trường prerequisite; vì vậy 17 cạnh dưới đây là ứng viên phụ thuộc khái niệm do
hệ thống sắp xếp để duyệt, không phải prerequisite chính thức của nguồn.

Gate này chỉ rà soát sâu 16 bài thuộc `vn` và `prep`. Mười hai bài tạo lõi bắt
buộc cho năng lực lập trình nền; bốn bài `PR04`, `PR05`, `PR06`, `PR15` là nhánh
giới thiệu Data/Database. `PR17–PR48` vẫn hiện diện đúng nguồn nhưng chưa được
L8-B1 sắp thứ tự; từng lượt L8-B2 đến L8-B14 giữ quyền xác định chiều sâu và
dependency của phần mình.

Không edge nào được khóa/mở bài, chặn assessment, sửa tiến độ hoặc tạo trạng
thái Master-ready. AI không được tự nâng một edge thành prerequisite chính thức.

## Sự thật nguồn đã khóa

| Hạng mục | Kết quả quan sát |
|---|---:|
| Bài học | 48, ID `PR01`–`PR48` |
| Giai đoạn | 6, mỗi giai đoạn 8 bài |
| Lesson type | 28 `programming`, 4 `database`, 16 `software-design` |
| Slide nguồn | 5/bài, 240 tổng cộng |
| Trường prerequisite/dependency trong lesson | 0 |
| Workflow / grammar path / knowledge index | 48 / 48 / 48 |
| Mindmap theo giai đoạn | 6, phủ 48 node |
| Exercise / test question / simulation | 144 / 384 / 96 |
| Russian Twin terminology | 48 record source-aligned |
| Math support | `PR06`, `PR20`; relation `supports`, không blocking |

Subject Factory vẫn là thẩm quyền: engine `programming-v2-specialist`, route
`subjects/programming/index.html`, offline policy `programming-rich-explicit`.
Không sao chép UI, runtime, storage, score hay evidence từ Russian/Math.

## Phân vùng foundation

| Vai trò | Lesson IDs | Ý nghĩa ở B1 |
|---|---|---|
| Mandatory core | `PR01`, `PR02`, `PR03`, `PR07`–`PR14` trừ `PR15`, và `PR16` | Nền Programming cần được luyện trước các handoff tương ứng; chưa phải runtime gate |
| Data introduction | `PR04`, `PR05` | Cầu nối sang L8-B3; B3 sở hữu chiều sâu NumPy/Pandas/pipeline |
| Database introduction | `PR06`, `PR15` | Cầu nối sang L8-B7–B10; không được hiểu là database full path |

Sáu strand primary phủ đúng một lần 16 bài: Python core, algorithmic foundation,
data computing, database introduction, engineering hygiene và Russian technical
communication. Russian communication là companion source-aligned; nó không tạo
progress thứ hai cho cùng một bài.

## Đồ thị ứng viên 17 cạnh

| Prerequisite candidate | Bài phụ thuộc | Quan hệ | Căn cứ khái niệm |
|---|---|---|---|
| `PR01` | `PR03` | required | Cần môi trường chạy được trước Python core |
| `PR03` | `PR04` | required | NumPy giả định kiểu dữ liệu, hàm, module Python |
| `PR04` | `PR05` | required | Pandas nối tiếp tư duy mảng và vector hóa |
| `PR01` | `PR08` | required | Notebook tái lập cần môi trường xác định |
| `PR03` | `PR08` | required | Notebook cần khả năng đọc/chạy Python cơ bản |
| `PR07` | `PR08` | supporting | Git hỗ trợ lịch sử notebook/README |
| `PR02` | `PR10` | required | Pseudocode cần mô hình input–process–output |
| `PR09` | `PR10` | required | Giải thích Nga cần thuật ngữ tin học nguồn |
| `PR02` | `PR11` | required | Chọn cấu trúc dữ liệu cần tư duy thuật toán |
| `PR03` | `PR11` | required | Cấu trúc nhập môn được thao tác bằng Python |
| `PR03` | `PR12` | required | File/JSON/CSV dùng hàm và container Python |
| `PR03` | `PR13` | required | Debug/exception/logging cần code chạy được |
| `PR03` | `PR14` | required | Pytest cần hàm/module có hành vi quan sát được |
| `PR13` | `PR14` | required | Assertion có nghĩa cần hiểu failure/exception |
| `PR06` | `PR15` | required | JOIN/GROUP BY/index cần SQL và relational cơ bản |
| `PR07` | `PR16` | supporting | Git hỗ trợ review tài liệu song ngữ |
| `PR09` | `PR16` | required | Tài liệu song ngữ cần thuật ngữ Nga đã đăng ký |

Mọi cạnh đều mang provenance
`system-curated-concept-dependency`, `manualReviewRequired: true`,
`runtimeActive: false` và `assessmentBlocking: false`. Năm root là `PR01`,
`PR02`, `PR06`, `PR07`, `PR09`; đồ thị không phải chuỗi “bài trước → bài sau”
tự động theo source order.

## Handoff sang các bước L8

| Owner | Năng lực được bàn giao | Ranh giới |
|---|---|---|
| L8-B2 | OOP, SOLID, patterns | B1 chỉ đưa readiness từ Python/data structures/testing/docs; B2 quyết định graph và content |
| L8-B3 | NumPy, Pandas, data pipeline | `PR04`, `PR05`, `PR12` là nền ứng viên; chưa xác nhận pipeline đầy đủ |
| L8-B4 | Testing, debugging, Git | Counts hiện hữu không thay cho executable evidence |
| L8-B5–B6 | Algorithms & Data Structures practical | Phải bổ sung/duyệt search, sort, hash, tree, graph; không competitive-programming hóa |
| L8-B7–B10 | SQL, relational, optimization, post-relational | `PR06`/`PR15` là entry; Math chỉ hỗ trợ không blocking |
| L8-B11–B12 | Software engineering và system design | B1 không sắp dependency cho `PR17+` |
| L8-B13 | Code runner, debug challenge, SQL/UML interactions | `code-runner` và `sql-playground` vẫn `planned-L8` với static fallback |
| L8-B14 | Full QA, offline, RU/EN hooks, Master-ready | Sở hữu phê duyệt cuối về content, assessment, evidence và accessibility |

## Finding còn mở

| Code | Tình trạng | Owner tiếp theo |
|---|---|---|
| `SOURCE_PREREQUISITES_ABSENT` | 17 edge chỉ là review candidate | L8-B14 full-subject QA |
| `PYTHON_FUNDAMENTALS_DEPTH_NOT_YET_ACCEPTED` | `PR03` đang gói nhiều chủ đề; shell 5 slide chưa được duyệt chiều sâu | L8-B14 full-subject QA |
| `ALGORITHMS_DATA_STRUCTURES_COVERAGE_THIN` | Chưa có title nguồn rõ cho search/sort/hash/tree/graph | L8-B5–B6 |
| `ADVANCED_DATABASE_COVERAGE_GAPS` | Chưa có title nguồn rõ cho normalization/transaction/query plan/optimization/NoSQL | L8-B7–B10 |
| `AUXILIARY_CONTENT_NOT_ACADEMICALLY_QUALIFIED` | Có đủ record count nhưng chưa duyệt correctness/difficulty/executability | L8-B14 full-subject QA |
| `INTERACTIVE_WIDGETS_DECLARED_NOT_IMPLEMENTED` | Hai widget đặc sản còn planned | L8-B13 |

Những finding này chặn claim tương ứng; B1 PASS không được dùng để che hoặc tự
đóng chúng.

## Gate và nghĩa của PASS

Regression phải kiểm tra fail-closed:

```bash
node --check scripts/academic/l8-b1-programming-prerequisite-roadmap-audit.cjs
node scripts/academic/l8-b1-programming-prerequisite-roadmap-audit.cjs
```

CI còn yêu cầu generated graph/report không drift. PASS chỉ có nghĩa source
48 bài được bảo toàn, scope foundation và candidate graph tái lập, reference
bindings vẫn đúng và mọi gap có owner. Đây không phải phê duyệt học thuật toàn
môn, không kích hoạt runtime, không nhập learner evidence, không xác nhận
content complete và không cấp Master-ready.

## Rollback

Xóa policy, generated graph, regression, report, decision record và wiring CI
L8-B1. Programming source, specialist runtime, curriculum, learner state,
offline pack, Service Worker, toàn bộ L7 artifacts và `main` không bị tác động.

Sau checkpoint remote, bước kế tiếp là L8-B2: OOP + SOLID/patterns cho ИУ-5.
