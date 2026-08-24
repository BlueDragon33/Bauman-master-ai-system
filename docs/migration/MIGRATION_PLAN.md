# BAUMAN MASTER AI · MASTER PLAN WEB APP

Baseline ổn định: `main`
Working branch: `migration/webapp-l1-audit-storage`
Mục tiêu sản phẩm: **Bauman Master AI · ИУ-5 · 09.04.01/11 · Web App/PWA · Online + Offline · AI-assisted · VI/RU/EN adaptive**

Kế hoạch chính thức hiện tại: **23 lượt · 218 bước**.

Quy tắc cố định:
- Thực hiện tuần tự; lỗi ở lượt/bước nào thì dừng tiến độ tại đó, sửa xong và chạy lại gate rồi mới tiếp tục.
- Được tự tăng lượt/bước khi audit/test phát hiện rủi ro hoặc một cải tiến có giá trị học tập rõ ràng; không giảm bước chỉ để rút ngắn tiến độ.
- Không phá học liệu Tiếng Nga/Toán đã có chỉ để ép vào schema mới; ưu tiên adapter/bridge/migration có rollback.
- Không merge/deploy `main` trước khi staging và regression tương ứng PASS.
- Learner-facing UI chỉ theo Bauman · ИУ-5 · 09.04.01/11; không đưa nhãn trường so sánh vào lộ trình học.
- AI phải hỗ trợ học tập thật, không chỉ là ô chat; offline phải vẫn học được khi AI/cloud/VPN không khả dụng.

---

## Lượt 1 · Audit toàn hệ thống · 15 bước

Trạng thái: **PASS**. Bản đồ chi tiết: `L1_SYSTEM_AUDIT.md`.

## Lượt 2 · Safety Platform Layer · 8 bước

Trạng thái: **PASS**. Báo cáo: `L2_SAFETY_PLATFORM_REPORT.md`.

1. Runtime feature config, mặc định cloud/auth backend/AI proxy OFF.
2. Storage adapter tương thích localStorage và legacy keys.
3. Schema/version metadata cho state migration.
4. Sửa ký tự rác HTML tại topbar.
5. Wire adapter/platform layer vào Main theo pass-through.
6. Platform bootstrap/audit không phá dữ liệu.
7. Deterministic regression harness.
8. GitHub Actions safety regression và checkpoint PASS.

## Lượt 3 · Storage abstraction toàn hệ · 15 bước

Trạng thái: **PASS**. Báo cáo: `L3_STORAGE_ABSTRACTION_REPORT.md`.

1. Main state repository.
2. Main state read/write qua repository, giữ legacy key.
3. Users/current-user/session cache qua repository.
4. Schedule/progress/report qua save path chung.
5. L3 regression workflow + scope protection.
6. Full-repo storage inventory.
7. Sửa inventory generated-file edge case.
8. Shared subject storage abstraction.
9. Allowlist migration guard.
10. Wire storage layer vào đủ 8 subject entry.
11. Chuyển AI/Foundation/Research/Signal/Systems.
12. Chuyển Russian/Programming và preserve oversized data.
13. Chuyển active Math storage.
14. Chuyển Math core-subject/DataVault legacy direct storage.
15. Final direct-API inventory + byte-for-byte legacy preservation.

## Lượt 4 · Personal Learning State · 8 bước

Trạng thái: **PASS**. Báo cáo: `L4_PERSONAL_LEARNING_STATE_REPORT.md`.

1. Tách content/static state khỏi Personal Learning State.
2. Progress schema + monotonic completion.
3. Assessment append-only + review revision.
4. Schedule/activity/preferences/planning/research/configuration schema.
5. Deterministic versioned migration + integrity.
6. Shadow repository chỉ ghi khi integrity PASS.
7. Bootstrap OFF-by-default, không tự tạo shadow.
8. CI baseline/bootstrap/index regression và checkpoint.

## Lượt 5 · Web App runtime · Roadmap V3 · Offline-first · 25 bước

Trạng thái: **PASS**.

Validated source: `de34c9606d8e35b138e9933c835d4ab55228fca6`
Immutable checkpoint: `checkpoint/l5-webapp-offline-pass-a20-20260824`
Authoritative run: `32702609199`
Báo cáo đóng lượt: `L5_WEBAPP_OFFLINE_FINAL_REPORT.md`

