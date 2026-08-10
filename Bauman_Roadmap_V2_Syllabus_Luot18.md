# BAUMAN MASTER AI — ROADMAP V2

## Đặc tả syllabus Lượt 18 — Bước 69–72

**Đối tượng:** học viên nền Kỹ thuật điều khiển và Tự động hóa HUTECH, chuẩn bị học thạc sĩ BMSTU, ИУ-5, 09.04.01.  
**Mốc kế thừa:** 17 lượt / 68 bước đã hoàn thành.  
**Mốc sau tài liệu này:** 18 lượt / 72 bước.  
**Trạng thái Toán được bảo toàn (đính chính tại Lượt 19/Bước 73):** baseline vật lý là `main@e383912354673bdce7a0059d6b9a23799d74e689`; giữ nguyên toàn bộ 347 lesson legacy và 18 theory overlay đã có. `MATH-L2-C07` là node logic ánh xạ tới các lesson covariance/correlation/PCA ở C05/C10/C15, không phải số Chương 7 vật lý. Các file standalone formula/exercise/simulation đang rỗng và tests mới là contract shell, vì vậy không được coi là dữ liệu đã đồng bộ.  
**Nguyên tắc:** không đập bỏ repo cũ, không sửa runtime/UI lõi khi không có lỗi thật, không ép học lại toàn bộ năng lực Tự động hóa đã có.

---

# BƯỚC 69 — KHÓA CHUẨN SYLLABUS ROADMAP V2

## 1. Phạm vi và điều không làm

Tài liệu này biến Roadmap V2 thành một syllabus có thể triển khai. Nó không cố dự đoán tên chính xác mọi học phần Bauman trong tương lai. Khi người học chính thức nhận thời khóa biểu/syllabus, Kho 09 sẽ nhập dữ liệu thật và sinh kế hoạch học trước lớp 2–4 tuần.

Các năng lực Control, Digital Control, điện–điện tử, đo lường, MCU, PLC/SCADA, automation và toán kỹ thuật cơ bản được gắn nguồn `existing_competency`. Chúng chỉ được mở lại theo ba trường hợp:

1. Là prerequisite trực tiếp của môn Bauman sắp học.
2. Kiểm tra chẩn đoán cho thấy có Gap hoặc Cần ôn.
3. Cần dùng trong project/NIR/Thesis nhưng người học chưa tái hiện được sau một khoảng giãn cách.

### Quy mô syllabus đã khóa

| Kho môn | Chapter/bộ vận hành | Lesson đánh số | Chapter động | Nguồn nội dung chính |
|---|---:|---:|---:|---|
| 01 Tiếng Nga | 10 | 32 | 2 | Tái sử dụng module Nga + tạo mới Nga kỹ thuật/học thuật |
| 02 Toán AI & Data | 10 | 36 | 0 | Bảo toàn baseline legacy; ánh xạ composite C07 + tạo mới C08–C10 |
| 03 Python & OOP | 8 | 32 | 0 | Tạo mới học thuật; dùng lại khung module |
| 04 Algorithms & Data Structures | 8 | 32 | 0 | Tạo mới học thuật; dùng lại khung module |
| 05 Database & Information Systems | 8 | 32 | 0 | Tạo mới học thuật; dùng lại khung module |
| 06 Linux, OS & Networks | 8 | 32 | 0 | Tạo mới học thuật; bổ sung terminal/network lab |
| 07 OR & System Modeling | 9 | 36 | 0 | Tạo mới học thuật; tái dùng engine mô phỏng |
| 08 Machine Learning & Research | 9 | 36 | 0 | Tạo mới; tái dùng các lesson legacy đã ánh xạ cho PCA |
| 09 Current Bauman Subjects | 6 | 0 | 6 | Sinh động từ syllabus thật |
| 10 NIR/Thesis | 9 | 36 | 0 | Tạo mới research workflow/rubric |
| **Tổng** | **85** | **304** | **8** | 8 chapter động sinh số lesson tùy dữ liệu thật |

## 2. Cấu trúc dữ liệu bắt buộc

```text
Course
└── Level
    └── Chapter
        └── Lesson
            ├── prerequisites
            ├── theory
            ├── exercises
            ├── application
            ├── simulation_or_lab
            ├── assessment
            ├── project_checkpoint
            └── master_ready_evidence
```

Mỗi bài phải có đủ trường trên. Với nội dung không cần mô phỏng đồ họa, `simulation_or_lab` được thay bằng notebook, terminal lab, database lab, speaking lab hoặc experiment lab; không để trống.

## 3. Quy ước Level

| Level | Ý nghĩa | Cách dùng |
|---|---|---|
| L0 — Diagnostic/Foundation | Kiểm tra và ôn có điều kiện | Không học tuyến tính. Chỉ mở node bị Gap/Cần ôn hoặc đang chặn prerequisite. |
| L1 — Prerequisite Core | Nền tối thiểu để học tiếp | Phải đạt trước khi mở phần phụ thuộc quan trọng. |
| L2 — Applied Core | Dùng kiến thức vào dữ liệu/hệ thống thực | Luôn có lab hoặc mô phỏng và checkpoint project. |
| L3 — Master-ready Integration | Bài toán mới, tích hợp nhiều mảng | Đòi hỏi giải thích lựa chọn, kiểm chứng kết quả và tái lập. |
| L4 — Master Mode | Chỉ dùng cho Kho 01, 09, 10 | Sinh nội dung động theo môn Bauman/NIR/Thesis đang diễn ra. |

Tiếng Nga dùng nhãn R0–R4 tương ứng với A0 → A1/A2 → B1 kỹ thuật → B1+/B2 học thuật → vận hành trong Master Mode.

## 4. Hợp đồng hoạt động của một bài

Mỗi bài tiêu chuẩn phải có tối thiểu:

- **Lý thuyết:** mục tiêu, sơ đồ khái niệm, định nghĩa/công thức hoặc quy trình, ví dụ đúng và phản ví dụ/lỗi thường gặp.
- **Bài tập:** 4 câu tái hiện, 4 câu áp dụng, 3 câu phân tích, 1 câu thách thức; môn lập trình thay bằng test case tương đương.
- **Ứng dụng:** ít nhất một tình huống gắn với dữ liệu, tín hiệu, hệ thống tự động, UGV/USV hoặc bài toán học thuật.
- **Mô phỏng/Lab:** đầu vào thay đổi được, có dự đoán trước khi chạy, kết quả, đối chiếu và kết luận.
- **Kiểm tra bài:** 10 câu hoặc bộ unit test; ngưỡng qua 80%, câu trọng yếu không dưới 70%.
- **Project checkpoint:** một sản phẩm nhỏ có thể ghép vào capstone của môn.
- **Master-ready evidence:** bằng chứng đo được, không dùng trạng thái “đã xem bài” làm minh chứng.

## 5. Cổng Master-ready chung

Một Chapter chỉ được gắn `Master-ready` khi đồng thời thỏa mãn:

1. Kiểm tra chương đạt **≥80%** và không còn lỗi prerequisite nghiêm trọng.
2. Lab/mô phỏng chạy được, người học giải thích được giả định và giới hạn.
3. Checkpoint project đạt tối thiểu **3/4** ở bốn tiêu chí: đúng, rõ, kiểm chứng, tái lập.
4. Kiểm tra lưu giữ sau 14–21 ngày đạt **≥75%**.
5. Với GĐ2–GĐ3, người học giải thích được 5–10 thuật ngữ cốt lõi bằng tiếng Nga trong ngữ cảnh môn.

Master-ready của cả Course cần: mọi Chapter bắt buộc đã Master-ready; capstone đạt; không còn node `Gap` đang chặn môn Bauman/NIR.

## 6. Trạng thái kiến thức

| Trạng thái | Điều kiện vào | Điều kiện ra |
|---|---|---|
| Chưa học | Chưa có bằng chứng | Bắt đầu bài hoặc thi chẩn đoán |
| Đang học | Có hoạt động nhưng chưa qua gate | Qua gate hoặc bỏ dở quá hạn |
| Đạt prerequisite | Đạt nền tối thiểu 70–79% | Nâng lên Master-ready hoặc tụt do quên |
| Master-ready | Qua toàn bộ cổng chung và cổng riêng | Có thể chuyển Cần ôn nếu retention giảm |
| Cần ôn | Đã từng đạt nhưng retention <75% | Ôn tập thích ứng và kiểm tra lại |
| Gap | Chẩn đoán <70%, lỗi trọng yếu hoặc thiếu hẳn | Hoàn thành bridge lesson và kiểm tra lại |

`existing_competency` là nguồn gốc năng lực, không phải trạng thái. Node có nguồn này vẫn phải qua chẩn đoán; nếu ≥80% thì bỏ qua bài giảng và chỉ làm một bài ứng dụng xác nhận.

## 7. Priority Engine V2

Điểm ưu tiên chuẩn hóa 0–100:

```text
Priority = 0.35 × MasterRelevance
         + 0.30 × KnowledgeGap
         + 0.20 × PrerequisiteUrgency
         + 0.15 × ForgettingRisk
```

- `MasterRelevance`: liên quan trực tiếp tới môn Bauman, project, NIR/Thesis.
- `KnowledgeGap`: mức thiếu hụt từ diagnostic, bài tập, project và phản hồi AI Mentor.
- `PrerequisiteUrgency`: số node đang bị chặn và khoảng thời gian tới khi cần dùng.
- `ForgettingRisk`: suy giảm mastery theo thời gian và kết quả kiểm tra lưu giữ.

Quy tắc override:

- Prerequisite của môn bắt đầu trong ≤4 tuần và đang `Gap` → **Critical**, bất kể tổng điểm.
- Năng lực HUTECH đã xác nhận ≥80%, retention ≥75% → chuyển sang **Review-on-demand**, không xếp học lại toàn khóa.
- Mỗi bài kỹ thuật được chọn trong GĐ2/GĐ3 → tự sinh một `Russian twin lesson` về thuật ngữ, câu giảng và cách trình bày.
- Không mở ML L2 nếu Python L2 và Toán xác suất–thống kê chưa đạt prerequisite.

---

# BƯỚC 70 — SYLLABUS CHI TIẾT KHO 01–05

> Quy ước thẻ chương: **Bài** liệt kê các lesson phải tạo. Các trường LT/BT/UD/MP/KT/PJ/MR là gói bắt buộc áp dụng cho từng lesson trong chương; khi đưa vào JSON, chúng được tách thành trường của từng lesson, không lưu thành mô tả chung mơ hồ.

## 01 — TIẾNG NGA

### R0 — Âm thanh, chữ viết và lớp học

#### RU-R0-C01 — Chữ, âm và nhịp tiếng Nga

