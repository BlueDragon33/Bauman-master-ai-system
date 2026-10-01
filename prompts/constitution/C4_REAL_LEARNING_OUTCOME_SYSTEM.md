# BAUMAN REAL LEARNING & OUTCOME SYSTEM
## Academic Content · Competency · Assessment · Evidence · Portfolio Master Prompt
## Học thật · Luyện thật · Chứng minh thật · Đầu ra thật

Repository:

BlueDragon33/Bauman-master-ai-system

Architecture Track:

BAUMAN_REAL_LEARNING_OUTCOME_ARCHITECTURE

Đây là một track kiến trúc độc lập.

KHÔNG mở lại Roadmap V2.
KHÔNG gọi đây là L36.
KHÔNG phá các capability đã được promote trên current main.

==================================================
I. SỨ MỆNH CỦA SẢN PHẨM
==================================================

Bauman Hub không được phát triển như một website chứa:

- PDF;
- video;
- bài giảng;
- quiz;
- flashcard;
- AI chat;
- progress bar.

Đó chỉ là công cụ.

Mục tiêu cuối cùng của Bauman Hub là:

> BIẾN KIẾN THỨC THÀNH NĂNG LỰC CÓ THỂ CHỨNG MINH.

Mỗi phần của hệ thống phải phục vụ chuỗi:

LEARN
→ PRACTICE
→ APPLY
→ EXPLAIN
→ PROVE
→ RETAIN
→ TRANSFER

Người học không được coi là "đã học được" chỉ vì:

- mở bài;
- đọc tài liệu;
- xem hết video;
- ở trên trang đủ lâu;
- hỏi AI;
- hoàn thành progress bar.

Learning activity không đồng nghĩa với competence.

==================================================
II. NORTH STAR
==================================================

North Star của hệ thống không phải:

"đã hoàn thành bao nhiêu bài?"

Mà là:

"người học thực sự làm được những gì?"

Mọi feature mới phải trả lời được:

1. Nó giúp hình thành competency nào?
2. Nó tạo ra learning evidence gì?
3. Nó giúp phát hiện weakness nào?
4. Nó giúp người học transfer kiến thức ra tình huống mới như thế nào?
5. Nó có đóng góp vào một đầu ra thực hay không?

Nếu một feature chỉ làm hệ thống nhiều chức năng hơn
nhưng không cải thiện quá trình học:

không ưu tiên.

==================================================
III. BỐN KHÁI NIỆM KHÔNG ĐƯỢC ĐÁNH ĐỒNG
==================================================

Phải tách rõ:

EXPOSURE

Người học đã tiếp xúc nội dung.

PROGRESS

Người học đã thực hiện các hoạt động được yêu cầu.

PERFORMANCE

Người học đã thực hiện được một task.

MASTERY

Có đủ bằng chứng đáng tin cậy để kết luận competency đã được chứng minh.

Không được viết logic:

viewed = completed = mastered.

==================================================
IV. CẤU TRÚC HỌC THUẬT TỔNG THỂ
==================================================

Kiến trúc học thuật chuẩn:

PROGRAM
    ↓
PROGRAM OUTCOME
    ↓
COMPETENCY
    ↓
SKILL
    ↓
CONCEPT
    ↓
PREREQUISITE
    ↓
LEARNING EXPERIENCE
    ↓
PRACTICE
    ↓
ASSESSMENT
    ↓
EVIDENCE
    ↓
MASTERY
    ↓
TRANSFER
    ↓
PROJECT / ARTIFACT
    ↓
PORTFOLIO

Lesson không phải root của kiến trúc.

Lesson chỉ là một learning experience phục vụ competency.

==================================================
V. DUAL STRUCTURE
==================================================

Bauman phải duy trì hai cấu trúc song song:

ACADEMIC STRUCTURE

Program
→ Year
→ Semester
→ Subject
→ Course
→ Chapter
→ Lesson

và:

COMPETENCY STRUCTURE

Domain
→ Competency
→ Skill
→ Concept
→ Evidence
→ Mastery

Hai structure liên kết nhưng không đồng nhất.

Ví dụ:

Sinh viên có thể đang ở:

Semester 2

nhưng competency:

Probability Foundations = Needs Review.

Academic progression không được tự động đồng nghĩa với competency mastery.

==================================================
VI. COMPETENCY GRAPH
==================================================

Xây dựng Competency Graph làm một lớp dữ liệu cấp một.

Mỗi competency có:

id

title

description

domain

level

prerequisites

required concepts

required skills

required evidence

mastery policy

retention policy

linked subjects

linked lessons

linked assessments

linked projects.

Ví dụ:

COMP-ML-PCA-001

Principal Component Analysis

Prerequisites:

Linear Algebra
Covariance
Variance
Standardization

Evidence:

Concept explanation
Calculation
Python implementation
Interpretation
Transfer task

==================================================
VII. PREREQUISITE GRAPH
==================================================

Prerequisite không được chỉ ghi dưới dạng text.

Phải là relationship machine-readable.

Ví dụ:

PCA
requires
Covariance

Covariance
requires
Expectation

Expectation
requires
Random Variable.

Hệ thống phải có khả năng phát hiện:

missing prerequisite

circular dependency

orphan concept

unreachable competency.

==================================================
VIII. LEARNING CONTRACT
==================================================

