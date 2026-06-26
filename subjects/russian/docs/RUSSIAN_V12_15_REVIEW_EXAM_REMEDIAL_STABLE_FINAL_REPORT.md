# Russian Bauman Survival Master V12.15 · Review Exam Remedial Stable Final

## Mục tiêu lượt cuối

Nghiệm thu ổn định cho update Ôn tập/Kiểm tra/Phụ đạo sau các lượt V12.11 đến V12.14.

## Đã xử lý

1. Giữ cấu trúc **Ôn tập** thay cho Kiểm tra cũ: 20 câu/khung, tab nhỏ 1-20, 21-40...
2. Giữ tab **Kiểm tra** chính thức: 40 câu/bảng, chu kỳ 7/14/21/28 ngày.
3. Sửa lỗi quan trọng của các nút có chỉ số `0`: Câu 1, trang 1-20, slide đầu, đáp án đầu tiên, dòng hội thoại đầu tiên giờ đều bấm được ổn định.
4. Kiểm tra sau khi nộp mới hiện đúng/sai, điểm /10 và đạt/chưa đạt theo ngưỡng 8.0/10.
5. Popup kết quả giữ phổ điểm theo mức, kỹ năng/chủ điểm và danh sách câu sai.
6. Lịch trình phụ đạo giữ trạng thái qua reload bằng localStorage, hoàn thành hết thẻ sẽ tự ẩn.
7. Ôn tập câu sai/cắm cờ quét toàn bộ mức khi cần phụ đạo, không bỏ rơi câu medium/hard/expert sau bài kiểm tra 14/21/28 ngày.
8. Cập nhật version manifest, adapter, README và CSS final polish.

## Checklist kiểm tra tĩnh

- `core.js`: kiểm tra cú pháp bằng Node.
- `subject-adapter.js`: kiểm tra cú pháp bằng Node.
- `subject-manifest.js`: kiểm tra cú pháp bằng Node.
- Toàn bộ JSON trong `data/`: parse hợp lệ.
- `subject-manifest.json`: parse hợp lệ.
- ZIP integrity: OK.

## Ghi chú sử dụng

Chạy bằng Live Server để `fetch(data/*.json)` hoạt động đúng. Sau khi mở app, có thể kiểm tra nhanh qua console: `window.RUSSIAN_FINAL_QA()` nếu cần xem snapshot kỹ thuật.