1. Chuẩn hóa static serving paths.
2. Lazy-load data lớn theo môn/tab.
3. Versioned cache cho static shell.
4. Chuẩn hóa iframe/new-tab routing.
5. Regression desktop/laptop/tablet/mobile.
6. A1: phân biệt catalog metadata / initial declaration / network request thật.
7. A2: static entry-graph audit từ subject entry.
8. A3: browser/network regression làm nguồn authoritative.
9. A4: defer Math legacy lessons và Russian vocab/tests/speaking khỏi startup.
10. A5: Node 24 + syntax gate cho deferred loaders.
11. A6: regression hai chiều: cấm eager-load nhưng bắt lazy source tải khi mở đúng chức năng.
12. A7: restore deferred source theo Personal Learning State khi reload trực tiếp.
13. A8: SiteRuntime vào Main, site-root/service-worker scope/same-origin routing.
14. A9: runtime/cache version + script-order/cache-policy + responsive matrix.
15. A10: durable checkpoint/report/rollback contract.
16. A11: tách Russian lazy khỏi optional/non-persistent, giữ overlay persistence.
17. A12: Roadmap V3 Bauman · ИУ-5 · 09.04.01/11 + manifest machine-readable.
18. A13: IndexedDB Offline Content Library + file/folder picker + HTML sandbox.
19. A14: explicit subject offline packs; không precache toàn kho lớn.
20. A15: Local Library/offline browser/quota/cache/update/rollback gates.
21. A16: Academic Main Runtime V3 thống nhất Home/Roadmap/Subjects/Schedule/NIR.
22. A17: render/DOM performance gate cho Main + Russian + Math.
23. A18: cache freshness + Service Worker lifecycle/revalidation/atomic install.
24. A19: Direct Local Reader zero-copy cho PDF/video/audio/image/text/code/HTML sandbox.
25. A20: offline report semantic-integrity; sandbox block dự kiến không bị hiểu sai thành runtime failure.

L5 PASS nhưng `serviceWorkerCache` production vẫn OFF. Chỉ bật ở staging/PWA rollout sau gate riêng.

---

## Lượt 6 · Universal Lesson Architecture & Subject Factory · 11 bước

Trạng thái: **B1–B8 PASS · B9 LOCAL PASS, CHỜ REMOTE CI**.

Bằng chứng B1:
- Audit quyết định: L6_B1_REFERENCE_IMPLEMENTATION_AUDIT.md.
- Evidence máy đọc được: L6_B1_REFERENCE_AUDIT.generated.json.
- Deterministic gate: 44/44 checks PASS; report hash ổn định qua hai lần chạy.
- Remote gate: commit `e75ca680a50e79f75e14218f4a9ecbfe0683a4b0`,
  context `migration/l6-b1-reference-audit` = `success`.
- L5 non-browser regression sau B1: static routing 9/9, service worker 17/17,
  academic runtime 36/36, roadmap/offline static 75/75, data loading 8 môn
  với 0 lỗi, runtime diagnostics 14/14, offline report integrity 5/5.

Bằng chứng B2:
- Contract: `assets/data/lesson/universal-lesson-contract-v2.json`.
- Decision record: `L6_B2_UNIVERSAL_LESSON_CONTRACT.md`.
- Evidence máy đọc được:
  `L6_B2_UNIVERSAL_LESSON_CONTRACT.generated.json`.
- Deterministic gate: 35/35 checks PASS; B1 vẫn 44/44; cả hai report có hash
  ổn định qua hai lần chạy.
- Remote gate: commit `bcf0eedf98cc0f7e1a5c610b037f8d2bf4f30698`,
  run `32713023513`, context
  `migration/l6-b2-universal-contract` = `success`.
- Russian/Math runtime và content: không có diff.
- L5 non-browser regression sau B2: static routing 9/9, service worker 17/17,
  academic runtime 36/36, roadmap/offline static 75/75, data loading 8 môn
  với 0 lỗi, runtime diagnostics 14/14, offline report integrity 5/5.

Bằng chứng B3:
- Policy:
  `assets/data/lesson/universal-lesson-block-policy-v1.json`.
- Decision record: `L6_B3_BLOCK_REQUIREMENT_POLICIES.md`.
- Evidence máy đọc được: `L6_B3_BLOCK_POLICY.generated.json`.
- Deterministic gate: 37/37 checks PASS; B1/B2 vẫn PASS; cả ba report có hash
  ổn định qua hai lần chạy.
