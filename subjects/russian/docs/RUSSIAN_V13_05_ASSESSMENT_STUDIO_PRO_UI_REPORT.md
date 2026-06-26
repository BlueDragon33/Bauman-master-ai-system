# Russian V13.05 Assessment Studio Pro UI Report

## Mục tiêu sửa
- Làm lại UX/UI tab Ôn tập và Kiểm tra theo bố cục bài giảng chuyên nghiệp.
- Chấm dứt hướng vá bằng khay câu ngang gây rối mắt, co nội dung và giảm trọng tâm câu hỏi.
- Dọn phần Từ vựng: bỏ cột nghĩa lặp, giữ flashcard lớn, thêm tìm kiếm và chi tiết gọn.

## Thay đổi chính
1. Ôn tập
   - Đổi sang Assessment Studio: câu hỏi nằm trung tâm, bản đồ câu nằm bên phải.
   - Bộ lọc gọn trên đầu: mức, bài, trạng thái, reset.
   - Trạng thái dữ liệu vẫn giữ: mới, đã làm, cắm cờ, sai.
   - Feedback đúng/sai giữ logic cũ: sai thì làm lại, đúng mới mở giải thích.

2. Kiểm tra
   - Đổi sang bố cục đề kiểm tra chuyên nghiệp: câu hỏi lớn, trạng thái đề và bản đồ câu bên phải.
   - Nút Nộp đề nằm ở panel trạng thái, khóa rõ nếu chưa làm đủ câu.
   - Đề vẫn dùng 20 câu/lượt theo dữ liệu hiện hành.
   - Kết quả, reset đề, reset mốc và ôn lại câu sai giữ nguyên logic.

3. Từ vựng
   - Bỏ cột nghĩa/ảnh tượng trưng lặp với flashcard.
   - Thêm header tìm kiếm ngay trong tab Từ vựng.
   - Giữ 20 thẻ/lượt, flashcard lớn, nút nghe/lật/trước/sau.
   - Chuyển thông tin phụ thành 4 thẻ gọn: Nghĩa, Ví dụ, Dùng khi nào, Ứng dụng.

## Kiểm tra kỹ thuật
- `node --check assets/core.js`: pass.
- Parse toàn bộ JSON trong `data/`: pass.
- Smoke render bằng môi trường giả lập cho 3 view: `learning/review`, `learning/exam`, `vocab`: pass.
- Kiểm tra `data-act`: 81/81 action có handler.

## Số liệu dữ liệu
- lessons: 26
- grammar: 20
- exercises: 312
- tests: 1320
- vocab: 8000
- speaking: 1220
- dialogue-bauman-az: 4164
- deep-speaking-bauman: 1140
- videos: 24
- handwriting: 48
- writing: 42

## Ghi chú
Không thay đổi cấu trúc JSON lõi. Lần sửa này ưu tiên thiết kế lại lớp hiển thị và giữ toàn vẹn luồng dữ liệu/nút bấm.
