# BAUMAN MASTER AI · KẾ HOẠCH MIGRATION AN TOÀN

Baseline: `main`
Working branch đầu tiên: `migration/webapp-l1-audit-storage`

Kế hoạch sau khi hoàn tất Lượt 2: **14 lượt · 91 bước**. Ban đầu là 88 bước; Lượt 2 phát sinh thêm 3 bước để sửa lỗi HTML và bổ sung kiểm định tự động. Số lượt/bước được phép tăng tiếp khi audit/test phát hiện rủi ro mới. Không giảm bước chỉ để rút ngắn tiến độ.

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

## Lượt 3 · Storage abstraction toàn hệ · 6 bước

1. Chuyển main state read/write qua adapter.
2. Chuyển current user/session cache qua adapter.
3. Chuyển schedule/progress/report writes qua repository layer.
4. Kiểm kê và bọc storage namespace của Math.
5. Kiểm kê và bọc storage namespace của Russian/các môn còn lại.
6. Kiểm migration dữ liệu cũ, không xóa legacy key.

## Lượt 4 · Chuẩn hóa Personal Learning State · 5 bước

1. Tách state tĩnh và state người dùng.
2. Định nghĩa schema progress.
3. Định nghĩa schema test/review history.
4. Định nghĩa schema schedule/study activity/settings.
5. Viết versioned migration + integrity checks.

## Lượt 5 · Site runtime và data loading · 5 bước

1. Chuẩn hóa static serving paths.
2. Lazy-load data lớn theo môn/tab.
3. Cache nội dung tĩnh có version.
4. Chuẩn hóa iframe/new-tab routing.
5. Regression desktop/laptop/tablet/mobile.

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
