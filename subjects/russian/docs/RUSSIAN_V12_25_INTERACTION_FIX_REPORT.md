# Russian Survival Master V12.25 · Interaction Fix Report

## Phạm vi sửa

1. Slide trình chiếu
- Mở rộng modal trình chiếu, còn khoảng 1 inch mỗi mép màn hình.
- Giữ vùng nội dung slide có scroll riêng để xem hết nội dung dài.
- Bổ sung điều hướng bàn phím: ←/→ chuyển slide, ↑/↓ cuộn nội dung, PageUp/PageDown cuộn xa, Space chuyển tiếp, Shift+Space quay lại, Home/End về đầu/cuối, Esc đóng.
- Thêm dòng hướng dẫn phím ngay trong thanh trên của slide.

2. Speaking Lab / Đối thoại
- Bảng đóng vai không chỉ hiển thị nữa, đã thêm Speaking Coach.
- Có nút ghi âm câu hiện tại bằng Web Speech API nếu trình duyệt hỗ trợ.
- Có chấm điểm gần đúng theo độ giống transcript tiếng Nga và câu mẫu.
- Có trạng thái câu đã nói ổn, cần luyện lại, điểm nói, transcript đã nói.
- Có fallback “Tôi nói ổn” khi thiết bị/trình duyệt không hỗ trợ nhận diện giọng nói.

3. Tab luyện viết
- Tách lại bố cục: mẫu và từng nét ở bảng trái, giấy tập viết ở bảng phải.
- Nút “Mẫu chữ cái” mở popup grid các mẫu chữ.
- Chọn mẫu trong popup sẽ đưa mẫu về bảng trái.
- Bảng trái có các bước/nét có thể bấm chọn để luyện chính xác hơn.
- Bảng phải chỉ còn vùng luyện viết, bút, xóa, undo, tải ảnh.

4. Flashcard từ vựng
- Thẻ từ có cơ chế bấm lật.
- Mặt trước ưu tiên từ/cụm và biểu tượng gợi nhớ.
- Mặt sau ưu tiên hình/biểu tượng tượng trưng, nhãn minh họa, nghĩa rút gọn và ví dụ.
- Tận dụng trường `image_emoji`, `illustration_label_ru`, `image_url/image` nếu dữ liệu có.

## Số bước / số lượt khuyến nghị

- Tổng thể nên chia 3 lượt để sạch: lượt 1 sửa lõi tương tác; lượt 2 bổ sung dữ liệu nét chữ riêng cho từng chữ và bộ hình minh họa sâu hơn; lượt 3 QA responsive và đóng bản final.
- File hiện tại đã hoàn thành lượt 1, đủ để dùng thử và phát hiện lỗi thực tế.

## Ghi chú kỹ thuật

- Kiểm tra cú pháp JS bằng `node --check assets/core.js`: đạt.
- Không dùng thư viện ngoài, giữ nguyên cấu trúc module tách HTML/CSS/JS/JSON.
- Nhận diện giọng nói phụ thuộc trình duyệt. Nên chạy bằng Chrome/Edge qua Live Server để có quyền micro tốt hơn.
