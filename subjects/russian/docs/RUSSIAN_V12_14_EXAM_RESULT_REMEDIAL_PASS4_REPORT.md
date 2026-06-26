# Russian Survival Master V12.14 · Exam Result & Remedial Pass 4

## Trọng tâm lượt 4

- Bổ sung popup kết quả sau khi nộp bài kiểm tra.
- Hiển thị điểm /10, đạt/chưa đạt, số câu đúng/sai và điều kiện 8.0/10.
- Hiển thị phổ điểm theo mức độ và theo kỹ năng/chủ điểm.
- Hiển thị danh sách câu sai với đáp án đã chọn, đáp án đúng và giải thích ngắn.
- Nếu không đạt, tự tạo Lịch trình phụ đạo ở Tổng quan.
- Mỗi thẻ phụ đạo là một câu sai trọng điểm. Bấm thẻ sẽ mở Ôn tập và đánh dấu hoàn thành một thẻ.
- Khi hoàn thành toàn bộ thẻ phụ đạo, lịch phụ đạo tự ẩn, không cảnh báo nữa.

## File sửa chính

- assets/core.js
- assets/core.css
- subject-manifest.json
- subject-manifest.js
- index.html

## Ghi chú logic

- Kiểm tra chính thức vẫn chỉ chấm sau khi nộp bài.
- Câu sai được đẩy vào `reviewProgress.wrong` để nút Ôn tập lại mở đúng nhóm sai.
- `remedialPlan` được lưu trong localStorage và tự chuẩn hóa khi reload.