- Remote gate: commit `6a356c92097798439dc26bba9d1c3acd29bbe7c2`,
  run `32713846615`, context
  `migration/l6-b3-block-policy` = `success`.
- Manual policy audit đã bắt và sửa inheritance leak của mode
  `orientation-only`; regression mới khóa exact required set cho
  orientation, diagnostic và recovery.
- Không lesson type nào bắt buộc đủ 13 block; optional/conditional rỗng bị omit,
  không sinh placeholder/tab.
- Russian/Math runtime và content: không có diff.
- L5 non-browser regression sau B3: static routing 9/9, service worker 17/17,
  academic runtime 36/36, roadmap/offline static 75/75, data loading 8 môn
  với 0 lỗi, runtime diagnostics 14/14, offline report integrity 5/5.

Bằng chứng B4:
- Registry: `assets/data/lesson/lesson-type-registry-v1.json`.
- Decision record: `L6_B4_LESSON_TYPE_REGISTRY.md`.
- Evidence máy đọc được:
  `L6_B4_LESSON_TYPE_REGISTRY.generated.json`.
- Deterministic gate: 36/36 checks PASS; B1-B3 vẫn PASS; cả bốn report có hash
  ổn định qua hai lần chạy.
- Đúng 8 lesson type; mỗi bài đúng 1 primary type, secondary facets không được
  tự merge block policy.
- Manual registry audit đã sửa ký tự trộn Latin/Cyrillic trong `ВКР`
  và thêm guard.
- Russian/Math chỉ là `audited-reference-unprojected`; không có
  source/runtime diff và chưa tuyên bố migration.
- Remote gate: commit `b051c8234927e5b0c012c4dd2c4008a6aa938a7d`,
  run `32714596099`, context
  `migration/l6-b4-lesson-types` = `success`.
- L5 non-browser regression sau B4: static routing 9/9, service worker 17/17,
  academic runtime 36/36, roadmap/offline static 75/75, data loading 8 môn
  với 0 lỗi, runtime diagnostics 14/14, offline report integrity 5/5.

Bằng chứng B5:
- Policy: `assets/data/lesson/master-ready-policy-v1.json`.
- Decision record: `L6_B5_MASTER_READY_EVIDENCE_GATES.md`.
- Evidence máy đọc được:
  `L6_B5_MASTER_READY_REGRESSION.generated.json`.
- Deterministic gate: 44/44 checks PASS; B1-B4 vẫn PASS; cả năm report có hash
  ổn định qua hai lần chạy. Hash report B5:
  `d5aaf144ee34e099d2608f82b92df59f0ed64a2bdc1b284b2d80561b294384e2`.
- Khóa năm stage chung `understand → solve → build-apply → explain → retain`,
  nhưng evidence/rubric/retention window theo đúng tám lesson type; không dùng
  một ngưỡng 80/75 toàn cục và không đồng nhất course pass với Master-ready.
- Chỉ deterministic evaluator và instructor review được đặt `verified`; self,
  peer và AI chỉ advisory. `ready-for-retention` là trạng thái tạm, không được
  xuất/hiển thị thành Master-ready.
- Manual audit đã bổ sung transition về `needs-repair` khi prerequisite hoặc
  versioned source/evidence bị vô hiệu; ba mutation test về rubric weight,
  quyền xác minh của AI và provisional-state wording đều FAIL đúng dự kiến.
- Russian/Math runtime và content: không có diff.
- Remote gate: commit `73f70e99f4a68b887fc2cb5faee125afbb8566ae`,
  run `32715744137`, context
  `migration/l6-b5-master-ready` = `success`; B1-B4 contexts cùng run cũng
  `success`.
- L5 non-browser regression sau B5: static routing 9/9, service worker 17/17,
  academic runtime 36/36, roadmap/offline static 75/75, data loading 8 môn
  với 0 lỗi, runtime diagnostics 14/14, offline report integrity 5/5.

Bằng chứng B6:
- Contract: `assets/data/lesson/visual-teaching-contract-v1.json`.
- Decision record: `L6_B6_VISUAL_TEACHING_CONTRACT.md`.
- Evidence máy đọc được:
  `L6_B6_VISUAL_TEACHING_REGRESSION.generated.json`.
