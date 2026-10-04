# PYTHON CURRICULUM BLUEPRINT
## PYTHON02 canonical academic model for Bauman 09.04.01/11

Status: **VALIDATING**  
Runtime mutation: **NO**  
Production migration: **NO**

## 1. Academic role

The official 09.04.01/11 curriculum snapshot does not identify a standalone course named “Python”. Python is therefore modeled honestly as a prerequisite and integration layer supporting object-oriented design, software-development technology, ML/data work and research artifacts. The canonical Python curriculum must not pretend that all mixed content currently under `subjects/programming/` is Python-owned.

The existing six delivery stages (`vn/prep/hk1/hk2/hk3/hk4`) remain compatibility projections. Canonical competence uses six academic stages: **Foundation → Core → Structured Program Design → Robustness → Ecosystem/Data Bridge → Engineering Transfer**.

## 2. Canonical outcomes

A learner should be able to read and predict Python code; write small programs; decompose work into functions/modules; reason about data, identity and mutation; handle failures; debug and test; build reusable components where justified; process files/data; reproduce an environment; and transfer Python into engineering/research workflows.

Mastery is not inferred from opening a lesson, completing a route, or obtaining a legacy MCQ score. It requires accepted performance evidence.

## 3. Canonical competency families

The machine-readable owner is `PYTHON_COMPETENCY_GRAPH.json`. It contains 16 competency families with stable `py.comp.*` IDs. The prerequisite DAG is `PYTHON_PREREQUISITE_GRAPH.json`.

Key ordering constraints include: boolean/type reasoning before control flow; control flow before function decomposition; collections before iterator/generator reasoning; reference/mutation reasoning before object state; functions/modules before testing; files/collections before the scientific-data bridge.

## 4. Python truth model

Python syntax is not treated as competence by itself. Canonical content distinguishes syntax form, semantic meaning, runtime behavior, type behavior, error/misconception patterns, examples/counterexamples and evidence hooks. Significant constructs use stable IDs and version/provenance metadata.

The supported Python minor version is intentionally **UNBOUND** in PYTHON02. PYTHON04 may bind it only when an execution/runtime contract or authoritative target requirement exists.

## 5. Content-as-data and evidence

Examples must be runnable under a declared future runtime, state expected behavior, and reveal important edge cases. Coding tasks must declare competency, inputs, behavior/output, constraints, support policy, examples, hidden-edge-case policy, assessment mode, runtime/version scope and deterministic conditions when needed.

Credible outputs include tested scripts, reusable modules, CLI utilities, reproducible data transformations, debug reports, test suites and small research/engineering utilities.

## 6. Current 48-lesson reconciliation

Every current lesson ID is preserved. No lesson is deleted or renumbered in PYTHON02. Routing class counts:

```json
{
  "KEEP_PYTHON": 7,
  "ROUTE_TO_ALGORITHMS": 3,
  "KEEP_AS_PYTHON_IMPLEMENTATION_CONTEXT": 12,
  "ROUTE_TO_DATABASE": 4,
  "ROUTE_TO_SOFTWARE_ENGINEERING": 16,
  "ROUTE_TO_ML_AI": 6
}
```

