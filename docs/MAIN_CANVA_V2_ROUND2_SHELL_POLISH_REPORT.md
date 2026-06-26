# MAIN CANVA V2 · Round 2 Shell Polish

## Scope
- Login/auth screen
- Sidebar / navigation / collapsed mode
- Topbar / action buttons
- Appearance dropdown
- Profile dropdown

## Changes
- Added `canva-main-v2` class to body while preserving `canva-main-v1`.
- Enhanced login card with visual mark, compact feature pills, safer admin note styling.
- Rebuilt sidebar as a floating Canva-style panel with active rail marker and better icon rhythm.
- Rebuilt topbar as a glass card with wrapped responsive actions.
- Polished appearance/profile menus with glass panels, readable typography, and safer mobile width.

## Safety
- Existing IDs retained: loginEmail, loginPass, loginBtn, appearanceBtn, profileBtn, etc.
- No JS logic changed in this round.
- CSS scoped to `body.canva-main-v2` to avoid breaking content pages.