Mỗi lesson/module phải có Learning Contract.

Không để logic học tập nằm ẩn trong HTML.

Learning Contract tối thiểu gồm:

Identity

Learning outcomes

Prerequisites

Concepts

Skills

Learning resources

Practice activities

Assessment

Evidence requirements

Mastery rule

Transfer task

Review policy.

Ví dụ:

{
  "schemaVersion": "1.0",
  "lessonId": "MATH-PCA-01",

  "outcomes": [
    "Explain the intuition of PCA",
    "Construct covariance matrix",
    "Compute principal components",
    "Interpret explained variance"
  ],

  "prerequisites": [
    "COMP-COVARIANCE",
    "COMP-EIGENVALUE"
  ],

  "evidence": [
    "concept-check",
    "calculation",
    "implementation",
    "oral-defense"
  ]
}

UI chỉ render Learning Contract.

==================================================
IX. DEFINITION OF LEARNED
==================================================

Mỗi competency hoặc lesson phải định nghĩa:

KNOW

Người học phải biết gì?

DO

Người học phải làm được gì?

PROVE

Bằng chứng nào chứng minh họ thực sự làm được?

TRANSFER

Có thể sử dụng kiến thức trong tình huống mới không?

Nếu không có PROVE:

không được cấp Mastery.

==================================================
X. LEARNING OBJECTIVE QUALITY
==================================================

Không sử dụng objective mơ hồ như:

"Hiểu PCA."

Ưu tiên động từ có thể quan sát:

Explain

Calculate

Compare

Implement

Diagnose

Design

Analyze

Interpret

Optimize

Defend

Evaluate.

Learning outcome phải kiểm chứng được.

==================================================
XI. LEARNING EXPERIENCE MODEL
==================================================

Một learning experience chuẩn có thể bao gồm:

WHY

Tại sao cần học?

OUTCOME

Học xong làm được gì?

PREREQUISITE CHECK

Đã đủ nền tảng chưa?

CONCEPT

Kiến thức chính.

WORKED EXAMPLE

Ví dụ được giải thích.

GUIDED PRACTICE

Luyện có hướng dẫn.

INDEPENDENT PRACTICE

Tự giải.

ERROR ANALYSIS

Phân tích sai lầm.

RETRIEVAL

Nhắc lại không nhìn tài liệu.

TRANSFER

Áp dụng vào tình huống mới.

EVIDENCE

Chứng minh năng lực.

NEXT

Bước tiếp theo.

Không bắt buộc mọi lesson hiển thị tất cả block.

Nhưng Content Engine phải hỗ trợ cấu trúc này.

==================================================
XII. CONTENT DEPTH
==================================================

Nội dung nên hỗ trợ nhiều tầng:

ESSENTIAL

Bắt buộc để đạt outcome.

DEEP DIVE

Đào sâu.

REFERENCE

Tra cứu.

RESEARCH

Nâng cao.

OPTIONAL

Không bắt buộc.

UI phải dùng progressive disclosure.

Không đổ tất cả lên một màn hình.

==================================================
XIII. CONTENT ROLE
==================================================

Mỗi resource phải khai báo pedagogical role.

Ví dụ:

core-reading

introduction

worked-example

demonstration

reference

practice

revision

deep-dive

assessment-support

project-resource.

Không coi tất cả PDF/video ngang nhau.

==================================================
XIV. CONTENT PROVENANCE
==================================================

Mỗi content item phải lưu provenance.

Các loại nguồn:

Official Curriculum

University Material

Lecturer Material

Textbook

Research Paper

User Upload

Web Resource

AI Generated

AI Derived

Learner Generated.

Không để AI-generated material trông giống authoritative source.

==================================================
XV. CONTENT AUTHORITY LEVEL
==================================================

Tách:

AUTHORITATIVE

Được phê duyệt làm chuẩn.

CURATED

Được người quản trị chọn.

DERIVED

Sinh ra từ nguồn khác.

AI GENERATED

AI tạo.

LEARNER GENERATED

Người học tạo.

Mastery decision không được dựa hoàn toàn vào content không đủ authority nếu policy không cho phép.

==================================================
XVI. CONTENT VERSIONING
==================================================

Mọi content object quan trọng phải versioned.

Ví dụ:

1.0.0

1.1.0

2.0.0.

Evidence phải biết:

content version

assessment version

rubric version

tại thời điểm evidence được tạo.

Không overwrite lịch sử.

==================================================
XVII. CONTENT LIFECYCLE
==================================================

Lifecycle:

Draft

Review

Approved

Published

Superseded

Archived.

Không chỉnh sửa trực tiếp published content nếu thay đổi làm thay đổi meaning/evidence.

Tạo version mới.

==================================================
XVIII. ASSESSMENT ARCHITECTURE
==================================================

Không xây assessment chỉ quanh multiple-choice quiz.

Hỗ trợ:

Diagnostic

Formative

Practice

Checkpoint

Summative

Oral Defense

Implementation

Project

Transfer Task

Portfolio Review.

Mỗi loại assessment phục vụ mục tiêu khác nhau.

==================================================
XIX. DIAGNOSTIC
==================================================

Diagnostic dùng để:

phát hiện nền tảng;

phát hiện gap;

chọn learning path.

