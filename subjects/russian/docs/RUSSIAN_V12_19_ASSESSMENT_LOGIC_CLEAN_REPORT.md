# Russian Survival Master V12.19 · Assessment Logic Clean

## Nội dung sửa

1. Sửa bố cục Ôn tập/Kiểm tra để vùng câu hỏi và đáp án cuộn nội bộ, không bị mất nội dung.
2. Thu gọn flag, bỏ thanh cuộn ngang trong bảng flag, chỉ giữ số và màu trạng thái.
3. Ôn tập: sau khi chấm, câu được lưu vào `reviewProgress.done` và flag đổi xanh ngay; câu sai vẫn đưa vào nhóm câu sai.
4. Kiểm tra: thêm cờ từng câu; bấm cờ làm flag chuyển vàng, kể cả khi đã chọn đáp án.
5. Sửa logic kiểm tra 7/14/21/28 ngày: không gộp thành một đề 220 câu. Mỗi mốc có nhiều đề con riêng: Dễ, Trung bình, Khá, Giỏi theo chu kỳ.
6. Mỗi đề con tính điểm riêng, phải đạt 8.0/10. Toàn mốc chỉ đạt khi tất cả đề trong mốc đều đạt.
7. Phụ đạo sinh theo đề chưa đạt, không bắt ôn lại toàn bộ các đề đã đạt.

## Kiểm tra kỹ thuật

- `core.js`: kiểm tra cú pháp bằng Node.
- JSON dữ liệu: parse hợp lệ.
- ZIP integrity: OK.
