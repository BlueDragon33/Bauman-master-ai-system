# Russian Bauman V12.26 · Interaction Round 1

## Mục tiêu lượt 1
Sửa những điểm làm người học không thao tác được hoặc thao tác không có tác dụng rõ ràng: slide trình chiếu, phòng đối thoại, luyện viết và flashcard từ vựng.

## Đã chỉnh

### 1. Trình chiếu slide
- Khung modal trình chiếu mở rộng gần full màn hình.
- Vùng nội dung slide cuộn độc lập để không bị khuyết thiếu phần cuối.
- Bổ sung điều hướng bàn phím:
  - Arrow Left / Arrow Right: chuyển slide.
  - Arrow Up / Arrow Down: cuộn nội dung slide.
  - PageUp / PageDown: cuộn xa.
  - Space / Shift + Space: qua/lùi slide.
  - Home / End: về đầu/cuối bộ slide.
  - Esc: đóng trình chiếu.
- Thêm nút cuộn lên/xuống trong modal cho người dùng không quen phím.

### 2. Đối thoại / Speaking Lab
- Bảng đối thoại được nâng thành Speaking Coach.
- Có chọn vai A/B, ẩn nghĩa, nghe mẫu, nghe chậm, ghi âm từng câu.
- Có điểm nói gần đúng theo câu mẫu tiếng Nga.
- Có tiến độ số câu đạt/tổng câu.
- Có nút Auto qua câu khi đạt từ 70%.
- Có nút “Tôi nói ổn” làm phương án dự phòng khi trình duyệt không hỗ trợ nhận diện giọng nói.

### 3. Tab luyện viết
- Chia rõ hai bảng:
  - Bên trái: mẫu chữ, popup “Mẫu chữ cái”, các bước/nét cần luyện.
  - Bên phải: giấy luyện viết bằng canvas.
- Popup mẫu chữ cái dạng grid, chọn mẫu sẽ đưa về bảng trái.
- Canvas bên phải có đường kẻ hướng dẫn và nhãn bước hiện tại.
- Bấm từng bước/nét bên trái sẽ đổi nhiệm vụ luyện bên phải.

### 4. Flashcard từ vựng
- Bổ sung ánh xạ trực quan theo ngữ nghĩa nếu thẻ chưa có ảnh/emoji đủ tốt.
- Ưu tiên các trường `image_emoji`, `illustration_label_ru`, `tags` trong dữ liệu 8000 từ.
- Mặt sau thẻ có cụm biểu tượng, nhãn hình dung, tag và nghĩa rút gọn để nhớ lâu hơn chữ đơn thuần.

## Kiểm tra kỹ thuật
- `node --check assets/core.js`: đạt.
- `node --check assets/subject-adapter.js`: đạt.
- `python3 -m json.tool subject-manifest.json`: đạt.

## Ghi chú cho lượt 2
- Nên bổ sung bộ dữ liệu stroke thật cho từng chữ Cyrillic thay vì dùng thuật toán bước nét chung.
- Nên test trực tiếp micro trên Chrome/Edge qua Live Server vì sandbox không thay thế được thiết bị micro thật.
