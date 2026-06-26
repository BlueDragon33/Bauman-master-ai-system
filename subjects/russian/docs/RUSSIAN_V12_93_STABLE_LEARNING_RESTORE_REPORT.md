# V12.93 · Stable Learning Restore

## Mục tiêu
- Trả Lý thuyết và Bài tập về nền ổn định trước khi CSS frame-safe làm các thẻ bị chồng/cắt.
- Sửa danh sách bài học theo ảnh 1: số bài bên trái, tiêu đề rõ, không phụ đề gây nhiễu.
- Sửa danh sách bài tập theo ảnh 2: mỗi thẻ tự giãn, không chồng chữ, không cắt nội dung.
- Làm lại Nghe/Nói theo mẫu Tab Đối thoại, nhưng nhiệm vụ là nghe mẫu và nhại lại theo câu cho trước.

## Lượt thực hiện
1. Khôi phục nền ổn định cho Lý thuyết/Bài tập từ V12.91.
2. Sửa danh sách Lý thuyết theo bố cục ảnh 1.
3. Sửa danh sách Bài tập theo bố cục ảnh 2.
4. Làm lại Nghe/Nói theo mẫu Dialogue Lab nhưng chuyên cho listen-repeat/shadowing.
5. Kiểm tra kỹ thuật, toàn vẹn dữ liệu và đóng gói.

## File thay đổi
- assets/core.js
- assets/core.css
- subject-manifest.json
- subject-manifest.js

## Kiểm tra
- node --check assets/core.js: OK
- node --check assets/subject-adapter.js: OK
- node --check subject-manifest.js: OK
- data/*.json parse: OK
- CSS brace balance: OK
- ZIP test: OK
