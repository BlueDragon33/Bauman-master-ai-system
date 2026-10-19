# CONTENT-FIRST · R01–R06 · kiểm kê và bài khởi động Pre-A0

**Phạm vi:** candidate riêng từ Bauman Issue #349 `cf65506bf33faa3c14e5629bfd34f53ab63ae880`. Giữ nguyên UI 10/10 và Offline-First v38 đã được người dùng kiểm thử PASS. Không công nhận học liệu bằng các gate kỹ thuật.

## 1. Nội dung có thật đã đối chiếu từ canonical JSON

| Bài | Chủ đề trong `listen-write-lessons.json` | Mục / drills | Quan sát |
|---|---|---|---|
| R01 | Кириллица, твёрдость и мягкость согласных, русское ударение | 2 / 3 | Có bài phân biệt мать–мять, stress молоко; quá khó nếu là âm đầu tiên cho Pre-A0 |
| R02 | Приветствие, самопрезентация и уточнение в учебной аудитории | 2 / 2 | Có câu chào, tự giới thiệu; thích hợp trích một lượt thực hành Pre-A0 |
| R03 | Общежитие, документы и просьба о помощи | 2 / 2 | Có mẫu hỏi đăng ký và giấy tờ |
| R04 | Город, покупки, здоровье и бытовые ситуации | 2 / 2 | Có chỉ đường metro, xin bác sĩ |
| R05 | Чтение базовых математических и информатических заданий | 2 / 2 | Có toán vector, thuật toán; không phải nhập môn |
| R06 | Понимание короткой лекции и конспектирование по методу Cornell | 2 / 2 | Có nghe hướng dẫn ghi định nghĩa / kết quả; chưa có âm thanh chuẩn |

**Nguồn:** `subjects/russian/data/curriculum.json` nối `R01–R06` vào giai đoạn VN; `subjects/russian/data/listen-write-lessons.json` có 10 binding R01–R10, R01–R06 tổng 12 mục và 13 drills; `handwriting-listen-write.json` chứa 33 chữ Cyrillic duy nhất với các dạng nghe/chọn, nghe/tô, nghe/viết. Dữ liệu viết chữ `handwriting.json` có 48 mục, nhưng **glyph-authority** hiện `status: blocked`, chưa thể coi font hệ thống là mẫu viết tay chuẩn.

## 2. Những khoảng trống cần giải quyết (KHÔNG tự điền VERIFIED)

- **Audio**: nguồn phát âm mẫu bất biến (hash/giấy phép/nguồn RU03) chưa được xuất bản thành kho media cục bộ trong module. TTS trình duyệt phụ thuộc giọng cài trên máy; không dùng TTS/ASR để khẳng định trọng âm hoặc chấm phát âm.
- **Hình ảnh từ vựng**: gợi ý biểu tượng/emoji chỉ để tương tác bước đầu, không phải thư viện tranh nhận diện độc lập đạt RU03; phải thay bằng nội dung được phép sử dụng và thẩm định trước khi công nhận.
- **Video offline**: 24/24 record trong `videos.json` là liên kết tìm YouTube, `offlineMapping: false`; không nhận là video được lưu offline.
- **Độ tin cậy**: `provenance.json` có 5 nhóm UNVERIFIED, 7 nhóm PARTIAL, không có nhóm VERIFIED; `engine/content/review/ru03-reviewers.v1.json` còn `reviewers: []`. `docs/p1/RUSSIAN_CONTENT_STANDARD_GAP_REPORT.md` ghi thiếu stress/morphology item-level của ngân hàng 8.000 từ.
- **Chu trình học vi mô**: có 26 bài/tầng học nhưng chưa chứng minh tất cả đều theo nhịp nghe→nhại→phân biệt→chữ in→viết→phản xạ→ô n lại được đo theo thiết bị và theo bài.

## 3. Bài khởi động Pre-A0 có thể thao tác

**Chủ đề:** chào giáo viên lúc đến trường · chỉ dành cho giai đoạn `vn`, đang chọn bài `R01` hoặc `R02`. *Đây là bài phụ trợ candidate*, không đăng ký lesson ID canonical mới, không viết dữ liệu khác vào hệ thống.

**Nguồn văn bản duy nhất:** câu chào lấy từ `LW_R02 / LW_ITEM_R02_INTRO`; câu phân biệt nghĩa lấy từ `LW_R02 / LW_ITEM_R02_NAME`; chữ А và lựa chọn lấy từ `RHW_AZ_01`. Nếu JSON không tải được hoặc lệch schema thì **BLOCKED**, không tự tạo văn bản thay thế.

1. **Nghe**: chỉ cho phát thử nếu trình duyệt công bố giọng ru-RU; thông báo rõ là **TTS máy UNVERIFIED**. Không có giọng: hiện BLOCKED_AUDIO.
2. **Nhại**: người học nhại, có thể ghi âm → dừng → nghe lại qua `RussianRecordingEngine` / `RussianAudioEngine` hiện có. Không dùng ASR làm điểm phát âm; bản ghi tạm trong phiên.
3. **Hình**: bối cảnh 👋🏫, chọn câu chào hay câu giới thiệu từ nguồn R02; câu trả lời chỉ đánh giá mapping text ngữ cảnh.
4. **Mặt chữ**: nhận diện А а từ bộ 33 chữ có sẵn; liên kết sang module viết chữ; glyph cursive chuẩn vẫn BLOCKED.
5. **Phản xạ**: tự gõ câu chào khi gặp giáo viên và đối chiếu khớp chữ viết với nguồn, không chấm âm chuẩn.
6. **Tự đối chiếu**: hiển thị những thao tác thật đã thử; không gọi `touch`, không cập nhật mastery, SRS, điểm hoặc stage gate.

## 4. Tiêu chí QA và trạng thái

- **Static/schema gate**: R01–R06, lesson binding, 33 chữ, provenance, không thay JSON nguồn và không thêm hệ audio/mastery thứ hai.
- **Node simulated interaction gate**: đọc đúng nguồn, 6 bước, TTS ru-RU nếu có, ghi âm qua owner cũ, kiểm tra phân biệt chữ và đối chiếu, fail-closed khi nguồn thiếu.
- **Real Chromium 390/768/1440 + offline**: **NOT_TESTED trên SHA CONTENT-FIRST**; phải đo trên Windows mới nếu muốn gọi bài học là hoạt động thực sự trên thiết bị.
- **Linguistic/audio RU03 và learner outcomes**: **BLOCKED HUMAN_RU03_REQUIRED**, chưa đo độ chính xác phát âm. Không ratify/merge/deploy/publish tự động.

**Quy tắc tiếp theo:** bổ sung đúng nguồn nghe chuẩn, tranh đúng bản quyền, nghiệm thu Pre-A0 trên thiết bị, rồi chuẩn hóa R01–R06 theo từng micro-lesson. Không tạo thêm 8.000 từ hay 26 bài trùng lặp.
