# BAUMAN UI Contrast Constitution · E9

Status: normative  
Scope: every surface that loads `platform/ui/bauman-ui.css`  
Priority: readability first; decoration must never compete with learning content.

## 1. Non-negotiable principle

**Content must visually dominate its background.**

Backgrounds, gradients, illustrations, glow, texture and decorative imagery are supporting layers only. If any decorative treatment reduces text legibility, the decoration must be reduced, masked, dimmed or removed before text contrast is reduced.

## 2. Contrast hierarchy

Every readable surface must use the shared semantic hierarchy:

1. `--bui-text-primary` — headings, titles, key values and primary learning content.
2. `--bui-text-secondary` — body copy, descriptions and supporting instructions.
3. `--bui-text-tertiary` — metadata, timestamps and deliberately de-emphasized information only.
4. `--bui-text-on-accent` — text placed on saturated/accent buttons.
5. `--bui-text-on-media` — text placed over images, gradients or decorative media.

Do not create arbitrary grey text in component styles. New components consume semantic tokens.

## 3. Minimum readability gates

- Normal text: target contrast ratio **>= 4.5:1**.
- Large/bold display text: target **>= 3:1**.
- Interactive controls and meaningful boundaries: target visual contrast **>= 3:1** against adjacent surfaces.
- Placeholder/help text must remain clearly readable and may not be used as a substitute for labels.
- Disabled states are the only routine exception to full reading contrast.

Automated tests are a floor, not a substitute for screenshot review.

## 4. Surface separation

The canvas, primary surface, secondary surface and elevated surface must be visibly distinct.

- Page canvas is the quietest layer.
- Cards/panels must separate from canvas with both surface delta and border/elevation.
- Nested controls must separate from the card they belong to.
- A border may reinforce hierarchy, but a border alone must not carry all separation.

## 5. Media and hero content

Text may not sit directly on uncontrolled image luminance.

A hero/media component containing text must provide a stable readability layer:
- dark/light scrim,
- solid/near-solid copy panel,
- or another deterministic treatment that protects the text.

Glow and bright image hotspots must not sit behind primary copy.

## 6. Typography hierarchy

- Primary headings use `--bui-text-primary`.
- Body content uses `--bui-text-secondary` only when the hierarchy benefits from de-emphasis.
- Tertiary text is reserved for metadata; never for core instructions, lesson names, schedule names or actionable information.
- Links/actions must remain visibly distinguishable without relying on low-opacity text.

## 7. Controls

Primary actions must have decisive foreground/background separation. Secondary and ghost controls must remain readable against their parent surface.

Input text, placeholder text, icons and focus rings must remain visible in both light and dark themes.

## 8. Responsive invariance

Contrast hierarchy may not degrade at desktop, ASUS-class laptop, iPad mini or iPhone breakpoints. Responsive CSS may change layout, density and decorative content, but not reduce the semantic text hierarchy.

## 9. Anti-patterns

Forbidden:
- opacity-based body copy that becomes unreadable;
- text over bright/unmasked artwork;
- a card surface visually indistinguishable from page canvas;
- tertiary text for core learning content;
- decorative glow stronger than adjacent text;
- hard-coded component colors outside the token source of truth;
- passing CI solely because there is no overflow.

## 10. Required review gates

Every material UI change must pass:
1. static semantic-token gate;
2. browser contrast assertions on representative text/surfaces;
3. iPhone 375/390/393/430 screenshots;
4. iPad mini 744/768/820 screenshots;
5. desktop 1366/1440/1920 screenshots;
6. manual visual review for hierarchy, legibility and decoration competition.

If automation and screenshot review disagree, screenshot readability wins and the implementation must be revised.

## 11. Change rule

Any exception to this constitution must be explicit, documented and local. It may not silently weaken the shared token scale.
