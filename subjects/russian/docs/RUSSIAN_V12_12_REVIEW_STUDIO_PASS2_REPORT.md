# Russian Survival Master V12.12 · Review Studio Pass 2

## Mục tiêu lượt 2
Hoàn thiện tab Ôn tập sau khi đã tách Ôn tập/Kiểm tra ở V12.11.

## Đã thực hiện
1. Thêm bộ lọc Ôn tập: tất cả, chưa làm, cắm cờ, đã làm, câu sai.
2. Thêm lọc theo bài học trong nguồn câu hỏi hiện tại.
3. Giữ cấu trúc 20 câu/khung, tự chia tab nhỏ 1-20, 21-40...
4. Flag câu hỏi giữ đúng màu: trắng chưa làm, vàng cắm cờ chưa làm, xanh đã làm.
5. Khi chấm sai, câu được đưa vào nhóm Câu sai; khi chấm đúng, câu chuyển xanh và bỏ khỏi nhóm sai/cắm cờ.
6. Vùng câu hỏi chi tiết hiển thị thêm bài, kỹ năng, chủ điểm, mức độ để ôn tập có ngữ cảnh.
7. Tổng quan có thẻ nhỏ Ôn tập còn lại, mở nhanh sang tab Ôn tập.
8. Không làm thay đổi logic Kiểm tra chính thức, dành cho các lượt sau.

## Kiểm tra tĩnh
- core.js: kiểm tra cú pháp bằng node.
- subject-adapter.js: kiểm tra cú pháp bằng node.
- subject-manifest.js: kiểm tra cú pháp bằng node.
- JSON trong data: parse hợp lệ.
- ZIP integrity: kiểm tra bằng unzip -t.
