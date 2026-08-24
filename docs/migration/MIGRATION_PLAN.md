# BAUMAN MASTER AI · KẾ HOẠCH MIGRATION AN TOÀN

Baseline: `main`
Working branch đầu tiên: `migration/webapp-l1-audit-storage`

Kế hoạch hiện tại trong Lượt 5: **14 lượt · 121 bước**. Ban đầu là 88 bước; Lượt 2 phát sinh thêm 3 bước, Lượt 3 thêm 9 bước, Lượt 4 thêm 3 bước và Lượt 5 hiện thêm 18 bước do audit/test tìm thấy rủi ro thật, yêu cầu Roadmap V3 và offline-first cho Web App. Số lượt/bước được phép tăng tiếp khi audit/test phát hiện vấn đề mới. Không giảm bước chỉ để rút ngắn tiến độ.

## Lượt 1 · Audit toàn hệ thống · 15 bước

Trạng thái: **PASS**. Bản đồ chi tiết ở `L1_SYSTEM_AUDIT.md`.

## Lượt 2 · Safety Platform Layer · 8 bước

Trạng thái: **PASS**. Báo cáo chi tiết ở `L2_SAFETY_PLATFORM_REPORT.md`.

1. Tạo runtime feature config, mặc định cloud/auth backend/AI proxy OFF.
2. Tạo storage adapter tương thích localStorage và legacy keys.
3. Bổ sung schema/version metadata cho state migration.
4. Bước phát sinh: sửa ký tự rác HTML tại topbar.
5. Wire adapter/platform layer vào main theo chế độ pass-through, không đổi hành vi runtime cũ.
6. Tạo platform bootstrap/audit không phá dữ liệu.
7. Bước phát sinh: deterministic regression harness.
8. Bước phát sinh: GitHub Actions safety regression và xác nhận run SUCCESS.

## Lượt 3 · Storage abstraction toàn hệ · 15 bước

Trạng thái: **PASS**. Báo cáo chi tiết ở `L3_STORAGE_ABSTRACTION_REPORT.md`.

1. Tạo main state repository trên platform storage.
2. Chuyển main state read/write qua repository, giữ nguyên legacy key.
3. Chuyển users/current-user/session cache qua repository, giữ nguyên legacy keys.
4. Chuyển schedule/progress/report writes qua đường `save()` của repository.
5. Tạo L3 regression workflow và scope protection.
6. Tạo full-repo storage inventory tự động.
7. Bước phát sinh: sửa workflow inventory không nhận generated file untracked.
8. Tạo shared subject storage abstraction.
9. Bổ sung allowlist migration để chặn sửa runtime ngoài phạm vi storage.
10. Wire storage layer vào entry của đủ 8 môn.
11. Chuyển AI/Foundation/Research/Signal/Systems qua subject storage.
12. Chuyển Russian/Programming và đổi oversized-data behavior từ xóa sang preserve.
13. Chuyển active Math storage E129/E239/E240 qua subject storage.
14. Bước phát sinh: chuyển Math core-subject/DataVault E127 còn direct browser storage.
15. Bước phát sinh: final direct-API inventory + byte-for-byte legacy preservation; sửa helper contract được gate phát hiện và chạy lại PASS.

## Lượt 4 · Chuẩn hóa Personal Learning State · 8 bước

Trạng thái: **PASS**. Báo cáo chi tiết ở `L4_PERSONAL_LEARNING_STATE_REPORT.md`.

1. Tách static/content state khỏi Personal Learning State bằng schema riêng.
2. Định nghĩa progress schema với monotonic-completion policy.
3. Định nghĩa assessment/test append-only và review record revision.
4. Định nghĩa schedule/activity/preferences/planning/research/configuration schema.
5. Viết deterministic versioned migration + integrity checks.
6. Bước phát sinh: shadow repository chỉ ghi khi integrity PASS, kiểm legacy state byte-for-byte.
7. Bước phát sinh: bootstrap OFF-by-default và wire vào main entry mà không tự tạo shadow.
8. Bước phát sinh: sửa CI guard dùng sai baseline, thêm bootstrap/index regression và checkpoint L3 guard.

## Lượt 5 · Site runtime, Roadmap V3 và offline-first data loading · 23 bước