- **Bài:** L01 bảng chữ cái và chữ viết; L02 trọng âm, nguyên âm giảm âm; L03 phụ âm cứng/mềm, hữu thanh/vô thanh; L04 số, ký hiệu toán và cách đọc công thức đơn giản.
- **Prerequisite:** không.
- **LT:** quan hệ chữ–âm; trọng âm từ; quy tắc đọc trọng yếu; ký hiệu khoa học.
- **BT:** nhận diện âm, chép chính tả ngắn, ghép chữ–âm, đọc 20 cụm kỹ thuật.
- **UD:** đọc tên phòng, thiết bị, biến số, đơn vị đo và nhãn trong giáo trình.
- **MP/Lab:** ghi âm–phát lại–so sánh; shadowing theo tốc độ 0.75×/1×; đánh dấu phổ lỗi.
- **KT:** đọc 30 từ mới; ≥90% chữ đúng, ≥75% phát âm/rhythm theo rubric.
- **PJ:** video 2 phút tự giới thiệu và đọc một đoạn công thức/ký hiệu.
- **MR:** đọc được một đoạn chưa gặp, không sai làm đổi nghĩa; tự nhận ra lỗi trọng âm chính.

#### RU-R0-C02 — Giao tiếp sinh hoạt và ngôn ngữ lớp học

- **Bài:** L01 chào hỏi–thông tin cá nhân; L02 thời gian–địa điểm–mua sắm; L03 yêu cầu giảng viên nhắc lại/giải thích; L04 chỉ dẫn, lịch học và thủ tục cơ bản.
- **Prerequisite:** RU-R0-C01-L01–L03.
- **LT:** mẫu câu hỏi–đáp; giống/số cơ bản; đại từ; hiện tại; phủ định.
- **BT:** 12 tình huống chọn phản hồi, 8 bài đổi vai, 4 bài nghe điền thông tin.
- **UD:** hỏi lịch, phòng học, deadline, tài liệu và yêu cầu hỗ trợ.
- **MP/Lab:** hội thoại phân nhánh với trợ lý ảo; chỉ qua lượt khi phát âm đạt ngưỡng.
- **KT:** hội thoại 5 phút, nghe hiểu thông tin chính ≥80%.
- **PJ:** “Một ngày học tại Nga” gồm audio, transcript và từ mới.
- **MR:** xử lý độc lập các tình huống học tập cơ bản, biết hỏi lại khi chưa hiểu.

### R1 — A1/A2 có hệ thống

#### RU-R1-C03 — Danh từ, tính từ và sáu cách

- **Bài:** L01 cách 1–4; L02 cách 5–6; L03 tính từ–đại từ hòa hợp; L04 giới từ và mẫu câu khoa học cơ bản.
- **Prerequisite:** RU-R0-C02.
- **LT:** chức năng nghĩa của sáu cách, không học bảng đuôi rời ngữ cảnh.
- **BT:** biến đổi câu, điền đuôi, sửa lỗi và mô tả quan hệ giữa các đại lượng.
- **UD:** đọc câu định nghĩa, điều kiện, phương tiện, vị trí và nguyên nhân.
- **MP/Lab:** mind map trường hợp–ý nghĩa–giới từ–ví dụ; bộ sinh câu theo chuyên môn.
- **KT:** 40 câu hỗn hợp + nói 3 phút; tổng ≥80%, không nhầm chủ thể/đối tượng.
- **PJ:** glossary 60 thuật ngữ có câu ví dụ đúng cách.
- **MR:** dùng sáu cách để hiểu và tạo câu kỹ thuật ngắn mà không dịch từng từ.

#### RU-R1-C04 — Động từ, thể và chuyển động

- **Bài:** L01 chia động từ và quá khứ/tương lai; L02 thể hoàn thành/chưa hoàn thành; L03 động từ chuyển động; L04 mệnh lệnh, điều kiện và mục đích.
- **Prerequisite:** RU-R1-C03-L01–L03.
- **LT:** thời–thể–ý định; tiền tố chuyển động; cấu trúc hướng dẫn thao tác.
- **BT:** chọn thể, kể quy trình, mô tả chuỗi sự kiện, sửa lỗi nghĩa.
- **UD:** mô tả thuật toán, thí nghiệm, tín hiệu đi qua hệ thống và robot di chuyển.
- **MP/Lab:** timeline tương tác; thay đổi thể động từ để quan sát thay đổi ý nghĩa.
- **KT:** nghe/đọc quy trình rồi tái tạo ≥80% bước đúng.
- **PJ:** thuyết minh video 3–4 phút về một quy trình kỹ thuật.
- **MR:** kể và viết được quy trình có thứ tự, kết quả và điều kiện rõ ràng.

### R2 — B1 và tiếng Nga kỹ thuật

#### RU-R2-C05 — Nghe bài giảng và ghi chú

- **Bài:** L01 signposting của bài giảng; L02 viết tắt và ghi chú công thức; L03 nhận diện định nghĩa–ví dụ–kết luận; L04 hỏi đáp sau bài giảng.
- **Prerequisite:** RU-R1-C03–C04.
- **LT:** cấu trúc diễn ngôn học thuật, từ nối, câu vô nhân xưng và bị động phổ biến.
- **BT:** nghe nhiều tốc độ, hoàn thành outline, đối chiếu transcript, phục dựng kết luận.
- **UD:** bài giảng Toán, Python, Database và ML đang học trong tuần.
- **MP/Lab:** trình phát chia đoạn; ẩn/hiện transcript; heatmap phần nghe sai.
- **KT:** ghi chú đúng ≥75% ý chính và ≥90% công thức/ký hiệu.
- **PJ:** bộ note song ngữ cho một bài giảng 10–15 phút.
- **MR:** nghe được mạch lập luận và đặt ít nhất hai câu hỏi đúng ngữ cảnh.

#### RU-R2-C06 — Thuật ngữ Toán, dữ liệu và hệ thống

- **Bài:** L01 Toán–xác suất–thống kê; L02 Python–thuật toán–database; L03 Linux–network–OS; L04 OR–ML–mô hình hóa.
- **Prerequisite:** RU-R2-C05; chapter chuyên môn tương ứng đang học.
- **LT:** word family, kết hợp từ, định nghĩa, so sánh, nguyên nhân–kết quả.
- **BT:** flashcard hai chiều, cloze trong câu giảng, chuyển định nghĩa Việt↔Nga.
- **UD:** glossary tự sinh từ lesson chuyên môn đang được Priority Engine chọn.
- **MP/Lab:** concept map liên kết thuật ngữ Nga ↔ node chuyên môn ↔ ví dụ/code/công thức.
- **KT:** dùng đúng ≥85% thuật ngữ trong đoạn giải thích 5 phút.
- **PJ:** ngân hàng thuật ngữ cá nhân có audio, ví dụ và nguồn bài học.
- **MR:** đọc/giải thích được thuật ngữ trong ngữ cảnh, không chỉ nhớ bản dịch.

### R3 — B1+/B2 học thuật

#### RU-R3-C07 — Đọc và viết học thuật

- **Bài:** L01 đọc lướt–tìm thông tin; L02 cấu trúc abstract/paper; L03 paraphrase và trích dẫn; L04 viết tóm tắt kỹ thuật.
- **Prerequisite:** RU-R2-C05–C06.
- **LT:** cấu trúc IMRaD, hedging, cohesion, khác biệt giữa dịch sát và diễn đạt khoa học.
- **BT:** annotation, xác định claim/evidence, sửa paraphrase, viết 150–300 từ.
- **UD:** tài liệu môn Bauman và paper gần đề tài UGV/USV.
- **MP/Lab:** reader song song với glossary, highlight claim–method–result–limitation.
- **KT:** tóm tắt paper giữ đúng claim và số liệu; rubric ≥80%.
- **PJ:** literature card tiếng Nga cho 5 tài liệu.
- **MR:** đọc paper có chiến lược, viết tóm tắt không bóp méo nội dung và trích dẫn đúng.

#### RU-R3-C08 — Seminar, phản biện và bảo vệ

- **Bài:** L01 trình bày 5–10 phút; L02 mô tả biểu đồ/công thức; L03 trả lời câu hỏi; L04 phản biện lịch sự và thừa nhận giới hạn.
- **Prerequisite:** RU-R3-C07; một project kỹ thuật hoàn chỉnh.
- **LT:** cấu trúc mở–thân–kết, ngôn ngữ chuyển ý, câu xử lý câu hỏi khó.
- **BT:** nói theo slide, giải thích cùng nội dung ở 30 giây/2 phút/8 phút.
- **UD:** bảo vệ project Python/DB/OR/ML.
- **MP/Lab:** mock defense ghi hình, câu hỏi ngẫu nhiên, tự chấm và AI rubric.
- **KT:** trình bày 8–10 phút + Q&A 5 phút, rubric ≥80%.
- **PJ:** mini-seminar kỹ thuật hoàn chỉnh bằng tiếng Nga.
- **MR:** truyền đạt được vấn đề–phương pháp–kết quả–giới hạn và xử lý câu hỏi không chuẩn bị trước.

### R4 — Russian Master Mode

#### RU-R4-C09 — Language pack theo môn Bauman hiện tại

- **Bài động:** thuật ngữ tuần; câu giảng; reading; speaking; viết bài tập/email cho từng môn thật.
- **Prerequisite:** syllabus môn đã nhập vào Kho 09.
- **LT:** sinh từ learning outcomes, bài đọc, deadline và lecture notes thật.
- **BT:** cloze, paraphrase, nghe–ghi chú và nói lại nội dung tuần.
- **UD:** xử lý đúng yêu cầu giao tiếp/đọc/viết của môn Bauman đang học.
- **MP/Lab:** lecture shadowing, oral rehearsal và glossary graph.
- **KT:** weekly oral/readiness check theo nội dung thật.
- **PJ:** readiness pack trước lớp 2–4 tuần.
- **MR:** hiểu yêu cầu môn, theo được bài giảng và giao tiếp học thuật đủ để hoàn thành nhiệm vụ.

#### RU-R4-C10 — Ngôn ngữ NIR/Thesis

- **Bài động:** email giảng viên; proposal; progress report; paper; defense.
- **Prerequisite:** Kho 10 đã có topic và research plan.
- **LT:** mẫu diễn đạt khoa học, claim có mức độ, mô tả method/result/limitation.
- **BT:** viết lại email/đoạn báo cáo, nói progress update và trả lời câu hỏi phản biện.
- **UD:** dùng trực tiếp trong họp NIR, seminar, paper và defense.
- **MP/Lab:** rehearsal họp NIR, seminar và defense; kiểm tra nhất quán giữa lời nói–slide–bản viết.
- **KT:** oral/writing check theo rubric của artifact hiện tại.
- **PJ:** proposal/paper/defense artifacts bằng tiếng Nga theo yêu cầu thực tế.
- **MR:** trao đổi được với giảng viên, viết tài liệu và bảo vệ mà không phụ thuộc dịch máy toàn phần.

## 02 — TOÁN AI & DATA

### Quy tắc bảo toàn baseline vật lý

- Toàn bộ ID vật lý, tiêu đề, UI và dữ liệu hiện có tại baseline commit phải giữ nguyên.
- Các tên dưới đây là **nhãn năng lực logic** cho Roadmap V2. Khi tích hợp phải dùng `legacyRefs`; không đổi tên/xóa/đánh số lại dữ liệu cũ chỉ để khớp tài liệu.
- `MATH-L2-C07` là node composite về covariance, correlation và PCA, ánh xạ tối thiểu tới `MATH-VN-PS-C05-L05`, `MATH-PREP-LA2-C10-L05`–`L07` và `MATH-PREP-PS2-C15-L06`.
- Không dùng nhãn bàn giao lịch sử `E15` làm Git ref, ID vật lý hoặc bằng chứng dữ liệu.
- Toán cũ nằm trong nhánh `Mathematics Foundation`; Priority Engine chỉ gọi lại node cần thiết.

