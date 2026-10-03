# 05 — Extension and Content Architecture

## Goal

New PDF, URL, HTML app, video, simulation, question type or subject should increasingly be installable as data/package/extension rather than requiring Core edits.

## Package hierarchy

```text
SubjectPackage
  ├─ subject.manifest
  ├─ courses/
  ├─ content-packs/
  ├─ resources/
  ├─ optional extensions/
  └─ integrity/provenance metadata
```

A `.baumanpack` may be a ZIP-compatible package, but the logical contract matters more than the filename.

## Universal resource descriptor

Every learning resource should normalize into a ResourceDescriptor:

```json
{
  "id": "bd:source:math:pca-core-pdf",
  "schemaVersion": "1.0",
  "type": "pdf",
  "source": "resources/pca.pdf",
  "role": "core-reading",
  "capabilities": ["resource.pdf.read"],
  "offlinePolicy": "available"
}
```

## Resource adapters

Initial adapter families:

- PDF
- Markdown/Text
- Image
- Video
- Audio
- URL
- HTML Micro-App
- Quiz/Question
- Simulation
- Code/Notebook
- External App

Adapters render resources. They do not own curriculum or mastery.

## Extension lifecycle

`discover → validate → install/register → enable → run → disable → update → rollback → remove`

Disabling an extension must not silently delete learner data.

## Extension SDK

The long-term SDK should expose stable, narrow APIs such as:

- register capability/provider;
- read approved context;
- store namespaced state;
- emit versioned events;
- request progress/evidence operations through authority ports;
- use Design System slots/components.

It must not expose internal DOM structure or direct database handles.

## HTML Micro-App boundary

HTML apps run sandboxed by default and communicate through an explicit host bridge.

Allowed examples:

- get current lesson context;
- emit activity completion;
- save namespaced extension state;
- request fullscreen;
- produce evidence through an approved evidence provider.

Forbidden:

- reading secrets;
- parent DOM mutation;
- direct mastery mutation;
- direct D1 access;
- bypassing Device Gate.

## Import Center

Long-term flow:

`Upload/Paste URL → Detect → Extract metadata → Draft manifest → Academic mapping → Preview → Validate → Review → Publish`

Normal authors should not need JSON.

## Content pack quality

A content pack fails independently without crashing the platform.

Validation covers:

- schema;
- duplicate IDs;
- missing assets;
- integrity/checksums;
- provenance;
- capabilities;
- security policy;
- offline policy;
- academic mapping.