- Deterministic gate: 75/75 checks PASS; B1-B5 vẫn PASS; report B6 ổn định
  qua hai lần chạy với SHA-256
  `a7ab789dae55ad78d9349fac686a74c1d1cb5dd65e35c833088e777f08b1e3d3`.
- Khóa 11 learning role, 10 representation family và đủ 48 assignment/46
  visual kind riêng biệt từ đúng tám type profile B4; profile là vocabulary
  cho phép, không buộc một bài dựng mọi visual hoặc một số tab cố định.
- Step-state, correct/partial/wrong/inconclusive, predict-act-observe-explain,
  one-primary-error feedback và formal-assessment disclosure được tách rõ;
  AI không được verify hoặc tiết lộ protected answer trước submission.
- Manual audit bổ sung quy tắc nullable có điều kiện cho specialist capability,
  repair ref và primary error; bốn mutation test về type coverage, focused
  feedback, assessment leakage và accessibility đều FAIL đúng dự kiến.
- Bơi ếch reference khớp URL và ba hash B1; chỉ giữ flow/checkpoint/focused
  repair/offline, không sao chép interaction theo miền bơi hoặc fixed tabs.
- Russian/Math vẫn `read-only-reference-unprojected`; runtime/content không có
  diff và sáu source compatibility paths có hash trong report.
- Remote gate: commit `39dc6f08023536924e1faa81029c30b8a8f51f3f`,
  run `32717062541`, context
  `migration/l6-b6-visual-teaching` = `success`; B1-B5 contexts cùng run cũng
  `success`.
- L5 regression trên bản nguồn sạch sau B6: static routing 9/9, service worker
  17/17, academic runtime 36/36, roadmap/offline static 75/75, data loading 8
  môn với 0 lỗi, runtime diagnostics 14/14, offline report integrity 5/5.

Bằng chứng B7:
- Contract: `assets/data/lesson/language-layer-hooks-v1.json`.
- Decision record: `L6_B7_LANGUAGE_LAYER_HOOKS.md`.
- Evidence máy đọc được:
  `L6_B7_LANGUAGE_LAYER_REGRESSION.generated.json`.
- Deterministic gate: 96/96 checks PASS; B1-B6 vẫn PASS; report B7 ổn định
  qua hai lần chạy với SHA-256
  `e4d2269047b69559dd27ed40ccf9010fbbe4d314c9e57100dd5984ef1aea6c59`.
- Russian Twin và English Research mỗi lớp có 8 mode, alignment/glossary/token
  provenance riêng; mặc định `declared`, hidden, `autoActivate=false`, toàn bộ
  learner UI đa ngôn ngữ vẫn thuộc L12.
- Manual audit sửa role `supportLanguages` nhất quán và thêm exact review
  authority: AI chỉ được đặt `unreviewed-ai-draft`; review alignment không phải
  xác minh Master-ready và vẫn cần B5 verifier riêng.
- Evidence boundary cấm hook-open/term-view/rescue/feedback trở thành mastery;
  assessment tách domain/source/language và cấm hook/AI lộ protected answer.
- Năm mutation test về auto-activation, AI review promotion, English Research
  coverage, rescue-as-evidence và answer leakage đều FAIL đúng dự kiến.
- Russian vẫn 26 bài/26 `ruTitle`; Research vẫn 45 bài `elearning-v1.1`;
  Roadmap giữ `russian-twin-lesson`, research methodology/thesis,
  `nir-vkr` và `matching-russian-technical`; sáu source path có hash trong
  report, source/runtime không có diff.
- Remote gate: commit `4997800c983cb0ad9e88b6254c7cc29ae6165128`,
  run `32718320781`, context
  `migration/l6-b7-language-hooks` = `success`; B1-B6 contexts cùng run cũng
  `success`.
- L5 regression trên bản nguồn sạch sau B7: static routing 9/9, service worker
  17/17, academic runtime 36/36, roadmap/offline static 75/75, data loading 8
  môn với 0 lỗi, runtime diagnostics 14/14, offline report integrity 5/5.

Bằng chứng B8:
- Schema Draft 2020-12:
  `assets/data/lesson/schema/universal-lesson-v2.schema.json`; validator và
  pure dry-run migrator dùng browser UMD, không thêm dependency và không nối
  vào learner runtime trong B8.