### L0 — Mathematics Foundation, ôn theo chẩn đoán

#### MATH-L0-C01 — Đại số, hàm, lượng giác và số phức

- **Bài:** L01 biến đổi đại số/hàm; L02 lượng giác và vector phẳng; L03 số phức/Euler; L04 đơn vị, sai số và ước lượng bậc lớn.
- **Prerequisite:** diagnostic đầu vào.
- **LT:** các công cụ nền cần cho tín hiệu, điều khiển, xác suất và ML.
- **BT:** bài tính ngắn + bài phát hiện sai biến đổi.
- **UD:** tín hiệu điều hòa, pha, chuẩn hóa dữ liệu cảm biến.
- **MP:** đồ thị hàm/phức, thay tham số và dự đoán trước kết quả.
- **KT:** diagnostic thích ứng; node ≥80% được skip.
- **PJ:** notebook “math refresher” cá nhân chỉ chứa các Gap.
- **MR:** xử lý chính xác các biến đổi cần cho chapter đang bị chặn.

#### MATH-L0-C02 — Giải tích, ODE và toán điều khiển cần gọi lại

- **Bài:** L01 giới hạn/đạo hàm/tích phân; L02 chuỗi và xấp xỉ; L03 ODE cơ bản; L04 Laplace/state-space review theo nhu cầu.
- **Prerequisite:** MATH-L0-C01 hoặc Existing Competency xác nhận.
- **LT:** ôn có điều kiện các định nghĩa, công thức và liên hệ cần cho node đang bị chặn.
- **BT:** bài cầu nối chọn lọc, không học lại toàn bộ chương trình Control.
- **UD:** đáp ứng hệ, gradient, mô hình động.
- **MP:** nghiệm số so với nghiệm giải tích; thay tham số hệ.
- **KT:** bài cầu nối gắn trực tiếp với môn đang chặn.
- **PJ:** một mô hình động nhỏ có giải thích giả định.
- **MR:** tái hiện và dùng được công cụ toán mà không cần mở lại toàn khóa Control.

### L1 — Toán lõi cho AI và dữ liệu

#### MATH-L1-C03 — Đại số tuyến tính

- **Bài:** L01 vector/không gian con/cơ sở; L02 ma trận/hạng/nghịch đảo; L03 trị riêng–vector riêng; L04 SVD và least squares.
- **Prerequisite:** MATH-L0-C01.
- **LT:** hình học và đại số của biểu diễn dữ liệu.
- **BT:** tính tay nhỏ, chứng minh ngắn, bài ma trận bằng Python.
- **UD:** fit mô hình, giảm chiều, biến đổi tọa độ tín hiệu.
- **MP:** vector–projection–eigen–SVD tương tác.
- **KT:** 20 câu + 3 bài tự luận; ≥80%.
- **PJ:** least-squares estimator có so sánh nghiệm đóng và nghiệm số.
- **MR:** chọn và giải thích được công cụ tuyến tính cho bài toán mới.

#### MATH-L1-C04 — Giải tích nhiều biến và matrix calculus

- **Bài:** L01 đạo hàm riêng/gradient; L02 Jacobian/Hessian; L03 chain rule cho mô hình; L04 Taylor và tối ưu cục bộ.
- **Prerequisite:** MATH-L0-C02; MATH-L1-C03-L01–L02.
- **LT:** đạo hàm như ánh xạ tuyến tính, không chỉ học công thức.
- **BT:** đạo hàm tay, kiểm tra bằng finite differences/autodiff.
- **UD:** loss function, backpropagation, sensitivity.
- **MP:** mặt loss, contour, gradient field và bước học.
- **KT:** gradient check sai số tương đối trong ngưỡng + bài giải thích.
- **PJ:** visual optimizer lab.
- **MR:** tự suy ra gradient và phát hiện gradient sai bằng kiểm chứng số.

### L2 — Xác suất, thống kê và cấu trúc dữ liệu

#### MATH-L2-C05 — Xác suất và biến ngẫu nhiên

- **Bài:** L01 không gian mẫu/xác suất có điều kiện/Bayes; L02 biến ngẫu nhiên và phân phối; L03 kỳ vọng/phương sai; L04 luật số lớn/CLT.
- **Prerequisite:** MATH-L1-C03; giải tích cơ bản.
- **LT:** mô hình bất định, điều kiện độc lập và giả định phân phối.
- **BT:** bài tính, mô phỏng kiểm chứng, nhận diện dùng Bayes sai.
- **UD:** cảm biến nhiễu, phân loại, độ tin cậy hệ.
- **MP:** Monte Carlo cho LLN/CLT và posterior.
- **KT:** 20 câu + notebook; ≥80%.
- **PJ:** mô hình nhiễu cho một cảm biến.
- **MR:** lập được mô hình xác suất, nêu rõ giả định và kiểm tra bằng dữ liệu.

#### MATH-L2-C06 — Thống kê suy luận

- **Bài:** L01 sampling/estimator/bias–variance; L02 confidence interval; L03 hypothesis testing/effect size; L04 regression diagnostics và bootstrap.
- **Prerequisite:** MATH-L2-C05; Python NumPy/Pandas.
- **LT:** suy luận từ mẫu, sai lầm loại I/II, statistical vs practical significance.
- **BT:** tính và diễn giải CI/test; phát hiện p-hacking/leakage.
- **UD:** so sánh thuật toán, thí nghiệm cảm biến và ML.
- **MP:** sampling distribution, power và bootstrap.
- **KT:** phân tích một dataset chưa gặp + oral explanation.
- **PJ:** báo cáo A/B hoặc so sánh hai phương pháp có uncertainty.
- **MR:** chọn phép kiểm định đúng và diễn giải không vượt quá bằng chứng.

#### MATH-L2-C07 — Covariance, correlation và PCA — LEGACY COMPOSITE

- **Bài:** ánh xạ các lesson legacy đã xác minh; năng lực tối thiểu gồm covariance, correlation, covariance matrix, eigen interpretation và PCA pipeline.
- **Prerequisite:** MATH-L1-C03; MATH-L2-C05–C06.
- **LT:** phân biệt liên hệ tuyến tính với nhân quả; centered data; covariance matrix; PCA như phép chiếu tối ưu.
- **BT:** tính tay dataset nhỏ; đọc ma trận; chọn số thành phần; giải thích sign/scale.
- **UD:** giảm chiều dữ liệu cảm biến, feature decorrelation và trực quan dữ liệu.
- **MP:** tạo simulation sidecar mới; thay scale/outlier/correlation và quan sát trục chính, không ghi đè legacy.
- **KT:** tạo test sidecar mới, có prerequisite audit và oral check; không tuyên bố tái sử dụng test khi nguồn thật chưa có.
- **PJ:** PCA report trên telemetry dataset.
- **MR:** giải thích được variance retained, giới hạn PCA và tránh dùng PCA gây leakage.

### L3 — Toán tích hợp cho Master

#### MATH-L3-C08 — Phương pháp số và độ ổn định

- **Bài:** L01 floating point/conditioning; L02 numerical linear algebra; L03 root finding/integration/ODE numeric; L04 reproducibility và error bounds.
- **Prerequisite:** MATH-L1-C03–C04; Python L2.
- **LT:** sai số làm tròn, điều kiện bài toán, hội tụ và ổn định.
- **BT:** so sánh thuật toán và đánh giá sai số.
- **UD:** solver cho mô hình hệ, PCA và optimization.
- **MP:** thay precision/step size/condition number.
- **KT:** chọn solver và bảo vệ lựa chọn trên bài mới.
- **PJ:** benchmark solver có error analysis.
- **MR:** không chỉ tạo kết quả số mà còn đánh giá độ tin cậy của kết quả.

#### MATH-L3-C09 — Nền toán cho tối ưu và information theory

- **Bài:** L01 convexity/constraint/KKT intuition; L02 entropy/cross-entropy/KL; L03 regularization; L04 bias–variance–capacity.
- **Prerequisite:** MATH-L1-C04; MATH-L2-C05.
- **LT:** cầu nối sang OR và ML; phần thuật toán tối ưu chi tiết thuộc Kho 07.
- **BT:** kiểm tra convexity, tính entropy/KL, phân tích regularization.
- **UD:** loss ML, model selection và resource allocation.
- **MP:** loss landscape, regularization path, distribution divergence.
- **KT:** concept + computation + case analysis.
- **PJ:** so sánh ba objective trên cùng dataset.
- **MR:** hiểu ý nghĩa toán của objective và hậu quả của lựa chọn loss/constraint.

#### MATH-L3-C10 — Chuỗi thời gian và quá trình ngẫu nhiên nền

- **Bài:** L01 stationarity/autocorrelation; L02 random process/spectral view; L03 estimation/filtering foundation; L04 uncertainty propagation.
- **Prerequisite:** MATH-L2-C05–C07; Existing Competency tín hiệu được chẩn đoán.
- **LT:** khái niệm cần cho telemetry, signal ML, Markov và simulation.
- **BT:** ACF, stationarity check, mô phỏng process.
- **UD:** dữ liệu cảm biến/UGV/USV theo thời gian.
- **MP:** white noise, random walk, AR process và propagation.
- **KT:** phân tích series mới, nêu giới hạn.
- **PJ:** signal dataset card + baseline stochastic model.
- **MR:** phân biệt được cấu trúc thời gian với mẫu IID và chọn cách đánh giá phù hợp.

## 03 — PYTHON & OOP

### L0–L1 — Nền lập trình và cấu trúc chương trình

#### PY-L0-C01 — Python căn bản có chẩn đoán

- **Bài:** L01 môi trường/REPL/types; L02 control flow; L03 function/scope; L04 collections và comprehension.
- **Prerequisite:** không.
- **LT:** data model cơ bản, mutability, function contract.
- **BT:** 30 bài nhỏ có hidden tests.
- **UD:** làm sạch telemetry và tính chỉ số cảm biến.
- **MP/Lab:** trace execution, memory/reference visualizer.
- **KT:** coding test 60 phút; node ≥80% được skip.
- **PJ:** CLI đọc file cảm biến và xuất summary.
- **MR:** viết được hàm đúng, rõ và xử lý edge case cơ bản.

#### PY-L1-C02 — File, lỗi, module và môi trường

- **Bài:** L01 text/CSV/JSON/path; L02 exception; L03 module/package/import; L04 venv/dependency/config.
- **Prerequisite:** PY-L0-C01.
- **LT:** resource lifecycle, error boundary, reproducible environment.
- **BT:** parser, validation, exception design, import debugging.
- **UD:** ingest log thiết bị và cấu hình thí nghiệm.
- **MP/Lab:** fault injection trên file hỏng/thiếu trường/encoding.
- **KT:** test tự động + giải thích failure modes.
- **PJ:** package ingest dữ liệu có logging và validation.
- **MR:** chương trình không chỉ chạy “happy path”, mà báo lỗi có kiểm soát và tái lập môi trường được.

