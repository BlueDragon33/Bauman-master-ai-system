# Russian Bauman Elearning V13.06 Final Tight UX 4×5

## Mục tiêu
Hoàn tất lượt cuối theo quy trình 4 lượt: chỉ xuất file sau khi đã phân tích lỗi, sửa sâu và kiểm thử toàn diện.

## Thay đổi chính
- Cố định bản đồ câu Ôn tập/Kiểm tra thành 20 câu trong một khung: 4 cột × 5 hàng.
- Chặn kiểu kéo ngang hoặc biến thành 5×4, 10×2 ở breakpoint nhỏ.
- Tinh gọn panel phải của Ôn tập/Kiểm tra, đặt câu hỏi làm trung tâm.
- Giữ nút Nộp đề khóa khi chưa làm đủ 20 câu.
- Làm lại tab Từ vựng theo layout học nhanh: danh sách 20 thẻ bên trái, flashcard gọn bên phải.
- Bỏ header lặp từ đang học và ẩn các card chi tiết cũ quá dàn trải.

## Kiểm thử
- Parse JSON: pass.
- 8000 thẻ từ vựng: pass.
- 1320 câu kiểm tra: pass.
- 81/81 nút `data-act` có handler: pass.
- Ôn tập 20 flag 4×5: pass.
- Kiểm tra 20 flag 4×5: pass.
- Không tràn ngang ở 1440/1180/1024/900px: pass.
