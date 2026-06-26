# Russian Survival Master V7.3 · Academic Button Framework Report

## Yêu cầu đã xử lý

- Gom 4 nút trong tab Học tập thành một cụm cha **Học thuật**.
- Bên trong **Học thuật** vẫn giữ 4 nút con: Lý thuyết, Bài tập, Mô phỏng, Kiểm tra.
- Bấm nút con nào thì render đúng nội dung tương ứng.
- Bỏ chip cũ `KHU HỌC TẬP V6.1` để tránh cảm giác bản vá chồng.
- Bỏ toàn bộ dải thẻ thống kê số lượng ở Tổng quan, gồm Bài học, Khái niệm, Từ/cụm, Video/Audio, Bài tập, Mô phỏng, Hội thoại, Nhiệm vụ viết, Câu kiểm tra.

## Kết quả khung sườn

Tab chính giữ 6 mục:

1. Tổng quan
2. Học tập
3. Đối thoại
4. Viết
5. Video/Audio
6. Từ vựng

Trong **Học tập**, cụm **Học thuật** quản lý:

- Lý thuyết
- Bài tập
- Mô phỏng
- Kiểm tra

## Ghi chú thiết kế

- Tổng quan không còn hiển thị số liệu thô để tránh rác giao diện khi dữ liệu chưa nạp hoặc khi mở sai môi trường.
- Nội dung thật vẫn giữ nguyên trong JSON.
- Controller vẫn dùng một state, một render, event delegation toàn cục.