| ID | Current title | PYTHON02 classification | Canonical/receiving owner | Compatibility |
|---|---|---|---|---|
| PR01 | Thiết lập môi trường Python, VS Code và Live Server | KEEP_PYTHON | python | preserve ID / no delete |
| PR02 | Tư duy thuật toán và độ phức tạp | ROUTE_TO_ALGORITHMS | algorithms | preserve ID / no delete |
| PR03 | Python căn bản: kiểu dữ liệu, hàm, module | KEEP_PYTHON | python | preserve ID / no delete |
| PR04 | NumPy và vector hóa dữ liệu | KEEP_AS_PYTHON_IMPLEMENTATION_CONTEXT | python-implementation-context | preserve ID / no delete |
| PR05 | Pandas và làm sạch bảng dữ liệu | KEEP_AS_PYTHON_IMPLEMENTATION_CONTEXT | python-implementation-context | preserve ID / no delete |
| PR06 | SQL căn bản và mô hình quan hệ | ROUTE_TO_DATABASE | database | preserve ID / no delete |
| PR07 | Git, GitHub và nhật ký học tập | ROUTE_TO_SOFTWARE_ENGINEERING | oop-software-engineering | preserve ID / no delete |
| PR08 | Notebook thực nghiệm và README tái lập | KEEP_AS_PYTHON_IMPLEMENTATION_CONTEXT | python-implementation-context | preserve ID / no delete |
| PR09 | Thuật ngữ tin học Nga cho lớp dự bị | KEEP_AS_PYTHON_IMPLEMENTATION_CONTEXT | python-implementation-context | preserve ID / no delete |
| PR10 | Pseudocode và giải thích thuật toán bằng tiếng Nga | ROUTE_TO_ALGORITHMS | algorithms | preserve ID / no delete |
| PR11 | Cấu trúc dữ liệu nhập môn | ROUTE_TO_ALGORITHMS | algorithms | preserve ID / no delete |
| PR12 | File, JSON, CSV và dữ liệu học tập | KEEP_PYTHON | python | preserve ID / no delete |
| PR13 | Debug, exception và logging | KEEP_PYTHON | python | preserve ID / no delete |
| PR14 | Unit test căn bản với pytest | KEEP_PYTHON | python | preserve ID / no delete |
| PR15 | SQL nâng nền: JOIN, GROUP BY, index | ROUTE_TO_DATABASE | database | preserve ID / no delete |
| PR16 | Quy tắc đặt tên, comment và tài liệu song ngữ | KEEP_AS_PYTHON_IMPLEMENTATION_CONTEXT | python-implementation-context | preserve ID / no delete |
| PR17 | OOP cho АСОИУ: class, interface, responsibility | KEEP_PYTHON | python | preserve ID / no delete |
| PR18 | Thiết kế module và kiến trúc package Python | KEEP_PYTHON | python | preserve ID / no delete |
| PR19 | Mẫu thiết kế ứng dụng: factory, strategy, adapter | ROUTE_TO_SOFTWARE_ENGINEERING | oop-software-engineering | preserve ID / no delete |
| PR20 | CSDL cho hệ thống học máy: schema và metadata | ROUTE_TO_DATABASE | database | preserve ID / no delete |
| PR21 | ORM và migration nhập môn | ROUTE_TO_DATABASE | database | preserve ID / no delete |
| PR22 | Kỹ nghệ phần mềm: requirement, issue, milestone | ROUTE_TO_SOFTWARE_ENGINEERING | oop-software-engineering | preserve ID / no delete |
| PR23 | Kiểm thử tích hợp và test dữ liệu | ROUTE_TO_SOFTWARE_ENGINEERING | oop-software-engineering | preserve ID / no delete |
| PR24 | CI nhẹ và kiểm tra chất lượng code | ROUTE_TO_SOFTWARE_ENGINEERING | oop-software-engineering | preserve ID / no delete |
| PR25 | Pipeline dữ liệu cho ML | KEEP_AS_PYTHON_IMPLEMENTATION_CONTEXT | python-implementation-context | preserve ID / no delete |
| PR26 | Scikit-learn baseline và metric | ROUTE_TO_ML_AI | ml-data-analysis | preserve ID / no delete |
| PR27 | API inference với FastAPI | KEEP_AS_PYTHON_IMPLEMENTATION_CONTEXT | python-implementation-context | preserve ID / no delete |
| PR28 | Serialization model và artifact version | KEEP_AS_PYTHON_IMPLEMENTATION_CONTEXT | python-implementation-context | preserve ID / no delete |
| PR29 | Cấu hình thí nghiệm bằng YAML/JSON | KEEP_AS_PYTHON_IMPLEMENTATION_CONTEXT | python-implementation-context | preserve ID / no delete |
| PR30 | Docker nhập môn cho môi trường tái lập | ROUTE_TO_SOFTWARE_ENGINEERING | oop-software-engineering | preserve ID / no delete |
| PR31 | Bảo mật dữ liệu và quản lý secret | ROUTE_TO_SOFTWARE_ENGINEERING | oop-software-engineering | preserve ID / no delete |
| PR32 | Tài liệu kỹ thuật và sơ đồ kiến trúc | ROUTE_TO_SOFTWARE_ENGINEERING | oop-software-engineering | preserve ID / no delete |
| PR33 | Dataset card cho telemetry và cảm biến | ROUTE_TO_ML_AI | ml-data-analysis | preserve ID / no delete |
| PR34 | Experiment tracking và bảng metric | ROUTE_TO_ML_AI | ml-data-analysis | preserve ID / no delete |
| PR35 | Ablation study bằng code có kiểm soát | ROUTE_TO_ML_AI | ml-data-analysis | preserve ID / no delete |
| PR36 | Xử lý log cảm biến và chuỗi thời gian | ROUTE_TO_ML_AI | ml-data-analysis | preserve ID / no delete |
| PR37 | Module đánh giá lỗi và phân tích thất bại | ROUTE_TO_ML_AI | ml-data-analysis | preserve ID / no delete |
| PR38 | Prototype dashboard kết quả nghiên cứu | KEEP_AS_PYTHON_IMPLEMENTATION_CONTEXT | python-implementation-context | preserve ID / no delete |
| PR39 | Đóng gói demo nghiên cứu | ROUTE_TO_SOFTWARE_ENGINEERING | oop-software-engineering | preserve ID / no delete |
| PR40 | Quản lý rủi ro phần mềm trong НИР | ROUTE_TO_SOFTWARE_ENGINEERING | oop-software-engineering | preserve ID / no delete |
| PR41 | Đóng băng mã nguồn và tag release | ROUTE_TO_SOFTWARE_ENGINEERING | oop-software-engineering | preserve ID / no delete |
| PR42 | Script chạy lại toàn bộ kết quả | KEEP_AS_PYTHON_IMPLEMENTATION_CONTEXT | python-implementation-context | preserve ID / no delete |
| PR43 | Chuẩn hóa thư mục luận văn và artifact | ROUTE_TO_SOFTWARE_ENGINEERING | oop-software-engineering | preserve ID / no delete |
| PR44 | Demo offline và kế hoạch dự phòng | ROUTE_TO_SOFTWARE_ENGINEERING | oop-software-engineering | preserve ID / no delete |
| PR45 | Tối ưu nhỏ: runtime, memory và latency | KEEP_AS_PYTHON_IMPLEMENTATION_CONTEXT | python-implementation-context | preserve ID / no delete |
| PR46 | Kiểm tra license, citation và nguồn mở | ROUTE_TO_SOFTWARE_ENGINEERING | oop-software-engineering | preserve ID / no delete |
| PR47 | Slide kỹ thuật: kiến trúc, pipeline, kết quả | ROUTE_TO_SOFTWARE_ENGINEERING | oop-software-engineering | preserve ID / no delete |
| PR48 | Trả lời phản biện kỹ thuật phần mềm | ROUTE_TO_SOFTWARE_ENGINEERING | oop-software-engineering | preserve ID / no delete |

## 7. Migration policy

PYTHON02 is additive governance only. The current learner runtime stays at `subjects/programming/`; current localStorage learner state is untouched; existing lesson IDs remain valid; mixed-subject lessons remain renderable until receiving owners/projections exist. A future schema/runtime migration must be versioned, idempotent where practical, rollbackable and independently validated.

## 8. Pass boundary

PYTHON02 passes only when the 48-lesson map is exact, the competency/prerequisite graph is coherent and acyclic, version/provenance rules are explicit, adjacent ownership is unambiguous, compatibility is preserved, and PYTHON03 receives a stable assessment input contract.

