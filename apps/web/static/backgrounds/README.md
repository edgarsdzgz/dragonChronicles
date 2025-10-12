# Background Assets Organization

This directory contains all background assets organized by land and layer type.

## Directory Structure

### Land Organization
Each land has its own directory with three layer types:

```
land1_steppe/
├── static/          # Non-moving background layers
├── parallax/        # Moving depth layers  
└── foreground/      # Moving foreground layers

land2_ember_reaches/
├── static/
├── parallax/
└── foreground/

land3_mistral_peaks/
├── static/
├── parallax/
└── foreground/
```

## Layer Types

### `static/`
Non-moving background layers:
- Base sky backgrounds
- Underground/UI backgrounds
- Static environmental elements

### `parallax/`
Moving depth layers for parallax effect:
- Distant mountains
- Mid-ground hills
- Sky clouds
- Atmospheric elements

### `foreground/`
Moving foreground layers:
- Grass layers
- Trees and vegetation
- Close environmental elements
- Ground textures

## Asset Requirements

### Dimensions
- **Static backgrounds**: 2048x1024px (standard)
- **Parallax layers**: Variable width, height optimized for depth
- **Foreground layers**: 2048px width minimum for seamless tiling

### Naming Convention
- Include land identifier: `steppe_background_grassless.png`
- Include layer type: `lonelyMountain-clouds-2.png`
- Use descriptive names: `grasslandLayer_steppe.png`

## Implementation Notes

- All paths updated in `scrolling-background.ts`
- Supports dynamic loading for future land switching
- Maintains parallax speed relationships
- Ensures seamless tiling for all layers
