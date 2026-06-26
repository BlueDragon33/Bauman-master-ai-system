# Russian Bauman V12.43 · Media Balance Fix

## Mục tiêu
Sửa tab Video/Audio theo phản hồi ảnh: tránh cụm nút Mở video/Sửa nguồn/Nghe xong nói lại bị treo lơ lửng bên phải và tránh player quá lớn làm bố cục mất cân đối.

## Thay đổi chính
1. Đưa các nút hành động vào hàng nút gọn ngay dưới mô tả nguồn học.
2. Thu gọn hero Media Hub, thay hai ô metric lớn bằng pill nhỏ dễ đọc.
3. Cân lại layout: danh sách nguồn học và player có chiều cao giới hạn, không tạo khoảng trống lớn.
4. Giới hạn chiều cao player, placeholder không iframe gọn hơn.
5. Giữ nguyên chức năng nhóm Video/Audio, thêm/sửa/xóa nhóm, thêm/sửa nguồn.

## Kiểm tra
- core.js hợp lệ.
- subject-adapter.js hợp lệ.
- JSON hợp lệ.
- ZIP test không lỗi.
