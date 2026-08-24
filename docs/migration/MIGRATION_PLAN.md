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

Trạng thái: **B1–B2 PASS · B3 IMPLEMENTED · LOCAL GATE PASS · REMOTE CI PENDING**.

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
- Manual policy audit đã bắt và sửa inheritance leak của mode
  `orientation-only`; regression mới khóa exact required set cho
  orientation, diagnostic và recovery.
- Không lesson type nào bắt buộc đủ 13 block; optional/conditional rỗng bị omit,
  không sinh placeholder/tab.
- Russian/Math runtime và content: không có diff.
- L5 non-browser regression sau B3: static routing 9/9, service worker 17/17,
  academic runtime 36/36, roadmap/offline static 75/75, data loading 8 môn
  với 0 lỗi, runtime diagnostics 14/14, offline report integrity 5/5.
- Chưa đánh dấu B3 remote PASS cho tới khi workflow L6 trên nhánh làm việc
  hoàn tất thành công.

1. **L6-B1** · Audit sâu ba reference implementations: Tiếng Nga, Toán và nguyên tắc UX bài giảng Bơi ếch; lập bảng phần nào giữ, phần nào chuẩn hóa, phần nào không dùng chung. **PASS**.
2. **L6-B2** · Định nghĩa `UniversalLessonContract` gồm metadata, prerequisite, objectives, theory, example, exercise, lab/simulation, misconception, visual-check, oral, review, test, mastery, project/NIR evidence. **PASS**.
3. **L6-B3** · Tách `required blocks` và `optional blocks` theo lesson type để không ép mọi bài có 18 tab. **LOCAL PASS · CI PENDING**.
4. Định nghĩa lesson types: language, mathematics, programming, database, software-design, ML/data, ASOIU/system, research.
5. Định nghĩa Master-ready evidence/gate chung: understand → solve → build/apply → explain → retain; rubric theo loại môn.
6. Định nghĩa Visual Teaching Contract: hình/diagram/step-state/correct-wrong/interactive feedback, kế thừa tinh thần Bơi ếch nhưng phù hợp môn kỹ thuật.
7. Định nghĩa Russian Twin + English Research Layer hooks ngay trong contract, chưa ép hiển thị toàn bộ trước L12.
8. Tạo machine-readable lesson schema + validator + version migration.
9. Tạo Subject Factory registry: subject → engine → lesson types → special widgets → data sources → offline policy.
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
