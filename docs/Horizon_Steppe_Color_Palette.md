# Horizon Steppe Color Palette

**Date**: September 18, 2025
**Region**: R01 - Horizon Steppe
**Purpose**: Comprehensive color palette for the first land's background design

## Color Palette Analysis

Based on the three steppe inspiration images and the existing Horizon Steppe
specification,
this
document
defines
the
complete
color
palette
for
background
design
in
the
first
land
of
Draconia
Chronicles.

### Primary Colors (Sky & Atmosphere)

#### Sky Colors

- **Horizon Blue**: `#87CEEB` (RGB: 135, 206, 235) - Main sky color

- **Cloud White**: `#F8F8FF` (RGB: 248, 248, 255) - Pure cloud highlights

- **Atmospheric Blue**: `#B0E0E6` (RGB: 176, 224, 230) - Mid-atmosphere tones

- **Distant Blue**: `#4682B4` (RGB: 70, 130, 180) - Far horizon mountains

#### Atmospheric Effects

- **Morning Mist**: `#E6F3FF` (RGB: 230, 243, 255) - Early morning atmosphere

- **Heat Shimmer**: `#F0F8FF` (RGB: 240, 248, 255) - Heat distortion effects

- **Wind Haze**: `#E0F6FF` (RGB: 224, 246, 255) - Wind-carried atmospheric particles

### Primary Colors (Grassland & Terrain)

#### Grass Colors

- **Golden Grass**: `#DAA520` (RGB: 218, 165, 32) - Primary grass color

- **Warm Amber**: `#FFA500` (RGB: 255, 165, 0) - Sunlit grass highlights

- **Prairie Gold**: `#B8860B` (RGB: 184, 134, 11) - Deeper grass shadows

- **Sage Green**: `#9CAF88` (RGB: 156, 175, 136) - Cooler grass areas

#### Terrain Colors

- **Earth Brown**: `#8B4513` (RGB: 139, 69, 19) - Exposed soil and paths

- **Sandy Beige**: `#F5DEB3` (RGB: 245, 222, 179) - Dry earth patches

- **Rich Loam**: `#654321` (RGB: 101, 67, 33) - Fertile soil areas

### Secondary Colors (Landmarks & Features)

#### Waystone Colors

- **Ancient Stone**: `#708090` (RGB: 112, 128, 144) - Base waystone material

- **Rune Glow**: `#00CED1` (RGB: 0, 206, 209) - Magical waystone inscriptions

- **Weathered Grey**: `#A9A9A9` (RGB: 169, 169, 169) - Aged stone surfaces

#### Water Features

- **Stream Blue**: `#4169E1` (RGB: 65, 105, 225) - River and stream colors

- **Reflection Silver**: `#C0C0C0` (RGB: 192, 192, 192) - Water surface reflections

### Accent Colors (Wind & Magic Effects)

#### Wind Effects

- **Zephyr Blue**: `#87CEFA` (RGB: 135, 206, 250) - Wind visual effects

- **Dust Swirl**: `#DEB887` (RGB: 222, 184, 135) - Wind-carried dust

- **Seed Drift**: `#F5F5DC` (RGB: 245, 245, 220) - Floating seed particles

#### Magical Elements

- **Arcana Shimmer**: `#FFD700` (RGB: 255, 215, 0) - Magical energy effects

- **Banner Red**: `#DC143C` (RGB: 220, 20, 60) - Enemy faction banners

- **Turquoise Accent**: `#40E0D0` (RGB: 64, 224, 208) - Nomad fetishes and decorations

### Lighting & Time of Day Variations

#### Golden Hour (Primary Lighting)

- **Warm Sunlight**: `#FFE4B5` (RGB: 255, 228, 181) - Primary lighting color

- **Long Shadows**: `#8B7355` (RGB: 139, 115, 85) - Shadow color in golden light

- **Rim Lighting**: `#FFEFD5` (RGB: 255, 239, 213) - Backlighting on grass

#### Midday Variations

- **Bright Sunlight**: `#FFFACD` (RGB: 255, 250, 205) - High noon lighting

