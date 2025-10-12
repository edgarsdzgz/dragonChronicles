# Pixel Art Button Color Palette Implementation Guide

## 🎨 Complete Color Palette

### Primary Color System
```css
/* Neon Blue System - Primary Accent */
--neon-primary: #00FFFF;    /* Main neon blue */
--neon-glow: #0088FF;       /* Glow effect */
--neon-accent: #0099FF;     /* Circuit pattern */
--neon-bright: #33FFFF;     /* Brightest highlight */

/* Bronze Metallic System - Frame Structure */
--bronze-primary: #CD7F32;  /* Main bronze */
--bronze-dark: #B87333;     /* Worn areas */
--bronze-light: #D4AF37;    /* Highlights */
--bronze-shadow: #8B4513;   /* Shadows */
--bronze-darker: #996633;   /* Deepest shadows */

/* Dark Panel System - Inner Recessed Area */
--panel-dark: #2C2C2C;      /* Main dark panel */
--panel-black: #1A1A1A;     /* Deepest areas */
--panel-texture: #404040;   /* Texture variation */
--panel-highlight: #4A4A4A; /* Subtle highlight */

/* Background System */
--bg-black: #000000;        /* Pure background */
--bg-shadow: #0A0A0A;       /* Cast shadows */
--bg-deep: #111111;         /* Deep background */
```

## 🎯 Pixel Art Implementation Techniques

### 1. Button Structure (Layers from Back to Front)
```
Layer 1: Background (#000000)
Layer 2: Bronze Frame Shadow (#8B4513)
Layer 3: Bronze Frame Main (#CD7F32)
Layer 4: Bronze Frame Highlight (#D4AF37)
Layer 5: Dark Panel Recess (#1A1A1A)
Layer 6: Dark Panel Main (#2C2C2C)
Layer 7: Neon Border (#00FFFF)
Layer 8: Neon Icon (#00FFFF)
```

### 2. Pixel Art Shading Rules
- **3-4 color gradients** maximum per element
- **Dithering** for smooth transitions
- **Consistent light source** (top-left)
- **No anti-aliasing** - pure pixel edges

### 3. State Variations

#### Normal State (Neutral)
- Bronze frame: Full color palette
- Dark panel: Recessed appearance
- Neon elements: Standard brightness

#### Pressed State (Depressed)
- Bronze frame: Slightly darker overall
- Dark panel: More recessed (darker)
- Neon elements: Slightly dimmed

## 🔧 CSS Implementation

### Button Base Styles
```css
.pixel-button {
  /* Bronze Frame */
  background: linear-gradient(
    135deg,
    #D4AF37 0%,    /* Top-left highlight */
    #CD7F32 25%,   /* Main bronze */
    #B87333 75%,   /* Worn areas */
    #8B4513 100%   /* Bottom-right shadow */
  );
  
  /* Dark Panel */
  box-shadow: 
    inset 4px 4px 8px #1A1A1A,  /* Deep recess */
    inset 2px 2px 4px #2C2C2C,  /* Panel main */
    0 0 0 2px #00FFFF;          /* Neon border */
}

.pixel-button:active {
  /* Pressed State - More recessed */
  background: linear-gradient(
    135deg,
    #B87333 0%,    /* Darker bronze */
    #996633 25%,   /* Even darker */
    #8B4513 75%,   /* Shadow areas */
    #6B4526 100%   /* Deepest shadow */
  );
  
  box-shadow: 
    inset 6px 6px 12px #0A0A0A,  /* Deeper recess */
    inset 3px 3px 6px #1A1A1A,   /* Darker panel */
    0 0 0 2px #0088FF;           /* Dimmed neon */
}
```

## 🎮 Game-Specific Implementation

### PixiJS Sprite Implementation
```javascript
// Create button with pixel art colors
function createPixelButton(texture, buttonType) {
  const button = new Sprite(texture);
  
  // Apply pixel art styling
  button.filters = [];
  button.texture.source.scaleMode = 'nearest'; // Pixel perfect scaling
  
  // Color tinting for different states
  const normalTint = 0xFFFFFF;     // No tint
  const pressedTint = 0xCCCCCC;    // Slightly darker
  
  return button;
}
```

### Color Hex Values for PixiJS
```javascript
const BUTTON_COLORS = {
  neon: {
    primary: 0x00FFFF,    // #00FFFF
    glow: 0x0088FF,       // #0088FF
    accent: 0x0099FF,     // #0099FF
    bright: 0x33FFFF      // #33FFFF
  },
  bronze: {
    primary: 0xCD7F32,    // #CD7F32
    dark: 0xB87333,       // #B87333
    light: 0xD4AF37,      // #D4AF37
    shadow: 0x8B4513,     // #8B4513
    darker: 0x996633      // #996633
  },
  panel: {
    dark: 0x2C2C2C,       // #2C2C2C
    black: 0x1A1A1A,      // #1A1A1A
    texture: 0x404040,    // #404040
    highlight: 0x4A4A4A   // #4A4A4A
  },
  background: {
    black: 0x000000,      // #000000
    shadow: 0x0A0A0A,     // #0A0A0A
    deep: 0x111111        // #111111
  }
};
```

## 🎨 Pixel Art Creation Tips

### 1. Start with Structure
1. **Bronze Frame**: Create the outer metallic frame
2. **Dark Panel**: Add the recessed inner area
3. **Neon Elements**: Place the glowing blue accents
4. **Details**: Add texture and wear effects

### 2. Shading Techniques
- **Light Source**: Top-left corner
- **Gradients**: 3-4 colors maximum
- **Dithering**: Use checkerboard patterns for smooth transitions
- **Highlights**: Always on the light-facing edges

### 3. Color Harmony
- **Bronze + Neon Blue**: High contrast, futuristic
- **Dark Panels**: Create depth and dimension
- **Consistent Palette**: Use the same colors across all buttons

## 📐 Button Dimensions

### Recommended Sizes
- **Small**: 32x32px (for minimal UI)
- **Medium**: 48x48px (standard buttons)
- **Large**: 64x64px (primary actions)
- **Extra Large**: 80x80px (current implementation)

### Pixel Perfect Scaling
- Always use `nearest` filtering for pixel art
- Avoid fractional scaling
- Maintain 1:1 pixel ratios when possible
