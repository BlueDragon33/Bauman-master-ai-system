(function(global){
  'use strict';

  const DATA=global.BAUMAN_DATA;
  if(!DATA)throw new Error('BAUMAN_DATA must load before academic-data-v3.js');

  const VERSION='BAUMAN_IU5_090401_11_MAIN_RUNTIME_V3_1';
  const official=(id,stage,subject,name,ru,competencies=[])=>({
    id,stage,subject,type:'official',name,ru,
    hours:'theo lịch Bauman',assessment:'theo học phần',priority:'critical',confidence:'official-2026',
    officialSource:'ИУ-5 · учебный план 2026',competencies,
    routeRole:'Học phần chính khóa của lộ trình Bauman ИУ-5 · 09.04.01/11.'
  });
  const prep=(id,stage,subject,name,ru,hours,competencies=[])=>({
    id,stage,subject,type:stage==='preparatory'?'prep_core':'self_prep',name,ru,hours,
    assessment:'master-ready',priority:'critical',confidence:'roadmap-v3',competencies,
    routeRole:'Prerequisite phục vụ trực tiếp cho học phần ИУ-5.',
    deliverable:'Understand · Solve · Build · Retain'
  });

  DATA.schemaVersion='3.1.0';
  DATA.academicRuntime={
    version:VERSION,
    institution:'МГТУ им. Н.Э. Баумана',
    department:'ИУ-5',
    displayCode:'09.04.01/11',
    publicDirectionCode:'09.04.01',
    program:'Искусственный интеллект в автоматизированных системах обработки информации и управления',
    curriculumYear:2026,
    durationYears:2,
    credits:120,
    focus:'bauman-only',
    prerequisiteLeadWeeks:[2,4],
    masterReady:['understand','solve','build','retain'],
    supportMode:'on-demand'
  };

  DATA.stages=[
    {id:'prepare',group:'g1',name:'GĐ1 · Chuẩn bị trước dự bị',period:'Hiện tại → trước dự bị',load:'Tiếng Nga hằng ngày + 12–18 giờ kỹ thuật/tuần',goal:'Xây tiếng Nga nền và hoàn tất prerequisite trực tiếp cho ИУ-5: Toán AI/Data, Python/OOP, Database, Software Engineering, ML nền.',color:'blue'},
    {id:'preparatory',group:'g2',name:'GĐ2 · Dự bị tại Nga',period:'Giai đoạn dự bị',load:'Theo lịch dự bị + 6–10 giờ kỹ thuật/tuần',goal:'Ưu tiên tiếng Nga và khoa học nền; duy trì prerequisite kỹ thuật bằng thuật ngữ Nga để không đứt mạch trước Master.',color:'green'},
    {id:'bauman',group:'g3',name:'GĐ3 · Bauman Master · ИУ-5 · 09.04.01/11',period:'2 năm chính khóa',load:'Theo lịch trường + tự học prerequisite 2–4 tuần trước môn',goal:'Học đúng học phần ИУ-5, chạy НИР xuyên 4 học kỳ và hoàn thiện ВКР.',color:'purple'}
  ];

  DATA.semesters=[
    {id:'m1',name:'Bauman · Semester 1',period:'Học kỳ 1',focus:'Analytical models ASOIU, multivariate data, OOP design ASOIU, database optimization, software development và НИР.'},
    {id:'m2',name:'Bauman · Semester 2',period:'Học kỳ 2',focus:'Machine Learning trong ASOIU, reliability, post-relational database, neural systems, practices và НИР.'},
    {id:'m3',name:'Bauman · Semester 3',period:'Học kỳ 3',focus:'Time series, AI business analytics, information-system project management, data-analysis НИР, ergonomics và elective.'},
    {id:'m4',name:'Bauman · Semester 4',period:'Học kỳ 4',focus:'Logical AI/mivar, lifecycle processes, elective Big Data/Multimedia, pre-diploma practice, НИР và ВКР.'}
  ];

  DATA.subjects=[
    {id:'russian',icon:'Я',track:'language',name:'Tiếng Nga Bauman',desc:'Nga sinh hoạt, lớp học, kỹ thuật và học thuật phục vụ trực tiếp dự bị, học phần ИУ-5, НИР và bảo vệ.',main:'A0/A2 → Russian technical → academic Russian → Russian Twin Lesson.',stages:['prepare','preparatory','m1','m2','m3','m4'],eq:['Nga nền tảng','Nga dự bị/kỹ thuật','Nga học thuật & bảo vệ']},
    {id:'math',icon:'∑',track:'core',name:'Toán cho AI & Data',desc:'Đại số tuyến tính, xác suất–thống kê, dữ liệu đa chiều, PCA/SVD, tối ưu và nền tính toán số.',main:'Prerequisite trực tiếp cho multivariate analysis, ML, reliability và thực nghiệm.',stages:['prepare','preparatory','m1','m2','m3'],eq:['Linear algebra & probability','Multivariate/PCA','Statistics for experiments']},
    {id:'programming',icon:'</>',track:'core',name:'Python · OOP · Database · Software Engineering',desc:'Python, OOP, SQL, relational/post-relational DB, query optimization, testing, Git, architecture và software-development workflow.',main:'Trục lập trình và dữ liệu cho OOP ASOIU, DB Optimization for ML, Post-relational DB và Software Development Technologies.',stages:['prepare','preparatory','m1','m2','m3','m4'],eq:['Python/OOP/SQL','DB & software engineering','Big Data/Multimedia elective bridge']},
    {id:'ai',icon:'◎',track:'ai',name:'Machine Learning & Neural Systems',desc:'Supervised/unsupervised learning, metrics, feature engineering, neural networks, logical AI và reproducible experiments.',main:'Trục AI của chương trình ИУ-5.',stages:['prepare','m2','m3','m4'],eq:['ML foundation','ML in ASOIU & Neural Systems','AI analytics & logical AI']},
    {id:'systems',icon:'⚙',track:'system',name:'ASOIU · Reliability · Information Systems',desc:'Analytical models, architecture, reliability, lifecycle, ergonomics và project management của hệ thống xử lý thông tin và điều khiển.',main:'Trục hệ thống của ИУ-5, nối AI/data với automated information & control systems.',stages:['prepare','m1','m2','m3','m4'],eq:['ASOIU foundation','Analytical models & reliability','Lifecycle/ergonomics/project management']},
    {id:'signal',icon:'≈',track:'data',name:'Multivariate Data · Time Series',desc:'Phân tích dữ liệu nhiều chiều, chuỗi thời gian, forecasting, anomaly detection và xử lý dữ liệu thực nghiệm.',main:'Phục vụ Multivariate Data Analysis, Time Series và НИР xử lý dữ liệu.',stages:['prepare','m1','m3','m4'],eq:['Data analysis foundation','Multivariate analysis','Time series & experimental data']},
    {id:'research',icon:'✦',track:'research',name:'Research · НИР · ВКР',desc:'Research question, literature review, baseline, experimental protocol, scientific writing, practices, НИР và ВКР.',main:'Chạy xuyên toàn bộ Master thay vì chờ tới cuối khóa.',stages:['prepare','preparatory','m1','m2','m3','m4'],eq:['Research foundation','НИР 1–4','Pre-defense & ВКР']},
    {id:'foundation',icon:'▦',track:'foundation',name:'Dự bị & kỹ năng học tại Nga',desc:'Khoa học nền, thuật ngữ lớp học, kỹ năng đọc đề, seminar và thích nghi môi trường học bằng tiếng Nga.',main:'Chỉ phục vụ giai đoạn dự bị và chuyển tiếp vào Master.',stages:['preparatory'],eq:['Khoa học nền','Thuật ngữ Nga','Study skills']}
  ];

  DATA.courses=[
    prep('pre-ru-1','prepare','russian','Tiếng Nga A0–A2: nghe, nói, lớp học và sinh hoạt','Русский язык A0–A2','hằng ngày',['Nghe hiểu chỉ dẫn lớp học','Phản xạ hỏi–đáp','Đọc Cyrillic chắc']),
    prep('pre-ru-2','prepare','russian','Tiếng Nga kỹ thuật & học thuật cho ИУ-5','Технический и академический русский язык','4–6h/tuần',['Thuật ngữ AI/Data/АСОИУ','Đọc đề và tài liệu','Trình bày ngắn bằng tiếng Nga']),
    prep('pre-math-1','prepare','math','Đại số tuyến tính cho AI & dữ liệu','Линейная алгебра для ИИ и анализа данных','4–5h/tuần',['Vector/matrix','Eigen/SVD','Least squares']),
    prep('pre-math-2','prepare','math','Xác suất, thống kê và dữ liệu đa chiều','Теория вероятностей, статистика и многомерный анализ','4–5h/tuần',['Probability','Estimation/testing','Covariance/PCA']),
    prep('pre-code-1','prepare','programming','Python, NumPy/Pandas và Git','Python, NumPy/Pandas и Git','4–6h/tuần',['Python core','NumPy/Pandas','Git/reproducibility']),
    prep('pre-code-2','prepare','programming','OOP, testing và software architecture','ООП, тестирование и архитектура ПО','4–6h/tuần',['OOP/SOLID','Testing','UML/architecture']),
    prep('pre-db-1','prepare','programming','SQL, relational DB và query optimization','SQL, реляционные БД и оптимизация запросов','4–5h/tuần',['SQL','Normalization/transactions','Index/query plan']),
    prep('pre-ads-1','prepare','programming','Algorithms & Data Structures đủ dùng cho Master','Алгоритмы и структуры данных','2–3h/tuần',['Complexity','Hash/tree/graph','Search/sort']),
    prep('pre-ai-1','prepare','ai','Machine Learning foundation: baseline, metrics, validation','Основы машинного обучения','3–4h/tuần',['Supervised/unsupervised','Metrics/CV','Feature engineering']),
    prep('pre-sys-1','prepare','systems','ASOIU foundation: system, model, architecture, reliability','Основы АСОИУ','2–3h/tuần',['System/model','Architecture','Reliability vocabulary']),
    prep('pre-data-1','prepare','signal','Time-series & experimental-data foundation','Основы анализа временных рядов и экспериментальных данных','2–3h/tuần',['Time-series basics','Forecasting basics','Anomaly basics']),
    prep('pre-res-1','prepare','research','Research foundation: paper → question → baseline → experiment','Основы научно-исследовательской работы','2–3h/tuần',['Literature review','Research question','Experimental protocol']),

    prep('prep-ru','preparatory','russian','Tiếng Nga dự bị và lớp học kỹ thuật','Русский язык подготовительного факультета','theo lịch dự bị',['Nghe giảng','Đọc đề','Hỏi/đáp trong lớp']),
    prep('prep-foundation','preparatory','foundation','Khoa học nền và kỹ năng học bằng tiếng Nga','Фундаментальная подготовка и учебные навыки','theo lịch dự bị',['Thuật ngữ khoa học','Đọc công thức bằng Nga','Seminar/study skills']),
    prep('prep-tech-ru','preparatory','russian','Russian Twin Lesson cho Toán, Python, DB và AI','Русский язык для технических дисциплин','3–4h/tuần',['Từ khóa môn học','Mẫu câu giải thích','Tóm tắt bài bằng tiếng Nga']),
    prep('prep-tech-maintain','preparatory','programming','Duy trì Python/OOP/SQL trong thời gian dự bị','Поддержание Python, ООП и SQL','2–3h/tuần',['Code fluency','SQL fluency','Technical vocabulary']),
    prep('prep-math-maintain','preparatory','math','Duy trì Toán AI/Data bằng thuật ngữ Nga','Математика для ИИ на русском языке','2–3h/tuần',['Linear algebra Russian','Probability Russian','Data-analysis vocabulary']),

    official('m1-foreign','m1','russian','Ngoại ngữ','Иностранный язык',['Academic Russian','Technical communication']),
    official('m1-methodology','m1','research','Phương pháp luận nhận thức khoa học','Методология научного познания',['Scientific methodology','Research reasoning']),
    official('m1-analytical-models','m1','systems','Mô hình phân tích của ASOIU','Аналитические модели автоматизированных систем обработки информации и управления',['Analytical modeling','ASOIU reasoning']),
    official('m1-multivariate','m1','math','Phân tích dữ liệu đa chiều trong hệ AI','Многомерный анализ данных в системах искусственного интеллекта',['Multivariate statistics','PCA/SVD','Data interpretation']),
    official('m1-oop-asoiu','m1','programming','Thiết kế hướng đối tượng ASOIU','Объектно-ориентированное проектирование АСОИУ',['OOP design','UML','Architecture']),
    official('m1-db-opt','m1','programming','Tối ưu cơ sở dữ liệu của hệ Machine Learning','Оптимизация баз данных систем машинного обучения',['Indexing','Query plan','ML data architecture']),
    official('m1-softdev','m1','programming','Công nghệ phát triển phần mềm','Технологии разработки программного обеспечения',['Software process','Testing','Versioning/CI']),
    official('m1-nir','m1','research','Nghiên cứu khoa học · НИР 1','Научно-исследовательская работа',['Topic/literature','Research question','Baseline plan']),

    official('m2-foreign','m2','russian','Ngoại ngữ','Иностранный язык',['Academic Russian','Seminar communication']),
    official('m2-business','m2','foundation','Cơ sở khởi nghiệp','Основы предпринимательства',['Project economics','Product thinking']),
    official('m2-ml-asoiu','m2','ai','Phương pháp Machine Learning trong ASOIU','Методы машинного обучения в автоматизированных системах обработки информации и управления',['ML methods','Model evaluation','ASOIU application']),
    official('m2-reliability','m2','systems','Mô hình độ tin cậy ASOIU','Модели надёжности АСОИУ',['Reliability modeling','Stochastic bridge','Risk reasoning']),
    official('m2-postrel','m2','programming','Cơ sở dữ liệu hậu quan hệ','Постреляционные базы данных',['Post-relational DB','Data models','Querying']),
    official('m2-neural','m2','ai','Phát triển hệ thống mạng nơ-ron','Разработка нейросетевых систем',['Neural fundamentals','Training/evaluation','Deployment thinking']),
    official('m2-softdev','m2','programming','Công nghệ phát triển phần mềm · tiếp tục','Технологии разработки программного обеспечения',['Software engineering','Team/release workflow']),
    official('m2-practice-project','m2','research','Thực hành dự án–công nghệ','Проектно-технологическая практика',['Project evidence','Technical report']),
    official('m2-practice-operation','m2','systems','Thực hành vận hành','Эксплуатационная практика',['Operational thinking','Reliability evidence']),
    official('m2-practice-pedagogy','m2','research','Thực hành sư phạm','Педагогическая практика',['Explanation','Presentation']),
    official('m2-nir','m2','research','Nghiên cứu khoa học · НИР 2','Научно-исследовательская работа',['Baseline','Experiment framework','Early results']),

    official('m3-timeseries','m3','signal','Phân tích chuỗi thời gian','Анализ временных рядов',['Time-series modeling','Forecasting','Anomaly detection']),
    official('m3-ai-business','m3','ai','AI trong bài toán phân tích kinh doanh','Искусственный интеллект в задачах бизнес-аналитики',['Applied AI','Analytics workflow','Decision support']),
    official('m3-is-project','m3','systems','Quản lý thiết kế hệ thống thông tin','Управление проектированием информационных систем',['Project management','Information-system design']),
    official('m3-nir-data','m3','research','НИР về xử lý và phân tích dữ liệu','НИР по обработке и анализу данных',['Data experiment','Metrics','Error analysis']),
    official('m3-ergonomics','m3','systems','Phân tích công thái học hệ xử lý và hiển thị thông tin','Эргономический анализ систем обработки и отображения информации',['Human-system analysis','Interface evaluation']),
    official('m3-elective-security','m3','systems','Tự chọn №1 · bảo vệ/an toàn thông tin ASOIU','Дисциплина по выбору №1: защита / информационная безопасность АСОИУ',['Information-security bridge','System protection']),
    official('m3-practice-pedagogy','m3','research','Thực hành sư phạm','Педагогическая практика',['Teaching/presentation','Technical explanation']),
    official('m3-nir','m3','research','Nghiên cứu khoa học · НИР 3','Научно-исследовательская работа',['Main experiments','Comparison','Scientific writing']),

    official('m4-mivar','m4','ai','Công nghệ mivar của AI logic','Миварные технологии логического искусственного интеллекта',['Knowledge representation','Logical AI']),
    official('m4-lifecycle','m4','systems','Mô tả các quá trình vòng đời STS','Описание процессов жизненного цикла СТС',['Lifecycle modeling','Process description']),
    official('m4-elective-data','m4','programming','Tự chọn №2 · Big Data hoặc phát triển hệ multimedia','Дисциплина по выбору №2: технологии обработки больших данных или технологии разработки мультимедиа систем',['Elective bridge','Data/media engineering']),
    official('m4-nir','m4','research','Nghiên cứu khoa học · НИР 4','Научно-исследовательская работа',['Final experiments','Thesis evidence']),
    official('m4-predegree','m4','research','Thực tập trước tốt nghiệp','Преддипломная практика',['Final implementation','Pre-defense evidence']),
    official('m4-vkr','m4','research','Chuẩn bị và bảo vệ ВКР','Подготовка и защита ВКР',['Thesis writing','Defense','Reproducible evidence'])
  ];

  DATA.routeOutcomes=[
    {id:'language',label:'Russian academic readiness',goal:'Nghe giảng, đọc đề/tài liệu, hỏi bài và bảo vệ bằng tiếng Nga.',evidence:'Russian Twin Lesson, glossary, seminar summary, oral defense practice.'},
    {id:'software',label:'Software & Database readiness',goal:'Code, thiết kế OOP, quản trị dữ liệu và tái lập project.',evidence:'Repo, tests, SQL/query plan, architecture notes.'},
    {id:'ai-data',label:'AI & Data readiness',goal:'Phân tích dữ liệu, dựng baseline, đánh giá ML/neural/time series.',evidence:'Notebook, metrics, error analysis, reproducible experiment.'},
    {id:'asoiu',label:'ASOIU readiness',goal:'Mô hình hóa, phân tích reliability/lifecycle và thiết kế hệ thống.',evidence:'System model, architecture, reliability/lifecycle analysis.'},
    {id:'research',label:'НИР → ВКР readiness',goal:'Biến môn học thành câu hỏi nghiên cứu, thí nghiệm, báo cáo và ВКР.',evidence:'Literature matrix, baseline, protocol, НИР reports, ВКР.'}
  ];

  DATA.projectTracks=[
    {id:'master_core',label:'ИУ-5 Master Core',desc:'Học phần và prerequisite trực tiếp của 09.04.01/11.'},
    {id:'research_core',label:'НИР / ВКР',desc:'Nghiên cứu và luận văn xuyên 4 học kỳ.'},
    {id:'support',label:'Support on demand',desc:'Linux/OS/Networks/OR/Queueing/Markov nâng cao chỉ mở khi môn hoặc НИР yêu cầu.'}
  ];

  global.BAUMAN_ACADEMIC_RUNTIME_V3=Object.freeze({version:VERSION,displayCode:'09.04.01/11',department:'ИУ-5',courseCount:DATA.courses.length,subjectCount:DATA.subjects.length});
})(window);
