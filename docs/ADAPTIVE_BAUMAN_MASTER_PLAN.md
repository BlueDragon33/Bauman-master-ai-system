# Adaptive Bauman Master AI · Kế hoạch triển khai xuyên suốt

## Mục tiêu

Chuyển hệ thống từ website chứa nội dung tự học thành một **hệ thống học tập cá nhân thích nghi**, tối ưu cho:

1. hiểu sâu;
2. nhớ lâu;
3. tự làm được;
4. trình bày và bảo vệ được;
5. dần học chuyên môn trực tiếp bằng tiếng Nga;
6. chuẩn bị sát chương trình Bauman ИУ-5 thay vì học lại toàn bộ đại học.

## Baseline bắt buộc

- Tiếng Nga: **ZERO**.
- Nền HUTECH 2014-2018: **Dormant**, không coi là Active nhưng cũng không học lại từ đầu nếu diagnostic tốt.
- LabVIEW + IoT + xử lý ảnh + tư duy tích hợp hệ thống: **Active**.
- Khoảng trống ưu tiên: Python/OOP, Algorithms & Data Structures, SQL/Database, Linux/OS/Networks, Probability/Statistics phục hồi-nâng cao, Optimization/OR, Markov, Queueing, Simulation, Data/ML, Research Russian.
- Mốc tự học mặc định: **01/09/2026**.
- Mốc dự bị mặc định: **01/11/2026**, trạng thái tentative và luôn chỉnh được.
- Mốc Bauman chính thức để trống cho đến khi có lịch thật.

## Nguyên tắc lõi

`Diagnostic -> Reactivate -> Bridge -> Apply -> Explain -> Defend -> Retrieve -> Bauman-ready`

Không dùng `đã xem = đã học`.

Một kiến thức chỉ được Mastered khi có đủ bằng chứng độc lập: retrieval, giải bài, ứng dụng, giải thích, retention. Hints làm giảm mức mastery.

## Hệ thống trạng thái năng lực

- `ZERO`
- `DORMANT`
- `REACTIVATING`
- `FUNCTIONAL`
- `MASTERED`
- `BAUMAN_READY`
- `ARCHIVE_ON_DEMAND`

## 16 lượt triển khai / 64 bước tối thiểu

Kế hoạch ban đầu 14 lượt được tăng thành **16 lượt / 64 bước** vì cần thêm lớp bảo vệ dữ liệu, Russian technical annotation và QA liên môn. Nếu QA phát hiện khoảng trống, hệ thống được phép tự tăng lượt/bước mà không xóa công việc đã đạt chuẩn.

### Lượt 1 · Audit & baseline
1. Đọc cấu trúc GĐ1/GĐ2/GĐ3.
2. Khóa baseline ZERO/Dormant/Active/Gap.
3. Khóa ba mốc thời gian có thể chỉnh.
4. Lập dependency graph sơ bộ.

### Lượt 2 · Adaptive state model
1. Tạo mastery states.
2. Tạo state persistence.
3. Tạo compatibility với `window.state`.
4. Không can thiệp dữ liệu môn đã được nghiệm thu.

### Lượt 3 · Diagnostic engine
1. Diagnostic theo competency.
2. Band 80/60/40.
3. Russian không được skip A0 bằng diagnostic.
4. Xuất remediation action.

### Lượt 4 · Knowledge reactivation
1. Tách DORMANT khỏi GAP.
2. Ôn nhanh theo lỗi thật.
3. Không học lại PLC/SCADA/điện tử nếu Bauman không cần.
4. Kích hoạt prerequisite ngay trước lúc dùng.

### Lượt 5 · Retention engine
1. Theo dõi last evidence.
2. Ước lượng retention decay.
3. Sinh micro-review.
4. Hạ ưu tiên học mới khi nền cũ suy giảm nghiêm trọng.

### Lượt 6 · Error notebook
1. Phân loại lỗi concept/calculation/prerequisite/language/careless/programming/reasoning.
2. Theo dõi lỗi chưa xử lý.
3. Phát hiện mẫu lỗi lặp.
4. Tự chèn remediation.

### Lượt 7 · GĐ1 reflow
1. Russian ~45-50% thời gian khởi động.
2. Toán phục hồi ~20-25%.
3. Python bridge ~25-30%.
4. Sau đó giảm Russian theo lịch nhưng không thấp hơn nhu cầu thực tế.

### Lượt 8 · CS bridge
1. Python kỹ thuật.
2. OOP.
3. Algorithms/Data Structures.
4. SQL/Database + Linux/OS/Networks theo dependency.

