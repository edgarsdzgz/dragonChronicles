# Profile UI Shape Specifications

## Overview

Complete technical specifications for all profile UI shapes used in the Draconia Chronicles game. All measurements are in pixels unless otherwise specified.

---

## Common Specifications

### Colors

- **Dark Green (Primary)**: `0x1a3d2d` - Main shape color
- **Gold**: `0xFFD700` - Gold gem
- **Ruby**: `0xE0115F` - Ruby gem
- **Sapphire**: `0x0F52BA` - Sapphire gem
- **Unlit Gem Outline**: `0x4a6d5b` - Muted green, 60% opacity

### Angled Corner (Standard)

- **Size**: 15×15px triangle
- **Style**: Concave hypotenuse with quadratic curve
- **Control Point**: 2px from corner (creates dramatic inward curve)
- **Usage**: All corners except those with specific cuts

### Gem Specifications

- **Radius**: 12px
- **Diameter**: 24px
- **Lit Style**: Filled circle with color
- **Unlit Style**: Outline only, 2px stroke width

---

## 1. NAMEPLATE (Standalone)

### Base Shape

- **Dimensions**: 500×80px
- **Color**: `0x1a3d2d` (dark green)
- **Opacity**: 1.0 (100%)
- **Corners**: Sharp (no rounding)

### Angled Corners (3)

Applied to: Bottom-left, Top-left, Top-right

- Each corner: 15×15px with concave curve

### Bottom-Right Cutout

**Triangle Section:**

- Vertices: (250, 80) → (300, 80) → (300, 40)
- Dimensions: 50px wide × 40px tall
- Right angle at: (300, 80)

**Rectangle Section:**

- Position: (300, 40)
- Dimensions: 200×40px
- Extends to: (500, 80)

### Gem Position (Standard for ALL Nameplates)

- **Position**: x=480, y=20 (relative to nameplate origin)
- **Padding**: 8px from right edge, 8px from top, 8px from bottom
- **Gem Type**: Gold (0xFFD700) for standalone

**Calculation:**

- Right edge padding: 500 - 8 - 12 (radius) = 480
- Top padding: 8 + 12 (radius) = 20
- Stub height: 40px, gem centered: (40 - 24) / 2 = 8px padding

---

## 2. SIMPLE ATTACHMENT

### Base Shape

- **Dimensions**: 500×80px
- **Color**: `0x1a3d2d` (dark green)
- **Opacity**: 1.0 (100%)

### Angled Corners (2)

Applied to: Bottom-right, Top-right

- Each corner: 15×15px with concave curve

### Top-Left Rectangular Cut

- **Position**: (0, 0)
- **Dimensions**: 260×48px
- **Percentages**: 52% of width, 60% of height

### Bottom-Left Triangle Cut

- **Vertices**: (10, 48) → (50, 48) → (10, 80)
- **Dimensions**: 40px wide × 32px tall
- **Offset**: 10px from left edge
- **Right angle at**: (10, 48)
- **Proportions**: Width = Height × 1.25

### Floating Rectangle Cut

Removes gap between rectangular and triangle cuts:

- **Position**: (0, 48)
- **Dimensions**: 10×32px

### Decorative Concave Corner

- **Size**: 15×15px
- **Position**: x=260, y=0 (at right edge of rectangular cut)
- **Transform**: Horizontally flipped (scale.x = -1)
- **Color**: Matches attachment (0x1a3d2d)

### Nameplate Gem

- **Position**: x=480, y=20 (standard nameplate position)
- **Type**: Ruby (0xE0115F)

### Attachment Gem (Unlit)

- **Position**: x=280, y=20 (relative to attachment origin)
- **Calculation**: rectCutWidth (260px) + 8px padding + 12px radius = 280
- **Type**: Unlit outline
- **Details**: 8px from left edge of uncut area, same y-axis as nameplate gem

---

## 3. EXTENDED ATTACHMENT (Complex)

### Base Shape

- **Total Dimensions**: 500×380px
- **Top Section**: 80px (same as simple attachment)
- **Extension**: 300px
- **Color**: `0x1a3d2d` (dark green)
- **Opacity**: 1.0 (100%)

### Top Section (80px)

Identical to Simple Attachment:

- Angled corner: Top-right (15×15px)
- Top-left rectangular cut: (0, 0) → (260, 48)
- Bottom-left triangle cut: (10, 48) → (50, 48) → (10, 80)
- Floating rectangle cut: (0, 48) → (10, 80)

### Extension Section (300px)

**Initial**: Full 500px width

**Left Side Cut:**

- **Position**: (0, 80)
- **Dimensions**: 10×300px
- **Purpose**: Narrows extension to 490px, aligns right edge

**Width Calculation:**

- Original: 500px
- Cut: 10px (2% from left)
- Final: 490px wide

