# Cursive glyph outline provenance

The offline SVG glyph outlines used by `cursive-glyphs.js` are derived from the Cyrillic glyph outlines in **Marck Script**, licensed under the SIL Open Font License 1.1.

- Source repository: `librefonts/marckscript`
- Source file: `MarckScript-Regular.ttf._g_l_y_f.ttx`
- Source blob SHA: `c8de09a9e2224c26997f8e938ed47fb3d26d72fe`
- License source: `OFL.txt`
- License blob SHA: `a06635f4e388ec16b1a4d2c9f81a8d44c271ec07`
- Extraction: TrueType on/off-curve contour points converted to SVG quadratic path commands.
- Packaging: only glyph-outline path data is embedded; no font binary is bundled by the Russian subject.

The learner runtime keeps distinct uppercase and lowercase outlines for all 33 Russian Cyrillic letters. This replaces the earlier hand-authored approximation and removes dependence on an installed operating-system handwriting font.
