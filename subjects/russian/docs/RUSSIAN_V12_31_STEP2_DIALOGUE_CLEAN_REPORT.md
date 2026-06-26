# Russian Bauman V12.31 · Step 2 Dialogue Clean

## Mục tiêu
Tinh gọn tab Đối thoại/Luyện nói theo yêu cầu: bỏ bố cục rối mắt, giữ đúng chức năng hỗ trợ nói.

## Đã sửa
1. Loại bỏ layout 3 cột nặng: kho tình huống trái + player giữa + coach phải.
2. Chuyển thành một phòng luyện nói tập trung: tiêu đề, nút Nghe/Vai A/Vai B/Ẩn nghĩa, tiến độ và câu hiện tại.
3. Gom thông tin ngữ cảnh/mức/từ khóa thành các dòng ngắn, không còn nhiều hộp gây nhiễu.
4. Khu đổi tình huống chuyển xuống dạng `details`, chỉ mở khi cần chọn bài khác.
5. Giữ các chức năng quan trọng: nghe câu mẫu, nghe chậm, nghe cả đoạn, ghi âm, tôi nói ổn, luyện lại, auto qua câu, câu của tôi.
6. Thêm CSS responsive riêng để tab này không phình và không vỡ khi màn hình hẹp.

## Kiểm tra
- core.js hợp lệ cú pháp.
- subject-adapter.js hợp lệ cú pháp.
- subject-manifest.json hợp lệ.
- ZIP đóng gói không lỗi.
