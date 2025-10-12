# Movement Control Buttons

This directory contains UI assets for movement control buttons.

## Current Implementation

The movement buttons are currently created programmatically in `scrolling-background.ts` using PixiJS Graphics, but this directory is ready for custom button assets.

## Planned Assets

- `reverse_button.png` - Reverse movement button (<)
- `pause_button.png` - Pause/play button (||)
- `forward_button.png` - Forward movement button (>)

## Button States

Each button should have multiple states:
- `_normal.png` - Default state
- `_hover.png` - Hover state
- `_pressed.png` - Pressed/active state
- `_disabled.png` - Disabled state

## Specifications

- **Size**: 40x40px (matches current programmatic buttons)
- **Style**: Rounded corners, semi-transparent background
- **Colors**: 
  - Normal: `0x666666` (gray)
  - Active: `0x4CAF50` (green)
  - Hover: Lighter shade of normal color