- Migration registry:
  `assets/data/lesson/schema/lesson-migration-registry-v1.json`; chỉ
  `universal-v1@1.0.0` và `elearning-v1.1` có đường tạo candidate V2 cần manual
  review. Russian rich và Math rich trả `ADAPTER_REQUIRED`, không có direct
  migration hoặc write authority.
- Deterministic B8 gate local: 110/110 checks PASS; 6/6 mutation failures được
  quan sát; 45/45 Research `elearning-v1.1` tạo candidate schema-valid ở dry-run;
  report SHA-256
  `4e405706231995f6067a460717536b138da878a04a803f0f55613291b24f6be6`.
- Source/candidate/rollback integrity dùng SHA-256 stable JSON; `NaN`, Infinity,
  cycle, prototype-control, credential-like key, duplicate ID, evidence sai
  lesson type và offline ref không resolve đều fail closed.
- Universal V1/eLearning fixture giữ source không đổi, giữ field chưa map trong
  migration extension/source snapshot, không tạo empty block; snapshot bị sửa
  không rollback được.
- Russian vẫn 26 bài/26 `ruTitle`; Russian/Math source thật không đổi và bị chặn
  direct migration; B8 không ghi Personal Learning State, offline library,
  Service Worker hoặc runtime subject.
- L5 regression trên baseline sạch sau B8: static routing 9/9, service worker
  17/17, academic runtime 36/36, roadmap/offline static 75/75, data loading 8
  môn với 0 lỗi, runtime diagnostics 14/14, offline report integrity 5/5 với
  một sandbox block đúng dự kiến.
- Decision record:
  `docs/migration/L6_B8_LESSON_SCHEMA_VALIDATOR_MIGRATION.md`; evidence:
  `docs/migration/L6_B8_SCHEMA_MIGRATION_REGRESSION.generated.json`.
- Remote gate: commit `b627464e5691972c2367de1367b371a657f851db`,
  run `32721005666`, context `migration/l6-b8-schema-migration` = `success`;
  B1-B7 contexts trong cùng run đều `success`.

Bằng chứng B9 (chưa được đánh dấu PASS trước remote CI):
- Registry:
  `assets/data/lesson/subject-factory-registry-v1.json`; resolver browser UMD:
  `assets/js/platform/universal-lesson/subject-factory-registry-v1.js`.
- Đúng 8 subject của Main, 4 engine, 22 widget, 4 offline policy và 128 data
  source đã resolve tới file local an toàn; registry SHA-256 stable JSON:
  `c852e9bd4ab02bb7307274f1efc3c3b34c766de679cf06f3cff7bcb2c16d3001`.
- Phân loại 631 lesson hiện tại: Russian 26 language; Math 347 mathematics;
  Programming 28 programming + 4 database + 16 software-design; AI 51 ML/data;
  Signal 36 ML/data; Systems 57 ASOIU/system; Research 45 research. Foundation
  chỉ resolve 15 lesson theo module và giữ 6 lesson của `f_m201`/`f_m202` ở
  `UNCLASSIFIED_LESSON`, không dùng default sai miền.
- Audit khóa Russian `vocab/tests/speaking` là required-lazy và không bị đưa
  vào optional persistence exclusion; Math ưu tiên `theory_lecture_content` /
  artifact reader, giữ full legacy `lessons.json` required-lazy; năm runtime
  light đăng ký `simulations.json` là runtime supplemental mà không rewrite
  manifest/runtime đang hoạt động.
- Deterministic B9 gate local: 340/340 checks PASS; 8/8 mutation failures được
  quan sát; report ổn định qua hai lần chạy với SHA-256
  `af8145f87c739400cfa5c4c04ec8c015914d5920fce89e146f15591d894e78a3`.
- B1-B9 chạy tuần tự đều PASS. Clean-baseline L5 sau B9: static routing 9/9,
  service worker 17/17, academic runtime 36/36, roadmap/offline static 75/75,
  data loading 8 môn với 0 lỗi, runtime diagnostics 14/14, offline report
  integrity 5/5 với một sandbox block đúng dự kiến.
- B9 không được load vào learner runtime; không render, migrate source, ghi
  learner state, sửa subject content/runtime, offline manager hoặc Service
  Worker. Remote context đang chờ:
  `migration/l6-b9-subject-factory`.

