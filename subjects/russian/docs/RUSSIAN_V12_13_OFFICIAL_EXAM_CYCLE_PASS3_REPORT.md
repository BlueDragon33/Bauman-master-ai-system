# Russian Survival Master V12.13 · Official Exam Cycle Pass 3

## Mục tiêu lượt 3
Làm tab Kiểm tra chính thức theo chu kỳ học, tách khỏi Ôn tập và chuẩn bị dữ liệu cho popup/phụ đạo ở lượt 4.

## Đã thực hiện
1. Thêm `examCycle`: tự động theo lịch hoặc chọn tay 7/14/21/28 ngày.
2. Chu kỳ 7 ngày tạo gói Dễ; 14 ngày tạo Dễ + Trung bình; 21 ngày tạo Dễ + Trung bình + Khá; 28 ngày tạo Dễ + Trung bình + Khá + Giỏi.
3. Tạo đề kiểm tra từ nguồn `tests.json`, lọc theo giai đoạn hiện tại và gói mức.
4. Bảng flag Kiểm tra giữ 40 câu/bảng, tự chia tab 1-40, 41-80...
5. Trong lúc làm bài: trắng = chưa trả lời, vàng = đánh dấu xem lại, xanh = đã trả lời. Không báo đúng/sai từng câu.
6. Nộp bài chỉ khi đã trả lời đủ câu; sau khi nộp mới tổng kết đúng/sai, điểm /10 và đạt/chưa đạt.
7. Điều kiện đạt là 8.0/10. Nếu không đạt, hiển thị nút làm lại và giữ danh sách câu sai trong `examProgress.wrong` để lượt 4 tạo popup + lịch phụ đạo.
8. Sau khi nộp, flag chuyển xanh đúng và đỏ sai/chưa trả lời; đáp án đúng/sai chỉ hiện sau khi hoàn tất bài.
9. Lưu lịch sử kiểm tra gần nhất trong `examHistory`.

## Phạm vi chưa làm ở lượt này
- Popup phổ điểm lớn.
- Tạo lịch trình phụ đạo ở Tổng quan.
- Click thẻ phụ đạo để hoàn thành và tự ẩn.
Các phần trên sẽ nối ở lượt 4.

## Kiểm tra tĩnh
- core.js: kiểm tra cú pháp bằng node.
- subject-adapter.js: kiểm tra cú pháp bằng node.
- subject-manifest.js: kiểm tra cú pháp bằng node.
- JSON trong data: parse hợp lệ.
- ZIP integrity: kiểm tra bằng unzip -t.
