# TEST_REPORT_MAIN_CODEX

Ngày kiểm tra: 2026-06-26  
Repo/branch: `BlueDragon33/bauman-master-ai-system` / `codex/main-system-audit`

## Kết luận nhanh

Main chạy được khi phục vụ qua HTTP kiểu Live Server. `index.html`, `assets/js/data.js`, `assets/js/main.js`, `assets/js/planning-main.js` không còn lỗi runtime/console trong smoke test chính. Các module môn học trong `subjects/*` đầy đủ và các nút mở môn từ Main trỏ đúng `subjects/<id>/index.html`.

## Sửa tối thiểu đã làm

1. `index.html`
   - Xóa ký tự dư `7` sau `</div>` của topbar.
   - Lý do: ký tự này có thể hiển thị rác trong UI.

2. `assets/js/planning-main.js`
   - `buildPlanningMission(subjectId, context)` hiện ưu tiên `context.courseId` / `context.itemId` khi có.
   - Lý do: một số action route-card truyền courseId nhưng trước đó mission vẫn có thể rơi về học phần gần nhất từ lịch, gây sai ngữ cảnh học phần dù đường dẫn môn đúng.

Không rewrite `main.js`. Không xóa môn hiện có.

## Kiểm tra kỹ thuật

### 1. Main `index.html` chạy qua Live Server-style HTTP

PASS.

- Mở qua static HTTP server: `http://127.0.0.1:5511/index.html`
- Title nhận được: `Bauman Master AI · Main Route R4 Final QA`
- Login mặc định hoạt động.
- Sau login, trang `Tổng quan` và trang `Môn học` render được.
- Browser console: không có `error` / `warn`.

### 2. JS syntax và logic/path

PASS sau sửa tối thiểu.

Đã chạy:

```bash
node --check assets/js/data.js
node --check assets/js/main.js
node --check assets/js/planning-main.js
```

Kết quả: cả 3 file đều pass syntax check.

Static scan:

- 46 file HTML được scan `src` / `href`.
- Không phát hiện asset local bị thiếu.
- Toàn bộ JSON trong repo parse hợp lệ.
- `data.js` có 8 subject ID và khớp đúng 8 thư mục `subjects/*`.

### 3. `subjects/*` có đủ module môn học

PASS.

Các module hiện có:

- `russian`
- `math`
- `programming`
- `ai`
- `systems`
- `signal`
- `research`
- `foundation`

Mỗi module có đủ:

- `index.html`
- `editor.html`
- `subject-manifest.json`
- `subject-manifest.js`
- thư mục `assets`
- các data file required theo manifest

### 4. Nút mở môn từ Main sang môn con

PASS.

Đã bấm nút `Học trong trang này` từ Main và xác nhận iframe `src`:

| Subject | Đường dẫn iframe |
|---|---|
| russian | `subjects/russian/index.html` |
| math | `subjects/math/index.html` |
| programming | `subjects/programming/index.html` |
| ai | `subjects/ai/index.html` |
| systems | `subjects/systems/index.html` |
| research | `subjects/research/index.html` |
| foundation | `subjects/foundation/index.html` |
| signal | `subjects/signal/index.html` |

Không có 404 và không có console `error` / `warn` khi mở từ Main.

### 5. Smoke test trực tiếp từng subject

PASS.

Đã mở trực tiếp từng URL:

- `subjects/russian/index.html`
- `subjects/math/index.html`
- `subjects/programming/index.html`
- `subjects/ai/index.html`
- `subjects/systems/index.html`
- `subjects/signal/index.html`
- `subjects/research/index.html`
- `subjects/foundation/index.html`

Tất cả render app/body/title hợp lệ, không 404, không console `error` / `warn`.

## Ghi chú

- Bộ lọc trang Môn học hiển thị subject theo giai đoạn, nên `prepare` không hiện đủ 8 môn. Khi đổi sang các giai đoạn khác, đủ 8 môn đều xuất hiện và mở được.
- `foundation` và `signal` có thể mở với mission chung nếu lịch auto hiện tại chưa có ca học tương ứng; đây không phải lỗi đường dẫn, và module vẫn chạy độc lập đúng.

## Kiểm Tra Bổ Sung 2026-06-27 · Toán / Tab Học Tập

Phạm vi: chỉ kiểm tra logic sâu môn Toán, tập trung tab `Học tập` và 4 phần chính `Lý thuyết`, `Bài tập`, `Ôn tập`, `Kiểm tra`.

### Lỗi Phát Hiện

- Skin lý thuyết `subjects/math/assets/theory_skin/theory-main-adapter-E126.js` thay toàn bộ màn `Học tập > Lý thuyết`, nhưng không có rail/nút chuyển trực tiếp sang `Bài tập`, `Ôn tập`, `Kiểm tra`.
- MutationObserver trong E126 tự render lại ngay sau khi E126 gán `view.innerHTML`, làm phần tử có thể bị detach trong lúc click và khiến thao tác chuyển phần không ổn định.

### Sửa Tối Thiểu

- Thêm rail 4 phần ngay trong E126: `Lý thuyết`, `Bài tập`, `Ôn tập`, `Kiểm tra`.
- Nút rail mới chỉ cập nhật state `view='learning'`, `learnTab`, `e122Focus` rồi gọi renderer sẵn có; không rewrite `core.js` / `main.js`.
- Khóa vòng tự-render của MutationObserver bằng cách giữ cờ `applying` tới tick kế tiếp sau `innerHTML`.
- Thêm CSS scoped `.e126-learn-rail` để nút có tương phản cao trên nền tối E126.

### Kết Quả Browser Test

PASS.

- Mở trực tiếp: `subjects/math/index.html` qua local static HTTP.
- Bấm nav `Học tập`: E126 Lý thuyết render, rail 4 phần xuất hiện đủ 4 nút.
- Bấm E126 `Bài tập`: render màn Bài tập đúng bài hiện tại.
- Từ Bài tập bấm `← Lý thuyết`: quay lại E126 Lý thuyết.
- Bấm E126 `Ôn tập`: render màn Ôn tập.
- Mở menu `Cấu trúc bài học` trong Ôn tập rồi chọn `Lý thuyết`: quay lại E126 Lý thuyết.
- Bấm E126 `Kiểm tra`: render đúng cổng khóa kiểm tra, có hướng dẫn mở từ `Lịch trình hôm nay` và nút `Về Lý thuyết`.
- Trong layout học tập hiện tại, mở menu `Cấu trúc bài học` từ Bài tập và chọn `Ôn tập`, sau đó chọn `Kiểm tra`: đều render đúng phần.
- Browser console: không có `error` / `warning`.

### Kiểm Tra Kỹ Thuật

```bash
node --check subjects/math/assets/theory_skin/theory-main-adapter-E126.js
git diff --check
```

Kết quả: PASS. Chỉ còn cảnh báo line-ending CRLF/LF từ Git trên Windows.
