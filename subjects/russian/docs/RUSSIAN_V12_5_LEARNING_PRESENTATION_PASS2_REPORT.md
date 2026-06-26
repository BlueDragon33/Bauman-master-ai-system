# RUSSIAN V12.5 · Lượt 2 · Learning + Presentation Pass

## Mục tiêu lượt 2
Sửa sâu tab Học tập và Trình chiếu để không rơi nội dung bài học, không lẫn nội dung giữa các chế độ, popup trình chiếu đủ rộng và phím điều hướng hoạt động ổn định.

## File đã chỉnh
- `assets/core.js`
- `assets/core.css`
- `assets/subject-adapter.js`
- `subject-manifest.json`
- `subject-manifest.js`

## Thay đổi chính

### 1. Trình chiếu không còn khuyết nội dung
- Thay hàm render slide cũ bằng bộ render mềm hơn:
  - đọc `blocks` nếu có;
  - đọc thêm `content`, `text`, `body`, `detail`;
  - gom thêm `objectives`, `goals`, `outcomes`, `summary`, `examples`, `keywords`, `tags`, `note`;
  - xử lý cả chuỗi, mảng và object lồng nhau.
- Các block dạng `section`, `list`, `quote`, `formula`, `code` đều có cách hiển thị riêng.

### 2. Popup trình chiếu rộng hơn
- `.modal-card.presentation-card` được chỉnh về kích thước cách mép khoảng 1 inch trên màn hình lớn.
- Vùng `.present-slide` có scroll riêng, không làm tràn cả modal.
- Sidebar slide vẫn giữ trên màn hình lớn, tự ẩn ở màn nhỏ để tránh chật.

### 3. Phím điều hướng hoạt động trong trình chiếu
- `ArrowLeft`: quay slide trước.
- `ArrowRight`: sang slide tiếp.
- `ArrowUp` / `ArrowDown`: cuộn nội dung trong slide.
- `PageUp` / `PageDown`: cuộn nhanh hơn trong slide.
- `Escape`: đóng popup.
- Khi mở popup, focus tự động chuyển vào vùng slide để phím nhận đúng.

### 4. Không render nhầm khi bấm slide trong modal
- Trước đây click slide trong popup có thể render lại trang chính.
- Đã tách logic: nếu đang ở `modalType === 'presentation'` thì cập nhật lại modal, không render nhầm view bên dưới.

### 5. Chống vượt biên slide và dòng hội thoại
- Thêm cơ chế clamp index:
  - slide không vượt quá slide cuối;
  - test không vượt quá câu cuối;
  - dòng hội thoại không vượt quá số câu thực tế.

### 6. Tab Học tập tách nội dung rõ hơn
- Khi đổi giữa Lý thuyết / Bài tập / Nghe-Nói / Kiểm tra, state phụ được reset theo tab.
- Bài tập có thẻ focus riêng, không chỉ đổ danh sách dài.
- Vùng học có scroll nội bộ để tránh phình trang.

## Kiểm tra đã chạy
- `node --check assets/core.js`: OK
- `node --check assets/subject-adapter.js`: OK
- `node --check subject-manifest.js`: OK
- Parse toàn bộ 12 file JSON trong `data/`: OK
- ZIP integrity: OK sau khi đóng gói

## Ghi chú
Môi trường sandbox không cho mở trình duyệt headless bằng HTTP/file local do `ERR_BLOCKED_BY_ADMINISTRATOR`, nên lượt này đã kiểm bằng cú pháp, JSON và kiểm tra tĩnh. Khi mở bằng Live Server trên máy người dùng cần test thao tác UI thực tế: mở Học tập → Trình chiếu → bấm trái/phải/lên/xuống → đổi 4 tab học.

## Lượt tiếp theo nên làm
Lượt 3 nên xử lý Từ vựng, Đối thoại, Viết và Video/Audio:
- biến Desk từ vựng thành bảng nghĩa học thuật;
- làm Đối thoại thành phòng đóng vai thực tế;
- gọn lại Viết;
- gọt Video/Audio chỉ còn nội dung hữu ích.
