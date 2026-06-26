# Russian Bauman · Learning Tab Access Guard

## Mục tiêu
Kiểm tra toàn diện tab Học tập sau khi người dùng báo không mở được.

## Sửa chính
- Thêm lớp bảo vệ `safeLocalJson()` để tránh dữ liệu lưu cũ quá lớn/hỏng làm app treo.
- Không nạp optional/lazy data lớn từ localStorage overlay cũ.
- Bọc `render()` bằng `FULL_RENDER_GUARD` để nếu một lỗi ngầm xảy ra, app không trắng màn hình mà tự mở lại Học tập/Lý thuyết.
- Làm chặt `setLearnTab()` và `setView('learning')` để tab Học tập luôn có trạng thái hợp lệ.
- Giữ nguyên các yêu cầu trước: 20 câu/lượt, đáp án dạng list, flag trái Ôn tập/Kiểm tra, Deep chỉ trong Đối thoại.

## Kiểm tra
- `node --check assets/core.js`: pass.
- `node --check assets/subject-adapter.js`: pass.
- `node --check subject-manifest.js`: pass.
- Parse JSON trong `data/`: pass.
- Render VM: Lý thuyết, Bài tập, Nghe/Nói, Ôn tập, Kiểm tra đều pass.
- Test giả lập localStorage hỏng/quá lớn: pass.

## Ghi chú trung thực
Không tái hiện lỗi bằng VM trong sandbox, nhưng đã tìm và vá vùng rủi ro có khả năng cao nhất: state/localStorage cũ và render không có guard toàn cục. Cần mở Live Server trên máy thật để xác nhận UI nhìn ổn.