### Bottom-Right Corner Cut

- **Size**: 15×15px
- **Position**: (485, 365) → (500, 380)
- **Style**: Concave curve

### Decorative Concave Corner

- **Size**: 15×15px
- **Position**: x=260, y=0
- **Transform**: Horizontally flipped
- **Color**: 0x1a3d2d

### Nameplate Gem

- **Position**: x=480, y=20 (standard position)
- **Type**: Sapphire (0x0F52BA)

### Attachment Gem (Unlit)

- **Position**: x=280, y=20 (relative to attachment origin)
- **Type**: Unlit outline
- **Details**: 8px from left edge of uncut area, same y-axis as nameplate gem

---

## Positioning & Layout

### Template Spacing

All three profile templates displayed with equal vertical spacing:

- **Template 1 (Standalone)**: y=100
- **Template 2 (Simple)**: y=200 (100px gap)
- **Template 3 (Extended)**: y=300 (100px gap)

### Attachment Overlap

Attachments overlap nameplates by 50%:

- **Nameplate origin**: x=50
- **Attachment origin**: x=300 (50% of 500px = 250px offset)

### Gem Alignment

**Nameplate Gems (All Types):**

- Always at x=480, y=20 relative to nameplate origin
- 8px padding from edges

**Attachment Gems (Unlit):**

- Always at x=280, y=20 relative to attachment origin
- 8px from left edge of uncut area
- Shares same y-axis as corresponding nameplate gem

---

## Implementation Notes

### Concave Corner Creation

```
1. moveTo(startPoint)
2. lineTo(cornerPoint)
3. lineTo(endPoint)
4. quadraticCurveTo(controlPoint, startPoint)
5. cut()
```

**Control Point Offset**: 2px from corner in both x and y directions creates dramatic inward curve

### Attachment Overlap Calculation

```
attachmentX = nameplateX + (nameplateWidth * 0.5)
attachmentX = 50 + (500 * 0.5) = 300
```

### Gem Position Calculations

**Nameplate Gem:**

```
x = nameplateWidth - padding - gemRadius
x = 500 - 8 - 12 = 480

y = padding + gemRadius
y = 8 + 12 = 20
```

**Attachment Gem:**

```
x = rectCutWidth + padding + gemRadius
x = 260 + 8 + 12 = 280

y = padding + gemRadius
y = 8 + 12 = 20
```

---

## Color Reference

| Element       | Hex Code | RGB         | Usage                         |
| ------------- | -------- | ----------- | ----------------------------- |
| Primary Shape | 0x1a3d2d | 26, 61, 45  | All shapes                    |
| Gold Gem      | 0xFFD700 | 255, 215, 0 | Standalone nameplate          |
| Ruby Gem      | 0xE0115F | 224, 17, 95 | Simple attachment nameplate   |
| Sapphire Gem  | 0x0F52BA | 15, 82, 186 | Extended attachment nameplate |
| Unlit Outline | 0x4a6d5b | 74, 109, 91 | Attachment gems               |

---

## Summary Dimensions

| Shape               | Width   | Height | Total Area |
| ------------------- | ------- | ------ | ---------- |
| Nameplate           | 500px   | 80px   | 40,000px²  |
| Simple Attachment   | 500px   | 80px   | 40,000px²  |
| Extended Attachment | 490px\* | 380px  | 186,200px² |

\*After left side cut applied

**Total UI Width**: 550px (50px start + 500px nameplate)
**Total UI Height**: 480px (y=100 to y=380 + 80px + 20px buffer)

---

## Magical Effects & Animations

### Gem 3D Appearance

All gems use layered shapes to create 3D translucent appearance:

**Lit Gems (Powered):**

- **Base Color**: Full gem color at 100% opacity
- **Edge Ring**: White (0xFFFFFF) at 15% opacity
- **Inner Shadow**: Black (0x000000) ellipse at 20% opacity, offset 15% of radius
- **Main Highlight**: Large oval (60% × 50% of radius) at 25% opacity, upper portion (-30% Y offset)
- **Secondary Highlight**: Smaller oval (35% × 25% of radius) at 50% opacity, top edge (-60% Y offset)
- **Bright Spot**: Smallest oval (20% × 15% of radius) at 80% opacity, top-left (-25% X, -55% Y offset)

**Unlit Gems (Unpowered):**

- **Base Color**: Crystalline gray (0x9eadb5) at 30% opacity
- **Highlights**: Same as lit gems but stronger (35%, 60%, 80% opacity) for glass effect
- **Edge Stroke**: Light blue (0xccddee) at 40% opacity, 1px width
- **No Glow**: No magical glow layers or particles

### Magical Glow (Lit Gems Only)

Three concentric circular layers behind gem, using brightened color (30% lighter):

