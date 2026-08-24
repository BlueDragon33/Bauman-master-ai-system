# BAUMAN MASTER AI · ROADMAP V3

## ИУ-5 · 09.04.01/11

Mục tiêu duy nhất của roadmap này là chuẩn bị và đồng hành với chương trình Thạc sĩ tại кафедра ИУ-5, МГТУ им. Н.Э. Баумана.

Tên chương trình công khai 2026: **Искусственный интеллект в автоматизированных системах обработки информации и управления**.

Trong giao diện người học, mã chương trình được hiển thị thống nhất: **09.04.01/11**.

> Nguyên tắc: chỉ học kiến thức phục vụ trực tiếp cho việc vào học, theo học, làm НИР và bảo vệ ВКР tại ИУ-5. Kiến thức hỗ trợ chỉ mở khi prerequisite hoặc môn Bauman hiện tại yêu cầu.

---

## 1. Đích năng lực

Khi vào Master, người học cần đủ năng lực để:

1. đọc bài giảng và tài liệu kỹ thuật tiếng Nga;
2. lập trình Python/OOP và đọc được code dự án;
3. thiết kế phần mềm và mô hình hóa hệ thống bằng UML/architecture artifacts;
4. làm việc với SQL, relational DB, indexing/query plan và post-relational DB;
5. hiểu xác suất, thống kê, đại số tuyến tính và phân tích dữ liệu đa chiều;
6. triển khai pipeline Machine Learning và đánh giá mô hình đúng phương pháp;
7. hiểu mô hình ASOIU, độ tin cậy, lifecycle và kiến trúc hệ thống thông tin/điều khiển;
8. xử lý chuỗi thời gian và dữ liệu thực nghiệm;
9. đọc paper, xây baseline, thiết kế thí nghiệm và viết báo cáo nghiên cứu;
10. tích lũy НИР liên tục để đi thẳng tới ВКР thay vì dồn luận văn vào học kỳ cuối.

---

# 2. Kiến trúc Roadmap

Roadmap chia thành 5 pha và 10 kho học tập.

## Pha A · Russian Foundation

Mục tiêu: đủ năng lực sinh hoạt, dự bị và bước đầu nghe hiểu lớp học.

### Kho 1 · Tiếng Nga

- A0 → A1 → A2.
- phát âm, trọng âm, nghe chậm và shadowing;
- hội thoại lớp học, ký túc, giáo vụ, phòng thí nghiệm;
- đọc công thức, ký hiệu và câu mệnh lệnh trong bài giảng;
- từ vựng kỹ thuật CNTT, dữ liệu, AI, hệ thống;
- Russian Twin Lesson: mỗi khái niệm kỹ thuật quan trọng có tên Nga + nghĩa Việt + cách dùng trong lớp.

**Gate A:** nghe hiểu chỉ dẫn lớp học cơ bản, tự trình bày ngắn, đọc được đề bài kỹ thuật đơn giản.

---

## Pha B · Pre-Master Core

Mục tiêu: dựng đủ prerequisite trước khi các môn Master bắt đầu.

### Kho 2 · Toán cho AI & Data

#### B2.1 Đại số tuyến tính
- vector, matrix, rank, linear transformation;
- eigenvalue/eigenvector;
- orthogonality;
- SVD;
- least squares.

#### B2.2 Xác suất & thống kê
- random variables;
- common distributions;
- expectation/variance;
- conditional probability/Bayes;
- sampling;
- confidence intervals;
- hypothesis testing;
- correlation vs causality.

#### B2.3 Multivariate Data
- data matrix;
- centering/scaling;
- covariance/correlation matrix;
- PCA;
- explained variance;
- dimensionality reduction;
- leakage-safe preprocessing.

#### B2.4 Optimization essentials
- gradient;
- unconstrained/constrained optimization;
- convexity trực giác;
- loss functions;
- numerical optimization phục vụ ML và DB/system tuning.

**Gate B2:** giải được bài toán covariance/PCA, đọc được biểu thức ML cơ bản và giải thích được pipeline preprocessing.

### Kho 3 · Python & OOP

- Python syntax và data structures;
- functions/modules/packages;
- exceptions/logging;
- OOP: class, inheritance, composition, polymorphism;
- SOLID ở mức ứng dụng;
- design patterns nền;
- typing/dataclass;
- NumPy/Pandas;
- testing;
- Git;
- project structure;
- API/data pipeline cơ bản.

**Gate B3:** tự dựng một project có module, test, data pipeline và README tái lập được.

### Kho 4 · Algorithms & Data Structures

Chỉ học phần cần cho Master/software/ML:

- complexity;
- arrays/lists/stacks/queues;
- hash table;
- tree/graph;
- searching/sorting;
- recursion;
- graph traversal;
- practical algorithm selection.

Không biến kho này thành luyện competitive programming.

### Kho 5 · Database & Information Systems

- relational model;
- SQL CRUD + joins + subquery + CTE + window functions;
- normalization;
- schema design;
- transactions/ACID;
- indexing;
- execution/query plan;
- performance tuning;
- data warehouse/lake concepts;
- post-relational/NoSQL/document/key-value/graph concepts;
- database patterns cho ML pipelines.

**Gate B5:** thiết kế schema, viết truy vấn phân tích, đọc query plan và giải thích lựa chọn index.

### Kho 6 · Software Engineering & System Design

- requirements;
- UML/use case/class/sequence/component diagrams;
- architecture basics;
- OOP system design;
- testing strategy;
- versioning;
- CI concepts;
- lifecycle;
- documentation;
- project management fundamentals.

Kho này nối trực tiếp tới OOP design ASOIU, software development technologies và quản lý thiết kế hệ thống thông tin.

---

## Pha C · AI, ASOIU & Research Bridge

### Kho 7 · Machine Learning & Neural Systems

- supervised learning;
- regression/classification;
- metrics;
- cross-validation;
- feature engineering;
- regularization;
- trees/ensembles;
- clustering;
- dimensionality reduction;
- neural network fundamentals;
- training/validation/test discipline;
- experiment tracking;
- reproducibility.

**Gate C7:** hoàn thành một ML mini-project có baseline, metric, error analysis và báo cáo.

### Kho 8 · ASOIU, Reliability & Time Series

#### C8.1 Analytical models of ASOIU
- system/object/model;
- state, input, output;
- deterministic vs stochastic model;
- discrete-event concepts;
- simulation essentials;
- optimization in system models.

#### C8.2 Reliability
- reliability metrics;
- failure/repair models;
- series/parallel structures;
- Markov models chỉ học khi dùng cho reliability;
- availability/maintainability.

#### C8.3 Time Series
- stationarity;
- trend/seasonality;
- autocorrelation;
- smoothing;
- AR/MA/ARIMA concepts;
- forecasting metrics;
- anomaly detection;
- sensor/telemetry data.

#### C8.4 Lifecycle & ergonomics
- lifecycle processes;
- information display;
- human-system interaction;
- ergonomic analysis.

Các chủ đề Queueing/Markov/Simulation không còn là một khối bắt buộc riêng. Chúng được mở đúng lúc analytical model, reliability hoặc НИР cần đến.

### Kho 9 · Research Methodology

- research question;
- literature search;
- paper reading;
- citation management;
- baseline;
- hypothesis;
- dataset/experimental protocol;
- reproducibility;
- statistics for experiments;
- ablation/comparison;
- visualization;
- scientific writing;
- presentation/defense.

**Gate C9:** có mini research report tái lập được từ code + data + methodology.

---

# 3. Master Mode · bám trực tiếp curriculum ИУ-5 2026

Khi đã vào Master, hệ thống chuyển từ “học kho kiến thức” sang **Current Bauman Subjects**. Mỗi môn đang học tạo một dependency graph và đẩy prerequisite lên trước 2–4 tuần.

## Semester 1

1. Иностранный язык.
2. Методология научного познания.
3. Аналитические модели автоматизированных систем обработки информации и управления.
4. Многомерный анализ данных в системах искусственного интеллекта.
5. Объектно-ориентированное проектирование автоматизированных систем обработки информации и управления.
6. Оптимизация баз данных систем машинного обучения.
7. Технологии разработки программного обеспечения · phần học kỳ 1.
8. Научно-исследовательская работа · bắt đầu từ học kỳ 1.

### Ưu tiên trước Semester 1

`Russian technical → Linear Algebra → Statistics → Multivariate/PCA → Python/OOP → SQL/DB tuning → UML/Software Engineering → Analytical system models → Research methodology`.

## Semester 2

1. Иностранный язык.
2. Основы предпринимательства.
3. Методы машинного обучения в автоматизированных системах обработки информации и управления.
4. Модели надёжности АСОИУ.
5. Постреляционные базы данных.
6. Разработка нейросетевых систем.
7. Технологии разработки программного обеспечения · hoàn tất.
8. Проектно-технологическая практика.
9. Эксплуатационная практика.
10. Педагогическая практика.
11. НИР tiếp tục.

### Ưu tiên trước Semester 2

`ML core → neural fundamentals → reliability → stochastic/Markov bridge → NoSQL/post-relational DB → project/reproducibility discipline`.

## Semester 3