### Lượt 9 · Math/System bridge
1. Linear Algebra.
2. Probability/Statistics.
3. Optimization/OR.
4. Markov/Queueing/Simulation.

### Lượt 10 · Data/AI bridge
1. Data analysis.
2. ML.
3. Neural systems.
4. Time series / evaluation.

### Lượt 11 · Russian ZERO -> Engineering Russian
1. A0 từ bảng chữ cái/âm/đọc.
2. Survival Russian.
3. Academic Russian.
4. Engineering Russian gắn trực tiếp từng môn.

### Lượt 12 · Progressive language immersion
1. L0 Việt + micro Russian.
2. L1 bilingual tăng dần.
3. L2 Russian-first + Vietnamese rescue.
4. L3/L4 immersion và Language Freedom.

### Lượt 13 · Russian Fade Engine
1. VI+RU+IPA+gợi đọc+audio.
2. RU+VI+audio.
3. RU + hover VI.
4. RU-only -> active production.

### Lượt 14 · Deep mastery pedagogy
1. Socratic hint ladder.
2. Feynman recall.
3. Explain-three-ways.
4. Closed-AI assessment.

### Lượt 15 · Project / lecture / oral defense
1. Intelligent IoT Vision System làm project spine.
2. Lecture simulator bằng Nga.
3. DZ/KR + mini NIR.
4. Oral defense hội đồng AI.

### Lượt 16 · Academic Board & QA
1. Weekly academic board.
2. Cross-subject dependency QA.
3. Language bottleneck QA.
4. Regression, persistence, accessibility, mobile, no-data-loss QA.

## Language progression

### L0 · trước dự bị
Việt gần như toàn phần, nhưng thuật ngữ quan trọng có Nga + IPA + gợi đọc tạm thời + audio khi có dữ liệu.

### L1 · nửa đầu dự bị
Song ngữ tăng dần từ khoảng 90/10 đến 50/50. Lịch chỉ là gợi ý; nếu năng lực chưa đủ, không ép chuyển.

### L2 · nửa sau dự bị
Nga đứng trước. Việt chuyển thành hỗ trợ khi rê/chạm hoặc yêu cầu giải thích.

### L3 · Bauman HK1
Russian immersion. AI Mentor hỏi bằng Nga; tiếng Việt là rescue layer.

### L4 · từ Bauman HK2
Ba chế độ: `VI_ONLY`, `RU_ONLY`, `ADAPTIVE`. Mặc định `ADAPTIVE`.

## Deep learning loop bắt buộc

`prerequisite -> intuition -> theory -> worked example -> independent practice -> lab/simulation -> Feynman recall -> Russian transfer -> project -> oral defense -> spaced retrieval`

## Project spine

**Intelligent IoT Vision System** phát triển từ kinh nghiệm hiện có:

LabVIEW/image acquisition -> Python/OpenCV -> OOP -> MQTT -> SQL -> Statistics -> ML -> Neural Network -> Optimization -> Russian documentation -> Mini NIR -> Oral defense.

Mục tiêu: không học từng môn như đảo riêng lẻ; một project dùng nhiều kiến thức cùng lúc.

## Thành phần đã triển khai trong nhánh roadmap

- `assets/data/adaptive-roadmap.json`
- `assets/js/adaptive-learning.js`
- `assets/data/russian-technical-lexicon.json`
- `assets/js/technical-russian.js`
- `index.html` đã load hai lớp mới.

## Tiêu chuẩn không phá hệ thống

- Không sửa các lesson Math đang trong workflow riêng.
- Không xóa dữ liệu được nghiệm thu.
- Không hard-code ngày dự bị như ngày chắc chắn.
- Không nâng Russian stage chỉ vì đến ngày.
- Không đánh Mastered vì đọc hết bài.
- Không tự động thay nội dung trong `code/pre/math/form/input` bằng Russian annotation.
- Mọi mở rộng mới phải giữ tương thích backup/restore hiện tại.

## Tiêu chuẩn hoàn thành cuối

Site được xem là đạt khi người học có thể:

1. bắt đầu từ Russian ZERO;
2. được diagnostic nền cũ thay vì học lại mù quáng;
3. có lịch tự reflow khi mốc dự bị/Bauman đổi;
4. nhận Russian technical support tăng/giảm theo năng lực;
5. học dependency đúng thứ tự;
6. giải bài độc lập và bị phạt mastery khi dùng quá nhiều hint;
7. có retention/review tự động;
8. dùng kiến thức trong project;
9. nghe bài giảng kỹ thuật Nga mô phỏng;
10. viết và bảo vệ mini NIR;
11. chuyển dần sang học hoàn toàn bằng Nga;
12. không phát sinh regression ở các môn đã nghiệm thu.
