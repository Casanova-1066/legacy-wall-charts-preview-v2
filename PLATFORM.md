# Legacy Wall Charts Platform v2

## Sprint 3 status

The Platform v2 development codebase now includes a real Template Workshop route and a canvas-based World Cup 2026 layout designer.

### Current MVP focus

- Launch with World Cup 2026 first.
- Keep Historical Library separate from editing.
- Use Template Workshop for customer-created blank charts.
- Support future sports through reusable layout blocks rather than one-off pages.

### Builder Engine included in this milestone

- Movable blocks using pointer drag.
- Resize handle per selected block.
- Snap-to-grid toggle.
- Show/hide grid toggle.
- Layer basics through z-index and bring-to-front.
- Lock/unlock blocks.
- Duplicate and delete blocks.
- Group-stage block configuration.
- Print size presets from A4 to A0 plus poster sizes.
- Landscape/portrait orientation.
- Background image URL and opacity.
- Local draft save.

### Next sprint

Sprint 4 should focus on account/auth and project persistence:

- Fix Neon sign-in callback/origin handling.
- Load local drafts in My Charts from the new builder storage key.
- Add cloud project table migration for builder projects.
- Sync guest draft to cloud after sign-in.

## World Cup 2026 MVP milestone

The World Cup 2026 template now uses a two-sided project:

- Front: Round of 32 through Final.
- Back: Groups A-L with editable team names, standings rows and blank fixture lines.
- Both sides use the same movable/resizable block engine.
- Users can switch sides, add blocks, upload a background by URL, save a local draft and print the active side.


## Build 006 — World Cup 2026 layout pack
- Full standings columns (P/W/D/L/GF/GA/GD/Pts)
- Round-of-32 through final bracket with date/venue fields
- Optional third-place match
- Editable knockout round names
- Fixture-list block
- One-click restore of the official blank World Cup 2026 layout