- **Sharp Shadows**: `#696969` (RGB: 105, 105, 105) - Crisp midday shadows

#### Overcast Variations

- **Diffuse Light**: `#F5F5F5` (RGB: 245, 245, 245) - Cloudy day lighting

- **Soft Shadows**: `#D3D3D3` (RGB: 211, 211, 211) - Gentle overcast shadows

### Distance & Depth Colors

#### Foreground (0-500m)

- **Vivid Grass**: `#DAA520` (RGB: 218, 165, 32) - Full saturation grass

- **Clear Details**: `#8B4513` (RGB: 139, 69, 19) - Sharp terrain features

#### Middle Distance (500m-1km)

- **Muted Grass**: `#BDB76B` (RGB: 189, 183, 107) - Slightly desaturated

- **Soft Terrain**: `#A0522D` (RGB: 160, 82, 45) - Reduced contrast

#### Far Distance (1km+)

- **Hazy Grass**: `#F0E68C` (RGB: 240, 230, 140) - Atmospheric perspective

- **Mountain Silhouette**: `#2F4F4F` (RGB: 47, 79, 79) - Distant mountains

### Seasonal & Weather Variations

#### Spring Bloom

- **Fresh Green**: `#ADFF2F` (RGB: 173, 255, 47) - New grass growth

- **Wildflower Purple**: `#9370DB` (RGB: 147, 112, 219) - Scattered flowers

#### Summer Heat

- **Bleached Grass**: `#F0E68C` (RGB: 240, 230, 140) - Sun-dried vegetation

- **Heat Mirage**: `#FFFAF0` (RGB: 255, 250, 240) - Heat distortion

#### Storm Weather

- **Storm Grey**: `#2F4F4F` (RGB: 47, 79, 79) - Storm cloud colors

- **Lightning White**: `#F0F8FF` (RGB: 240, 248, 255) - Lightning flashes

### Implementation Guidelines

#### Color Temperature

- **Warm Bias**: Primary palette leans warm (2700K-3200K) for comfort

- **Cool Accents**: Sky and magic effects provide cool contrast

- **Neutral Grounding**: Stone and earth colors anchor the palette

#### Saturation Levels

- **High Saturation**: Foreground grass and magical effects (80-100%)

- **Medium Saturation**: Middle distance elements (60-80%)

- **Low Saturation**: Background and atmospheric elements (20-60%)

#### Contrast Ratios

- **Primary Elements**: 4.5:1 minimum for gameplay visibility

- **Secondary Elements**: 3:1 minimum for atmospheric depth

- **Background Elements**: 2:1 minimum for subtle detail

### Accessibility Considerations

#### Color-Blind Support

- **No Red/Green Reliance**: Critical information never relies solely on red/green

- **High Contrast Options**: Alternative palette with increased contrast

- **Pattern Support**: Important elements have shape/pattern alternatives

#### Visual Clarity

- **Focus Indicators**: Clear visual hierarchy with contrast

- **Motion Sensitivity**: Reduced animation options for sensitive players

- **Text Legibility**: All UI text meets WCAG AA standards

### Technical Specifications

#### File Formats

- **Palette File**: Adobe Swatch Exchange (.ase) format

- **Reference Images**: PNG with embedded color profiles

- **CSS Variables**: Custom properties for web implementation

#### Color Space

- **Primary**: sRGB for web compatibility

- **HDR Support**: Rec. 2020 variants for future HDR displays

- **Mobile Optimization**: Reduced gamut variants for older devices

## Usage in Game Design

This color palette should be used consistently across:

- Background terrain rendering

- Atmospheric effects and particles

- Environmental lighting systems

- UI elements that represent the Horizon Steppe

- Faction-specific visual elements for Wind-Taken Nomads

The palette supports the lore-driven design where "sky kisses grass and home feels near"
while
maintaining
the
visual
identity
of
the
Wind-Taken
Nomads
faction
with
their
sun-bleached
banners
and
turquoise
fetishes.

---

**Note**: This palette is designed to work harmoniously with the PixiJS rendering system and maintains performance while providing rich visual depth for the first land experience.
