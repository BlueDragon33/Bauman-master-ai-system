# V12.63 Final Canva Fit Containment

## Mục tiêu
Khóa thẩm mỹ tổng thể cho các vùng bị vượt khỏi thẻ: Lý thuyết, Bài tập và Lưu trữ/Dữ liệu.

## Đã xử lý
- Thêm lớp chống tràn toàn cục cho panel, card, input, textarea, bảng, ảnh, iframe, code/pre.
- Tab Lý thuyết: nội dung bài, slide strip, header và các section được giới hạn trong card, có cuộn riêng.
- Tab Bài tập: câu hỏi/gợi ý/đáp án xuống dòng và cuộn trong card, không vượt biên.
- Tab Nghe nói: câu dài, danh sách câu và nút điều khiển không làm vỡ khung.
- Tab Lưu trữ/Dữ liệu: cây thư mục, header nguồn, preview, record card, nút công cụ và JSON editor đều được khóa max-width/overflow.
- Responsive: dưới 1240px chuyển layout về 1 cột để tránh bóp vỡ thẻ; dưới 760px nút và input tự wrap.

## Ghi chú Canva
Canva brand template không khả dụng trong phiên này do yêu cầu Canva paid plan. Đã áp dụng trực tiếp preset Canva-like đã định trong CSS/layout nội bộ: card sáng, bo góc lớn, viền xanh nhạt, spacing đều, cuộn riêng trong vùng nội dung.

## QA static
- JS syntax: OK
- JSON parse: OK
- Manifest parse: OK
- ZIP test: OK