Diagnostic KHÔNG mặc định dùng làm điểm thành tích.

Diagnostic không được tự động tạo Mastery nếu không đáp ứng Mastery Policy.

==================================================
XX. GUIDED PRACTICE
==================================================

Guided Practice có:

hint

step

worked reasoning

feedback.

Mục tiêu:

hình thành phương pháp.

Không sử dụng Guided Practice như bằng chứng mastery mạnh.

==================================================
XXI. INDEPENDENT PRACTICE
==================================================

Independent Practice:

không hiển thị lời giải trước;

không phụ thuộc hint;

không copy example.

Dùng để chuẩn bị evidence.

==================================================
XXII. RETRIEVAL PRACTICE
==================================================

Hệ thống phải hỗ trợ retrieval without source.

Không phải:

"đọc lại".

Mà:

"tự nhớ lại".

Ví dụ:

Explain covariance without notes.

Write the formula.

Solve a short problem.

==================================================
XXIII. TRANSFER TASK
==================================================

Competency quan trọng phải có transfer evidence.

Transfer Task:

không trùng bài mẫu;

không chỉ đổi số;

không copy pattern trực tiếp.

Mục tiêu:

chứng minh người học có thể sử dụng kiến thức trong tình huống mới.

==================================================
XXIV. ORAL DEFENSE
==================================================

Xây Oral Defense như capability cấp một.

Có thể yêu cầu người học:

giải thích;

bảo vệ lựa chọn;

phản biện;

trình bày reasoning;

phân tích lỗi;

so sánh phương pháp.

Ví dụ:

"Vì sao standardization ảnh hưởng PCA?"

"Nếu một biến được nhân 100 lần thì chuyện gì xảy ra?"

"Correlation cao có đồng nghĩa quan hệ nhân quả không?"

Oral Defense không chỉ là chat AI thông thường.

==================================================
XXV. EVIDENCE MODEL
==================================================

Evidence là đối tượng cấp một.

Evidence types:

KnowledgeEvidence

CalculationEvidence

ImplementationEvidence

ExplanationEvidence

AnalysisEvidence

OralEvidence

ArtifactEvidence

TransferEvidence

ProjectEvidence

ObservationEvidence.

Mỗi evidence phải có:

learner

competency

activity

timestamp

source

version

result

rubric

confidence/reliability nếu phù hợp.

==================================================
XXVI. EVIDENCE QUALITY
==================================================

Không phải evidence nào cũng có giá trị như nhau.

Có thể có:

LOW

MEDIUM

HIGH

VERIFIED

theo policy.

Ví dụ:

Self report:

LOW.

Simple quiz:

MEDIUM.

Independent implementation:

HIGH.

Reviewed project:

VERIFIED.

Không dùng label này để đánh giá con người.

Nó chỉ mô tả độ mạnh của bằng chứng.

==================================================
XXVII. EVIDENCE TRUTHFULNESS
==================================================

Đây là protected invariant.

Bauman không được tuyên bố:

"Mastered"

nếu evidence policy chưa đạt.

Không được dùng:

page open

watch time

click count

AI conversation duration

online duration

làm bằng chứng mastery độc lập.

==================================================
XXVIII. MASTERY ENGINE
==================================================

Mastery Engine phải dựa trên rules.

Ví dụ:

PCA Mastery:

Concept Check >= threshold

AND

Independent Calculation PASS

AND

Implementation PASS

AND

Interpretation PASS

AND

Oral Defense PASS

AND

Transfer Task PASS.

Không dùng average score đơn giản nếu policy yêu cầu nhiều dimensions.

==================================================
XXIX. MASTERY STATES
==================================================

Trạng thái nên gồm:

NOT_EXPOSED

INTRODUCED

PRACTICING

DEMONSTRATED

MASTERED

NEEDS_REVIEW

STALE_EVIDENCE.

Không dùng duy nhất:

0–100%.

==================================================
XXX. MASTERY IS NOT PERMANENT
==================================================

Một competency có thể có retention policy.

Ví dụ:

6 tháng không có evidence mới:

MASTERED
→ NEEDS_REVIEW.

Không có nghĩa người học "mất năng lực".

Chỉ có nghĩa evidence hiện tại không còn đủ mới theo policy.

==================================================
XXXI. SPACED RETRIEVAL
==================================================

Spaced review phải liên kết competency.

Không chỉ flashcard timer.

Review scheduling có thể dựa trên:

last evidence

error rate

difficulty

retrieval success

competency importance.

==================================================
XXXII. ERROR NOTEBOOK
==================================================

Error Notebook trở thành phần học tập cấp một.

Error taxonomy có thể gồm:

Conceptual Error

Calculation Error

Procedure Error

Interpretation Error
Implementation Error

Language Error

Careless Error

Unknown.

Người học có thể review lỗi theo competency.

==================================================
XXXIII. ERROR → LEARNING LOOP
==================================================

Mỗi lỗi có thể tạo:

targeted practice

retrieval task

concept review

oral question

worked example.

Không chỉ ghi lỗi để xem lại.

==================================================
XXXIV. FEEDBACK ARCHITECTURE
==================================================

Feedback phải trả lời:

Sai ở đâu?

Tại sao sai?

Cách suy nghĩ đúng?

Người học nên làm gì tiếp theo?

Không chỉ:

Wrong answer.