1. Анализ временных рядов.
2. Искусственный интеллект в задачах бизнес-аналитики.
3. Управление проектированием информационных систем.
4. НИР по обработке и анализу данных.
5. Эргономический анализ систем обработки и отображения информации.
6. Môn tự chọn #1: bảo vệ/an toàn thông tin ASOIU.
7. Педагогическая практика tiếp tục nếu lịch cá nhân yêu cầu.
8. НИР tiếp tục.

### Ưu tiên trước Semester 3

`Time Series → analytics pipeline → project management → information security basics → experimental analysis → scientific reporting`.

## Semester 4

1. Миварные технологии логического искусственного интеллекта.
2. Описание процессов жизненного цикла СТС.
3. Môn tự chọn #2: Big Data technologies hoặc multimedia-system development.
4. НИР hoàn thiện.
5. Преддипломная практика.
6. Подготовка и защита ВКР.

### Ưu tiên trước Semester 4

`knowledge representation/logical AI → lifecycle → elective bridge → thesis experiment closure → writing → defense rehearsal`.

---

# 4. Kho 10 · НИР → ВКР

НИР chạy song song toàn bộ Master.

## NIR-1 · Semester 1
- chốt vùng đề tài;
- literature map;
- research question;
- dataset/system source;
- baseline plan;
- repository nghiên cứu.

## NIR-2 · Semester 2
- baseline chạy được;
- experimental pipeline;
- metric/protocol;
- reliability/reproducibility check;
- báo cáo trung gian.

## NIR-3 · Semester 3
- phương pháp chính;
- comparative experiments;
- error analysis;
- figures/tables;
- draft paper/report.

## NIR-4 · Semester 4
- khóa experiment;
- kiểm định kết quả;
- hoàn thiện text;
- slide;
- mock defense;
- ВКР.

---

# 5. Các kho hỗ trợ chỉ mở khi cần

Các chủ đề sau không chiếm roadmap chính nếu chưa có dependency thật:

- Linux administration nâng cao;
- Operating Systems theory sâu;
- Computer Networks sâu;
- Queueing Theory;
- Markov chains nâng cao;
- Operations Research đầy đủ;
- cloud/devops nâng cao;
- embedded/industrial topics ngoài đề tài НИР.

Chúng được gắn trạng thái `support_on_demand` và chỉ xuất hiện trong lịch khi một môn Bauman, lab hoặc НИР yêu cầu.

---

# 6. Quy tắc Master-ready

Một module chỉ được coi là hoàn thành khi đủ cả 4 lớp:

1. **Understand**: giải thích được khái niệm bằng lời của mình.
2. **Solve**: làm được bài tập/quiz mà không nhìn đáp án.
3. **Build**: có lab/code/model/query/report tương ứng.
4. **Retain**: vượt review lại sau 1–3–7–14 ngày hoặc cơ chế spaced review tương đương.

Các môn có lab phải có artifact thực hành. Các môn nghiên cứu phải có evidence tái lập.

---

# 7. Quy tắc Priority Engine

Ưu tiên hằng ngày được tính theo thứ tự:

1. môn Bauman đang học hoặc sắp học;
2. prerequisite còn thiếu cho môn đó;
3. deadline/lab/assessment;
4. НИР/VКР;
5. Russian technical vocabulary liên quan đúng môn hiện tại;
6. review điểm yếu;
7. support-on-demand.

Không mở một kho chỉ vì “có trong roadmap”.

---

# 8. Quy tắc nội dung Web App

Mỗi lesson chuẩn dùng cùng mô hình:

`Lý thuyết → Ví dụ → Bài tập → Ứng dụng/Lab → Mô phỏng nếu phù hợp → Vấn đáp → Ôn tập → Kiểm tra → Mastery`.

Môn Toán tiếp tục giữ mô hình sâu hiện có. Chương covariance/correlation/PCA đã có nội dung, bài tập, mô phỏng và mastery nên được tái sử dụng thay vì viết lại.

---

# 9. Nguồn chuẩn curriculum

Roadmap V3 bám kế hoạch học công khai của ИУ-5 cho khóa bắt đầu năm 2026: hướng 09.04.01, chương trình AI trong ASOIU, thời gian 2 năm, 120 з.е., НИР xuyên semester 1–4 và ВКР semester 4.

Khi Bauman công bố curriculum/OPOP mới hơn cho đúng cohort, **Current Bauman Subjects** được phép cập nhật theo nguồn mới, nhưng prerequisite/content đã hoàn thành không bị xóa.

---

## Trạng thái

- Roadmap academic: **V3 baseline created**.
- Tiếp theo: chuyển manifest này vào runtime Web App, xây dependency graph machine-readable, lịch học thích nghi và offline content packs.