#### PY-L1-C03 — OOP và thiết kế có kiểm thử

- **Bài:** L01 class/object/dataclass; L02 encapsulation/composition/inheritance; L03 protocol/ABC/dependency injection; L04 unit test/type hints/refactor.
- **Prerequisite:** PY-L1-C02.
- **LT:** responsibility, interface, composition over inheritance, testability.
- **BT:** refactor code thủ tục; thiết kế class; test doubles.
- **UD:** mô hình Sensor–Vehicle–Controller–Experiment.
- **MP/Lab:** object interaction trace và mutation testing nhỏ.
- **KT:** code review theo rubric + coverage có ý nghĩa.
- **PJ:** thư viện OOP mô phỏng hệ cảm biến/robot tối giản.
- **MR:** bảo vệ được thiết kế, test hành vi chính và thay implementation mà không phá interface.

### L2 — Scientific Python và dữ liệu

#### PY-L2-C04 — NumPy, vectorization và tính toán số

- **Bài:** L01 ndarray/shape/dtype; L02 indexing/broadcasting; L03 linear algebra/random; L04 vectorization/performance.
- **Prerequisite:** PY-L1-C02; MATH-L1-C03.
- **LT:** array programming và khác biệt với list.
- **BT:** chuyển loop sang vectorization, shape debugging.
- **UD:** signal windows, covariance/PCA, simulation.
- **MP/Lab:** benchmark memory/time và numerical error.
- **KT:** notebook ẩn test shape/value/performance.
- **PJ:** pipeline xử lý batch telemetry.
- **MR:** viết phép tính đúng shape, đủ ổn định và giải thích trade-off.

#### PY-L2-C05 — Pandas, visualization và data quality

- **Bài:** L01 DataFrame/index; L02 join/group/window/time series; L03 missing/outlier/schema; L04 Matplotlib/Seaborn và biểu đồ trung thực.
- **Prerequisite:** PY-L2-C04; DB-L1-C02 được khuyến nghị.
- **LT:** tidy data, provenance, visualization grammar.
- **BT:** cleaning, merge, aggregation, plot critique.
- **UD:** EDA log robot và thí nghiệm.
- **MP/Lab:** data-quality dashboard, thay quy tắc xử lý và quan sát hậu quả.
- **KT:** EDA dataset lạ, không leakage.
- **PJ:** report dữ liệu tái lập từ raw → clean → figure.
- **MR:** tạo được dataset sạch, giải thích mọi biến đổi và không che giấu uncertainty.

#### PY-L2-C06 — Kết nối Database, API và pipeline

- **Bài:** L01 DB-API/ORM boundary; L02 HTTP/REST/serialization; L03 ETL orchestration; L04 logging/config/secret hygiene.
- **Prerequisite:** PY-L1-C03; DB-L0-C01; DB-L1-C02–C03; SYS-L0-C01.
- **LT:** separation of concerns, idempotency và data contract.
- **BT:** query parameterized, retry, pagination, pipeline tests.
- **UD:** thu telemetry → lưu DB → truy vấn → báo cáo.
- **MP/Lab:** lỗi mạng, duplicate event và partial failure.
- **KT:** integration tests + failure explanation.
- **PJ:** mini information system cho dữ liệu thí nghiệm.
- **MR:** pipeline chạy lặp không nhân đôi dữ liệu, trace được lỗi và bảo vệ thông tin nhạy cảm.

### L3 — Python Master-ready

#### PY-L3-C07 — Hiệu năng, concurrency và maintainability

- **Bài:** L01 profiling/complexity; L02 iterator/generator; L03 threading/process/async; L04 lint/type/test/CI concepts.
- **Prerequisite:** PY-L2-C04–C06; ADS-L0-C01.
- **LT:** bottleneck, I/O-bound vs CPU-bound, race condition.
- **BT:** profiling, optimize with evidence, concurrency bug lab.
- **UD:** stream cảm biến và batch ML.
- **MP/Lab:** load test và fault injection.
- **KT:** cải thiện có benchmark, không tối ưu cảm tính.
- **PJ:** telemetry service chịu tải nhỏ.
- **MR:** tìm đúng bottleneck, chọn concurrency model phù hợp và giữ code kiểm thử được.

#### PY-L3-C08 — Packaging và capstone tái lập

- **Bài:** L01 project layout/pyproject; L02 CLI/config/docs; L03 reproducible experiment; L04 release/versioning/artifact.
- **Prerequisite:** PY-L3-C07; SYS-L0-C01; SYS-L1-C02.
- **LT:** package lifecycle và experiment provenance.
- **BT:** đóng gói, fresh-install test, rebuild result.
- **UD:** công cụ dùng lại cho Kho 07/08/10.
- **MP/Lab:** chạy trên clean environment/container.
- **KT:** người khác cài và tái tạo output theo README.
- **PJ:** capstone Python package hoàn chỉnh.
- **MR:** code có thể bàn giao, tái lập và mở rộng; không phụ thuộc máy cá nhân.

## 04 — ALGORITHMS & DATA STRUCTURES

### L0–L1 — Tư duy thuật toán và cấu trúc lõi

#### ADS-L0-C01 — Complexity, recursion và correctness

- **Bài:** L01 problem decomposition/invariant; L02 Big-O/Ω/Θ; L03 recursion/stack; L04 correctness và edge cases.
- **Prerequisite:** PY-L0-C01.
- **LT:** cost model, invariant và proof intuition.
- **BT:** trace, recurrence nhỏ, phân tích code.
- **UD:** ước lượng pipeline với dữ liệu lớn.
- **MP/Lab:** growth-rate visualizer và call tree.
- **KT:** phân tích unseen code ≥80%.
- **PJ:** benchmark báo cáo complexity thực nghiệm.
- **MR:** phân biệt được độ phức tạp lý thuyết với bottleneck thực tế.

#### ADS-L1-C02 — Sequence, stack, queue và linked structure

- **Bài:** L01 array/dynamic array; L02 linked list; L03 stack/deque/queue; L04 ring buffer.
- **Prerequisite:** ADS-L0-C01.
- **LT:** memory layout và operation trade-off.
- **BT:** tự cài đặt, hidden tests, chọn cấu trúc.
- **UD:** buffer sensor, undo, BFS frontier.
- **MP/Lab:** operation animation và memory access comparison.
- **KT:** implement + justify selection.
- **PJ:** bounded telemetry buffer.
- **MR:** chọn cấu trúc theo access/update/memory, không theo thói quen.

#### ADS-L1-C03 — Hashing, set, map và heap

- **Bài:** L01 hash table/collision; L02 set/map patterns; L03 heap/priority queue; L04 cache và top-k.
- **Prerequisite:** ADS-L1-C02.
- **LT:** expected vs worst-case, load factor, priority semantics.
- **BT:** implement simplified table/heap; solve top-k/dedup.
- **UD:** event indexing, scheduler và anomaly queue.
- **MP/Lab:** collision/load-factor simulator.
- **KT:** coding + complexity defense.
- **PJ:** priority event dispatcher.
- **MR:** đánh giá được collision, memory và ordering requirements.

### L2 — Tree, graph và algorithmic patterns

#### ADS-L2-C04 — Tree và indexing structures

- **Bài:** L01 binary tree traversal; L02 BST/balancing intuition; L03 trie; L04 B-tree/index concept.
- **Prerequisite:** ADS-L1-C02–C03.
- **LT:** hierarchy, ordering và search cost.
- **BT:** traversal/insert/search; compare structures.
- **UD:** filesystem, routing, autocomplete, DB index.
- **MP/Lab:** tree shape theo insertion order.
- **KT:** chọn/cài structure cho case mới.
- **PJ:** searchable technical glossary index.
- **MR:** nối được cấu trúc dữ liệu với hành vi index thực tế.

#### ADS-L2-C05 — Graph algorithms

- **Bài:** L01 representation/BFS/DFS; L02 shortest path; L03 MST/topological order; L04 state-space/search.
- **Prerequisite:** ADS-L1-C03.
- **LT:** graph model, invariant và complexity.
- **BT:** cài BFS/DFS/Dijkstra/toposort; test disconnected graph.
- **UD:** UGV path planning, network, prerequisite graph.
- **MP/Lab:** graph editor và algorithm trace.
- **KT:** model + algorithm + proof sketch.
- **PJ:** route planner có obstacle/cost.
- **MR:** biến bài toán thành graph đúng và chọn thuật toán theo giả định trọng số/cấu trúc.

#### ADS-L2-C06 — Sorting, searching, divide-and-conquer và greedy

- **Bài:** L01 binary search; L02 sorting families; L03 divide-and-conquer; L04 greedy và counterexample.
- **Prerequisite:** ADS-L0-C01; ADS-L1-C02.
- **LT:** invariant, stability, lower-bound intuition.
- **BT:** implement, benchmark, prove/counterexample.
- **UD:** log processing, scheduling và selection.
- **MP/Lab:** comparison/swap trace và adversarial input.
- **KT:** chọn strategy cho unseen case.
- **PJ:** benchmark suite nhiều phân phối dữ liệu.
- **MR:** lựa chọn dựa trên dữ liệu, stability, memory và worst-case.

### L3 — Optimization patterns và capstone

#### ADS-L3-C07 — Dynamic programming, backtracking và approximation

- **Bài:** L01 state/transition; L02 memoization/tabulation; L03 backtracking/pruning; L04 approximation/heuristic boundary.
- **Prerequisite:** ADS-L2-C05–C06.
- **LT:** optimal substructure, overlapping subproblems, search space.
- **BT:** classic problems + one novel formulation.
- **UD:** route/resource planning và sequence alignment.
- **MP/Lab:** state-table/search-tree visualizer.
- **KT:** tự xây recurrence và test.
- **PJ:** constrained route/resource planner.
- **MR:** nhận ra khi DP phù hợp, khi state explosion khiến cần OR/heuristic.

#### ADS-L3-C08 — Applied algorithm engineering

- **Bài:** L01 streaming/sliding window; L02 approximate data structures; L03 algorithm selection; L04 profiling and trade-off report.
- **Prerequisite:** ADS-L3-C07; PY-L3-C07.
- **LT:** latency, throughput, memory, accuracy trade-off.
- **BT:** streaming telemetry challenges.
- **UD:** online sensor analytics.
- **MP/Lab:** load generator và memory/latency plots.
- **KT:** design review + benchmark reproducible.
- **PJ:** streaming analytics component.
- **MR:** đưa ra quyết định thuật toán có số liệu và nêu giới hạn triển khai.

## 05 — DATABASE & INFORMATION SYSTEMS

### L0–L1 — Relational model và SQL

#### DB-L0-C01 — Mô hình quan hệ và SQL cơ bản

- **Bài:** L01 table/key/relationship; L02 SELECT/filter/sort; L03 NULL/type/constraint; L04 CRUD có kiểm soát.
- **Prerequisite:** không; Python cơ bản được khuyến nghị.
- **LT:** relational model, set/bag semantics, integrity.
- **BT:** 40 query nhỏ trên telemetry schema.
- **UD:** thiết bị–sensor–mission–measurement.
- **MP/Lab:** SQLite/PostgreSQL sandbox; quan sát constraint failure.
- **KT:** SQL practical ≥80%.
- **PJ:** database log thí nghiệm phiên bản 1.
- **MR:** truy vấn đúng và không làm hỏng integrity khi ghi dữ liệu.

