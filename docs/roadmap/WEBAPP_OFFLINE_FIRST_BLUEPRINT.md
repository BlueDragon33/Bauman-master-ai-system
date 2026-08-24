# BAUMAN MASTER AI · WEB APP OFFLINE-FIRST BLUEPRINT

Target: **ИУ-5 · 09.04.01/11**

## 1. Mục tiêu

Web App phải hoạt động theo 3 trạng thái mà người học không cần đổi hệ thống:

1. **Online**: tải nội dung mới, đồng bộ state khi backend được bật.
2. **Offline cached**: học các bài/chương đã chọn “Giữ để học offline”.
3. **Local library**: mở tài liệu đã tải sẵn trên máy bằng file/folder picker, không phụ thuộc VPN hay domain.

Offline không đồng nghĩa với tải toàn bộ kho. Kiến trúc phải giữ app nhẹ.

---

## 2. Ba lớp dữ liệu

### Lớp A · App shell

Cache versioned:

- root HTML;
- CSS lõi;
- runtime JS;
- icon/font nội bộ cần thiết;
- roadmap manifest nhẹ;
- metadata subject.

Không đưa JSON học liệu lớn vào precache.

### Lớp B · Offline content pack

Người học chủ động tải theo:

- môn;
- chapter;
- lesson;
- tuần học;
- Current Bauman Subject.

Mỗi pack có manifest:

- `packId`;
- `version`;
- `subjectId`;
- danh sách file;
- bytes;
- checksum nếu có;
- downloadedAt;
- lastUsedAt.

Nội dung lưu trong IndexedDB/Cache Storage theo loại dữ liệu.

### Lớp C · Local library

Nguồn nằm trên máy tính:

- JSON;
- PDF;
- HTML;
- TXT/Markdown;
- ảnh;
- audio/video nếu browser hỗ trợ.

Ưu tiên File System Access API trên Chromium. Fallback dùng file input / directory input.

Không ghi đường dẫn tuyệt đối của máy người học vào state đồng bộ cloud.

---

## 3. Loader thống nhất

Mọi môn tiến dần tới một contract:

```text
request content
  ↓
memory cache
  ↓ miss
IndexedDB offline pack
  ↓ miss
local selected library
  ↓ miss
network fetch
  ↓ success
optional offline cache
```

Không môn nào tự tải toàn bộ dataFiles lúc startup.

---

## 4. Performance budget

### Startup

- không JSON đơn lẻ >= 5 MB;
- không fetch `vocab/tests/speaking/lessons legacy` nếu chưa mở chức năng;
- metadata startup càng nhỏ càng tốt;
- render first screen không phụ thuộc toàn bộ subject database.

### Runtime

- list dài phải pagination hoặc virtualization;
- không render hàng nghìn DOM nodes cùng lúc;
- parse dữ liệu lớn theo chunk/worker ở pha tối ưu hóa;
- ảnh lazy-load;
- video/audio không preload toàn bộ;
- simulation chỉ khởi tạo khi tab được mở.

### Content pack

Khuyến nghị:

- lesson pack: <= 2 MB trừ media;
- chapter pack: chia nhỏ nếu > 10 MB;
- media tách khỏi text/data;
- Russian vocabulary/tests/speaking chia theo level/chapter/theme thay vì 1 JSON khổng lồ ở phiên bản tối ưu cuối.

---

## 5. Offline UX

Mỗi môn có trạng thái:

- `Online only`;
- `Có thể tải offline`;
- `Đã tải offline`;
- `Có bản mới`;
- `Local file`.

Nút đề xuất:

- **Giữ để học offline**;
- **Xóa bản offline**;
- **Mở thư mục tài liệu**;
- **Mở file đã tải**;
- **Kiểm tra dung lượng**.

Dashboard có “Offline Library” hiển thị pack đã tải và dung lượng.

---

## 6. Local file reading

### Chromium desktop

Dùng `showOpenFilePicker` / `showDirectoryPicker` khi khả dụng.

### Fallback

Dùng `<input type="file" multiple>` và `webkitdirectory` khi browser hỗ trợ.

### Quy tắc

- file được đọc chỉ sau hành động của người dùng;
- không tự quét ổ đĩa;
- file JSON được parse có giới hạn kích thước và báo lỗi rõ;
- PDF/media đọc bằng Blob/Object URL;
- HTML local phải sandbox khi render để tránh script không tin cậy chạy trong app.

---

## 7. Service Worker

Service Worker chỉ chịu trách nhiệm:

- app shell;
- versioned static assets;
- navigation fallback an toàn;
- tài nguyên đã được đánh dấu offline.

Không precache toàn bộ `subjects/**/data/*.json`.

Khi update:

1. cache mới tạo theo version;
2. cache cũ không xóa trước khi cache mới sẵn sàng;
3. state người học không nằm trong cache shell;
4. rollback được về version trước.

---

## 8. Dữ liệu người học

Offline state và content là hai lớp khác nhau.

- progress/test/schedule/preferences: Personal Learning State;
- content pack: read-mostly learning assets;
- local file: user-selected source;
- cloud sync sau này chỉ sync state/metadata phù hợp, không upload file local ngoài ý muốn.

---

## 9. Roadmap integration

`assets/data/roadmap/iu5-090401-11-v3.json` là manifest academic chính.

Web App đọc manifest này để:

- tạo pha học;
- sinh prerequisite graph;
- biết Current Bauman Subjects;
- gợi ý pack offline cần tải cho tuần kế tiếp;
- chỉ tải nội dung tương ứng môn/chương đang học.

---

## 10. Gate bắt buộc trước khi bật offline production

1. Browser network regression PASS.
2. Russian heavy overlay persistence PASS.
3. Math legacy deferred route PASS.
4. Service worker version/cache regression PASS.
5. 9 entry × desktop/laptop/tablet/mobile regression PASS.
6. Local file sandbox test PASS.
7. Offline reload test PASS cho Main và ít nhất 1 môn nhẹ + Math + Russian.
8. Quota/storage-full handling PASS.
9. Update/rollback cache PASS.
10. Không thay đổi byte học liệu đã được chấp nhận chỉ để đạt performance.

---

## Trạng thái

Blueprint đã tạo. Tầng runtime được bổ sung theo feature flag và chỉ bật production sau khi các gate trên PASS.