==================================================
XXXV. AI ROLE
==================================================

AI là:

Tutor

Coach

Explainer

Question Generator

Practice Generator

Feedback Assistant

Curriculum Assistant.

AI KHÔNG mặc định là:

authoritative examiner

official grader

mastery authority.

==================================================
XXXVI. AI CONTENT GENERATION
==================================================

AI có thể sinh:

draft lesson

questions

hints

examples

glossary

summary

practice.

Nhưng output phải có:

provenance

AI-generated marker

review state.

==================================================
XXXVII. AI CURRICULUM ASSISTANT
==================================================

Khi upload syllabus/PDF:

AI có thể đề xuất:

subjects

chapters

concepts

competencies

prerequisites

lesson structure

assessment ideas

rubrics.

Nhưng kết quả ban đầu:

DRAFT.

Không tự publish curriculum.

==================================================
XXXVIII. AI FEEDBACK SAFETY
==================================================

AI feedback không được tự thay đổi:

official score

mastery

prerequisite status

program completion

credential.

Nếu muốn thay đổi:

phải đi qua policy/assessment authority.

==================================================
XXXIX. RUBRIC ENGINE
==================================================

Assessment phức tạp phải hỗ trợ rubric.

Ví dụ Oral Defense:

Correctness

Reasoning

Technical terminology

Transfer

Clarity.

Project:

Problem framing

Method

Implementation

Validation

Interpretation

Documentation

Presentation.

Rubric phải versioned.

==================================================
XL. PROJECT-BASED LEARNING
==================================================

Mỗi stage lớn nên có integrated project nếu phù hợp.

Project phải kết hợp nhiều competencies.

Ví dụ:

Data Analysis Project:

Data cleaning

Statistics

Visualization

PCA

Interpretation

Python

Technical report.

==================================================
XLI. REAL OUTPUT
==================================================

Người học phải có thể tạo artifact thật.

Ví dụ:

.ipynb

.py

PDF report

Technical document

Presentation

Simulation

Dataset analysis

Design

Research note

Recorded oral defense

Portfolio project.

Artifact phải liên kết competency/evidence.

==================================================
XLII. PORTFOLIO
==================================================

Portfolio là first-class feature.

Không chỉ là file list.

Portfolio item phải biết:

project

competencies

skills

evidence

version

date

review

reflection.

==================================================
XLIII. CAPABILITY PASSPORT
==================================================

Có thể xây learner capability passport.

Không coi đây mặc định là chứng chỉ chính thức.

Hiển thị:

Competency

Mastery state

Latest evidence

Evidence strength

Last review

Projects.

Người dùng click competency:

xem bằng chứng.

==================================================
XLIV. PROGRESS DASHBOARD
==================================================

Tách ít nhất:

Content Progress

Practice Progress

Evidence Status

Competency Status.

Không dùng một progress bar duy nhất để mô tả tất cả.

==================================================
XLV. LEARNING PATH
==================================================

Learning Path được sinh từ:

Curriculum

Prerequisite Graph

Competency State

Deadlines

Learner Evidence.

Nhưng phải nằm trong curriculum boundary đã được phê duyệt.

==================================================
XLVI. ADAPTIVE LEARNING BOUNDARY
==================================================

Adaptive Engine có thể:

recommend;

reorder optional practice;

suggest review;

identify gaps;

choose valid branch.

Không tự:

delete required curriculum;

change official prerequisites;

grant mastery;

rewrite program outcomes.

==================================================
XLVII. PERSONALIZATION
==================================================

Personalization có thể thay đổi:

pace

practice amount

resource preference

difficulty

review timing

explanation style.

Không thay đổi expected competency chỉ để làm pathway dễ hơn.

==================================================
XLVIII. DIFFICULTY MODEL
==================================================

Activity có thể khai báo:

introductory

guided

standard

advanced

transfer

expert.

Không dùng difficulty chỉ dựa trên điểm số lịch sử.

==================================================
XLIX. COURSE QUALITY
==================================================

Course không đạt chuẩn nếu:

có lesson nhưng không có outcome;

có outcome nhưng không assessment;

có assessment nhưng không map competency;

có mastery nhưng không evidence policy;

có resource nhưng không rõ pedagogical role.

==================================================
L. CONTENT QUALITY GATE
==================================================

Tạo Academic Content Gate.

Kiểm tra:

schema

outcomes

prerequisites

competency mapping

evidence mapping

assessment mapping

provenance

resource validity

broken links

duplicate IDs

orphan concepts

circular prerequisites.

FAIL thì không publish.

==================================================
LI. LEARNING PATH QUALITY GATE
==================================================

Kiểm tra:

unreachable lesson

missing prerequisite

dead-end path

duplicate required module

invalid dependency

competency never assessed.

==================================================
LII. ASSESSMENT QUALITY GATE
==================================================

Kiểm tra:

outcome alignment

answer validity

rubric completeness

question duplication

difficulty balance

evidence type

mastery policy compatibility.

==================================================
LIII. QUESTION BANK
==================================================

Question không chỉ có:

question

answer.

Phải có metadata:

competency

concept

difficulty

type

source

version

misconception

explanation

evidence role.

==================================================
LIV. MISCONCEPTION MODEL
==================================================

Các đáp án sai quan trọng có thể map tới misconception.

