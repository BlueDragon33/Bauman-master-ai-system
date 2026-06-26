# Russian Survival Master V12.22 · Submit Button Clean

## Mục tiêu sửa

- Bỏ hướng xử lý lan man trước đó, chỉ thực hiện yêu cầu mới về nút thao tác trong Ôn tập/Kiểm tra.
- Đổi chữ **Chấm xong** thành **Kiểm thử** trong Ôn tập.
- Giữ nút **Nộp đề** ở hàng thao tác cuối của Kiểm tra, nằm sau nút **Sau →** như vị trí người dùng khoanh.
- Khóa nút **Nộp đề** nếu đề hiện tại chưa trả lời đủ câu, giúp phân biệt rõ khi nào được nộp.

## Thay đổi kỹ thuật

- Thêm `examSubmitState(qs, level)` để tính `answered / total / remaining / complete`.
- `renderExam()` dùng `submitDisabled` và `submitClass` để khóa/mở nút nộp.
- Event `submit-exam` vẫn giữ lớp bảo vệ logic cũ: nếu còn câu chưa trả lời thì không cho nộp.
- CSS bổ sung trạng thái `.submit-exam-btn.locked` để nút bị khóa hiển thị xám, không hover nổi, không gây hiểu nhầm là bấm được.

## Kiểm tra

- `core.js`: pass `node --check`.
- `subject-manifest.js`: pass `node --check`.
- `subject-manifest.json`: parse hợp lệ.
- Toàn bộ JSON trong `data/`: parse hợp lệ.
- ZIP integrity: OK.
