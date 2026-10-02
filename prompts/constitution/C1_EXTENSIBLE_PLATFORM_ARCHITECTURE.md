# BAUMAN EXTENSIBLE LEARNING PLATFORM
## Long-Term Strategic Master Prompt
## Content-as-Data · Plugin Architecture · Add-on First · Core-Stable

Bạn đang tiếp tục phát triển dự án:

BlueDragon33/Bauman-master-ai-system

Đây không còn được xem đơn thuần là một Website học tập.

Từ thời điểm này, định hướng kiến trúc dài hạn là xây dựng Bauman thành:

> MỘT NỀN TẢNG HỌC TẬP MỞ, CÓ KERNEL ỔN ĐỊNH,
> có khả năng tiếp nhận nội dung, môn học, tài liệu,
> công cụ, module và add-on mới mà không phải sửa lại Core.

==================================================
I. TẦM NHÌN DÀI HẠN
==================================================

Mục tiêu kiến trúc 3–5 năm:

Bauman phải tiến hóa thành một Learning Platform có thể mở rộng liên tục.

Một nội dung mới phải có khả năng được đưa vào hệ thống bằng:

- PDF
- URL
- HTML
- Markdown
- JSON
- video
- audio
- image
- ZIP content package
- bộ câu hỏi
- flashcard
- bài tập
- mô phỏng
- iframe/web app
- SCORM-like package
- external API
- AI tool
- local offline package

mà KHÔNG yêu cầu lập trình lại giao diện chính.

Nguyên tắc quan trọng nhất:

CORE CODE PHẢI NGÀY CÀNG ÍT BỊ ĐỤNG ĐẾN.

Nội dung mới phải được thêm chủ yếu bằng:

manifest + metadata + content files + adapters + plugin/add-on.

==================================================
II. MỤC TIÊU KIẾN TRÚC
==================================================

Chuyển hệ thống hiện tại từ:

hard-coded application

sang:

Kernel
    ↓
Extension Runtime
    ↓
Plugin / Add-on
    ↓
Content Pack
    ↓
Runtime-generated Learning Experience

Core không biết trước một bài học cụ thể.

Core chỉ hiểu:

Subject
Course
Chapter
Lesson
Activity
Resource
Assessment
Simulation
Addon
Capability

Nội dung cụ thể nằm ngoài Core.

==================================================
III. KIẾN TRÚC MỤC TIÊU
==================================================

Xây dựng hệ thống thành các tầng độc lập:

1. PLATFORM KERNEL

Chỉ quản lý:

- routing
- authentication
- identity
- permissions
- learner state
- progress
- search
- offline
- device gate
- storage
- synchronization
- telemetry
- navigation
- theme/design system
- extension lifecycle

Kernel không chứa nội dung môn học.

-----------------------------------------------

2. CONTENT ENGINE

Content Engine đọc manifest và dựng trải nghiệm học tập.

Ví dụ:

content-pack.json

{
  "id": "math-linear-algebra-pca",
  "type": "lesson",
  "version": "1.0.0",

  "subject": "math",

  "title": "Principal Component Analysis",

  "resources": [
    {
      "type": "pdf",
      "src": "pca.pdf"
    },
    {
      "type": "video",
      "src": "intro.mp4"
    },
    {
      "type": "html",
      "src": "simulation/index.html"
    }
  ]
}

Chỉ cần thêm package này.

Runtime phải tự tạo:

- lesson page
- navigation
- resource viewer
- progress tracking
- search index
- offline cache
- recent learning
- continue learning
- study history

Không sửa UI Core.

-----------------------------------------------

3. EXTENSION / ADD-ON ENGINE

Xây dựng chuẩn:

Bauman Extension API

Một extension có thể thêm:

- activity mới
- visualization
- AI tutor
- simulation
- quiz engine
- PDF annotation
- handwriting
- pronunciation
- flashcard
- calculator
- code runner
- external service

Mỗi extension có:

addon.manifest.json

Ví dụ:

{
  "id": "pdf-study-addon",
  "version": "1.0.0",

  "capabilities": [
    "pdf-reader",
    "annotation",
    "bookmark",
    "study-progress"
  ],

  "entry": "index.js"
}

Core chỉ load extension thông qua Extension Runtime.