1. **L6-B1** · Audit sâu ba reference implementations: Tiếng Nga, Toán và nguyên tắc UX bài giảng Bơi ếch; lập bảng phần nào giữ, phần nào chuẩn hóa, phần nào không dùng chung. **PASS**.
2. **L6-B2** · Định nghĩa `UniversalLessonContract` gồm metadata, prerequisite, objectives, theory, example, exercise, lab/simulation, misconception, visual-check, oral, review, test, mastery, project/NIR evidence. **PASS**.
3. **L6-B3** · Tách `required blocks` và `optional blocks` theo lesson type để không ép mọi bài có 18 tab. **PASS**.
4. **L6-B4** · Định nghĩa lesson types: language, mathematics, programming, database, software-design, ML/data, ASOIU/system, research. **PASS**.
5. **L6-B5** · Định nghĩa Master-ready evidence/gate chung: understand → solve → build/apply → explain → retain; rubric theo loại môn. **PASS**.
6. **L6-B6** · Định nghĩa Visual Teaching Contract: hình/diagram/step-state/correct-wrong/interactive feedback, kế thừa tinh thần Bơi ếch nhưng phù hợp môn kỹ thuật. **PASS**.
7. **L6-B7** · Định nghĩa Russian Twin + English Research Layer hooks ngay trong contract, chưa ép hiển thị toàn bộ trước L12. **PASS**.
8. Tạo machine-readable lesson schema + validator + version migration.
   **PASS**.
9. Tạo Subject Factory registry: subject → engine → lesson types → special widgets → data sources → offline policy. **LOCAL PASS · CHỜ REMOTE CI**.
10. Tạo Universal Lesson Renderer/bridge dùng được với content engine hiện tại mà không phá Russian/Math legacy.
11. Regression reference subjects + rollback checkpoint; chỉ PASS khi Russian/Math không giảm chức năng và một subject nhẹ dựng được bằng Factory.

## Lượt 7 · Hoàn thiện Reference Subjects · Russian + Math + Foundation · 9 bước

1. Audit coverage Russian theo roadmap dự bị → technical → academic → defense.
2. Chuẩn hóa Russian lesson map vào Universal Contract bằng adapter, giữ dialogue/speech/handwriting/flashcard/exam đặc thù.
3. Hoàn thiện Russian Twin lesson generator/registry và glossary theo subject/context.
4. Audit Math toàn bộ theory/exercise/test/simulation; map prerequisite theo AI/Data/ИУ-5.
5. Chuẩn hóa Math vào Universal Contract, giữ formula/step solution/simulation đặc thù.
6. Hoàn thiện Foundation cho giai đoạn dự bị: classroom Russian + math/science transition + study-method bridge.
7. Master-ready evidence + spaced-review hooks cho Russian/Math/Foundation.
8. Visual/pedagogical QA desktop/tablet/mobile/offline.
9. Cross-reference checkpoint: Russian/Math là reference implementation chính thức cho các môn sau.

## Lượt 8 · Programming Core FULL · Python/OOP/Algorithms/DB/Software Engineering · 14 bước

1. Python fundamentals roadmap theo prerequisite thực tế.
2. OOP + SOLID/patterns cần cho ИУ-5.
3. NumPy/Pandas/data pipeline.
4. Testing/debugging/Git.
5. Algorithms & Data Structures vừa đủ, không competitive-programming hóa.
6. Complexity/search/sort/hash/tree/graph practical modules.
7. SQL full path từ query cơ bản đến complex query.
8. Relational model/schema/normalization/transactions.
9. Index/query plan/database optimization.
10. Post-relational/NoSQL + ML data architecture.
11. Software requirements/UML/architecture/OOP system design.
12. Testing strategy/versioning/CI/lifecycle/project management.
13. Đặc sản UI: code runner/test/debug challenge + SQL playground/schema/query-plan + UML/architecture interactions.
14. Full subject QA + Master-ready + RU Twin/EN terminology hooks + offline packs.

## Lượt 9 · AI & Data FULL · ML/Neural/Data Analysis/Time Series · 13 bước

