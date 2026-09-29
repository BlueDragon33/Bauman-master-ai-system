# Bauman UI Contrast Constitution

Version: UI-E9  
Status: normative  
Scope: Bauman Master Hub and shared Future Interface System

## 1. Prime rule

**Content must visually dominate the background.** Decorative imagery, gradients, glow,
wallpaper, borders and motion are subordinate to readable information. A screen is not
accepted merely because it has no overflow or geometry collision.

## 2. Semantic hierarchy

Every interface surface must use the shared `--bui-hub-*` semantic tokens.

| Role | Contract |
| --- | --- |
| Primary text | Titles, main values, active navigation, essential labels |
| Secondary text | Normal body copy and explanatory content |
| Muted text | Metadata, dates, captions, secondary progress labels |
| Subtle text | Tertiary non-essential information only |
| Accent | Links, meaningful highlights and deliberate callouts |
| Primary action | Dedicated action background/text pair; never decorative text colors |
| Surface 1 | Main card/panel plane |
| Surface 2 | Nested rows, chips, schedule items and secondary cards |
| Surface 3 | Tracks and tertiary structural planes |
| Strong border | Interactive controls or boundaries that must remain visible |

Hard-coded local text colors are not permitted in the shared UI-E9 enforcement layer.
New components must consume semantic tokens rather than inventing another gray/blue/gold.

## 3. Contrast floor

The token system must maintain:

- normal readable text: at least **4.5:1** against intended surfaces;
- large text: at least **3:1**;
- essential controls, focus boundaries and meaningful non-text UI: at least **3:1**;
- placeholder/help text intended to be read: at least **4.5:1**;
- disabled controls are the only routine low-emphasis exception.

UI-E9 intentionally keeps secondary and muted Hub text comfortably above the minimum
instead of targeting the threshold exactly.

## 4. Background and image rule

Text over photography, illustration, wallpaper, glow or gradients must have a scrim or
equivalent deterministic separation layer. The decoration may remain visible, but may
not compete with the copy.

Hero and motivation artwork must therefore satisfy all of the following:

1. copy is rendered above the overlay;
2. heading uses primary text;
3. supporting text uses semantic secondary/accent text;
4. the overlay is strong enough to stabilize legibility across the whole image;
5. text shadow may assist media-backed text, but cannot replace the scrim.

## 5. Surface separation

Canvas, panel, nested panel and control surfaces must be visually distinguishable.
Do not solve hierarchy by reducing text opacity. Prefer surface elevation, border
separation and spacing.

Interactive boundaries that carry meaning use the strong border token. Decorative
boundaries may use the subtle border token.

## 6. Typography rule

- Heading and essential values: primary text.
- Body copy: secondary text.
- Metadata/captions: muted text.
- No readable text may be faded with arbitrary `opacity`.
- Truncation may shorten text but cannot make it lower contrast.
- Font size is not a substitute for contrast.

## 7. Controls and forms

Inputs, search fields, dropdowns and textareas must expose:

- readable entered text;
- readable placeholder text;
- visible boundary against the containing surface;
- visible keyboard focus;
- distinct primary versus secondary actions.

Primary action foreground/background is a tested semantic pair.

## 8. Responsive invariance

The hierarchy above is invariant across:

- desktop 1920 / 1440 / 1366;
- iPad mini portrait 744 / 768 / 820;
- iPad landscape 1024;
- iPhone 375 / 390 / 393 / 430.

Responsive layout may change geometry, but must not lower text contrast to make a
compact layout appear lighter.

## 9. Theme invariance

Academic, Night, Mint and Paper themes each project the same semantic hierarchy.
Theme choice may change hue and lightness direction; it may not weaken the content
priority contract.

## 10. Acceptance gate

A contrast change is mergeable only when all of the following pass:

1. semantic token ratio test;
2. shared-kernel static architecture test;
3. browser contrast contract on representative high-risk text/control surfaces;
4. desktop, iPad mini and iPhone screenshots reviewed visually;
5. no regression in collision/overflow/touch-target gates;
6. CI green before merge.

A screenshot that is technically inside the viewport but visually unreadable is a FAIL.

## 11. Change discipline

When a future screen violates this constitution:

1. fix the semantic token or shared component layer first;
2. use a route-specific override only when the semantic role is genuinely different;
3. never fix contrast by adding another arbitrary low-opacity color;
4. extend the gate so the same failure cannot silently return.

Production deployment is outside this constitution and requires its own explicit release
decision.