Không import trực tiếp vào Core.

==================================================
IV. CONTENT-AS-DATA
==================================================

Tất cả nội dung môn học phải dần chuyển thành dữ liệu.

KHÔNG tiếp tục tạo:

lesson1.html
lesson2.html
lesson3.html

nếu cùng một loại bài học.

Thay vào đó:

lesson-template
      +
lesson-manifest
      +
content-data

Runtime tự dựng bài.

Ví dụ:

subjects/
  math/
    subject.json

    courses/
      linear-algebra/
        course.json

        chapters/
          pca/
            chapter.json

            lessons/
              lesson-01/
                manifest.json
                theory.md
                slides.json
                exercise.json
                pca.pdf

==================================================
V. UNIVERSAL RESOURCE ADAPTER
==================================================

Xây dựng Resource Adapter System.

Mọi tài nguyên đều được chuẩn hóa thành:

ResourceDescriptor

Ví dụ:

{
  "id": "...",
  "type": "pdf",
  "source": "...",
  "metadata": {},
  "capabilities": []
}

Các adapter:

PDFAdapter
VideoAdapter
AudioAdapter
HtmlAdapter
UrlAdapter
MarkdownAdapter
ImageAdapter
QuizAdapter
SimulationAdapter
ExternalAppAdapter

Sau này muốn hỗ trợ định dạng mới:

không sửa lesson engine.

Chỉ thêm:

NewResourceAdapter

==================================================
VI. PDF FIRST-CLASS LEARNING RESOURCE
==================================================

PDF không chỉ là file tải xuống.

PDF phải trở thành tài nguyên học tập cấp 1.

Một PDF có thể tự động có:

- viewer
- bookmark
- page progress
- notes
- highlight
- search
- lesson linking
- AI explanation
- AI summarization
- question generation
- glossary extraction
- reading history

Khi người quản trị thêm PDF:

hệ thống phải có thể biến nó thành một phần của lesson.

Không cần lập trình lại.

==================================================
VII. URL / WEBSITE RESOURCE
==================================================

Cho phép một URL trở thành tài nguyên học tập.

Ví dụ:

{
  "type": "url",
  "src": "https://..."
}

Runtime quyết định:

embed
external
reader mode
snapshot
offline metadata

Tùy capability và security policy.

==================================================
VIII. HTML MICRO-APP
==================================================

HTML tương tác phải được hỗ trợ như Micro Learning App.

Ví dụ:

lesson/
   simulation/
       index.html
       app.js
       styles.css

Manifest:

{
  "type": "html-app",
  "entry": "simulation/index.html"
}

Runtime cung cấp bridge:

window.BAUMAN_HOST

Micro-app có thể gọi:

getLearner()
getLesson()
saveProgress()
completeActivity()
openResource()
emitEvent()

Micro-app không được đọc trực tiếp internals của Core.

==================================================
IX. EXTENSION SDK
==================================================

Tạo:

Bauman Extension SDK

API ổn định:

Bauman.extension.register()

Bauman.resources.registerAdapter()

Bauman.activities.register()

Bauman.events.subscribe()

Bauman.storage.get()

Bauman.storage.set()

Bauman.progress.update()

Bauman.ui.openPanel()

Bauman.search.register()

Bauman.offline.register()

Mọi extension phải đi qua SDK.

Không truy cập biến global nội bộ.

==================================================
X. CAPABILITY REGISTRY
==================================================

Không kiểm tra tính năng bằng:

if (math)
if (russian)

Thay bằng:

Capability Registry.

Ví dụ:

pdf.read
pdf.annotate

audio.play
audio.record

speech.recognition

handwriting.input

simulation.run

quiz.answer

ai.explain

ai.feedback

Mỗi content pack khai báo capability cần thiết.

Runtime tự tìm provider.

==================================================
XI. CONTENT REGISTRY
==================================================

Xây dựng registry trung tâm.

ContentRegistry

ExtensionRegistry

ResourceRegistry

CapabilityRegistry

SubjectRegistry

Runtime chỉ giao tiếp với registry.

Không scan thủ công hàng chục thư mục ở mỗi module.

==================================================
XII. IMPORT CENTER
==================================================

Xây dựng giao diện:

Add Learning Content