Ví dụ:

CORRELATION_CAUSATION_CONFUSION

VARIANCE_SCALE_CONFUSION.

Từ misconception:

tạo targeted remediation.

==================================================
LV. RETRY POLICY
==================================================

Không để người học:

spam submit tới khi đúng.

Assessment phải có retry policy.

Có thể:

immediate retry

cooldown

new question

guided remediation

review required.

==================================================
LVI. CHEATING RESISTANCE
==================================================

Không cố biến Bauman thành proctoring platform mặc định.

Nhưng evidence quan trọng nên giảm khả năng "đoán đúng" bằng:

randomized tasks

explanation

implementation

oral defense

transfer.

==================================================
LVII. LEARNING ANALYTICS
==================================================

Analytics phải ưu tiên:

learning signal

không vanity metrics.

Useful:

competency gaps

error patterns

evidence strength

retention risk

practice effectiveness

time-to-mastery.

Less useful:

click count

page view

raw time online.

==================================================
LVIII. TIME DATA
==================================================

Time-on-task chỉ là contextual signal.

Không được tự động:

đánh giá effort

đánh giá intelligence

grant mastery.

==================================================
LIX. LANGUAGE LEARNING
==================================================

Với Russian:

Competency Graph phải hỗ trợ:

Listening

Speaking

Reading

Writing

Pronunciation

Vocabulary

Grammar

Academic Russian

Technical Russian.

Vocabulary count không được đồng nghĩa language mastery.

==================================================
LX. SPEAKING EVIDENCE
==================================================

Speaking có thể dùng:

pronunciation sample

dialogue completion

free response

oral defense

scenario roleplay.

Phải phân biệt:

pronunciation

fluency

accuracy

comprehension.

==================================================
LXI. MATH LEARNING
==================================================

Math competency phải hỗ trợ:

conceptual understanding

symbolic reasoning

calculation

proof/reasoning nếu phù hợp

application

implementation

interpretation.

Không chỉ multiple-choice.

==================================================
LXII. PROGRAMMING LEARNING
==================================================

Programming evidence nên gồm:

code

execution

test result

debugging

explanation

refactoring

project.

Không đánh giá programming bằng quiz là chính.

==================================================
LXIII. RESEARCH LEARNING
==================================================

Research competency có thể gồm:

problem framing

literature search

source evaluation

method

experiment

analysis

writing

citation

defense.

==================================================
LXIV. SUBJECT FACTORY ACADEMIC CONTRACT
==================================================

Khi tạo subject mới:

không chỉ nhập:

name

icon

color.

Phải hỗ trợ:

program outcomes

competencies

prerequisites

assessment model

evidence policy

learning path.

==================================================
LXV. LESSON FACTORY ACADEMIC CONTRACT
==================================================

Lesson Factory phải hỏi:

Outcome?

Prerequisite?

Concept?

Practice?

Evidence?

Next competency?

Không chỉ:

Title + Content blocks.

==================================================
LXVI. IMPORT CENTER ACADEMIC FLOW
==================================================

Upload PDF không được tự động coi PDF = lesson.

Flow:

Upload
→ Detect
→ Extract
→ Classify
→ Academic Mapping
→ Preview
→ Review
→ Publish.

Academic Mapping có thể đề xuất:

subject

chapter

concept

competency

pedagogical role.

==================================================
LXVII. LIBRARY VS CURRICULUM
==================================================

Phải phân biệt:

LIBRARY

Kho tài nguyên.

CURRICULUM

Đường học có chủ đích.

Một PDF trong library không tự động trở thành required lesson.

==================================================
LXVIII. KNOWLEDGE SYSTEM VS TRAINING SYSTEM
==================================================

Bauman gồm hai subsystem:

KNOWLEDGE SYSTEM

Search

Library

PDF

Reference

Notes.

TRAINING SYSTEM

Learning Path

Practice

Assessment

Evidence

Mastery

Projects.

Hai hệ thống liên kết nhưng không lẫn authority.

==================================================
LXIX. CONTENT SEARCH
==================================================

Search result nên biết:

resource

concept

competency

course

lesson.

Người dùng có thể tìm:

"covariance"

và thấy:

Concept

Lesson

Formula

PDF reference

Practice

Competency.

==================================================
LXX. LEARNING SEARCH
==================================================

Có thể cung cấp action:

Learn this

Review this

Practice this

Ask AI

Open reference.

Không chỉ hiển thị search results.

==================================================
LXXI. STUDY PLAN
==================================================

Study Plan nên được sinh từ:

official curriculum

available time

deadlines

prerequisite gaps

competency state

review needs.

Không chỉ chia đều số lesson theo ngày.

==================================================
LXXII. CALENDAR
==================================================

Calendar event có thể phân biệt:

Class

Study

Practice

Review

Assessment

Project

Deadline.

==================================================
LXXIII. DAILY LEARNING
==================================================

Daily view ưu tiên:

Next required learning

Due review

Weak competency

Upcoming assessment

Project task.

Không nhồi toàn bộ curriculum.

==================================================
LXXIV. WEEKLY REVIEW
==================================================

Weekly review có thể cho người học thấy:

What learned

What demonstrated

What remains weak

What needs review

What to do next.

Không chỉ tổng giờ học.

==================================================
LXXV. REFLECTION==================================================

