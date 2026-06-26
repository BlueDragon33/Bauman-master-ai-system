# Russian Survival Master V12.4 · Lượt 1: Overview Route Pass 1

## Phạm vi lượt 1

Lượt này xử lý lớp nền giao diện và Tổng quan, chưa đi sâu vào sửa ruột trình chiếu, Desk từ vựng hay Đối thoại nâng cao. Mục tiêu là dựng lại xương sống điều phối để các lượt sau không bị vá chồng.

## Đã sửa

1. **Nút bấm 3D nhẹ toàn hệ thống**
   - Áp dụng hover nổi nhẹ, active nhấn xuống, focus rõ.
   - Đồng bộ cho button chính, nav trái, skill card, route card, media tile, answer card, dialogue line, source tile.

2. **Tổng quan trở thành trung tâm lịch trình**
   - Thêm khối lớn: `Mục tiêu hôm nay`.
   - Khi chưa nhận từ Main hiển thị đúng: `Mục tiêu hôm nay: Chưa đồng bộ được`.
   - Nút `Mở lịch trình` được đặt làm CTA chính.
   - Lịch trình hôm nay hiển thị trực tiếp trong Tổng quan, không bị chìm.

3. **Truy vết lịch sử truy cập**
   - Thêm `recentAccess` trong state.
   - Khi mở kỹ năng hoặc đi theo thẻ lịch trình, hệ thống ghi lại điểm tiếp tục.
   - Tổng quan có khối `Tiếp tục` để quay lại khu học gần nhất.

4. **Bridge nhận mục tiêu từ Main**
   - Bổ sung incoming types: `BAUMAN_TODAY_TASK`, `BAUMAN_MAIN_TODAY`.
   - Khi khởi động, module gửi `BAUMAN_SUBJECT_REQUEST_TODAY` lên Main.
   - Nếu Main chưa trả lời, giao diện dùng fallback rõ ràng.

5. **Dọn hướng dẫn cố định và giảm phình nền**
   - Bỏ các câu hướng dẫn tĩnh trong Tổng quan, Học tập, Video/Audio, Viết, Lưu trữ.
   - Giảm chiều cao thừa của Writing Studio và Media Studio.
   - Ẩn các đoạn mô tả rỗng để layout không phình trắng.

## File đã chỉnh

- `subjects/russian/index.html`
- `subjects/russian/subject-manifest.json`
- `subjects/russian/subject-manifest.js`
- `subjects/russian/assets/core.js`
- `subjects/russian/assets/core.css`

## Kiểm tra nhanh đã thực hiện

- `node --check assets/core.js`: đạt.
- Parse toàn bộ JSON trong `data/`: đạt.
- Parse `subject-manifest.json`: đạt.
- ZIP integrity sau đóng gói: đạt.

## Ghi chú cho lượt 2

Lượt 2 nên xử lý sâu phần Học tập và Trình chiếu:

- render đủ nội dung slide không rơi dữ liệu;
- popup trình chiếu rộng hơn;
- phím trái/phải/lên/xuống hoạt động chắc;
- không lẫn nội dung giữa Lý thuyết, Bài tập, Nghe/Nói, Kiểm tra.
