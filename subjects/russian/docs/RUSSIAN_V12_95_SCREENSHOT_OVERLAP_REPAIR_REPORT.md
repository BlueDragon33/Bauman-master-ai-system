# Russian Bauman V12.95 · Screenshot overlap repair

Scope: direct fixes for the two latest screenshots.

## Nghe/Nói
- Removed the large duplicated right-panel situation title and purpose text that was marked with a red cross.
- Rebuilt the right header as a compact chip + small context label + role buttons.
- Changed the left dialogue cards to stop showing the long subtitle/purpose in the list. The list now shows only title + level/turn count, preventing text from spilling outside the card.
- Added stronger card containment: full-width card, hidden horizontal overflow, auto height, stable internal list scroll.

## Lý thuyết
- Removed the repeated huge slide title inside the content card, the content marked with a red cross.
- Kept the compact header and slide selector, but reduced slide selector height.
- Made the theory content body scroll inside the right panel so long lesson content can be read without expanding over the frame.

## Integrity
- Did not modify data JSON.
- Did not alter lessonId/exercise/speaking mappings.
