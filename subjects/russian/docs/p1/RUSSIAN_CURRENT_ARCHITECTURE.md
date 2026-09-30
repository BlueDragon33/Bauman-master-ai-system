# Russian P1 Current Architecture

Base SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`

```mermaid
flowchart TD
  B[Browser] --> H[subjects/russian/index.html]
  H --> CSS[12 CSS layers]
  H --> AD[subject-adapter + content-contract]
  H --> FB[Foundation identity + shared host bridge]
  H --> PB[planning-bridge]
  H --> CORE[core.js]
  H --> LS[learning-state.js]
  H --> LF[learning-flow.js]
  H --> HW[handwriting authority + recognition]
  H --> SRS[vocab-srs.js]
  H --> SPK[speaking-coach.js]
  H --> ACAD[academic-language.js]
  H --> CAP[capability-progression.js]
  H --> AI[ai-mentor-guard.js]
  H --> OPT[runtime-optimizer.js]
  H --> FUT[russian-future-ui.js]
  CORE --> DATA[Required JSON data]
  AD --> DATA
  AD --> OPTDATA[Optional huge datasets]
  OPTDATA --> CHUNK[russian-optional-data-loader / packaged chunks]
  CORE --> STORE[localStorage learner/core state]
  LS --> LSTORE[learning-state localStorage]
  SRS --> SSTORE[SRS localStorage]
  SPK --> SPSTORE[speaking coach / core speech state]
  OPT --> CACHE[Cache Storage + service worker]
  PB <--> HUB[Main Hub]
  FUT --> DOM[Final DOM]
  CORE --> DOM
  LS --> DOM
  LF --> DOM
  SRS --> DOM
  SPK --> DOM
  ACAD --> DOM
```

## Current reality
The product is not a single renderer + single engine. It is a layered runtime where `core.js` remains broad and specialized engines/enhancers mutate/read around it.

This diagram describes present runtime boundaries only; it is not the target architecture.