| Layer  | Radius Multiplier | Alpha | Purpose         |
| ------ | ----------------- | ----- | --------------- |
| Outer  | 1.6×              | 0.15  | Soft aura       |
| Middle | 1.35×             | 0.22  | Glow body       |
| Inner  | 1.15×             | 0.30  | Core brightness |

**Glow Pulsing Animation:**

- **Speed**: 2.0 (normal state)
- **Amount**: ±15% alpha variation
- **Formula**: `1.0 + sin(time × speed) × 0.15`

### Magical Particles

**Particle Appearance:**

- **Size**: 12% of gem radius (varied 60%-100% for diversity)
- **Base Shape**: Colored circle using lightened gem color (40% lighter) at 70% opacity
- **Highlight**: White ellipse at 60% opacity, offset -35% Y, size 40% × 30%
- **Bright Spot**: White circle at 80% opacity, size 20% of particle

**Particle Behavior:**

- **Spawn Rate**: 1-2 particles every 0.15 seconds per lit gem
- **Spawn Location**: Random point on/near gem surface (70%-100% of radius from center)
- **Movement**: Upward drift (-0.5 to -1.0 Y velocity), slight horizontal sway (±0.3 X velocity)
- **Lifespan**: Fades in 40% the time of original (2.5× faster decay)
- **Fade Curve**: `alpha = life × 0.7` for smooth ethereal fade
- **Max Distance**: Particles fade completely within ~2-3 gem radii

**Particle Colors (Lightened 40%):**

- Gold: Brighter gold
- Ruby: Lighter crimson
- Sapphire: Lighter azure

### Hover Interactions

**Lit Gems (Hovered):**

- **Glow Pulse**: Slows to 1.0 speed (from 2.0) for breathing effect
- **Glow Amount**: Increases to ±25% (from ±15%)
- **Glow Brightness**: 30% brighter (1.3× alpha multiplier)
- **Particles**: Same spawn rate as normal

**Unlit Gems (Hovered):**

- **Soft Glow Appears**: Three layers using designated color (not gray)
  - Outer: 1.4× radius, 0.06 alpha
  - Middle: 1.2× radius, 0.10 alpha
  - Inner: 1.05× radius, 0.15 alpha
- **Glow Fade**: Smooth fade in/out with 8% speed per frame
- **Particles**: Very rare spawn (every 0.8s, 20% chance)
- **Color**: Uses designated gem color (gold/ruby/sapphire)

**Gem Color Assignments:**

- Standalone nameplate unlit: Would be gold (none in current test)
- Simple attachment unlit: Ruby (0xE0115F)
- Extended attachment unlit: Sapphire (0x0F52BA)

### Color Lightening Function

Magical glows and particles use mathematically lightened colors:

```typescript
function lightenColor(color: number, factor: number): number {
  r' = r + (255 - r) × factor
  g' = g + (255 - g) × factor
  b' = b + (255 - b) × factor
}
```

**Glow Lightening**: 30% factor
**Particle Lightening**: 40% factor

### Animation Performance

- **Particle Cleanup**: Automatic removal when life reaches 0
- **Glow Updates**: Per-frame alpha updates based on pulse/hover state
- **Hover Fade**: Smooth interpolation at 8% per frame
- **Update Rate**: Tied to ticker, normalized to 60 FPS

---

## Technical Implementation

### File Location

`apps/web/src/lib/pixi/systems/profile-shapes-test.ts`

### Key Functions

- `createNameplateShape()`: Standalone nameplate (lines 33-106)
- `createMirroredNameplateShape()`: Simple attachment (lines 122-193)
- `createExtendedAttachmentShape()`: Extended attachment (lines 212-292)
- `createConcaveCornerShape()`: Decorative corner (lines 299-315)
- `createGemCircle()`: 3D gem with highlights (lines 335-376)
- `createMagicalGem()`: Gem with glow layers (lines 383-413)
- `lightenColor()`: Color brightness utility (lines 419-429)
- `ProfileShapesTestManager`: Complete test scene (lines 553-924)

### PixiJS Graphics API Usage

- `.rect()`: Rectangles
- `.circle()`: Circles and gems
- `.ellipse()`: Ovals for highlights
- `.poly()`: Triangles and complex shapes
- `.quadraticCurveTo()`: Concave curves
- `.fill()`: Fill with color and alpha
- `.cut()`: Boolean subtraction
- `.stroke()`: Outlines

---

## Version History

**Version 1.0** (Initial)

- Basic shapes with angled corners
- Static gem circles

**Version 2.0** (Current)

- 3D gem appearance with highlights
- Magical glow layers with pulsing animation
- Particle system with 3D orbs
- Hover interactions for lit and unlit gems
- Crystal appearance for unlit gems
- Performance optimized particle lifecycle
