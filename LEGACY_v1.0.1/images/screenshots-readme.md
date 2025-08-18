# Screenshots Required

To complete the verification, take these screenshots:

## `/images/phase0_overlay.png`
- Visit http://localhost:5173/ after `npm run dev`
- Show debug overlay in bottom-right of combat pane (purple area)
- Must contain all required lines:
  - Config loaded: true
  - Enemies: 0/48
  - Projectiles: 0/160
  - Spawns/s: 0.00
  - Cull count: 0
  - InRange: 0
  - Tracking: NO
  - Distance(UI/Worker): 0.00 / 0.00 km

## `/images/phase0_overlay_resized.png`
- Same page after resizing browser smaller
- Overlay still pinned 12px from combat pane edges

## `/images/phase1_tabs_focus.png`
- Focus on "Enchant" tab using keyboard
- Show visible focus ring
- Browser devtools showing role="tab" and aria-selected

## Optional: `/images/phase0_overlay_scroll.gif`
- Resize and scroll demonstration
- Show overlay remains anchored and non-interactive

Run this command to take screenshots programmatically:
```bash
npm run dev & sleep 3 && node take-screenshots.js
```