#### DB-L1-C02 — Join, aggregate, subquery và window

- **Bài:** L01 joins; L02 group/aggregate; L03 subquery/CTE/set operations; L04 window functions.
- **Prerequisite:** DB-L0-C01.
- **LT:** row cardinality, join semantics, aggregation grain.
- **BT:** query từ đơn đến nhiều tầng; sửa duplicate sai.
- **UD:** KPI mission, rolling statistics và event sequence.
- **MP/Lab:** visual query result theo từng stage.
- **KT:** dataset lạ + explain expected row count.
- **PJ:** analytical SQL report.
- **MR:** viết query đúng grain và phát hiện join làm nhân bản dữ liệu.

#### DB-L1-C03 — Thiết kế schema và normalization

- **Bài:** L01 ER modeling; L02 functional dependency; L03 1NF–3NF/BCNF intuition; L04 denormalization có lý do.
- **Prerequisite:** DB-L0-C01; DB-L1-C02.
- **LT:** anomaly, dependency và domain rule.
- **BT:** chuyển yêu cầu → ERD → schema; normalize/decompose.
- **UD:** information system quản lý thí nghiệm/NIR.
- **MP/Lab:** schema sandbox với anomaly scenarios.
- **KT:** design defense và integrity tests.
- **PJ:** schema version 2 + data dictionary.
- **MR:** mô hình hóa đúng nghiệp vụ, nêu trade-off normalization/performance.

### L2 — Giao dịch, hiệu năng và dữ liệu tin cậy

#### DB-L2-C04 — Transaction và concurrency

- **Bài:** L01 ACID; L02 isolation/anomaly; L03 locking/MVCC/deadlock; L04 recovery/idempotency.
- **Prerequisite:** DB-L1-C03.
- **LT:** consistency boundary và concurrent histories.
- **BT:** predict anomaly, design transaction, retry safely.
- **UD:** concurrent sensor ingest và experiment metadata update.
- **MP/Lab:** hai session tạo dirty/non-repeatable/phantom/deadlock.
- **KT:** scenario diagnosis ≥80%.
- **PJ:** transactional ingest service.
- **MR:** chọn isolation theo invariant và xử lý retry không duplicate.

#### DB-L2-C05 — Index và query optimization

- **Bài:** L01 B-tree/hash index; L02 composite/covering index; L03 execution plan; L04 statistics/cost và anti-pattern.
- **Prerequisite:** DB-L1-C02; ADS-L2-C04.
- **LT:** access path, selectivity và cost.
- **BT:** đọc plan, đề xuất index, đo before/after.
- **UD:** truy vấn telemetry lớn theo device/time/mission.
- **MP/Lab:** scale dataset và quan sát plan đổi.
- **KT:** optimization report có benchmark.
- **PJ:** performance tuning dossier.
- **MR:** tối ưu dựa trên plan/số liệu, không tạo index tùy tiện.

#### DB-L2-C06 — ETL, data quality và provenance

- **Bài:** L01 ETL/ELT; L02 schema evolution; L03 quality rules/dedup; L04 lineage/metadata.
- **Prerequisite:** DB-L1-C03; PY-L2-C05–C06.
- **LT:** data contract, idempotency, provenance.
- **BT:** bad-data cases, migrations, reconciliation.
- **UD:** raw telemetry → curated dataset cho ML.
- **MP/Lab:** pipeline fault injection và replay.
- **KT:** data quality audit.
- **PJ:** versioned dataset build.
- **MR:** tái tạo được dataset và giải thích nguồn gốc từng trường quan trọng.

### L3 — Information Systems Master-ready

#### DB-L3-C07 — Kiến trúc hệ thống thông tin, API và bảo mật

- **Bài:** L01 service/repository boundary; L02 API/data contract; L03 access control/secret/audit; L04 backup/restore/migration.
- **Prerequisite:** DB-L2-C04–C06; PY-L2-C06; Linux L1.
- **LT:** availability, consistency, least privilege và recoverability.
- **BT:** threat cases, API schema, restore drill.
- **UD:** research information system.
- **MP/Lab:** service+DB sandbox, role permissions và failure recovery.
- **KT:** architecture review + restore evidence.
- **PJ:** capstone information system cho telemetry/thí nghiệm.
- **MR:** hệ thống đúng dữ liệu, truy vết được, phục hồi được và có quyền truy cập hợp lý.

#### DB-L3-C08 — Dữ liệu thời gian và analytical serving

- **Bài:** L01 time-series modeling; L02 partition/retention; L03 materialized view/aggregation; L04 serving features/report.
- **Prerequisite:** DB-L2-C05–C06; MATH-L3-C10.
- **LT:** event time, sampling, partition và aggregation correctness.
- **BT:** query/time-window/late event scenarios.
- **UD:** sensor platform và feature store nhỏ.
- **MP/Lab:** ingest/query under scale.
- **KT:** correctness + performance benchmark.
- **PJ:** telemetry analytical store.
- **MR:** phục vụ được dữ liệu time-series có định nghĩa thời gian và chất lượng rõ ràng.

---

# BƯỚC 71 — SYLLABUS CHI TIẾT KHO 06–10 VÀ DEPENDENCY GRAPH

## 06 — LINUX, OS & COMPUTER NETWORKS

### L0–L1 — Linux vận hành và nền OS

#### SYS-L0-C01 — Shell, file, text và Git workflow

- **Bài:** L01 filesystem/path/command; L02 pipe/redirection/text tools; L03 shell script; L04 Git branch/commit/diff.
- **Prerequisite:** không.
- **LT:** process model của command, stream và version history.
- **BT:** terminal challenges, script nhỏ, sửa conflict giả lập.
- **UD:** tự động hóa chạy thí nghiệm và quản lý code.
- **MP/Lab:** Linux sandbox; broken-command recovery.
- **KT:** terminal practical không dùng GUI.
- **PJ:** script dựng workspace và chạy pipeline.
- **MR:** tái tạo workflow bằng command/script và quản lý thay đổi an toàn.

#### SYS-L1-C02 — User, permission, process và service

- **Bài:** L01 user/group/permission; L02 process/signal/job; L03 service/log; L04 SSH/key và remote workflow.
- **Prerequisite:** SYS-L0-C01.
- **LT:** ownership, privilege, process lifecycle.
- **BT:** permission debugging, terminate safely, inspect logs.
- **UD:** chạy service/data job trên máy từ xa.
- **MP/Lab:** least-privilege sandbox và failed-service cases.
- **KT:** diagnose 6 incident scenarios.
- **PJ:** deploy một service dưới user riêng.
- **MR:** vận hành và khắc phục lỗi mà không dùng quyền cao quá mức.

#### SYS-L1-C03 — OS: CPU, memory, concurrency và filesystem

- **Bài:** L01 system call/process/thread; L02 scheduling/concurrency; L03 virtual memory; L04 filesystem/I/O.
- **Prerequisite:** SYS-L1-C02; ADS-L0-C01.
- **LT:** abstraction và resource trade-off.
- **BT:** trace process, race/deadlock, memory/I/O cases.
- **UD:** Python multiprocessing, database và ML workload.
- **MP/Lab:** process/memory/I/O monitor.
- **KT:** concept mapping + incident diagnosis.
- **PJ:** resource profile của một pipeline.
- **MR:** giải thích được hành vi performance/failure bằng mô hình OS, không chỉ thử lệnh ngẫu nhiên.

### L2 — Networks và systems lab

#### SYS-L2-C04 — Network fundamentals

- **Bài:** L01 layer/IP/subnet/routing; L02 TCP/UDP; L03 DNS/DHCP; L04 HTTP/TLS.
- **Prerequisite:** SYS-L0-C01.
- **LT:** packet path, reliability, latency và naming.
- **BT:** subnet, handshake, protocol selection.
- **UD:** sensor/robot–server communication.
- **MP/Lab:** packet capture và network emulator nhỏ.
- **KT:** trace request end-to-end.
- **PJ:** network map của hệ telemetry.
- **MR:** xác định được lớp phát sinh lỗi và chọn protocol phù hợp yêu cầu.

#### SYS-L2-C05 — Socket, API và distributed failure

- **Bài:** L01 socket client/server; L02 timeout/retry/idempotency; L03 serialization/framing; L04 clock/order/partial failure.
- **Prerequisite:** SYS-L2-C04; PY-L2-C06.
- **LT:** message boundary và failure model.
- **BT:** implement protocol nhỏ; fault handling.
- **UD:** stream telemetry qua mạng.
- **MP/Lab:** delay/loss/disconnect/duplicate injection.
- **KT:** integration test dưới lỗi mạng.
- **PJ:** resilient telemetry link.
- **MR:** hệ vẫn hành xử có kiểm soát khi mạng chậm, mất hoặc lặp gói.

#### SYS-L2-C06 — Chẩn đoán hệ thống và mạng

- **Bài:** L01 logs/metrics/traces; L02 CPU/memory/disk diagnosis; L03 network tools; L04 incident hypothesis/testing.
- **Prerequisite:** SYS-L1-C03; SYS-L2-C04–C05.
- **LT:** observability và evidence-driven debugging.
- **BT:** incident labs có tín hiệu nhiễu.
- **UD:** dịch vụ DB/ML/data pipeline.
- **MP/Lab:** injected incidents và timeline reconstruction.
- **KT:** time-boxed diagnosis report.
- **PJ:** runbook và dashboard cơ bản.
- **MR:** đưa ra nguyên nhân có bằng chứng, không đồng nhất triệu chứng với nguyên nhân.

### L3 — Deployment Master-ready

#### SYS-L3-C07 — Environment, container và build

- **Bài:** L01 package/env; L02 container/image/volume/network; L03 compose multi-service; L04 reproducible build.
- **Prerequisite:** SYS-L1-C02–C03; PY-L3-C08; DB-L2-C04.
- **LT:** isolation, dependency pinning và artifact.
- **BT:** Dockerfile/compose/debug build.
- **UD:** Python+DB+ML experiment stack.
- **MP/Lab:** clean-machine rebuild.
- **KT:** fresh build/run test.
- **PJ:** containerized research stack.
- **MR:** người khác dựng được cùng hệ từ repo và tài liệu.

#### SYS-L3-C08 — Monitoring, security và recovery

- **Bài:** L01 health/log/metric; L02 secret/firewall/update; L03 backup/restore; L04 deployment/rollback/runbook.
- **Prerequisite:** SYS-L3-C07; DB-L3-C07.
- **LT:** defense in depth, SLO intuition và recoverability.
- **BT:** threat/failure drills.
- **UD:** bảo vệ dữ liệu NIR và demo thesis.
- **MP/Lab:** outage/restore/rollback rehearsal.
- **KT:** operational review.
- **PJ:** production-like demo environment.
- **MR:** phát hiện, giới hạn, phục hồi sự cố và chứng minh được quy trình.

## 07 — OPERATIONS RESEARCH & SYSTEM MODELING

