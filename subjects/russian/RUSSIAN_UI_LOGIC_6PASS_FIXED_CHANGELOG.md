# Russian Bauman UI Logic 6-Pass Fixed

## Mục tiêu
Sửa các lỗi theo ảnh chụp: nút Cài đặt bị nhỏ, chữ Nga trong Nghe/Nói quá lớn, Ôn tập/Kiểm tra đổi bố cục nút, và cây dữ liệu/lazy-load bất ổn.

## Thay đổi chính
1. Khôi phục nút Cài đặt trong Lịch trình hôm nay, không còn bị ép thành icon nhỏ.
2. Giảm kích cỡ câu Nga trong tab Nghe/Nói xuống khoảng 1/2, có cuộn an toàn khi câu dài.
3. Ôn tập và Kiểm tra dùng lại cùng modebar với Lý thuyết/Bài tập/Nghe-Nói.
4. Cây dữ liệu hiển thị nguồn lazy ổn định và không cho chỉnh nguồn lớn khi chưa tải.
5. Giữ nguyên nguyên tắc: Nghe/Nói dùng speaking.json cơ bản, Đối thoại dùng dialogue-bauman-az, Deep chỉ nằm trong Đối thoại.

## QA
- node --check assets/core.js: pass
- node --check assets/subject-adapter.js: pass
- node --check subject-manifest.js: pass
- subject-manifest.json: valid
- speaking.json: 1220 mục
- dialogue-bauman-az.json: 4164 mục
- deep-speaking-bauman.json: 1140 unit
- speaking-link-index.json: 1058 khóa nối
