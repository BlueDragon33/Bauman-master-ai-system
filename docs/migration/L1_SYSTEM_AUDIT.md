# LƯỢT 1 · AUDIT HỆ THỐNG BAUMAN MASTER AI

Ngày audit: 2026-08-13
Nhánh baseline: `main`
Nhánh migration: `migration/webapp-l1-audit-storage`

## Kết luận điều hành

Bauman Master AI hiện là hệ thống web tĩnh HTML/CSS/JavaScript + JSON, không có npm build, không có GitHub Actions và chưa có cấu hình Firebase. Kiến trúc hiện tại vẫn đủ khả năng migration tăng dần. Không có lý do kỹ thuật để rewrite 100% hoặc đổi framework ở giai đoạn này.

Nguyên tắc khóa: `main` là baseline ổn định; mọi migration thực hiện trên nhánh riêng; nội dung học thuật và runtime môn học được coi là compatibility islands cho đến khi có regression test tương ứng.

## 15 bước audit

1. Cấu trúc repo: entry cấp hệ thống ở root; tài nguyên chung dưới `assets`; các môn tách dưới `subjects/{id}`; có nhiều báo cáo QA/changelog trong các môn.
2. Entry point: `index.html` là entry chính. Môn học có entry riêng, ví dụ `subjects/math/index.html`.
3. HTML/CSS/JS: cấp main dùng `assets/css/main.css`, `assets/js/data.js`, `assets/js/main.js`, `assets/js/planning-main.js`. Math có runtime riêng với nhiều lớp presenter/route/artifact/formula.
4. JSON/data: dữ liệu lộ trình cấp main nằm trong `data.js`; các môn giữ kho JSON riêng. Math khai báo danh sách dữ liệu lớn qua subject adapter và hỗ trợ lazy-data. Russian dùng fetch JSON và Data Manager.
5. localStorage: main dùng ít nhất ba khóa `bauman_main_all_phases_subjects_v1`, `bauman_main_users_fullcode_v1`, `bauman_current_user_fullcode_v1`. Math có state key riêng và danh sách oldStorageKeys để tương thích dữ liệu cũ. Không được xóa hoặc đổi khóa hàng loạt.
6. Progress: progress, subjectReports, reviewQueue, activity và activeTask đang nằm trong state cấp main; môn Toán còn có stageGate/exam history/remedial state riêng.
7. Schedule: schedule nằm trong main state; `planning-main.js` là PlanningBridge V3, dùng schedule entries, mission/plan/warning/action và gọi `window.save()` để lưu.
8. Quiz/Test: main nhận report từ subject; Math có gate kiểm tra, paper levels, lịch sử đề và logic chỉ mở kiểm tra theo PlanningBridge; Russian có review/test cycles và remedial flow theo README.
9. Simulation: dữ liệu simulation thuộc từng môn. Math khai báo `simulations.json` và runtime riêng; không đưa logic này lên backend trong giai đoạn đầu.
10. AI Mentor: AI Mentor cấp main hiện là trợ lý tìm kiếm/quy tắc chạy hoàn toàn client-side trên state. Russian có mentor theo ngữ cảnh môn. Chưa có backend AI thật.
11. Dependencies: trang main chỉ nạp script nội bộ. Math cũng nạp chuỗi script nội bộ riêng. Chưa phát hiện package manager/build framework ở root.
12. Build/deployment: không có `package.json`, `.github/workflows`, `firebase.json` tại baseline. Trạng thái hiện phù hợp static hosting/Live Server; Russian README khuyến nghị Live Server để fetch JSON.
13. Điểm dễ vỡ: Math formula/slideshow/artifact routing; PlanningBridge/postMessage; localStorage keys và backup/restore; Russian Data Manager; iframe/new-tab subject routing; state normalization; login gate; dữ liệu JSON lớn.
14. Phân loại migration: xem phần Classification bên dưới.
15. Kế hoạch migration: được chốt ở `docs/migration/MIGRATION_PLAN.md`; bắt đầu triển khai ngay bằng runtime config và storage compatibility adapter.

## Phát hiện P0/P1

### P0 · Authentication giả lập trên frontend

`assets/js/main.js` chứa ADMIN_EMAIL và ADMIN_PASS plaintext; danh sách user/password lưu trong localStorage; login so khớp plaintext trên client. Đây chỉ được xem là local UI gate, tuyệt đối không phải authentication production.

### P0 · Backup chứa mật khẩu plaintext

Export backup hiện đóng gói `{state, users}` nên password trong user list cũng đi vào JSON backup. Trước production phải thay bằng user identity không chứa credential và backend auth thật.

### P1 · State động đang gộp lớn

Main state chứa schedule, progress, report, activity, research state, appearance, subject paths và nhiều dữ liệu khác. Cần tách schema logic trước khi chuyển database để tránh sync toàn blob và tạo xung đột lớn.

### P1 · Nhiều storage namespace theo môn

Math đã có storageKey + oldStorageKeys. Migration storage phải hỗ trợ legacy lookup/copy có kiểm soát, không bulk rename.

## Classification

### A · Giữ nguyên trước mắt

- HTML/CSS nhận diện hiện tại.
- Subject entry và runtime đã ổn định.
- JSON nội dung tĩnh: theory, lessons, exercises, questions, vocabulary, simulation content.
- Math formula renderer/slideshow/artifact stack.
- Russian Data Manager và flow học hiện có.
- PlanningBridge protocol và postMessage contract, chỉ bọc lớp lưu trữ bên dưới.

### B · Refactor nhẹ

- Truy cập localStorage qua adapter.
- Main state schema và normalize/migration version.
- Runtime config/feature flags.
- Backup/export format để loại credential.
- Data loading/lazy loading nơi đang tải dư thừa.

### C · Migration

- User progress, reports, scores, review queue, schedule, bookmarks/settings và study history sang repository/service layer rồi API.
- Session hiện tại sang backend session/token.
- Cross-device sync và conflict metadata.

### D · Backend required

- Authentication/authorization.
- Sync coordinator và conflict resolution.
- AI service proxy/context builder.
- Protected user APIs, rate limits, validation, secret handling.

### E · Database required

- Users/identity reference.
- Progress and lesson completion.
- Test results/history.
- Schedule.
- Weak topics/review state.
- Study history/activity.
- Personal AI learning state.

### F · Deprecated

Chưa xóa file nào trong Lượt 1. Chỉ deprecate sau khi có bằng chứng không còn runtime reference và có regression test.

## Baseline regression contract

Mỗi migration quan trọng phải kiểm ít nhất: homepage, subject cards, mở môn, lesson/tab navigation, exercises, math formulas, simulations, review, test, state persistence, schedule/PlanningBridge, AI Mentor, iframe/new-tab routing, responsive desktop/tablet/mobile. Không merge vào stable nếu chức năng cũ giảm.

## Quyết định kiến trúc Lượt 1

1. Không đổi sang React/Next/Vue lúc này.
2. Giữ static content JSON.
3. Tạo Platform Layer bằng JavaScript thuần để tương thích code cũ.
4. `localStorage` tiếp tục là driver local/cache tạm thời.
5. API/database được bổ sung sau storage/service abstraction, không cắm thẳng vào UI.
6. Auth legacy được gắn nhãn UI gate và sẽ bị thay trước staging online có user thật.
7. Math và Russian được ưu tiên regression cao vì có runtime/data phức tạp.
