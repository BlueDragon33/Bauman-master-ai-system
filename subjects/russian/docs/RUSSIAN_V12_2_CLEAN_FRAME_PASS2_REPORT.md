# Russian Survival Master V12.2 · Clean Frame Pass 2

## Phạm vi
Lượt 2 tập trung làm sạch khu Học tập, trình chiếu slide và Phòng luyện nói. Chưa đi sâu polish Viết, Video/Audio và Lưu trữ vì đó là lượt 3.

## Đã sửa

1. Router con trong tab Học tập
   - `learnTab=theory` chỉ hiện bài học/slide.
   - `learnTab=exercises` chỉ hiện danh sách bài tập.
   - `learnTab=practice` chỉ hiện hội thoại/nghe nói.
   - `learnTab=tests` chỉ hiện câu kiểm tra.
   - Không còn dùng chung danh sách Lý thuyết cho mọi mode.

2. Layout Học tập
   - Sidebar trái compact hơn.
   - Mỗi mode có danh sách riêng.
   - Vùng nội dung chính không phình trắng như trước.

3. Popup trình chiếu
   - Mở gần full màn hình, cách mép desktop khoảng 1 inch.
   - Có danh sách slide bên trái.
   - Nội dung slide bên phải, vùng nội dung tự cuộn.
   - Modal presentation dùng class riêng `presentation-card`.

4. Phím điều hướng slide
   - Khi modal trình chiếu mở:
     - `←` slide trước.
     - `→` slide sau.
     - `↑` cuộn nội dung lên.
     - `↓` cuộn nội dung xuống.
     - `Esc` đóng modal.
   - Khi không mở modal, phím vẫn điều khiển slide trong tab Lý thuyết.

5. Đối thoại / Speaking Lab
   - Làm lại thành bố cục 3 vùng: chọn tình huống, câu đang luyện, chu trình luyện.
   - Giảm rườm rà, tăng khoảng đọc, giữ nghe mẫu/nghe chậm/chuyển câu.

## Kiểm tra kỹ thuật
- ZIP hợp lệ.
- `core.js` không lỗi cú pháp.
- `subject-adapter.js` không lỗi cú pháp.
- Manifest JSON hợp lệ.
- Dữ liệu JSON trong `data/` hợp lệ.

## Cần test bằng Live Server
- Bấm 4 nút Học tập xem có đổi đúng nội dung không.
- Mở Trình chiếu, thử phím `←/→/↑/↓/Esc`.
- Tab Đối thoại kiểm tra chọn nhóm, mức độ, tìm kiếm, nghe mẫu.

## Lượt tiếp theo
V12.3: làm sạch Viết, Video/Audio, Lưu trữ và QA cuối.