### L1 — Mô hình quyết định và tối ưu tuyến tính

#### OR-L1-C01 — Từ bài toán thực đến mô hình

- **Bài:** L01 decision variable/objective/constraint; L02 assumptions/units/boundary; L03 feasible region; L04 validation và sensitivity question.
- **Prerequisite:** MATH-L0-C01; Python L1.
- **LT:** modeling cycle và lỗi mô hình hóa phổ biến.
- **BT:** chuyển 12 tình huống thành mô hình.
- **UD:** phân bổ pin, lịch nhiệm vụ, đường đi và tài nguyên.
- **MP/Lab:** thay constraint và quan sát feasible set.
- **KT:** model formulation defense.
- **PJ:** model card cho bài toán UGV/USV.
- **MR:** mô hình phản ánh đúng quyết định, đơn vị, phạm vi và giả định.

#### OR-L1-C02 — Linear programming, duality và sensitivity

- **Bài:** L01 LP geometry/simplex intuition; L02 solver modeling; L03 dual/shadow price; L04 sensitivity/infeasible/unbounded.
- **Prerequisite:** OR-L1-C01; MATH-L1-C03.
- **LT:** optimality và ý nghĩa kinh tế/kỹ thuật của dual.
- **BT:** giải nhỏ bằng tay, lớn bằng solver, diagnose model.
- **UD:** resource allocation và mission planning.
- **MP/Lab:** LP geometry + parameter sweep.
- **KT:** unseen model + interpretation.
- **PJ:** optimized mission allocation.
- **MR:** không chỉ lấy nghiệm solver; giải thích được nghiệm, dual và độ nhạy.

### L2 — Discrete decisions, Markov và Queueing

#### OR-L2-C03 — Integer/combinatorial optimization

- **Bài:** L01 binary/integer variable; L02 assignment/scheduling; L03 routing formulation; L04 relaxation/bounds/heuristics.
- **Prerequisite:** OR-L1-C02; ADS-L2-C05; ADS-L3-C07.
- **LT:** integrality và complexity trade-off.
- **BT:** MIP formulations và solver logs.
- **UD:** nhiệm vụ nhiều robot và lịch tài nguyên.
- **MP/Lab:** gap/time-limit/heuristic comparison.
- **KT:** formulation + bound interpretation.
- **PJ:** constrained planner.
- **MR:** chọn formulation/solver/heuristic theo quy mô và yêu cầu optimality.

#### OR-L2-C04 — Dynamic programming và sequential decision

- **Bài:** L01 Bellman principle; L02 finite-horizon DP; L03 state/action/reward; L04 curse of dimensionality.
- **Prerequisite:** ADS-L3-C07; MATH-L2-C05.
- **LT:** quyết định theo thời gian và state sufficiency.
- **BT:** derive recursion, implement value table.
- **UD:** energy-aware navigation và maintenance policy.
- **MP/Lab:** state-transition simulator.
- **KT:** model a novel sequential problem.
- **PJ:** finite-horizon mission policy.
- **MR:** xác định đúng state và biết khi DP không còn khả thi.

#### OR-L2-C05 — Markov chains và MDP foundation

- **Bài:** L01 transition matrix/state classification; L02 stationary/absorbing; L03 reward and MDP; L04 policy evaluation/improvement intuition.
- **Prerequisite:** MATH-L2-C05; OR-L2-C04.
- **LT:** Markov assumption, long-run behavior và uncertainty.
- **BT:** matrix analysis + simulation.
- **UD:** reliability, robot mode và task policy.
- **MP/Lab:** chain/MDP visualizer.
- **KT:** validate Markov model against data.
- **PJ:** maintenance or navigation MDP.
- **MR:** kiểm tra được Markov assumption và giải thích policy/long-run metric.

#### OR-L2-C06 — Queueing systems

- **Bài:** L01 arrival/service/Little’s law; L02 M/M/1 và variants; L03 networks/capacity; L04 empirical fitting và limitation.
- **Prerequisite:** MATH-L2-C05–C06.
- **LT:** stochastic flow, utilization và waiting trade-off.
- **BT:** analytic calculation + scenario design.
- **UD:** processing sensor jobs, communication/service station.
- **MP/Lab:** queue simulator theo arrival/service distributions.
- **KT:** compare analytic vs simulation.
- **PJ:** capacity planning report.
- **MR:** không áp công thức M/M/1 khi giả định dữ liệu không phù hợp.

### L3 — Simulation và optimization integration

#### OR-L3-C07 — Discrete-event và Monte Carlo simulation

- **Bài:** L01 event/state/clock; L02 random input/seed; L03 warm-up/replication/CI; L04 verification/validation.
- **Prerequisite:** OR-L2-C05–C06; PY-L2; MATH-L2-C06.
- **LT:** simulation study lifecycle.
- **BT:** build/verify small simulator.
- **UD:** fleet/queue/reliability experiments.
- **MP/Lab:** full simulation lab, scenario manager.
- **KT:** reproducibility + statistical analysis.
- **PJ:** validated discrete-event model.
- **MR:** tách được verification khỏi validation và lượng hóa uncertainty.

#### OR-L3-C08 — Nonlinear, multi-objective và heuristic optimization

- **Bài:** L01 nonlinear/local optimum; L02 constrained methods; L03 Pareto/multi-objective; L04 metaheuristic và experiment discipline.
- **Prerequisite:** MATH-L1-C04; MATH-L3-C09; OR-L1-C02.
- **LT:** convergence, constraint và Pareto trade-off.
- **BT:** optimize benchmark, compare starts/methods.
- **UD:** energy–time–risk mission design.
- **MP/Lab:** landscape/Pareto frontier.
- **KT:** method selection + robustness evidence.
- **PJ:** multi-objective planner.
- **MR:** không tuyên bố “tối ưu” khi chỉ có một nghiệm heuristic chưa kiểm chứng.

#### OR-L3-C09 — System modeling capstone

- **Bài:** L01 system boundary/causal map; L02 hybrid model; L03 calibration/validation; L04 scenario/decision report.
- **Prerequisite:** OR-L3-C07–C08; Existing Competency Control/automation.
- **LT:** mô hình phục vụ quyết định, không phải mô hình càng phức tạp càng tốt.
- **BT:** model critique và calibration tasks.
- **UD:** UGV ưu tiên; có thể mở rộng USV.
- **MP/Lab:** end-to-end scenario simulator.
- **KT:** independent review + sensitivity/uncertainty.
- **PJ:** OR/System Modeling capstone.
- **MR:** mô hình, dữ liệu, solver và kết luận nhất quán; giới hạn được công khai.

## 08 — MACHINE LEARNING & RESEARCH

### L1 — ML foundation đúng phương pháp

#### ML-L1-C01 — Problem framing, split, leakage và metrics

- **Bài:** L01 task/target/baseline; L02 train/validation/test; L03 leakage; L04 metrics/cost/calibration.
- **Prerequisite:** PY-L2-C05; MATH-L2-C05–C06.
- **LT:** generalization và measurement of success.
- **BT:** identify bad splits/metrics, build baseline.
- **UD:** sensor classification/regression/anomaly.
- **MP/Lab:** thay split/preprocessing và quan sát optimistic bias.
- **KT:** audit một ML plan có lỗi.
- **PJ:** problem statement + baseline protocol.
- **MR:** định nghĩa được bài toán và đánh giá không leakage trước khi chọn model.

#### ML-L1-C02 — Linear và logistic models

- **Bài:** L01 linear regression; L02 regularization; L03 logistic/classification; L04 diagnostics/interpretation.
- **Prerequisite:** ML-L1-C01; MATH-L1-C03–C04; MATH-L3-C09-L02–L03 học just-in-time.
- **LT:** objective, assumption và decision boundary.
- **BT:** implement simplified model + library model.
- **UD:** calibration và sensor prediction.
- **MP/Lab:** coefficient/regularization/decision surface.
- **KT:** fit + diagnose unseen dataset.
- **PJ:** interpretable baseline report.
- **MR:** giải thích được hệ số, assumption, error và khi model không phù hợp.

#### ML-L1-C03 — Trees và ensembles

- **Bài:** L01 decision tree; L02 random forest/bagging; L03 boosting; L04 feature importance/overfit.
- **Prerequisite:** ML-L1-C01; ADS-L2-C04.
- **LT:** recursive partition, bias–variance và ensemble logic.
- **BT:** tune depth, compare models, inspect errors.
- **UD:** fault classification và tabular telemetry.
- **MP/Lab:** tree growth và ensemble variance.
- **KT:** model comparison with proper CV.
- **PJ:** robust tabular classifier.
- **MR:** chọn ensemble có căn cứ và không nhầm feature importance với causality.

### L2 — Unsupervised, temporal và neural foundation

#### ML-L2-C04 — Clustering, PCA và anomaly detection

- **Bài:** L01 distance/scaling; L02 k-means/hierarchical; L03 PCA pipeline; L04 anomaly methods/evaluation.
- **Prerequisite:** MATH-L2-C07; PY-L2-C04–C05.
- **LT:** geometry, cluster assumption và unsupervised evaluation.
- **BT:** scale/cluster/project/anomaly cases.
- **UD:** operating regimes và fault detection.
- **MP/Lab:** dùng mapping lesson PCA legacy làm nguồn lý thuyết; tạo simulation cluster/anomaly sidecar mới.
- **KT:** justify preprocessing, k/components/threshold.
- **PJ:** unsupervised telemetry analysis.
- **MR:** kết luận thận trọng khi không có ground truth và kiểm soát leakage.

#### ML-L2-C05 — Time-series và signal ML

- **Bài:** L01 temporal split/window; L02 feature extraction; L03 classical forecast/classification baseline; L04 drift và online evaluation.
- **Prerequisite:** MATH-L3-C10; Existing Competency signal; PY-L2.
- **LT:** autocorrelation, nonstationarity và temporal leakage.
- **BT:** windowing/features/backtest.
- **UD:** UGV/USV sensor and condition monitoring.
- **MP/Lab:** stream replay và drift injection.
- **KT:** time-aware experiment.
- **PJ:** temporal baseline pipeline.
- **MR:** đánh giá theo thời gian thật và phân biệt drift với random error.

#### ML-L2-C06 — Neural network foundation

- **Bài:** L01 perceptron/MLP; L02 backprop/optimization; L03 regularization/normalization; L04 CNN/RNN/Transformer orientation.
- **Prerequisite:** MATH-L1-C04; ML-L1-C02; PY-L2-C04.
- **LT:** representation, gradient training và capacity.
- **BT:** implement small network, gradient check, train/debug.
- **UD:** tín hiệu/ảnh/sequence tùy đề tài.
- **MP/Lab:** network playground và training diagnostics.
- **KT:** reproduce a small experiment.
- **PJ:** neural baseline with ablation.
- **MR:** debug được training và không dùng deep learning chỉ vì model phức tạp hơn.

### L3 — Model selection và Research Methods

#### ML-L3-C07 — Tuning, explainability, robustness và deployment boundary

