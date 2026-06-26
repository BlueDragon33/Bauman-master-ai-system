# Russian_Bauman_LearningRender_ComprehensiveFix_FINAL

## Đã sửa

- Thêm `VOCAB_PAGE_SIZE = 20` để chặn lỗi render Từ vựng do hằng số thiếu.
- Dựng lại `renderVocab()` với guard nội bộ, danh sách 20 thẻ/lượt, flashcard không làm nút dịch chuyển, nội dung dài cuộn trong khung.
- Bỏ các nhãn dư thừa trong Kiểm tra: 7 ngày, 14 ngày, 21 ngày, 28 ngày, dễ + trung bình...
- Giữ Kiểm tra 20 câu/lượt, đáp án dạng list A/B/C/D.
- Tăng lớp chống khuyết nội dung cho Ôn tập/Kiểm tra: flag trái + nội dung phải + vùng cuộn nội bộ.
- Bỏ chip mức độ dư trong thẻ bài tập; mức độ vẫn do bộ lọc phía trên quản lý.
- Thêm CSS V13.03 chống tràn cho Từ vựng, Ôn tập, Kiểm tra.

## Kiểm tra

- `node --check assets/core.js`: đạt.
- `node --check assets/subject-adapter.js`: đạt.
- `node --check subject-manifest.js`: đạt.
- Parse toàn bộ JSON trong `data/`: đạt.
- Node VM render test: Lý thuyết, Bài tập, Ôn tập, Kiểm tra, Từ vựng đều render được, không rơi vào recovery card.

## Ghi chú trung thực

Chromium trong sandbox bị chính sách chặn localhost/file, nên chưa kiểm được bằng Live Server GUI thật. Cần mở trên máy người dùng để soi trực quan lần cuối.
