# RUSSIAN V12.84 · Pro UI Screenshot Cleanup

## Mục tiêu
Sửa các lỗi UX/UI theo 4 ảnh chụp mới, ưu tiên bố cục sạch, không che khuất, không cắt nội dung và không tạo lỗi chồng lỗi.

## Các bước đã thực hiện
1. Lịch trình: bỏ 3 dòng nhiễu ở đầu modal, chỉ giữ chip nhỏ và 4 nút hành động gom gọn.
2. Sidebar/tab đỏ: chỉnh lại chiều cao, nền và lưới app để sidebar khớp workspace, giảm khoảng trắng chết và không đẩy bảng bên phải.
3. Bài tập: bỏ dòng mô tả “Chỉ hiện bài tập...”, cho danh sách bài tập hiển thị đủ nội dung, không cắt prompt.
4. Nghe/Nói: tăng vùng bản đồ câu, sửa overflow để thấy đủ các câu bên dưới target line.
5. Giao diện nhanh: bỏ câu hướng dẫn thừa, bỏ preview cards, modal gọn hơn chỉ còn 2 dropdown và nút Xong.
6. Kiểm tra kỹ thuật: JS syntax, JSON parse, CSS brace balance và zip integrity.

## File sửa
- assets/core.js
- assets/core.css

## Kiểm tra
- node --check assets/core.js: OK
- data/*.json parse: OK
- CSS brace balance: OK
- zip test: OK