Trạng thái: **IN PROGRESS**. Static audit đã được sửa false positive; browser gate sau đó phát hiện eager-load thật ở Math/Russian, audit tiếp phát hiện SiteRuntime chưa nằm trong Main entry graph, yêu cầu Web App offline-first phát sinh Local Library/content packs, audit Roadmap V3 phát hiện Main vẫn còn dùng academic dataset cũ ở Home/Kho môn/Lịch, và audit offline phát hiện pack có nguy cơ giữ bản cũ vô thời hạn nếu cache luôn thắng network. Không được chuyển sang L6 trước khi toàn bộ gate L5 PASS.

1. Chuẩn hóa static serving paths.
2. Lazy-load data lớn theo môn/tab.
3. Cache nội dung tĩnh có version.
4. Chuẩn hóa iframe/new-tab routing.
5. Regression desktop/laptop/tablet/mobile.
6. Bước phát sinh L5-A1: phân biệt catalog metadata, declared-initial metadata và request thật của browser; không coi `adapter.dataFiles` là startup network load.
7. Bước phát sinh L5-A2: dựng static entry-graph audit từ `subjects/*/index.html` và các script được nạp trực tiếp; giữ nguyên dữ liệu học thuật.
8. Bước phát sinh L5-A3: bổ sung browser/network regression làm nguồn authoritative cho startup payload và lazy-load behavior.
9. Bước phát sinh L5-A4: browser gate phát hiện eager-load thật; tách Math `lessons.json` legacy và Russian `vocab/tests/speaking` khỏi startup mà không sửa byte học liệu.
10. Bước phát sinh L5-A5: nâng GitHub Actions runtime lên Node 24 và gate syntax cho các module deferred-loader mới.
11. Bước phát sinh L5-A6: regression hai chiều, vừa cấm JSON lớn lúc startup vừa bắt buộc nguồn deferred phải tải khi người học mở đúng chức năng/Refresh.
12. Bước phát sinh L5-A7: khôi phục deferred source theo Personal Learning State đã lưu khi reload trực tiếp vào Vocab/Practice/Review/Exam/Storage.
13. Bước phát sinh L5-A8: wire `site-runtime.js` vào Main entry thật, chuẩn hóa site-root/service-worker scope và bọc iframe/new-tab/editor bằng same-origin routing bridge mà không ghi hostname triển khai vào state lâu dài.
14. Bước phát sinh L5-A9: đồng bộ runtime/cache version, static path + script-order + cache-policy gate, responsive matrix 9 entry × 4 viewport.
15. Bước phát sinh L5-A10: ghi durable CI checkpoint vào repo cho source SHA mới nhất, kèm các báo cáo gate sinh được; workflow checkpoint tự bỏ qua để không tạo vòng lặp. Chỉ khi checkpoint cuối là PASS mới ghi root cause/rollback report và đóng Lượt 5.
16. Bước phát sinh L5-A11: tách `lazy` khỏi `optional/non-persistent` ở Russian; giữ `vocab/tests/speaking` là nguồn bắt buộc có thể chỉnh sửa, cắt startup network nhưng bảo toàn legacy `_db` overlay byte/state-wise; thêm browser regression chống mất dữ liệu.
17. Bước phát sinh L5-A12: khóa Roadmap V3 riêng cho **Bauman · ИУ-5 · 09.04.01/11**, tạo manifest machine-readable bám curriculum 2026 và runtime bridge để Main đọc manifest mà không sửa khối `main.js` lớn.
18. Bước phát sinh L5-A13: tạo Offline Content Library bằng IndexedDB, file/folder picker, quota, local-file preview và sandbox HTML; không lưu file máy tính vào legacy Personal Learning State.
19. Bước phát sinh L5-A14: tạo explicit offline content-pack contract cho Web App/môn học; chỉ cache URL người học chủ động giữ, cho phép JSON đã chọn chạy offline nhưng vẫn cấm precache toàn bộ kho dữ liệu lớn.
20. Bước phát sinh L5-A15: gate Roadmap/offline gồm static source invariants, IndexedDB roundtrip, local HTML sandbox, explicit pack add/remove, Main offline reload, ít nhất một môn nhẹ + Math + Russian offline-flow, quota/storage-full handling và cache update/rollback. Chỉ sau PASS mới bật `serviceWorkerCache` cho rollout.
21. Bước phát sinh L5-A16: tạo **Academic Main Runtime V3** nạp sau `data.js` nhưng trước `main.js`, thay toàn bộ stage/semester/subject/course graph của Main bằng Bauman-only ИУ-5 · 09.04.01/11; migrate metadata state tại chỗ nhưng giữ nguyên progress, lịch thủ công, subject paths/editor paths và dữ liệu người học; thay Research UI bằng pipeline НИР 1→4→ВКР.
22. Bước phát sinh L5-A17: performance/render gate cho data lớn và Main V3: xác nhận Russian Vocab phân trang 20, Review/Exam 20–25, card Main dùng `content-visibility`, không render toàn kho một lượt; đo navigation/render responsiveness cho Main + Russian + Math và fail nếu long-task/DOM/request budget vượt ngưỡng đã khóa.
23. Bước phát sinh L5-A18: sửa freshness/lifecycle cho offline cache: explicit pack và versioned shell phục vụ cache ngay để không lag/mất mạng vẫn mở được, đồng thời revalidate nền khi network có lại; mọi refresh promise phải được đăng ký `waitUntil` trong fetch-event lifetime, shell install all-or-nothing, không để pack offline giữ nội dung cũ vĩnh viễn.

