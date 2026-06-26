# Russian V13.10 Balanced Polish

Mục tiêu: giữ bản V13.09 đã đọc đủ nội dung, sau đó tinh gọn và cân đối lại giao diện.

## Đã chỉnh
- Ôn tập/Kiểm tra: giữ luồng cuộn dọc, không khóa chiều cao nội dung chính.
- Bảng flag: giữ 20 câu/trang, 4 cột x 5 hàng, không kéo ngang.
- Header Ôn tập/Kiểm tra: giảm nhiễu, gom bộ lọc gọn hơn.
- Câu hỏi/đáp án: tăng nhịp đọc, giảm padding thừa, giữ wrap nội dung dài.
- Từ vựng: chuyển về bố cục 2 cột cân đối, danh sách 20 thẻ bên trái, thẻ học + chi tiết bên phải.
- Bỏ giao diện flashcard phình to và cụm nút cao quá mức.

## Kiểm tra
- core.js syntax: pass bằng node --check.
- JSON data: parse pass.
- CSS braces: pass.