- **Bài:** L01 CV/hyperparameter search; L02 calibration/uncertainty; L03 explainability/fairness/robustness; L04 inference cost/monitoring.
- **Prerequisite:** ML-L1-C02–C03; ML-L2-C04–C06.
- **LT:** selection bias, post-hoc explanation limits và distribution shift.
- **BT:** nested evaluation, calibration, stress test.
- **UD:** model trên robot/edge or research service.
- **MP/Lab:** corrupted/noisy/OOD data.
- **KT:** model card review.
- **PJ:** selected model + model card.
- **MR:** quyết định model dựa trên metric, uncertainty, robustness và resource constraint.

#### ML-L3-C08 — Research question, literature và experimental design

- **Bài:** L01 research question/contribution; L02 search/read/synthesize literature; L03 hypothesis/variables/control; L04 validity/ethics/data plan.
- **Prerequisite:** ML-L1-C01; RU-R3-C07 đang song hành.
- **LT:** research gap, falsifiability, internal/external validity.
- **BT:** critique papers, build evidence matrix, rewrite vague question.
- **UD:** định hướng UGV AI, mở rộng USV khi dữ liệu/phạm vi cho phép.
- **MP/Lab:** simulated experiment design review.
- **KT:** proposal defense.
- **PJ:** mini research proposal.
- **MR:** câu hỏi có thể kiểm chứng, đóng góp không phóng đại và thiết kế trả lời đúng câu hỏi.

#### ML-L3-C09 — Reproducible research và technical reporting

- **Bài:** L01 experiment tracking/version; L02 baseline/ablation/error analysis; L03 statistical reporting; L04 paper/poster/presentation.
- **Prerequisite:** ML-L3-C07–C08; PY-L3-C08; MATH-L2-C06.
- **LT:** provenance, comparison fairness và claim–evidence alignment.
- **BT:** reproduce, ablate, write result/limitation.
- **UD:** chuẩn bị NIR/Thesis.
- **MP/Lab:** clean-run reproduction và seeded rerun.
- **KT:** independent reproduction + oral defense.
- **PJ:** reproducible ML research package.
- **MR:** người khác tái tạo được kết quả chính và mọi claim đều có bằng chứng phù hợp.

## 09 — CURRENT BAUMAN SUBJECTS — MODULE ĐỘNG

Kho này không chứa danh sách môn giả định. Mỗi môn thật được nhập vào sẽ tạo một `Course Instance` có sáu chapter vận hành.

#### CUR-L4-C01 — Syllabus intake

- **Bài động:** learning outcomes; topics; assessment; readings; deadlines.
- **Prerequisite:** syllabus/tài liệu chính thức của môn.
- **LT:** cách đọc learning outcomes, rubric, assessment và lịch học.
- **BT:** phân tích yêu cầu và chuyển thành competency nodes.
- **UD:** tạo kế hoạch học từ syllabus thật.
- **MP/Lab:** timeline và workload simulation.
- **KT:** audit đối chiếu toàn bộ syllabus nguồn.
- **PJ:** syllabus digest một trang.
- **MR:** không bỏ sót outcome, bài đánh giá hoặc deadline trọng yếu.

#### CUR-L4-C02 — Prerequisite map và diagnostic

- **Bài động:** map tới Kho 01–08; diagnostic; gap bridge; Russian glossary.
- **Prerequisite:** CUR-L4-C01.
- **LT:** dependency reasoning và quy tắc mastery/prerequisite.
- **BT:** targeted diagnostic và phân loại lỗi.
- **UD:** chọn đúng bridge lesson từ Kho 01–08.
- **MP/Lab:** graph các node bị chặn và thử kịch bản deadline.
- **KT:** audit không bỏ sót prerequisite Critical.
- **PJ:** readiness report đỏ–vàng–xanh.
- **MR:** mọi prerequisite Critical có chủ sở hữu, deadline và đường xử lý.

#### CUR-L4-C03 — Preview 2–4 tuần

- **Bài động:** pre-read; concept preview; worked example; mini-lab; Russian twin lesson.
- **Prerequisite:** CUR-L4-C02.
- **LT:** concept và thuật ngữ lấy đúng từ tuần học sắp tới.
- **BT:** worked examples và bài tự giải cùng dạng nhưng khác dữ liệu.
- **UD:** liên hệ với assignment/lab dự kiến của môn.
- **MP/Lab:** mini-lab hoặc simulation của concept sắp học.
- **KT:** preview quiz.
- **PJ:** one-page concept map + Russian twin lesson.
- **MR:** vào lớp đã nhận diện được thuật ngữ, câu hỏi và bài toán lõi.

#### CUR-L4-C04 — Weekly co-pilot

- **Bài động:** lecture consolidation; assignment decomposition; misconception repair; office-hour questions.
- **Prerequisite:** tài liệu tuần thật.
- **LT:** giải thích lại concept và nối với prerequisite, không làm hộ bài đánh giá.
- **BT:** retrieval practice và bài tương tự độc lập.
- **UD:** áp dụng vào nhiệm vụ tuần với ranh giới hỗ trợ rõ ràng.
- **MP/Lab:** lab tương ứng môn.
- **KT:** weekly mastery check.
- **PJ:** evidence log và artifact tuần.
- **MR:** hiểu, tự làm và giải thích được sản phẩm tuần.

#### CUR-L4-C05 — Assessment readiness

- **Bài động:** exam blueprint; oral drill; project rubric; timed practice.
- **Prerequisite:** các tuần liên quan đã học.
- **LT:** tổng hợp concept theo blueprint đánh giá thật.
- **BT:** timed practice và oral drill.
- **UD:** giải một tình huống tích hợp gần dạng đánh giá nhưng không sao chép đề thật.
- **MP/Lab:** rehearsal lab/project under time limit.
- **KT:** mock exam/defense.
- **PJ:** error log và final readiness dossier.
- **MR:** ≥80% mock, không còn prerequisite Gap, giải thích được lỗi.

#### CUR-L4-C06 — Archive và chuyển giao sang NIR

- **Bài động:** concept map; reusable code/data; open questions; thesis relevance.
- **Prerequisite:** hoàn thành môn.
- **LT:** synthesis các khái niệm và quan hệ với Roadmap/NIR.
- **BT:** retrieval practice sau giãn cách.
- **UD:** chuyển kiến thức sang bài toán khác.
- **MP/Lab:** transfer test bằng lab/simulation mới.
- **KT:** retention và transfer check.
- **PJ:** course portfolio.
- **MR:** tài sản học tập có thể tìm lại, tái dùng và liên kết Kho 10.

## 10 — NIR/THESIS

### L1 — Định hướng và câu hỏi nghiên cứu

#### NIR-L1-C01 — Problem landscape và hướng đề tài

- **Bài:** L01 domain map; L02 stakeholder/problem; L03 data/resource constraint; L04 UGV-first, USV-extension decision.
- **Prerequisite:** Existing Competency automation/control; ML-L1-C01.
- **LT:** problem framing, scope và feasibility.
- **BT:** scope critique, constraint inventory.
- **UD:** chọn nhánh UGV AI ưu tiên; USV là mở rộng, không ép đồng thời.
- **MP/Lab:** scenario comparison theo data/time/compute/risk.
- **KT:** concept note defense.
- **PJ:** one-page research landscape.
- **MR:** vấn đề có giá trị, vừa phạm vi và có dữ liệu/khả năng thực hiện.

#### NIR-L1-C02 — Literature review và research gap

- **Bài:** L01 search strategy; L02 screening/quality; L03 evidence matrix; L04 synthesis/gap.
- **Prerequisite:** ML-L3-C08; RU-R3-C07.
- **LT:** systematic search vừa đủ, gap thật vs “chưa ai làm”.
- **BT:** inclusion/exclusion, claim extraction, synthesis.
- **UD:** literature UGV/USV/signal/automation/ML theo topic.
- **MP/Lab:** citation network và evidence map.
- **KT:** review protocol + spot audit.
- **PJ:** annotated bibliography và literature matrix.
- **MR:** gap được suy ra từ bằng chứng, nguồn có chất lượng và tìm kiếm có thể lặp.

#### NIR-L1-C03 — Research question, hypothesis và contribution

- **Bài:** L01 RQ; L02 hypothesis/metric; L03 novelty/contribution; L04 limitation/scope lock.
- **Prerequisite:** NIR-L1-C01–C02.
- **LT:** falsifiability và claim ladder.
- **BT:** rewrite question, map evidence needed.
- **UD:** topic thật.
- **MP/Lab:** adversarial reviewer questions.
- **KT:** proposal gate 1.
- **PJ:** RQ–hypothesis–contribution sheet.
- **MR:** mỗi claim có phép đo và thí nghiệm có thể bác bỏ nó.

### L2 — Method, data và thí nghiệm

#### NIR-L2-C04 — Methodology và experimental design

- **Bài:** L01 variables/control; L02 baseline; L03 sampling/split/power; L04 protocol và validity threats.
- **Prerequisite:** NIR-L1-C03; MATH-L2-C06; ML-L3-C08.
- **LT:** causal caution, fairness of comparison và validity.
- **BT:** experiment critique/design.
- **UD:** thí nghiệm mô phỏng hoặc thực tùy nguồn lực.
- **MP/Lab:** pilot experiment.
- **KT:** method review.
- **PJ:** preregistered-like experiment protocol.
- **MR:** protocol trả lời đúng RQ, baseline công bằng và metric phù hợp.

#### NIR-L2-C05 — Data, ethics, provenance và reproducibility

- **Bài:** L01 acquisition/consent/permission; L02 schema/quality; L03 version/lineage; L04 backup/security/release.
- **Prerequisite:** DB-L2-C06; SYS-L3-C08.
- **LT:** data governance cho nghiên cứu.
- **BT:** data risk/audit cases.
- **UD:** dataset thesis.
- **MP/Lab:** rebuild dataset from raw.
- **KT:** data audit.
- **PJ:** data management plan + dataset card.
- **MR:** dữ liệu hợp lệ, truy vết, bảo vệ và tái tạo được.

#### NIR-L2-C06 — Baseline, implementation và verification

- **Bài:** L01 reference baseline; L02 modular implementation; L03 unit/integration test; L04 simulation-to-real boundary.
- **Prerequisite:** PY-L3-C08; module kỹ thuật liên quan.
- **LT:** correctness before novelty.
- **BT:** reproduce baseline, failure test.
- **UD:** prototype thesis.
- **MP/Lab:** controlled simulation and regression suite.
- **KT:** baseline reproduction gate.
- **PJ:** verified baseline package.
- **MR:** baseline chạy đúng và sai khác với nguồn được giải thích.

### L3–L4 — Kết quả, viết và bảo vệ

#### NIR-L3-C07 — Analysis, ablation và error investigation

- **Bài:** L01 result table/uncertainty; L02 ablation; L03 error taxonomy; L04 sensitivity/robustness.
- **Prerequisite:** NIR-L2-C04–C06; MATH-L2-C06.
- **LT:** evidence strength và alternative explanations.
- **BT:** analysis audit và claim correction.
- **UD:** kết quả thật.
- **MP/Lab:** rerun across seeds/scenarios.
- **KT:** internal replication.
- **PJ:** results dossier.
- **MR:** claim không vượt dữ liệu, có uncertainty, ablation và failure cases.

