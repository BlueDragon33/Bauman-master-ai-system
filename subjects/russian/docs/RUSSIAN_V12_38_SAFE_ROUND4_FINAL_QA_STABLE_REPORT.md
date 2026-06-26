# Russian Bauman V12.38 · Safe Round 4 Final QA Stable

## Phạm vi lượt cuối
QA tổng thể sau 3 lượt an toàn:
1. Popup xác nhận nhỏ gọn.
2. Từ vựng giai đoạn Việt Nam ưu tiên nghĩa Việt/Anh dễ hiểu.
3. Tab Viết chuyển trọng tâm sang chữ viết tay Nga thông dụng.
4. Tab Video/Audio được làm đẹp thành Media Hub.
5. Lịch trình hôm nay có thẻ học và nút dẫn đường tới đúng mục tiêu.

## Kiểm tra đã thực hiện
- Kiểm tra cú pháp `core.js`.
- Kiểm tra cú pháp `subject-adapter.js`.
- Kiểm tra toàn bộ JSON trong `data/`.
- Kiểm tra `subject-manifest.json`.
- Kiểm tra `handwriting.json`: đủ 33 chữ Cyrillic có dữ liệu strokes.
- Kiểm tra ZIP bằng `unzip -t`.

## Ghi chú sử dụng
Mở bằng Live Server trên Chrome/Edge để kiểm tra thực tế phần micro của Speaking Coach.
