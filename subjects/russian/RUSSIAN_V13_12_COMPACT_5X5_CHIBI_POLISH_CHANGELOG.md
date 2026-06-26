# V13.12 Compact 5x5 Chibi Polish

## Mục tiêu
- Giữ nền V13.11 đã đọc đủ nội dung.
- Thử bảng flag 5×5 cho Ôn tập/Kiểm tra để gọn và cân hơn.
- Sửa header Ôn tập/Kiểm tra cho bớt lạ: bộ lọc thành một hàng sạch.
- Bổ sung lớp trực quan cho flashcard từ vựng: icon/nhãn hình dung/chibi bằng emoji hoặc ảnh nếu dữ liệu có ảnh.

## Thay đổi chính
1. Flag map:
   - Mỗi trang vẫn xử lý 20 câu theo logic cũ.
   - Giao diện hiển thị khung 5×5: 20 câu + 5 ô ghost mờ để cân hình.
   - Không kéo ngang, không đổi logic đề 20/40/60/100.

2. Ôn tập/Kiểm tra:
   - Header chuyển về một nhịp: tiêu đề trên, bộ lọc dưới, không còn lệch 2 hàng kỳ cục.
   - Câu hỏi là vùng chính, flag rail chuyển sang phải trên desktop.
   - Mobile/tablet tự xếp flag lên trên, câu hỏi xuống dưới.
   - Không dùng fixed-height/overflow-hidden gây khuyết nội dung.

3. Từ vựng:
   - Flashcard có icon/chibi/nhãn mô tả trực quan lấy từ `image_emoji`, `illustration_label_ru`, tags hoặc suy luận từ nội dung.
   - Danh sách trái có emoji nhỏ để nhận diện nhanh.
   - Giữ flashcard gọn, không phình thùng thình.

## File sửa
- assets/core.js
- assets/core.css