1. Data preparation/statistical bridge.
2. Supervised learning.
3. Unsupervised learning.
4. Metrics/cross-validation/model selection.
5. Feature engineering/regularization.
6. Ensembles/clustering.
7. Neural-network fundamentals.
8. Neural training/loss/activation/optimization practicals.
9. Multivariate data analysis + covariance/PCA/SVD links to Math.
10. Time-series foundations/stationarity/autocorrelation/decomposition.
11. Forecasting + anomaly detection + telemetry examples.
12. Đặc sản UI: dataset playground/model comparison/confusion matrix/overfit/network/time-series visualizers.
13. Full QA + reproducible experiments + Master-ready + RU/EN layers.

## Lượt 10 · ASOIU · Reliability · Systems · Support Bridges FULL · 11 bước

1. Analytical models of ASOIU.
2. System architecture/information flow/modeling.
3. OOP design links to software-engineering subject.
4. Reliability models and failure reasoning.
5. Lifecycle/process description.
6. Ergonomic analysis of information/display systems.
7. Information security bridge where official course requires it.
8. Markov bridge on demand.
9. Queueing/Operations Research bridge on demand.
10. Linux/OS/Networks bridge on demand, only depth actually needed.
11. System-diagram/reliability-scenario/lifecycle interactive QA + Master-ready.

## Lượt 11 · Research Methodology · НИР 1–4 · ВКР FULL · 9 bước

1. Research question/hypothesis builder.
2. Literature matrix + source/evidence vault.
3. Dataset/system/experimental asset registry.
4. Baseline + metric design.
5. Experimental protocol/version log/reproducibility.
6. Comparative experiment + statistics/error analysis.
7. Scientific writing RU/EN support with citation/source boundary.
8. NIR Semester 1→4 milestones mapped to current Bauman courses.
9. ВКР preparation, demo, pre-defense and oral-defense simulator.

## Lượt 12 · Multilingual Immersion Engine · VI/RU/EN · 10 bước

1. Language-state schema: general Russian, classroom Russian, technical Russian, academic Russian, English technical, English paper-reading.
2. Configurable stage timeline; dates editable because preparatory start can change.
3. Home adaptive language distribution.
4. Roadmap adaptive language distribution.
5. Subjects/chapter/lesson adaptive labels.
6. RU–EN–VI concept mapping + hover/tap rescue layer.
7. Russian Twin content policy by stage and subject.
8. English Research Layer: terminology, documentation words, paper/search keywords.
9. Russian-first transition around half preparatory; Master uses Russian classroom + English research + Vietnamese rescue.
10. Adaptive per-subject exposure + accessibility/fallback QA; never blindly translate formulas/code/official course names.

## Lượt 13 · AI Core & Context Engine · 8 bước

1. AI provider abstraction; client UI does not contain production secret.
2. Context schema from current lesson, prerequisite, progress, scores, weak topics, schedule and NIR/VKR.
3. Context-size budget/chunking and privacy boundary.
4. AI Mentor modes: explain-simple, explain-deep, example, hint, Socratic, quiz-me.
5. Grounding contract: source content vs user data vs AI inference must be distinguishable.
6. Structured AI result schema with confidence/source/version.
7. Offline/non-AI fallback so learning flow never depends on model availability.
8. Safety/cost/latency regression + deterministic mock provider for tests.

## Lượt 14 · Adaptive Learning Engine · 8 bước

1. Prerequisite graph evaluation.
2. Weak-topic/misconception detection.
3. Mastery state per concept, not only subject percent.
4. Adaptive daily priority engine.
5. Recovery Route after failed assessment.
6. Spaced repetition 1/3/7/14/30-day baseline with performance adjustment.
7. Adaptive test composition from core/weak/old/integrated topics.
8. Explainability: system must show why a lesson/review was prioritized; regression against endless-loop/over-practice.

## Lượt 15 · AI Language Tutor · Russian/English/Oral · 8 bước

1. Russian conversation tutor by stage.
2. Classroom Russian simulator.
3. Technical Russian terminology coach linked to current subject.
4. Russian oral exam / преподаватель role-play.
5. Rubric: content, terminology, Russian clarity, completeness.
6. English technical-reading helper + paper vocabulary/search-query builder.
7. RU/EN/VI rescue rules integrated with Language Immersion Engine.
8. Speech/text fallback, transcript retention policy and multilingual QA.

## Lượt 16 · AI Research Mentor · НИР/VКР · 7 bước

1. Research context builder from user-selected sources/evidence only.
2. Literature summarization/comparison with source traceability.
3. Research-question critique without inventing evidence.
4. Experiment-plan/baseline/metric assistant.
5. Error-analysis/results interpretation assistant.
6. Writing/revision/translation support with explicit source vs inference boundary.
7. Defense simulator + anti-hallucination/source-integrity regression.