Người dùng chỉ cần:

Upload
hoặc
Paste URL

Các lựa chọn:

PDF
Word
PowerPoint
Excel
HTML
ZIP
Markdown
JSON
Video
Audio
URL

Hệ thống tự:

1. nhận diện loại file
2. đọc metadata
3. tạo draft manifest
4. đề xuất Subject / Course / Chapter
5. preview
6. validate
7. publish

Mục tiêu:

NGƯỜI QUẢN TRỊ KHÔNG CẦN BIẾT CODE.

==================================================
XIII. CONTENT PACK
==================================================

Chuẩn hóa:

.baumanpack

hoặc ZIP chứa:

manifest.json
content/
assets/
optional addons/

Ví dụ:

PCA.baumanpack

Import một lần.

Hệ thống tự tạo bài học.

Có thể export pack.

Sau này có thể chia sẻ pack giữa:

Bauman
Bơi ếch
Health
các hệ thống khác

nếu sử dụng chung Core Extension Protocol.

==================================================
XIV. SUBJECT FACTORY
==================================================

Tạo Subject Factory.

Tạo môn mới không cần copy source môn cũ.

Ví dụ quản trị nhập:

Tên môn:
Machine Learning

Icon:
...

Màu:
...

Content packs:
...

Capabilities:
...

Runtime tự tạo:

subject route
dashboard
course browser
progress
search
learning history
offline configuration

==================================================
XV. LESSON FACTORY
==================================================

Lesson không được hard-code.

Lesson Factory nhận:

LessonManifest

và tự tạo giao diện.

Các block chuẩn:

TheoryBlock
VideoBlock
AudioBlock
PdfBlock
ImageBlock
FormulaBlock
ExerciseBlock
QuizBlock
SimulationBlock
DiscussionBlock
AIBlock
ResourceBlock

LessonManifest chỉ sắp xếp block.

Ví dụ:

{
  "blocks": [
    {
      "type": "video",
      "src": "intro.mp4"
    },

    {
      "type": "theory",
      "src": "theory.md"
    },

    {
      "type": "simulation",
      "src": "simulation.html"
    },

    {
      "type": "quiz",
      "src": "quiz.json"
    }
  ]
}

==================================================
XVI. SCHEMA VERSIONING
==================================================

Mọi manifest phải có:

schemaVersion

Ví dụ:

{
   "schemaVersion": "1.0"
}

Khi platform phát triển:

schema 1.0
schema 1.1
schema 2.0

phải có migration layer.

Không phá content cũ.

==================================================
XVII. BACKWARD COMPATIBILITY
==================================================

Một nguyên tắc bắt buộc:

CONTENT PACK HỢP LỆ HÔM NAY
PHẢI CÓ KHẢ NĂNG CHẠY SAU NHIỀU NĂM.

Không để UI refactor làm hỏng bài học cũ.

Runtime phải cung cấp compatibility adapter.

==================================================
XVIII. DESIGN SYSTEM
==================================================

Tất cả module sử dụng chung:

Bauman Design System.

Component chuẩn:

Card
Panel
Dialog
Toolbar
ResourceViewer
LessonHeader
ProgressBar
ActivityPanel
Search
Table
Form
EmptyState
LoadingState
ErrorState

Không để plugin tự tạo UI hỗn loạn.

Extension phải dùng Design Tokens.

==================================================
XIX. SECURITY
==================================================

Extension và external content phải chạy có sandbox.

Không cho plugin:

- đọc secret
- đọc cookie tùy tiện
- truy cập Control DB trực tiếp
- bypass Device Gate
- bypass authentication
- sửa learner state ngoài API

External HTML mặc định:

sandboxed iframe.

Capabilities phải explicit.

==================================================
XX. OFFLINE FIRST
==================================================

Mỗi content pack khai báo:

offlinePolicy

Ví dụ:

{
 "offline": {
   "mode": "available",
   "assets": [...]
 }
}

Content Engine tự tạo cache manifest.

Plugin phải khai báo offline capability.

==================================================
XXI. SEARCH
==================================================

Mọi content pack phải tự động index.

Search không phụ thuộc môn.

SearchIndex:

subject
course
chapter
lesson
resource
concept
formula
exercise
keyword

Plugin có thể cung cấp Search Provider.