Deep Study Journal giữ vai trò:

reflection

metacognition

error analysis.

Không tự động trở thành authoritative mastery evidence.

Preserve existing non-authoritative boundary.

==================================================
LXXVI. HUMAN REVIEW
==================================================

Một số evidence có thể cần:

Teacher review

Reviewer approval

Publisher approval.

Human review phải explicit.

Không để hệ thống giả human-reviewed.

==================================================
LXXVII. OFFICIAL VS INTERNAL STATUS
==================================================

Phân biệt:

Internal Learning Status

Official Academic Status.

Bauman có thể hiển thị internal mastery.

Không tự tuyên bố:

official grade

official credit

official degree

nếu không có authority.

==================================================
LXXVIII. REPORT TRUTHFULNESS
==================================================

Report phải ghi rõ:

scope

source

evidence

date

authority.

Không biến learning dashboard thành official transcript.

==================================================
LXXIX. PORTFOLIO EXPORT
==================================================

Có thể hỗ trợ export:

PDF

ZIP

Share link

Portfolio package.

Nhưng export phải giữ provenance/version khi phù hợp.

==================================================
LXXX. CONTENT OBSERVABILITY
==================================================

Admin cần thấy:

Broken resources

Unmapped lessons

Missing evidence

Missing prerequisites

Outdated content

Unreviewed AI content

Low-quality assessment

Orphan competency.

==================================================
LXXXI. ACADEMIC HEALTH
==================================================

Có thể tạo Academic Health dashboard.

Ví dụ:

Competencies: 184

Fully assessed: 166

Missing evidence mapping: 8

Missing prerequisite mapping: 3

Outdated resources: 12.

Không chỉ application health.

==================================================
LXXXII. CONTENT DEPRECATION
==================================================

Khi resource lỗi thời:

mark deprecated.

Không xoá ngay.

Determine:

replacement

affected lessons

affected assessments

affected evidence.

==================================================
LXXXIII. CURRICULUM MIGRATION
==================================================

Curriculum version update phải hỗ trợ migration.

Ví dụ:

2026 curriculum

→ 2027 curriculum.

Không phá learner history.

==================================================
LXXXIV. HISTORICAL EVIDENCE
==================================================

Evidence lịch sử không được rewrite khi curriculum thay đổi.

Giữ:

competency version

assessment version

rubric version.

==================================================
LXXXV. SCHEMA VERSIONING
==================================================

Academic schemas đều có:

schemaVersion.

Các schema chính:

ProgramSchema

CompetencySchema

LessonSchema

AssessmentSchema

EvidenceSchema

RubricSchema

ProjectSchema.

==================================================
LXXXVI. BACKWARD COMPATIBILITY
==================================================

Valid learning content cũ phải tiếp tục chạy qua compatibility layer.

Không refactor UI làm mất academic semantics.

==================================================
LXXXVII. CONTENT AS DATA
==================================================

Không hard-code:

learning outcome

assessment condition

mastery threshold

resource role

vào component UI.

Những thứ đó phải nằm trong data/contract.

==================================================
LXXXVIII. AUTHORITY SEPARATION
==================================================

UI:

presentation.

Learning Engine:

learning orchestration.

Assessment Engine:

assessment.

Evidence Engine:

evidence storage/interpretation.

Mastery Engine:

mastery rules.

Không gom tất cả vào một JS file.

==================================================
LXXXIX. EVENT MODEL
==================================================

Learning events có thể gồm:

learning.started

resource.viewed

practice.completed

assessment.submitted

evidence.created

competency.demonstrated

mastery.changed

review.due

project.completed.

Events không được tự mang authority ngoài contract.

==================================================
XC. EVIDENCE IMMUTABILITY
==================================================

Important evidence không overwrite tùy tiện.

Có thể append:

review

supersede

invalidate.

Phải traceable.

==================================================
XCI. AUDIT TRAIL
==================================================

Các hành động như:

publish curriculum

change rubric

change mastery rule

invalidate evidence

phải có audit.

==================================================
XCII. PERFORMANCE VS LEARNING
==================================================

Không tối ưu UI để người học click thật nhanh
nếu điều đó làm giảm learning quality.

Ví dụ:

assessment không nên auto-skip reasoning
chỉ vì ít click hơn.

UX phải tối ưu effort không cần thiết,
không loại bỏ desirable difficulty.

==================================================
XCIII. DESIRABLE DIFFICULTY
==================================================

Một số friction trong học tập là có chủ ý.

Ví dụ:

retrieval without notes.

Không coi mọi friction là UX bug.

Phân biệt:

BAD FRICTION

system khó sử dụng.

LEARNING FRICTION

task cần suy nghĩ.

==================================================
XCIV. GAMIFICATION
==================================================

Gamification chỉ phụ.

Có thể dùng:

streak

badge

milestone.

Không dùng chúng thay thế:

competency

evidence

portfolio.

==================================================
XCV. MOTIVATION SYSTEM
==================================================

Ưu tiên feedback như:

"You can now..."

"You demonstrated..."

"You resolved..."

"You completed a project..."

hơn:

+100 XP.

==================================================
XCVI. OUTCOME-FIRST DESIGN
==================================================

Trước khi viết lesson:

define outcome.

Trước khi viết assessment:

define evidence.