## Lượt 17 · Backend/API Shell · 6 bước

1. Chọn backend tối thiểu phù hợp deployment, không rewrite frontend framework.
2. Environment/config/secrets server-side.
3. Health/version endpoint.
4. User-state API contract.
5. Progress/schedule/test/AI context API contracts.
6. Validation/error envelope/logging + offline-safe failure behavior.

## Lượt 18 · Authentication & Authorization thật · 6 bước

1. Loại production credential khỏi frontend.
2. Password hashing hoặc identity provider phù hợp.
3. Login/session/token lifecycle.
4. Roles/authorization.
5. CSRF/CORS/session hardening theo kiến trúc thực tế.
6. Backup/export không chứa credential + auth regression/recovery.

## Lượt 19 · Database + Cloud Sync đa thiết bị · 7 bước

1. Users/identity reference + Personal Learning records.
2. Progress/lesson/mastery/test/review schema.
3. Schedule/history/preferences/research evidence metadata.
4. Record-level revision + device/client metadata.
5. Pull bootstrap + push mutation queue, không sync whole-state blob.
6. Conflict policy theo loại record; offline queue/retry/idempotency.
7. Máy A → cloud → Máy B + concurrent edit + recovery regression.

## Lượt 20 · Progress/Test/Schedule/AI Cloud Integration · 5 bước

1. Sync lesson completion/mastery/weak topics.
2. Sync assessment/review/spaced repetition state.
3. Sync schedule/PlanningBridge/current Bauman subjects.
4. Sync settings/bookmarks/study history/NIR checkpoints.
5. AI context uses synced records without leaking unrelated personal data; full learning-flow regression.

## Lượt 21 · Security · Privacy · Performance Hardening · 5 bước

1. XSS/injection/local-file sandbox/client-tampering audit.
2. Authz/API validation/rate limiting/AI abuse guard.
3. Secret scan/dependency/deploy-env/privacy retention audit.
4. Lazy-loading/cache/DOM/memory/network/AI-context profiling across full subjects.
5. Security/performance regression + failure/recovery/rollback drill.

## Lượt 22 · PWA · Site · Staging · Cross-device QA · 6 bước

1. PWA manifest/install/update UX and deliberate Service Worker rollout.
2. Site deployment/staging domain with version/health marker.
3. Offline install → open → study → reconnect → update regression.
4. Cross-device/browser matrix: desktop/laptop/tablet/mobile; Chrome/Edge and supported fallbacks.
5. Full curriculum path smoke: Home → Roadmap → Subject → Lesson → Lab → Review → Test → AI → NIR.
6. Pedagogical/visual consistency audit across every full subject; no subject may ship as a low-quality text dump compared with reference lesson form.

## Lượt 23 · Production · Backup · Rollback · Monitoring · 4 bước

1. Production release with immutable version/checkpoint and no premature migration of `main`.
2. Database/content/state backup + restore drill.
3. App/API/database/content rollback procedure tested from checkpoint.
4. Monitoring/logging/health + final acceptance: Web App/site, offline, multilingual, AI, all core subjects and NIR/VKR PASS.

---

## Conflict policy

- Static/content: versioned authoritative content; user learning state is separate.
- Completion/mastery: monotonic where appropriate; never silently lose completed evidence.
- Assessment: append-only results; review status may revise separately.
- Schedule: record-level revision; same-slot conflicts must be visible.
- Settings: timestamped last-write-wins only where harmless.
- Research evidence: append/version, never overwrite source silently.
- AI output: derived/advisory; never treated as authoritative source without provenance.
- Offline cache: user-selectable; no giant automatic precache; server update may revalidate without deleting a working old shell before new shell is complete.

## Merge / progression gates

Không được chuyển lượt nếu gate bắt buộc của lượt hiện tại chưa PASS. Không merge sang stable nếu thiếu ít nhất một trong: syntax/data validation, legacy-data preservation, functional/browser regression, pedagogical/content validation phù hợp phạm vi, security review phù hợp cấp thay đổi, và rollback path.

Mọi lượt hoàn tất phải có ít nhất: source checkpoint, gate result, report ngắn về root cause/phần phát sinh, và rollback point.
