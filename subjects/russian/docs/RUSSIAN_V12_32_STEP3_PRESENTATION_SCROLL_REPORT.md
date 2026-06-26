# Russian Bauman V12.32 · Step 3 Presentation Scroll

## Mục tiêu
Sửa triệt để lỗi trình chiếu/slide dài không đọc hết nội dung.

## Thay đổi chính
1. Trình chiếu tách thành 3 vùng: header cố định, vùng nội dung cuộn độc lập, footer cố định.
2. Thêm nút `Đầu nội dung` và `Cuối nội dung` để nhảy nhanh trong slide dài.
3. Giữ phím điều hướng: ←/→ chuyển slide, ↑/↓ cuộn, PgUp/PgDn cuộn xa, Space chuyển slide, Esc đóng.
4. Sửa `#modalBody` cho presentation để nhận đúng chiều cao 100%, tránh lỗi modal cao nhưng nội dung không cuộn.
5. Sửa cả slide trong tab Học tập: `slidebox` có vùng cuộn và padding đáy an toàn, không còn bị cắt ở cuối.

## Kiểm tra
- core.js: kiểm tra cú pháp.
- subject-adapter.js: kiểm tra cú pháp.
- subject-manifest.json: hợp lệ.
- Toàn bộ JSON: hợp lệ.
- ZIP: đóng gói không lỗi.