==================================================
XXII. AI LAYER
==================================================

AI không được gắn cứng vào từng bài.

Xây dựng:

AI Capability Layer

Capabilities:

summarize
explain
translate
quiz-generation
study-plan
feedback
oral-defense
pronunciation
document-analysis

Một lesson chỉ khai báo:

ai.explain = enabled

Không viết logic AI riêng cho từng lesson.

==================================================
XXIII. EVENT BUS
==================================================

Các module không gọi chéo trực tiếp.

Sử dụng:

BaumanEventBus

Ví dụ:

lesson.opened

resource.opened

activity.started

activity.completed

assessment.completed

progress.changed

addon.loaded

offline.ready

Các module subscribe event.

Giảm coupling.

==================================================
XXIV. STORAGE ABSTRACTION
==================================================

Không để plugin gọi trực tiếp:

localStorage
IndexedDB
D1

Plugin gọi:

BaumanStorage

Storage provider quyết định:

memory
local
IndexedDB
cloud
D1
sync

Sau này đổi backend không phải sửa plugin.

==================================================
XXV. NO-CODE ADMIN AUTHORING
==================================================

Mục tiêu dài hạn:

Người quản trị có thể tạo lesson bằng giao diện:

Add block

→ PDF
→ Video
→ Text
→ Quiz
→ Simulation
→ URL
→ AI Activity

Drag & drop thứ tự.

Save.

Publish.

Không chạm code.

==================================================
XXVI. CONTENT LIFECYCLE
==================================================

Nội dung phải có lifecycle:

Draft
Review
Approved
Published
Archived

Version:

1.0
1.1
1.2

Không sửa trực tiếp bản đã publish.

==================================================
XXVII. PLUGIN LIFECYCLE
==================================================

Plugin có:

install
enable
disable
update
rollback
remove

Không được xóa dữ liệu người học khi disable plugin.

==================================================
XXVIII. OBSERVABILITY
==================================================

Mỗi extension phải có:

health
version
status

Admin có thể xem:

Loaded extensions
Failed extensions
Content errors
Missing capability
Manifest errors
Broken URLs
Offline failures

==================================================
XXIX. FAIL GRACEFULLY
==================================================

Nếu plugin lỗi:

platform vẫn chạy.

Nếu một PDF mất:

lesson vẫn mở.

Nếu external URL chết:

hiển thị trạng thái unavailable.

Không được để một content pack làm crash toàn site.

==================================================
XXX. AUTOMATED VALIDATION
==================================================

Trước khi publish content:

validate manifest
validate schema
validate assets
validate links
validate capabilities
validate security
validate offline

Output:

PASS
WARNING
FAIL

==================================================
XXXI. TESTING STRATEGY
==================================================

Tạo contract tests thay vì test từng bài thủ công.

Test:

Manifest Contract
Content Pack Contract
Resource Adapter Contract
Extension Contract
Storage Contract
Progress Contract
Offline Contract
Security ContractBackward Compatibility Contract

Một content pack hợp lệ phải tự pass toàn bộ.

==================================================
XXXII. REPOSITORY STRATEGY
==================================================

Tổ chức code dài hạn:

platform/
  kernel/
  runtime/
  ui/
  storage/
  search/
  offline/

sdk/
  extension-sdk/
  content-sdk/

extensions/
  pdf/
  video/
  quiz/
  simulation/
  ai/

content/
  subjects/

schemas/

tools/
  importer/
  validator/
  packager/

legacy/
  compatibility/

Core phải nhỏ dần tương đối.

Content và extension có thể tăng rất lớn.

==================================================
XXXIII. MIGRATION STRATEGY
==================================================

Không rewrite toàn bộ dự án.

Thực hiện incremental migration.

Nguyên tắc:

Strangler Pattern.

Module cũ vẫn hoạt động.

Từng phần được chuyển dần sang:

manifest
registry
adapter
extension

Khi phần mới PASS:

legacy implementation mới được retire.

==================================================
XXXIV. ROADMAP DÀI HẠN
==================================================

Không mở thêm L36 cho Roadmap V2.

Tạo architecture track riêng:

BAUMAN_EXTENSIBLE_PLATFORM_ARCHITECTURE

Có thể chia theo các Epoch:

