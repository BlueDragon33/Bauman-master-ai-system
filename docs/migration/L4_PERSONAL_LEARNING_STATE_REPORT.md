# Lượt 4 · Chuẩn hóa Personal Learning State · Báo cáo hoàn thành

Branch: `migration/webapp-l1-audit-storage`
Baseline L4: `4bc4cd1bb33f560aa61467dc606a275d1a70ebee`

## Kết quả

Lượt 4 ban đầu dự kiến 5 bước. Trong quá trình triển khai phát sinh nhu cầu shadow repository riêng, bootstrap OFF-by-default và một lỗi guard CI dùng sai baseline. Lượt 4 được mở rộng thành **8 bước**.

1. Tách khái niệm static/content state khỏi Personal Learning State bằng schema riêng.
2. Định nghĩa progress schema với conflict policy `monotonic-completion`.
3. Định nghĩa assessment/test history dạng append-only và review queue dạng record revision.
4. Định nghĩa schedule, activity, preferences, planning, research và subject override trong state cá nhân.
5. Tạo deterministic migrator từ legacy main state + integrity report.
6. Bước phát sinh: tạo shadow repository, chỉ ghi khi integrity PASS và luôn kiểm legacy main state byte-for-byte không đổi.
7. Bước phát sinh: tạo bootstrap OFF-by-default, wire vào main entry nhưng không tự tạo shadow key.
8. Bước phát sinh: sửa CI guard từ `main` sang checkpoint L3, thêm regression cho bootstrap OFF và thứ tự script trong `index.html`.

## Personal Learning State v1

Key shadow chuẩn bị: `bauman_personal_learning_state_v1_shadow`.

Các vùng chính:

- `identity`: chỉ email/name/role đã sanitize, không mang password.
- `preferences`: appearance + timezone.
- `navigation`: page/panel/stage/subject/lastStudy.
- `progress`: tiến độ theo môn.
- `assessments.results`: append-only record sinh từ `subjectReports`.
- `reviews.queue`: record revision.
- `schedule.entries`: tách từng slot thành record có ID chính là legacy slot key.
- `studyActivity.events`: append-only.
- `planning`: active task + warnings/missions/plans/actions.
- `research`: checks + attachment metadata/reference.
- `configuration.subjectOverrides`: chỉ path/priority, không copy nội dung mô tả môn tĩnh.
- `sourceSnapshot`: thống kê nguồn + field chưa phân loại để chặn silent cutover.

## Research attachment policy

`researchFiles` cũ có thể chứa Data URL/Base64 lớn.

L4 không copy payload vào shadow. Shadow chỉ lưu:

- metadata file;
- số ký tự payload cũ;
- cờ `hasInlinePayload`;
- `legacyRef` trỏ về field/item/index trong legacy state.

Legacy payload vẫn nguyên vẹn ở key cũ. Điều này tránh nhân đôi dung lượng localStorage.

## Hai mức readiness

### Shadow-safe

PASS khi:

- schema đúng;
- count progress/report/review/schedule/activity/planning/research khớp;
- không copy credential;
- không copy inline attachment payload;
- attachment đều có legacy reference.

### Cutover-ready

Khắt khe hơn. Chỉ TRUE khi ngoài các điều kiện trên còn:

- không còn field legacy chưa phân loại;
- không còn attachment payload chỉ tồn tại ở legacy local state.

L4 cố ý **không tuyên bố cutover-ready**. Runtime legacy vẫn là nguồn đọc chính.

## Regression

Fixture test bao gồm:

- 2 môn có progress;
- 3 subject reports;
- 2 review items;
- 2 schedule slots;
- activity events;
- đủ planning warnings/missions/plans/actions;
- research file có Data URL/Base64;
- password trong current-user fixture;
- một future field chưa biết.

Kết quả:

- migration deterministic: PASS;
- password không xuất hiện trong Personal Learning State: PASS;
- Base64 không bị copy sang shadow: PASS;
- legacy main state byte-for-byte sau explicit shadow refresh: PASS;
- users/session legacy cache không đổi: PASS;
- unknown field được surface và làm `cutoverReady=false`: PASS;
- bootstrap khi feature OFF không tạo shadow: PASS;
- main-entry script order: PASS;
- không có thay đổi học thuật mới kể từ checkpoint L3: PASS.

## Storage cross-check sau L4

Inventory hiện quét 130 file, direct browser-storage API vẫn chỉ có 5 call trong duy nhất `assets/js/platform/storage-adapter.js`; file vi phạm ngoài adapter: **0**.

## Trạng thái feature

`personalLearningShadow: false`

Cloud sync/backend auth/AI proxy vẫn OFF.

## Gate cuối

Workflow `Migration L4 Personal Learning Regression`: **PASS**.

Lượt 4: **HOÀN THÀNH**. Cho phép bắt đầu Lượt 5 · Site runtime và data loading.
