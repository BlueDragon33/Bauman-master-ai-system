# V12.68 Final Speaking Exam Canva UI QA

## Scope
- Lượt 1: Tab Nghe/Nói được chuyển thành Speaking Studio: câu chính lớn, 4 nút điều khiển đều, bản đồ câu dạng ngang chống cắt cụt.
- Lượt 2: Tab Kiểm tra được gom mức độ thành dropdown Dễ / Trung bình / Khá / Giỏi; trạng thái chỉ còn Đã xong hoặc Chưa xong; header compact và nội dung đẩy lên.
- Lượt 3: Giao diện học tập dùng dropdown cho Màu giao diện và Mật độ bố cục; chọn là áp dụng ngay; thêm thẻ kiểu chữ và nền Canva sáng rõ.
- Lượt cuối: QA tổng thể, khóa chống tràn thẻ, cập nhật version V12.68 và đóng gói.

## Checks
- JavaScript syntax checked by `node -c`.
- JSON files parsed successfully.
- subject-manifest.json parsed successfully.
- ZIP was created and extraction-tested.

## Note
Canva connector did not provide a directly reusable language-learning UI template in this session, so the Canva-style system was implemented directly in the local HTML/CSS/JS package.