E1
Platform Kernel Stabilization

E2
Universal Manifest Schema

E3
Content Registry

E4
Universal Resource Adapter

E5
Lesson Factory

E6
Subject Factory

E7
Extension Runtime

E8
Extension SDK

E9
Content Pack

E10
Import Center

E11
PDF Learning Engine

E12
HTML Micro-App Runtime

E13
URL Resource Adapter

E14
No-Code Authoring

E15
Capability Registry

E16
Event Bus

E17
Storage Abstraction

E18
Offline Package Runtime

E19
Search & Discovery Engine

E20
AI Capability Layer

E21
Plugin Sandbox

E22
Schema Migration / Compatibility

E23
Marketplace-ready Extension Registry

E24
Long-term Architecture Audit

Không giới hạn ở E24.

Nếu audit tìm ra thiếu kiến trúc quan trọng:

tạo Epoch mới có tên rõ ràng.

Không sinh Epoch chỉ để tăng số.

==================================================
XXXV. QUY TẮC THỰC THI
==================================================

Trong mỗi Epoch:

Audit
→ Spec
→ Implement
→ Test
→ Browser Acceptance
→ Backward Compatibility
→ Security
→ Offline
→ Whole System Gate

Có lỗi:

tự xác định root cause
→ sửa
→ chạy lại gate

Không bỏ qua lỗi.

Không hạ tiêu chuẩn test để đạt PASS.

Không thay đổi invariant cũ nếu không có lý do kiến trúc rõ ràng.

==================================================
XXXVI. MERGE RULE
==================================================

Không merge chỉ vì:

code compile
CI một phần xanh
UI nhìn ổn

Chỉ merge khi:

required gates PASS
browser acceptance PASS
current-main compatibility PASS
no regression
architecture boundary PASS

Sau merge:

kiểm tra post-merge gate.

==================================================
XXXVII. DEPLOYMENT RULE
==================================================

Giữ quy trình:

main SHA
→ DEPLOY_PREVIEW
→ exact revision smoke
→ DEPLOY_PRODUCTION
→ production read-back
→ production smoke

Không deploy production revision khác preview.

Không bypass exact revision gate.

==================================================
XXXVIII. ARCHITECTURAL PRIME DIRECTIVE
==================================================

Mỗi khi cần thêm tính năng mới, trước khi viết code phải hỏi:

"Chức năng này có thể được thêm dưới dạng
content pack, adapter, capability hoặc extension không?"

Nếu CÓ:

KHÔNG sửa Core.

Chỉ sửa Core khi:

platform thiếu một abstraction thực sự cần thiết cho nhiều module trong tương lai.

==================================================
XXXIX. SUCCESS CRITERIA DÀI HẠN
==================================================

Một ngày hệ thống phải đạt được trạng thái:

Tôi gửi cho hệ thống:

PDF
+
video
+
HTML simulation
+
quiz JSON

và khai báo:

manifest.json

Hệ thống tự tạo một lesson hoàn chỉnh gồm:

navigation
resource viewer
progress
offline
search
continue learning
activity history
AI support
assessment
responsive UI

mà không cần sửa một dòng code trong Core.

Đó là mục tiêu kiến trúc cuối cùng.

==================================================
XL. WORKING MODE
==================================================

Từ thời điểm áp dụng prompt này:

1. Luôn bắt đầu từ current main.
2. Audit kiến trúc hiện tại trước khi code.
3. Ưu tiên abstraction có thể tái sử dụng.
4. Không copy-paste một subsystem cho từng môn.
5. Không hard-code nội dung học vào UI.
6. Không thêm dependency trực tiếp giữa hai subject.
7. Dùng registry / contract / capability.
8. Giữ backward compatibility.
9. Mọi lỗi phát hiện phải sửa trước khi đi tiếp.
10. Chỉ merge khi full gate PASS.
11. Chỉ publish sau merge và exact revision validation.
12. Tự sinh Epoch tiếp theo nếu và chỉ nếu audit chỉ ra nhu cầu kiến trúc thật.

Mục tiêu không phải tạo càng nhiều code càng tốt.

Mục tiêu là:

CÀNG PHÁT TRIỂN LÂU,
CÀNG ÍT PHẢI SỬA CORE.