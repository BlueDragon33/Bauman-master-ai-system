# Lượt 3 · Storage Abstraction toàn hệ · Báo cáo hoàn thành

Branch: `migration/webapp-l1-audit-storage`
Baseline: `main`

## Kết quả

Lượt 3 ban đầu dự kiến 6 bước. Trong quá trình triển khai, inventory và regression phát hiện nhiều namespace storage hoạt động độc lập, một bug workflow inventory, hai runtime Math phụ còn truy cập browser storage trực tiếp, và một lỗi contract giữa subject helper với regression test. Vì vậy Lượt 3 được mở rộng thành **15 bước**.

1. Tạo `main-state-repository.js` trên `BaumanPlatformStorage`.
2. Chuyển main state read/write qua repository nhưng giữ nguyên legacy key.
3. Chuyển users/current-user/session cache qua repository nhưng giữ nguyên legacy keys.
4. Đưa schedule/progress/report về cùng đường ghi `save()` qua repository.
5. Tạo L3 regression workflow và scope protection.
6. Tạo full-repo storage inventory tự động.
7. Sửa lỗi workflow inventory không nhận file report untracked.
8. Tạo `subject-storage.js` dùng chung cho toàn bộ môn học.
9. Tạo allowlist migration để chặn sửa ngoài phạm vi storage.
10. Wire platform/subject storage vào entry của đủ 8 môn.
11. Chuyển AI/Foundation/Research/Signal/Systems qua subject storage.
12. Chuyển Russian/Programming qua subject storage; payload quá lớn/JSON lỗi được giữ nguyên thay vì tự xóa.
13. Chuyển các storage path hoạt động của Math E129/E239/E240 qua subject storage, giữ compatibility patch E239.
14. Chuyển Math `core-subject.js` và DataVault E127 còn sót qua subject storage.
15. Khóa gate bằng direct-browser-storage inventory + byte-for-byte legacy preservation regression; sửa lỗi contract helper phát hiện bởi gate và chạy lại PASS.

## Trạng thái browser storage

Inventory cuối quét 126 file JavaScript/HTML:

- 22 file có tín hiệu liên quan storage/key.
- 5 direct browser-storage API call.
- Tất cả 5 call nằm trong duy nhất `assets/js/platform/storage-adapter.js`.
- Direct browser-storage API ở ngoài adapter: **0**.

Điều này tạo một cửa duy nhất cho storage local, là điều kiện cần để backend/cloud sync được thêm sau mà không phải sửa rải rác từng môn.

## Legacy-data preservation

Regression kiểm byte-for-byte các key lịch sử của:

- Main state/users/current session.
- Math release/content/roadmap/responsive keys cũ.
- Russian universal/core/clean-controller keys cũ.

Kết quả cuối: **PASS**.

Các migration helper được kiểm theo nguyên tắc copy-only: có thể copy dữ liệu từ legacy key sang target nhưng không tự xóa source.

## Lỗi đã phát hiện và xử lý ngay

### 1. Inventory workflow không commit report mới

Nguyên nhân: dùng `git diff --quiet`, không thấy untracked file.

Sửa: dùng `git status --porcelain` cho generated report.

### 2. Russian/Programming xóa payload lớn

Code cũ tự `removeItem()` khi JSON local vượt ngưỡng.

Sửa: `readJSONWithLimit()` trả trạng thái `oversize-preserved` / `invalid-json-preserved`, runtime dùng fallback nhưng không xóa dữ liệu cũ.

### 3. Math còn direct localStorage ở runtime phụ

`core-subject.js` và DataVault E127 còn gọi localStorage trực tiếp.

Sửa bằng codemod riêng, syntax check, allowlist và regression trước commit.

### 4. Legacy preservation gate fail ở lần đầu

Nguyên nhân: subject helper trả `from`, regression dùng contract `sourceKey`; đồng thời `readFirstJSON()` wrapper truyền sai chữ ký xuống base adapter.

Sửa API wrapper để chuẩn hóa contract và sửa `readFirstJSON(primaryKey, legacyKeys, fallback)` đúng chữ ký. Chạy lại toàn bộ L3 gate: **PASS**.

## Những gì cố ý chưa thay đổi

- Không đổi dữ liệu học thuật JSON.
- Không đổi nội dung bài học/công thức/slideshow.
- Không đổi PlanningBridge logic.
- Không bật cloud sync.
- Không bật backend auth.
- Không bật AI backend proxy.
- Không xóa legacy key.
- Không merge vào `main`.
- P0 auth plaintext/hard-coded credentials vẫn là rủi ro đã biết, sẽ xử lý ở Lượt 8 theo kế hoạch.

## Gate cuối

Workflow: `Migration L3 Storage Regression`

Gate cuối kiểm đồng thời:

1. Storage/repository regression.
2. Legacy key preservation.
3. Inventory regeneration phải không tạo diff.

Kết quả cuối: **PASS**.

Lượt 3: **HOÀN THÀNH**. Cho phép bắt đầu Lượt 4 · Chuẩn hóa Personal Learning State.
