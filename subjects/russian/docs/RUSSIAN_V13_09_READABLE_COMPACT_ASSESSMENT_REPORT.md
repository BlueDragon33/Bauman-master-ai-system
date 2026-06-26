# Russian V13.09 · Readable Compact Assessment

Mục tiêu sửa:
- Bỏ thông báo "Tỷ lệ đề" khỏi tab Kiểm tra.
- Không cắt nội dung chính trong Ôn tập/Kiểm tra.
- Giữ bảng flag 20 câu mỗi trang theo 4 cột x 5 hàng.
- Kiểm tra có 4 dạng: Phổ thông 20, Tăng cường 40, Nâng cao 60, Chuyên sâu 100.
- Mỗi dạng giữ tỷ lệ sinh đề: 30% dễ, 30% trung bình, 20% khá, 20% giỏi.

Thay đổi kỹ thuật:
- Gỡ dòng render `exam-composition-strip`.
- Gỡ panel trạng thái đề khi chưa nộp để giảm rối bố cục.
- Mở khóa `height/max-height/overflow` ở `v1298-assessment-single` và `v1298-assessment-single-main` để trang cuộn dọc đọc đủ nội dung.
- Thêm guard CSS V13.09 cuối file để chống các lớp cũ `v1266/v1298/v1308` cắt nội dung.
- Ép `.question-flag-grid` thành 4 x 5 cố định: 20 câu/trang, không kéo ngang.

Kiểm thử:
- `core.js` syntax: pass.
- Toàn bộ JSON trong `data/`: pass.
- CSS braces: pass.
- Render harness Chromium inline: Ôn tập/Kiểm tra grid 4 x 5, không còn "Tỷ lệ đề", câu dài không bị cắt.
