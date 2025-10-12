# UI Assets Organization

This directory contains all user interface assets organized by function and type.

## Directory Structure

### `buttons/`
Interactive UI elements organized by category:
- `movement/` - Movement control buttons (reverse, pause, forward)
- `menu/` - Menu navigation buttons
- `action/` - Action buttons (attack, abilities, etc.)

### `panels/`
Background panels and containers:
- Currency panels
- Health bar backgrounds
- Menu backgrounds
- Dialog boxes

### `icons/`
Status indicators and currency icons:
- Currency icons (Arcana, Soul Power, etc.)
- Status indicators
- UI decoration icons

### `effects/`
Visual effects for UI elements:
- Button hover states
- Button press animations
- UI transitions
- Particle effects

## Asset Naming Convention

- Use descriptive names: `currency_panel.png`, `movement_button_reverse.png`
- Include state suffixes: `button_hover.png`, `button_pressed.png`
- Use lowercase with underscores: `soul_power_icon.png`

## Future Expansion

This structure supports:
- Theme variations (`themes/dark/`, `themes/light/`)
- Resolution variants (`@2x/`, `@3x/`)
- Animation sequences (`button_01.png`, `button_02.png`)
- Localization variants (`en/`, `es/`, etc.)