## Lượt 6 · Backend/API shell · 6 bước

1. Chọn backend tối thiểu theo yêu cầu thực tế, không đổi frontend framework.
2. Thiết lập environment/config/secrets server-side.
3. Health/version endpoint.
4. User-state API contract.
5. Progress/schedule/test API contract.
6. Validation/error envelope/logging cơ bản.

## Lượt 7 · Database cho dữ liệu động · 7 bước

1. Users/identity reference.
2. Progress/lesson completion.
3. Test results/history.
4. Schedule.
5. Weak topics/review state.
6. Study history/activity/settings.
7. Migration/import từ local backup với idempotency.

## Lượt 8 · Authentication thật · 6 bước

1. Loại ADMIN_PASS khỏi frontend production path.
2. Password hashing hoặc external identity provider.
3. Login/session/token.
4. Authorization/roles.
5. CSRF/CORS/session hardening theo kiến trúc đã chọn.
6. Chuyển backup sang không chứa credential.

## Lượt 9 · Cloud sync đa thiết bị · 7 bước

1. Revision/version cho record.
2. Device/client metadata tối thiểu.
3. Pull bootstrap khi đăng nhập.
4. Push mutations theo record, không sync whole-state blob.
5. Offline queue/cache fallback.
6. Conflict strategy theo loại dữ liệu.
7. Test Máy A → cloud → Máy B và xung đột gần đồng thời.

## Lượt 10 · Progress/Test/Schedule cloud integration · 5 bước

1. Đồng bộ lesson completion/progress.
2. Đồng bộ test results/review queue.
3. Đồng bộ schedule/PlanningBridge state.
4. Đồng bộ settings/bookmarks/study history.
5. Regression toàn bộ learning flow cũ.

## Lượt 11 · Personal AI Mentor foundation · 5 bước

1. Giữ mentor client hiện tại làm fallback.
2. Backend AI proxy không lộ API key.
3. Context builder từ profile/progress/history/score/weak topics/current lesson/schedule.
4. Recommendation contract có nguồn/context/version.
5. Fallback và privacy controls khi AI service lỗi/tắt.

## Lượt 12 · Security và performance hardening · 5 bước

1. XSS/injection/client tampering audit.
2. Authz/API validation/rate-limit audit.
3. Secret scan và deploy-env audit.
4. Lazy loading/cache/network payload profiling.
5. Security regression + dependency/config review.

## Lượt 13 · Staging và regression đa thiết bị · 6 bước

1. Staging deployment.
2. Regression homepage → subject → lesson → practice → simulation → review → test.
3. Math formula/slideshow/artifact regression.
4. Russian/Data Manager/assessment regression.
5. Responsive/browser matrix.
6. Sync/auth/failure/recovery tests.

## Lượt 14 · Production, backup và rollback · 5 bước

1. Production deployment có version/checkpoint.
2. Database backup + restore drill.
3. Rollback app/API/database migration procedure.
4. Monitoring/logging/health checks.
5. Release acceptance theo tiêu chí thành công của migration.

## Conflict policy định hướng

- Content tĩnh: server/version là authoritative, không merge user edit vào runtime content production nếu chưa qua workflow biên tập.
- Progress completion: monotonic completion ưu tiên không làm mất trạng thái đã hoàn thành.
- Test result: append-only event/result, không last-write-wins whole history.
- Schedule: record-level revision; xung đột cùng slot cần phát hiện rõ.
- Settings: last-write-wins theo `updatedAt` có server timestamp.
- AI history/state: append/event-based hoặc summary revision, không ghi đè mù.

## Merge gates

Không merge sang stable nếu thiếu ít nhất một trong các điều kiện: syntax/data validation, legacy-data preservation, regression chức năng liên quan, security review phù hợp cấp thay đổi, và rollback path.
