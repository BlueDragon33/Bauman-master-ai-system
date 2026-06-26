# Tiếng Nga Bauman · Russian Survival Master V12.54 Final Unified Overview Media Focus

Bản V12.10 Clean Final.

Điểm chính:
- Tổng quan làm lại phần Lịch trình hôm nay có trọng tâm, bối cảnh thực tế và đầu ra rõ.
- Tab Viết có mẫu chữ lớn để quan sát, hướng dẫn từng bước viết chữ/từ/câu, gắn với lớp học, ký túc, Bauman, НИР/ВКР.
- Giữ AI Mentor theo ngữ cảnh học hiện tại: bài học, từ vựng, hội thoại, viết và mục tiêu hôm nay.
- Data Manager quản lý nguồn JSON bằng preview giới hạn, không phơi code dài để tránh treo hệ thống.

Chạy bằng Live Server để fetch dữ liệu JSON ổn định.


## V12.16 · Clean Flag UI

- Ôn tập: 20 câu/khung, chia tab 1-20, 21-40..., màu trắng/vàng/xanh theo trạng thái.
- Kiểm tra: 40 câu/bảng, chu kỳ 7/14/21/28 ngày, chỉ tổng kết đúng/sai sau khi nộp.
- Popup kết quả: điểm /10, phổ điểm theo mức/kỹ năng, danh sách câu sai.
- Phụ đạo: câu sai tạo lịch trình phụ đạo ở Tổng quan, bấm thẻ để hoàn thành, xong toàn bộ thì tự ẩn.
- Final QA: sửa các nút chỉ số 0 như Câu 1, tab 1-20, slide đầu, đáp án A không bị bỏ qua.


## V12.20 Assessment Final Clean
- Bổ sung bản vá nghiệm thu còn thiếu: bỏ renderExam cũ ghi đè logic nhiều đề, thêm popup kết quả chính thức, giữ bố cục câu hỏi cuộn đủ nội dung, và hoàn thiện trạng thái đề con 7/14/21/28 ngày.


## V12.21 Assessment Display Fix

- Sửa lỗi Ôn tập/Kiểm tra bị cắt nội dung vì shell học tập khóa chiều cao và ẩn overflow.
- Bảng flag số không còn bị khuyết hoặc sinh thanh cuộn ngang vô nghĩa.
- Vùng câu hỏi và đáp án hiển thị đủ, nội dung dài cho phép cuộn trang tự nhiên.
- Panel kết quả kiểm tra thu gọn để không che mất khu làm bài.


## V12.33 Step 4 Writing Practice
- Trình chiếu mở rộng còn đúng khoảng 1 inch mỗi mép, có hướng dẫn phím: ←/→ qua slide, ↑/↓ cuộn, PageUp/PageDown cuộn xa, Space chuyển tiếp, Esc đóng.
- Đối thoại chuyển từ bảng hiển thị sang Speaking Coach: chọn vai A/B, ghi âm câu, chấm gần đúng bằng Web Speech API nếu trình duyệt hỗ trợ, hoặc tự đánh dấu câu đã nói ổn.
- Luyện viết tách đúng: bảng trái là mẫu chữ và từng nét; bảng phải là vùng tập viết. Nút “Mẫu chữ cái” mở popup grid.
- Flashcard có mặt nghĩa trực quan bằng image/emoji/biểu tượng, bấm thẻ để lật nghĩa, giảm phụ thuộc chữ viết.

## V12.24 Vietnam Listening First Schedule

- Xếp lại lịch trình 2 tháng đầu ở Việt Nam: Video/Audio → nghe chủ động → nhại/shadowing → đóng vai.
- Từ vựng và ngữ pháp chuyển thành phần phụ trợ: học ít, dùng ngay trong câu, không học danh sách dài.
- Lịch mẫu mặc định đổi sang buổi 120 phút với khoảng 70% thời lượng cho nghe, nói, video.
- Planning Bridge và Subject Adapter ưu tiên trọng số listening/speaking/video, giảm tải vocab/grammar trong giai đoạn đầu.


## V12.52 Final Storage Tree QA

- QA tổng thể sau 4 bước sửa: nút nguy hiểm, đối thoại/luyện nói, trình chiếu và luyện viết.
- Bổ sung xác nhận cho các thao tác khôi phục dữ liệu trong Data Manager: khôi phục nguồn và khôi phục toàn bộ DB.
- Dọn lặp xử lý nhập JSON trong Data Manager.
- Kiểm tra JS, JSON, handwriting strokes 33/33 chữ Cyrillic và ZIP trước khi phát hành.


## V12.54 Final Unified Overview Media Focus

- Hợp nhất thẻ học hôm nay/timeline để tránh trùng lặp.
- Làm gọn phần dưới Tổng quan thành bảng điều phối học.
- Bố cục lại Video/Audio: phụ lục bên trái, khung xem trung tâm bên phải, thêm nhiệm vụ nghe 3 bước.
