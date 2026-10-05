# HUB-C2 — PRIMARY PAGE UX CONTRACT

Status: CHAT COMPLETE
Baseline reviewed: main@dc7fd3d8d90b6a84504f35ae2049752c6f339462

## Global shell

Bauman Hub has exactly five primary destinations:
1. Trang chủ
2. Lộ trình
3. Môn học
4. Lịch học
5. НИР & Luận văn

No second top-level navigation should duplicate these destinations.

Shared behavior:
- one stable sidebar/topbar shell;
- shared typography, spacing, focus, theme and responsive tokens;
- readable content before decoration;
- no page-specific second design system;
- desktop, tablet and phone layouts are deliberate rather than scaled copies;
- 44px minimum important touch targets;
- visible keyboard focus;
- normal text uses the shared readable scale.

## Presentation ownership

Each route gets one presentation owner.

### Home
Owner: shared dashboard contract.
Purpose: orientation and next action, not full detail.

Required regions:
- current stage / current learning context;
- continue learning;
- high-signal subject summary;
- today/next schedule;
- overall progress with truth-state handling;
- contextual Hub assistant.

Do not duplicate detailed schedule, full subject catalog or thesis workspace on Home.

### Roadmap
Owner: roadmap reference contract.
Purpose: where the learner is, what comes next, and how stages connect.

Required regions:
- current stage;
- stage/semester timeline;
- subject/course filters;
- stage coverage/progress;
- upcoming work;
- action to Subjects/Schedule.

Unknown progress must remain unknown and must not be averaged as zero.

### Subjects
Owner: subject catalog/workspace contract.
Purpose: browse registered subjects and launch the correct subject workspace.

Required regions:
- stage/semester selector;
- subject cards from registered descriptors;
- health/progress/resume state when exported;
- next Hub schedule item;
- launch action.

Teacher, progress, deadlines and session counts must come from approved sources or show unavailable.
Do not show a normal learner action for direct subject editing.

### Schedule
Owner: Hub schedule contract.
Purpose: canonical planning surface.

Required regions:
- day/week/month;
- scheduled entries;
- priority/workload;
- upcoming work;
- planning suggestions;
- Hub notes;
- manual/automatic planning controls.

This page owns scheduling. Other pages link to it instead of recreating scheduling logic.

### Research / Thesis
Owner: Hub research workspace contract.
Purpose: plan and monitor НИР/VKR work without inventing research progress.

Required regions:
- topic/project setup state;
- milestones;
- tasks;
- notes;
- attachments;
- chapter/work-package status when configured;
- research activity summary;
- contextual assistant.

Default state is explicit unconfigured/empty state, not example progress.

## Truth-state presentation

Every data-bearing component supports:
- CURRENT
- STALE
- UNAVAILABLE
- LOCAL_HUB

Rules:
- CURRENT has no warning.
- STALE shows last-known value plus freshness cue.
- UNAVAILABLE uses neutral copy such as “Chưa có dữ liệu”.
- LOCAL_HUB is clearly a Hub note/plan, not subject evidence.

## Layering rule

The current index loads several historical Hub presentation layers together.
Future changes must converge toward:
- one shared shell/design-system layer;
- one presentation owner per route;
- compatibility hooks only where still required;
- no competing DOM renderers for the same page.

Legacy selectors may remain temporarily for regression compatibility, but new work targets the shared BUI contracts.

## Responsive contract

Desktop:
- sidebar + content + optional right rail;
- no forced one-screen compression.

Tablet:
- reduced shell;
- two-column where useful;
- horizontal snap for dense card groups.

Phone:
- single primary column;
- safe-area bottom navigation;
- short labels;
- decorative media may collapse;
- primary task/action stays visible.

## HUB-C2 outcome

The stable Hub information architecture is now fixed at five primary pages with one route owner each. Further Chat work should clean integration semantics and acceptance gates rather than inventing new top-level pages.