Trước khi tạo learning path:

define prerequisites.

Không làm ngược lại.

==================================================
XCVII. CURRICULUM DESIGN LOOP
==================================================

Program Outcome
↓
Competency
↓
Evidence
↓
Assessment
↓
Practice
↓
Learning Content

Đây là backward design.

Không:

viết 100 lesson trước
rồi mới nghĩ học xong làm được gì.

==================================================
XCVIII. ACADEMIC REVIEW PROCESS
==================================================

Content release lớn nên review dưới các vai:

Subject Expert

Instructional Designer

Assessment Designer

Learner

QA Tester.

==================================================
XCIX. LEARNING UX REVIEW
==================================================

UX review phải hỏi:

Người học có biết tại sao học?

Có biết học xong phải làm được gì?

Có đủ practice?

Có feedback?

Có biết mình yếu ở đâu?

Có biết bước tiếp theo?

==================================================
C. LOW-TECH LEARNER
==================================================

Người học không cần hiểu:

competency graph

evidence schema

rubric engine.

UI phải dịch chúng thành ngôn ngữ đơn giản.

Ví dụ:

"Bạn đã làm tốt phần này."

"Bạn còn yếu ở..."

"Thử bài này tiếp."

==================================================
CI. ADMIN UX
==================================================

Admin không phải chỉnh JSON.

Có wizard cho:

Create competency

Map lesson

Add assessment

Configure evidence

Publish curriculum.

Advanced mode mới hiện raw schema.

==================================================
CII. CONTENT AUTHOR UX
==================================================

Author có thể tạo:

lesson

practice

assessment

project

bằng block editor/no-code.

Hệ thống tự validate academic contract.

==================================================
CIII. PDF-TO-COURSE ASSISTED FLOW
==================================================

Mục tiêu dài hạn:

Upload:

Syllabus
+
Textbook PDF
+
Exercise PDF

AI có thể đề xuất:

course structure

competencies

concepts

prerequisites

lesson drafts

question bank

projects.

Nhưng không auto-authoritative publish.

==================================================
CIV. LEARNING PACK
==================================================

.baumanpack có thể chứa:

manifest

learning contract

resources

activities

assessment

rubric

competency links.

Import một pack:

hệ thống hiểu cả nội dung lẫn logic học.

==================================================
CV. SUBJECT PACKAGE
==================================================

Một Subject Package có thể tự đăng ký:

courses

competencies

lessons

resources

assessment

projects.

Không sửa Core.

==================================================
CVI. ACADEMIC PLUGIN
==================================================

Plugin có thể cung cấp:

assessment type

simulation

code evaluator

speech evaluator.

Plugin không tự cấp Mastery.

Nó chỉ tạo evidence.

Mastery Engine quyết định theo policy.

==================================================
CVII. EVIDENCE PROVIDER CONTRACT
==================================================

Plugin assessment phải trả:

EvidenceDescriptor.

Không gọi trực tiếp Mastery API để tự mark mastered.

==================================================
CVIII. PLUGIN SECURITY
==================================================

Academic plugin không được:

modify evidence history

modify rubric

grant competency

bypass assessment policy.

==================================================
CIX. CONTENT TESTING
==================================================

Mỗi content pack phải test:

valid schema

valid resources

valid prerequisite graph

valid assessment mapping

valid evidence mapping

offline/package

responsive rendering.

==================================================
CX. ACADEMIC REGRESSION
==================================================

Sau refactor:

không chỉ test UI.

Test rằng:

same lesson

same outcome

same competency

same evidence policy

vẫn tồn tại.

==================================================
CXI. QA + LEARNING INTEGRATION
==================================================

Master QA Prompt phải coi:

false mastery

missing evidence

broken prerequisite

incorrect report authority

là P1/P0 tùy mức độ.

==================================================
CXII. ARCHITECTURE + LEARNING INTEGRATION
==================================================

Extensible Architecture Prompt phải ưu tiên:

manifest

registry

adapter

plugin.

Academic Prompt xác định:

những manifest đó mang ý nghĩa học thuật gì.

==================================================
CXIII. UI + LEARNING INTEGRATION
==================================================

Future UI Prompt phải render:

outcome

progress

evidence

mastery

portfolio

mà không làm người học quá tải.

Không hiển thị toàn bộ academic internals.

==================================================
CXIV. FOUR-CONSTITUTION RULE
==================================================

Mọi feature lớn phải đồng thời đáp ứng:

1. EXTENSIBLE PLATFORM ARCHITECTURE
2. FUTURE PROFESSIONAL UI/UX
3. PROFESSIONAL QA + AUTO-FIX
4. REAL LEARNING & OUTCOME SYSTEM

Nếu một feature tốt ở 3 nhưng phá 1:

chưa hoàn thành.

==================================================
CXV. LONG-TERM ACADEMIC ROADMAP
==================================================

Tạo track:

BAUMAN_REAL_LEARNING_OUTCOME_ARCHITECTURE

Có thể triển khai theo Epoch:

RL-E1
Academic Baseline Audit

RL-E2
Academic Schema Foundation

RL-E3
Competency Graph

RL-E4
Prerequisite Graph

RL-E5
Learning Contract

RL-E6
Outcome Mapping

RL-E7
Assessment Architecture

RL-E8
Evidence Model

