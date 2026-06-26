# RUSSIAN V12.81 · Learning Integrity Lock + UX Stretch

## Tổng số lượt thực hiện
4 lượt, hoàn tất trong bản cuối này.

## Lượt 1 · Kéo dãn tab chính / rail điều hướng
- Khóa `html`, `body`, `#app`, `.app`, `.sidebar`, `.main` theo `100dvh` để vùng điều hướng không bị cụt giữa màn hình.
- Đổi điểm gãy responsive: khung 821–1080px vẫn giữ sidebar trái, không biến thành layout ngắn gây khoảng trắng dưới menu.
- Main content cuộn độc lập, hạn chế tràn ngang.

## Lượt 2 · Khóa ngữ cảnh nội dung trong tab Học tập
- Thêm cơ chế `learningContextLesson()` làm nguồn sự thật cho bài đang học.
- `Lý thuyết`, `Bài tập`, `Nghe/Nói` cùng dùng một bài đang khóa.
- Danh sách bài tập chỉ lấy bài tập có `lessonId` đúng với bài hiện tại.
- Danh sách Nghe/Nói dùng ánh xạ hội thoại sang bài học theo stage, nhóm, ngữ cảnh, từ khóa Nga/Việt.

## Lượt 3 · Sửa lỗi logic khi thao tác nút
- Nút chọn bài học cập nhật lại slide về đầu và khóa ngữ cảnh.
- Nút chọn bài tập đồng bộ ngược về `lessonId` tương ứng.
- Trong `Nghe/Nói` mini của tab Học tập, các nút nghe câu, câu trước, câu tiếp lấy đúng hội thoại đang hiển thị, không rơi về hội thoại đầu tiên của kho chung.
- Bộ lọc nhóm/mức của Nghe/Nói chỉ hoạt động trong tập hội thoại liên quan tới bài đang khóa.

## Lượt 4 · Kiểm tra toàn vẹn cuối
- JSON parse OK: 12 file JSON trong thư mục data.
- Dữ liệu chính: 26 bài học, 20 mục ngữ pháp, 312 bài tập, 1220 hội thoại, 1320 câu kiểm tra, 8000 thẻ từ, 24 video/audio.
- Bài tập mồ côi: 0.
- Hội thoại thiếu lượt nói/utterance: 0.
- Mỗi bài học có bài tập liên quan và hội thoại/nghe-nói liên quan sau ánh xạ.
- `node --check` OK với `assets/core.js`, `assets/subject-adapter.js` và `subject-manifest.js`.

## Ghi chú UX/UI
- Có dải “Khóa nội dung” trong khu Học tập để nhìn thấy bài nào đang điều khiển cả ba phần.
- Sidebar được kéo full chiều cao như yêu cầu, tránh khoảng trắng như ảnh chụp.