#### NIR-L3-C08 — Viết báo cáo/paper và quản lý trích dẫn

- **Bài:** L01 outline/argument; L02 method/result; L03 discussion/limitation; L04 citation/figure/table/appendix.
- **Prerequisite:** NIR-L3-C07; RU-R3-C07.
- **LT:** claim–evidence flow và academic integrity.
- **BT:** rewrite, figure critique, citation audit.
- **UD:** NIR report/thesis/paper.
- **MP/Lab:** consistency checker giữa text–table–code output.
- **KT:** supervisor/reviewer rubric.
- **PJ:** complete draft.
- **MR:** bản viết rõ, kiểm chứng được, trích dẫn đúng và không che giới hạn.

#### NIR-L4-C09 — Seminar, defense và artifact handoff

- **Bài:** L01 slide/story; L02 demo; L03 Q&A/adversarial review; L04 archive/release/future work.
- **Prerequisite:** NIR-L3-C08; RU-R3-C08/R4-C10.
- **LT:** defense logic và reproducible handoff.
- **BT:** 1/3/10-minute explanation, mock Q&A.
- **UD:** seminar/NIR/thesis defense.
- **MP/Lab:** recorded defense and failure rehearsal.
- **KT:** mock committee.
- **PJ:** final thesis package: report, slides, code, data instructions, demo và archive.
- **MR:** bảo vệ được contribution/limitation và người khác tiếp tục công việc từ artifact bàn giao.

## Dependency graph chuẩn

1. **Tiếng Nga chạy song song**, không chặn kỹ thuật ở GĐ0 nhưng trở thành gate vận hành ở GĐ2–GĐ3.
2. **Python L1 + Database L1 + Math L1** là bộ ba khởi động cho khoảng trống mới.
3. **Python L2 + Math L2** mở ML L1 và OR mô phỏng.
4. **Algorithms L1–L2** hỗ trợ Python hiệu năng, Database index, Graph/UGV và ML hiểu cấu trúc.
5. **Linux L1–L2** mở các project tích hợp; Linux L3 mở reproduction/deployment.
6. **OR L1–L2** có thể học song hành ML L1; OR L3 và ML L2–L3 hội tụ ở capstone.
7. **Current Bauman Subjects** nhập prerequisite thật và override Priority Engine.
8. **NIR/Thesis** nhận artifact từ mọi kho, nhưng chỉ mở experiment chính sau khi RQ, baseline và data plan qua gate.

## Ánh xạ Roadmap theo giai đoạn

| Giai đoạn | Trục chính | Nội dung kỹ thuật ưu tiên | Nội dung trì hoãn có chủ đích |
|---|---|---|---|
| GĐ0 — hiện tại → trước dự bị | Nga R0–R1 song hành | Python L0–L1; DB L0–L1; diagnostic Toán; Linux C01 | Chưa học sâu OR/ML; Algorithms chỉ mở khi Python nền ổn |
| GĐ1 — khóa dự bị Nga | Russian-dominant | Duy trì 2–3 phiên/tuần luân phiên Python/SQL/Toán; tạo Russian twin lesson | Không chạy nhiều capstone đồng thời; không ép hoàn tất toàn kho kỹ thuật |
| GĐ2 — Pre-Master Acceleration | Hoàn thiện prerequisite graph | Math L1–L3; Python L2–L3; ADS; DB; Linux; OR; ML L1–L3 | Existing Competency chỉ ôn theo Gap |
| GĐ3 — Master Mode | Môn Bauman thật + NIR/Thesis | Preview 2–4 tuần; bridge prerequisite; project/research artifact; tiếng Nga kỹ thuật | Không học syllabus tĩnh không liên quan môn hiện tại |

---

# BƯỚC 72 — TÁI SỬ DỤNG, TẠO MỚI VÀ KẾ HOẠCH TÍCH HỢP KHÔNG PHÁ BASELINE

## 1. Ma trận tái sử dụng nội dung

| Thành phần repo cũ | Quyết định | Dùng cho Roadmap V2 | Phần phải bổ sung |
|---|---|---|---|
| Main: thẻ môn, Trang chủ/Kho môn học, Vào học, chỉnh sửa, lịch, AI Mentor | **Tái sử dụng và thích nghi** | Shell chung cho 10 kho môn | Mode GĐ0–GĐ3, Priority Engine, trạng thái 6 mức, dependency view |
| Hệ dữ liệu JSON/HTML, Add/Remove/Replace, cây thư mục và ánh xạ dữ liệu | **Tái sử dụng** | Import/export syllabus và artifact | Schema `level/chapter/lesson/prerequisites/mastery/evidence`; migration adapter |
| UI bài học Lý thuyết–Bài tập–Mô phỏng–Kiểm tra/Ôn tập–Vấn đáp/Ứng dụng | **Tái sử dụng theo loại môn** | Template cho Toán, Python, ADS, DB, OS, OR, ML | Terminal lab, code runner contract, SQL lab, simulation study, research review |
| Quiz 20 câu, flag số, giải thích đúng/sai, khóa cấp | **Tái sử dụng và nâng gate** | Kiểm tra bài/chương | Diagnostic adaptive, retention check, prerequisite-critical errors, project rubric |
| Toán legacy: 347 lesson + 18 theory overlay + runtime đã fingerprint | **BẢO TOÀN NGUYÊN TRẠNG** | Mathematics Foundation và Math for Bauman AI; composite C07 cung cấp nền PCA cho ML | Metadata Roadmap V2; formula/exercise/simulation/test sidecar; content C08–C10; audit mapping, không rewrite legacy |
| Công thức, render và mô phỏng Toán cũ | **Tái sử dụng** | Math/OR/ML | Simulation mới cho numerical methods, probability, queueing, optimization, ML |
| Tiếng Nga: vocabulary, grammar, nghe nói, video, luyện chữ, test | **Tái sử dụng** | RU-R0 đến RU-R2 | Liên kết thuật ngữ theo lesson chuyên môn; academic reading/writing; lecture note |
| Deep Speaking/Đối thoại | **Tái sử dụng** | Speaking lab, mock dialogue và oral drill | Seminar/Q&A/defense rubric; current-subject language pack |
| Lịch trình và Eisenhower | **Tái sử dụng có sửa logic** | Scheduler | phase weight, prerequisite deadline, forgetting risk, 2–4 week preview |
| Control/automation content cũ | **Không xóa; chuyển Existing Competency** | Bridge theo yêu cầu môn/project | Diagnostic và mapping prerequisite; không tạo một khóa học lại toàn bộ |

## 2. Nội dung phải tạo mới

### Tạo mới hoàn toàn về học thuật

1. Python & OOP: PY-C01–C08.
2. Algorithms & Data Structures: ADS-C01–C08.
3. Database & Information Systems: DB-C01–C08.
4. Linux, OS & Networks: SYS-C01–C08.
5. Operations Research & System Modeling: OR-C01–C09.
6. Machine Learning & Research: ML-C01–C09, trừ phần nền PCA lấy từ các legacy lesson đã ánh xạ.
7. Current Bauman Subjects: quy trình nhập syllabus, diagnostic, preview, weekly co-pilot, archive.
8. NIR/Thesis: NIR-C01–C09 và toàn bộ research artifact/rubric.

### Tạo mới một phần

- Toán: C08–C10; metadata prerequisite/evidence; audit logic; project và Russian twin lesson.
- Tiếng Nga: RU-R2-C05/C06, R3, R4; glossary động; seminar/defense; NIR language pack.
- Main: Priority Engine, Master Mode, dependency graph, readiness dashboard và schema migration.

## 3. Schema mở rộng tối thiểu, không phá legacy

Các object cũ được giữ nguyên. Chỉ gắn thêm namespace `roadmapV2`; mọi ID cũ nằm trong `legacyId`.

```json
{
  "legacyId": "existing-id-unchanged",
  "roadmapV2": {
    "courseId": "02-math-ai-data",
    "levelId": "L2",
    "chapterId": "MATH-L2-C07",
    "lessonId": "legacy-or-new-lesson-id",
    "prerequisites": ["MATH-L1-C03", "MATH-L2-C05"],
    "competencySource": "existing_competency|new_gap|bauman_current",
    "status": "chua_hoc|dang_hoc|dat_prerequisite|master_ready|can_on|gap",
    "mastery": {
      "knowledge": 0,
      "exercise": 0,
      "lab": 0,
      "retention": 0
    },
    "masterReadyEvidence": [],
    "linkedRussianLessonIds": [],
    "baumanSubjectInstanceIds": [],
    "version": 1
  }
}
```

Quy tắc migration:

1. Inventory read-only baseline commit và Git blob trước khi ánh xạ.
2. Không đổi/xóa ID, title, formula, exercise, simulation hoặc test đang chạy.
3. Tạo mapping table `legacyId → roadmapV2 node`.
4. Validate số lượng trước/sau; mọi record unmatched/ambiguous/cross-chapter phải được báo, không tự đoán.
5. Chỉ sau khi mapping PASS mới cho Priority Engine đọc dữ liệu.
6. Runtime/UI lõi giữ nguyên cho đến khi có test chứng minh cần patch.

## 4. Capstone xuyên môn đề xuất

**Chủ đề khung:** hệ dữ liệu và quyết định cho UGV; mở rộng USV khi phù hợp.

- Python: ingest/processing package.
- Algorithms: route/stream component.
- Database: telemetry information system.
- Linux/Networks: containerized data service.
- Math: uncertainty, PCA và time-series analysis.
- OR: mission/resource model và simulation.
- ML: baseline/model card/reproducible experiment.
- Russian: glossary, seminar và defense.
- NIR/Thesis: research question, evidence, report và artifact handoff.

Đây là một “sợi chỉ đỏ” để tái dùng sản phẩm, không ép tất cả môn thành một project khổng lồ. Mỗi checkpoint phải chạy độc lập trước khi tích hợp.

## 5. Tiêu chí nghiệm thu Lượt 18

- [x] Đủ 10 kho môn Roadmap V2.
- [x] Có hierarchy Level → Chapter → Lesson.
- [x] Mỗi chapter khai báo đầy đủ prerequisite, lý thuyết, bài tập, ứng dụng, mô phỏng/lab, kiểm tra, project và Master-ready.
- [x] Có cổng Master-ready chung và cổng riêng từng chapter.
- [x] Có dependency graph và ánh xạ GĐ0–GĐ3.
- [x] Existing Competency không bị biến thành một khóa phải học lại.
- [x] Tiếng Nga liên kết trực tiếp với bài kỹ thuật.
- [x] Current Bauman Subjects là module động theo dữ liệu thật.
- [x] Baseline commit, runtime, 347 lesson legacy và 18 theory overlay được khóa bảo toàn; các nguồn standalone rỗng được ghi đúng là Gap.
- [x] Phân định rõ tái sử dụng, thích nghi và tạo mới.

## 6. Điểm bắt đầu hợp lý của Lượt 19

Chuyển đặc tả này thành **Syllabus Registry + Prerequisite Graph + Migration Contract** ở dạng JSON/schema, dùng baseline inventory Bước 73 để tạo mapping chính xác. Chưa viết nội dung hàng loạt và chưa patch runtime trước khi registry/mapping được kiểm thử.