RL-E9
Mastery Engine

RL-E10
Error Notebook Integration

RL-E11
Retrieval & Retention

RL-E12
Transfer Task Engine

RL-E13
Oral Defense Engine

RL-E14
Rubric Engine

RL-E15
Project & Artifact Model

RL-E16
Portfolio

RL-E17
Capability Passport

RL-E18
Adaptive Learning Boundaries

RL-E19
Content Quality Gate

RL-E20
Assessment Quality Gate

RL-E21
AI Curriculum Assistant

RL-E22
PDF-to-Course Assisted Import

RL-E23
Subject Academic Factory

RL-E24
No-Code Academic Authoring

RL-E25
Learning Analytics

RL-E26
Curriculum Versioning

RL-E27
Academic Migration

RL-E28
Learning Truthfulness Audit

RL-E29
Real-World Output Audit

RL-E30
Professional Academic Product Review

Không giới hạn ở RL-E30.

Không tạo Epoch chỉ để tăng số.

==================================================
CXVI. EXECUTION METHOD
==================================================

Trong mỗi Epoch:

Audit current main

→ Identify academic gap

→ Define contract

→ Define protected invariant

→ Implement minimal reusable architecture

→ Add automated tests

→ Add browser acceptance

→ Add academic validation

→ Add backward compatibility tests

→ Human learning UX review

→ Regression

→ PASS.

==================================================
CXVII. AUTO-FIX RULE
==================================================

Nếu phát hiện:

logic sai

mapping sai

schema sai

assessment sai

UX học sai

false mastery

broken evidence

broken prerequisite

phải:

reproduce

→ root cause

→ fix

→ add regression

→ retest.

Không chỉ viết report.

==================================================
CXVIII. MERGE RULE
==================================================

Không merge nếu:

Academic contract fail

Competency mapping fail

Evidence mapping fail

Mastery truthfulness fail

QA required gate fail

Browser acceptance fail

Backward compatibility fail

P0/P1 unresolved.

==================================================
CXIX. RELEASE RULE
==================================================

Giữ quy trình hiện tại:

main SHA
→ DEPLOY_PREVIEW
→ exact revision smoke
→ DEPLOY_PRODUCTION
→ production read-back.

Academic feature không được bypass release contract.

==================================================
CXX. ANTI-PATTERNS CẤM
==================================================

Không:

PDF = lesson tự động

Page view = mastery

Watch video = competence

Quiz score duy nhất = mastery cho competency phức tạp

AI chat = official evidence

Completion percentage = skill level

Time online = ability

One progress bar = everything

Random content dump

1000 resources nhưng không learning path

AI auto-publish curriculum

Plugin tự grant mastery

UI tự thay đổi evidence

Assessment không map outcome.

==================================================
CXXI. REAL-LEARNING TEST
==================================================

Mỗi major module phải được đánh giá:

Nếu bỏ hết progress bar và badge đi,

người học có thật sự giỏi hơn sau khi dùng module này không?
Nếu câu trả lời không rõ:

thiết kế lại.

==================================================
CXXII. REAL-OUTPUT TEST
==================================================

Cuối một learning stage hỏi:

Người học có tạo được gì?

Có giải quyết được vấn đề gì?

Có giải thích được gì?

Có bằng chứng gì?

Nếu chỉ có:

"đã xem hết nội dung"

thì stage chưa đạt triết lý Bauman.

==================================================
CXXIII. END STATE
==================================================

Mục tiêu dài hạn:

Một sinh viên không chỉ có:

186 lessons completed.

Mà có thể có:

73 competencies demonstrated

48 competencies mastered

21 competencies due for review

15 technical artifacts

8 integrated projects

12 oral defenses

1 evolving learning portfolio.

Click vào từng competency:

xem bằng chứng.

Click vào project:

xem artifact.

Click vào weakness:

biết học tiếp gì.

Click vào evidence:

biết tại sao hệ thống kết luận trạng thái đó.

==================================================
CXXIV. PRIME ACADEMIC DIRECTIVE
==================================================

Không tối ưu Bauman để người dùng:

"hoàn thành nhiều bài nhất".

Tối ưu để người dùng:

HIỂU ĐÚNG

LÀM ĐƯỢC

GIẢI THÍCH ĐƯỢC

ÁP DỤNG ĐƯỢC

NHỚ ĐƯỢC

CHỨNG MINH ĐƯỢC

VÀ TẠO RA SẢN PHẨM THỰC.

==================================================
CXXV. FINAL PRODUCT VISION
==================================================

Bauman không phải:

Course Website.

Không chỉ là:

LMS.

Không chỉ là:

AI Tutor.

Không chỉ là:

Digital Library.

Mục tiêu là:

A REAL LEARNING OPERATING SYSTEM.

Một nền tảng trong đó:

kiến thức có cấu trúc,

năng lực có định nghĩa,

luyện tập có mục đích,

assessment có căn cứ,

evidence có provenance,

mastery có điều kiện,

lộ trình có prerequisite,

AI có giới hạn authority,

và kết quả cuối cùng là năng lực có thể chứng minh.

Triết lý cuối cùng:

HỌC THẬT
→ LÀM THẬT
→ SAI THẬT
→ SỬA THẬT
→ CHỨNG MINH THẬT
→ ĐẦU RA THẬT.