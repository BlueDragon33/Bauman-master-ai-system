# Russian Bauman V12.29 · Final Stable

## Trạng thái
Bản final ổn định sau 3 lượt sửa lõi tương tác.

## Nội dung đã chốt
1. Slide trình chiếu mở rộng, đọc được nội dung dài, hỗ trợ bàn phím.
2. Speaking Lab chuyển từ bảng hiển thị sang công cụ luyện nói có vai A/B, ghi âm, chấm gần đúng và phím tắt.
3. Tab luyện viết tách rõ: bảng trái là mẫu + bước nét; bảng phải là giấy tập viết.
4. Popup Mẫu chữ cái dạng grid, chọn mẫu đưa về bảng trái.
5. 33 chữ Cyrillic có hướng dẫn nét riêng trong `handwriting.json`.
6. Flashcard ưu tiên biểu tượng/hình gợi nhớ khi lật nghĩa.
7. Lịch học 2 tháng đầu ở Việt Nam ưu tiên nghe, nói, video; từ vựng/ngữ pháp chỉ là phụ trợ.

## Cách dùng khuyến nghị
- Giải nén ZIP.
- Mở thư mục bằng VS Code.
- Chạy Live Server tại `subjects/russian/index.html`.
- Dùng Chrome hoặc Edge để Speaking Coach có khả năng dùng micro.

## Kiểm tra đã thực hiện
- JavaScript syntax check: core.js, subject-adapter.js.
- JSON validation: toàn bộ file trong data và subject-manifest.json.
- Handwriting validation: 33/33 chữ cái Cyrillic có `strokes`.
- ZIP test: đóng gói không lỗi.
