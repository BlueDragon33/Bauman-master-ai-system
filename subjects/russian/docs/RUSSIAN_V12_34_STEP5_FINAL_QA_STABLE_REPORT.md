# Russian Bauman V12.34 · Step 5 QA Final Stable

## Phạm vi QA
- Kiểm tra lại toàn bộ 4 bước đã sửa: Safe Actions, Dialogue Clean, Presentation Scroll, Writing Practice.
- Dọn nhãn phiên bản và khóa gói phát hành ổn định.

## Sửa thêm trong Step 5
1. Bổ sung popup xác nhận cho Data Manager:
   - Khôi phục nguồn dữ liệu hiện tại.
   - Khôi phục toàn bộ DB đã lưu trong trình duyệt.
2. Xóa đoạn xử lý nhập JSON bị lặp trong `handleChange`.
3. Đồng bộ phiên bản lên V12.34 trong `core.js`, `subject-manifest.json/js`, `index.html`, `README.md`, `subject-adapter.js`.

## Kết quả kiểm tra
- `core.js`: cú pháp hợp lệ.
- `subject-adapter.js`: cú pháp hợp lệ.
- Tất cả file JSON trong `data/` hợp lệ.
- `handwriting.json`: đủ 33/33 chữ cái Cyrillic có `strokes`.
- ZIP: test không lỗi.

## Ghi chú dùng thật
- Nên chạy bằng Live Server trên Chrome/Edge để micro trong Speaking Coach hoạt động ổn định.
- Các thao tác Reset/Nộp đề/Khôi phục sẽ hỏi xác nhận trước khi chạy.
