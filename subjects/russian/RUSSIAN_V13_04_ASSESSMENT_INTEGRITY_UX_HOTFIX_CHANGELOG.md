# Russian V13.04 · Assessment Integrity UX Hotfix

## Phạm vi
Tập trung kiểm tra và tinh chỉnh tab **Ôn tập** và **Kiểm tra** theo 4 trục: toàn vẹn hệ thống, toàn vẹn sự kiện/nút bấm, toàn vẹn dữ liệu, và UX/UI chống chồng chéo nội dung.

## Phát hiện chính
- Dữ liệu JSON lõi parse được, không phát hiện lỗi JSON.
- `data/tests.json` có 1320 câu, không thiếu ID, không trùng ID, không có đáp án vượt khỏi danh sách lựa chọn.
- 81 `data-act` đang render đều có nhánh xử lý trong `handleClick` hoặc xác nhận liên quan.
- Lỗi UX trọng tâm: giao diện Ôn tập/Kiểm tra đã có ý đồ dùng layout một cột, nhưng render vẫn giữ rail danh sách câu bên trái. Điều này dễ làm vùng câu hỏi bị ép hẹp, dữ liệu trạng thái câu bị “ăn diện tích”, và khung phải phải cuộn khó kiểm soát.

## Đã sửa
1. Đưa **danh sách câu** của Ôn tập/Kiểm tra lên khay ngang có cuộn, nằm trên câu hỏi.
2. Loại rail trái cũ khỏi luồng chính của Ôn tập/Kiểm tra để nội dung câu hỏi chiếm trọn chiều rộng.
3. Đồng bộ `REVIEW_PAGE_SIZE` và `EXAM_PAGE_SIZE`, bỏ lệch `examFlagGrid` dùng 40 trong khi đề đang theo 20 câu/lượt.
4. Thêm panel trạng thái đề trong Kiểm tra, giúp thấy tiến độ/nộp đề/kết quả rõ hơn.
5. Giữ logic khóa nút **Nộp đề** nếu chưa trả lời đủ câu; trạng thái khóa được làm rõ bằng CSS.
6. Thêm hotfix CSS V13.04 để chống chồng chéo, không cắt nội dung, cho phép vùng câu hỏi cuộn dọc độc lập.

## Kiểm tra đã chạy
- `node --check assets/core.js`: PASS.
- Parse toàn bộ JSON: PASS.
- Kiểm tra coverage `data-act`: PASS, không có `data-act` render mà thiếu handler.
- Kiểm tra dữ liệu test: PASS.
- Kiểm tra cân bằng ngoặc CSS/comment: PASS.

## Ghi chú trung thực
Sandbox hiện tại chặn điều hướng Chromium/Playwright tới file/http cục bộ, nên chưa thể xác nhận bằng ảnh chụp trình duyệt tự động. Bản vá đã qua kiểm tra tĩnh và nên mở bằng Live Server để nhìn lại trực quan hai tab Ôn tập/Kiểm tra.
