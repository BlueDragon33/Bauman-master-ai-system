# Russian Survival Master V12.1 · Clean Frame Pass 1

## Phạm vi lượt 1

Lượt này chỉ xử lý 4 bước đầu trong kế hoạch làm sạch triệt để:

1. Audit các vùng phình lớn ở Tổng quan và Lịch trình.
2. Đặt lại quy chuẩn layout compact cho Tổng quan, metric, skill launcher và modal.
3. Dọn Tổng quan: bỏ block debug/ghi chú nội bộ, bỏ nội dung thừa kiểu “Nguyên tắc V11”.
4. Làm lại popup Lịch trình: gọn hơn, có 3 tầng Hôm nay / Tuần này / Toàn bộ lộ trình và có nút chỉnh sửa.

## Thay đổi chính

- Cập nhật phiên bản thành `V12.1 Clean Frame Lượt 1`.
- Tổng quan chỉ còn:
  - hero định hướng;
  - mission hiện tại;
  - Không gian học;
  - metric compact;
  - nút Lịch trình và Lưu trữ.
- Xóa khỏi UI phần debug: “Nguyên tắc V11”.
- Popup Lịch trình không còn bung dài toàn bộ nội dung.
- Lịch trình có chế độ chỉnh sửa:
  - sửa tiêu đề buổi;
  - sửa thời lượng;
  - sửa đầu ra/ghi chú;
  - sửa tên, giới hạn và mục đích của từng thẻ nhiệm vụ.
- Thêm các nút trong popup:
  - Chỉnh sửa;
  - Lưu chỉnh sửa;
  - Hủy;
  - Xuất lịch;
  - Tạo lại lịch;
  - Học bù thêm.
- Route cards vẫn chỉ nằm trong popup Lịch trình, không rơi vào tab kỹ năng.

## Chưa làm trong lượt này

Các phần dưới đây thuộc V12.2/V12.3:

- Sửa triệt để router con trong tab Học tập.
- Làm lại slide popup và phím điều hướng.
- Làm lại Đối thoại/Nghe nói.
- Làm lại Viết.
- Làm lại Video/Audio và Lưu trữ.
- Tách module JS nội bộ.

## QA đã kiểm tra trong môi trường build

- ZIP hợp lệ.
- `core.js` không lỗi cú pháp.
- `subject-adapter.js` không lỗi cú pháp.
- `subject-manifest.json` hợp lệ.
- Tất cả JSON trong `data/` hợp lệ.

## Cần test tay bằng Live Server

1. Mở Tổng quan, kiểm tra không còn block “Nguyên tắc V11”.
2. Bấm `📅 Lịch trình`, popup phải mở gọn.
3. Bấm `Chỉnh sửa`, các input sửa lịch phải hiện.
4. Sửa nội dung, bấm `Lưu chỉnh sửa`, popup cập nhật lại.
5. Bấm route card trong popup, modal đóng và nhảy đúng tab.
6. Bấm `Xuất lịch`, tải được file JSON lịch trình.
