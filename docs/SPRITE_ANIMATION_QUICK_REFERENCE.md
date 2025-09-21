# Sprite Animation Quick Reference

## Server Startup

````bash

cd apps/web
pnpm run dev

```text

**URL:** <http://localhost:5173/dev/dragon-animated>

## Adding New Enemy Sprites

### 1. Add Sprite File

Place 2x2 SVG sprite sheet in `apps/web/static/sprites/`

### 2. Update Configuration

In `lib/pixi/enemy-sprites.ts`:

```typescript

// Add to type union
export type EnemyType = 'mantair-corsair' | 'swarm' | 'new-enemy';

// Add to config
'new-enemy': {
  name: 'New Enemy',
  imagePath: '/sprites/new*enemy*sprite.svg',
  frameWidth: 128,
  frameHeight: 128,
  rows: 2,
  cols: 2
}

```javascript

### 3. Add UI Button

```typescript

<button on:click={() => spawnEnemy('new-enemy')}>
  🆕 New Enemy
</button>

```bash

## Sprite Sheet Format

```text

┌─────────┬─────────┐
│  idle   │  fly_1  │ 128x128 each
├─────────┼─────────┤
│  fly*2  │  fly*3  │ 256x256 total
└─────────┴─────────┘

```text

## Animation Controls

- **FPS Range:** 1-20 FPS (default: 8 FPS)

- **Frame Sequence:** idle → fly*1 → fly*2 → fly_3 → repeat

- **Duration:** 1000/FPS milliseconds per frame

## Positioning System

- **Dragon**: Left side of screen (x=150, y=center) - game-like positioning

- **Enemy Formation**: Smart column system starting at x=600 (moved toward center)

  - **Column 1**: Center, then alternating above/below (max 8 enemies)

  - **Column 2+**: New columns to the right when previous fills

  - **Pattern**: Center → Above → Below → Above2 → Below2 → etc.

## Combat System

- **Projectiles**: Enemies fire animated projectiles toward dragon

- **Movement**: Projectiles travel in straight line at configurable speed

- **Collision**: Projectiles disappear when hitting dragon (20px radius)

- **Firing Rate**: Random enemy fires every 2 seconds when shooting enabled

- **Types**: Mantair Corsair Attack, Swarm Attack sprites

## Debug Tools

- **Debug Page:** <http://localhost:5173/dev/dragon-debug>

- **Console Logs:** Texture loading and frame updates

- **Browser Network:** Verify sprite sheet loading

## Common Issues

- **No sprites visible:** Check console for texture errors

- **No animation:** Verify renderer/stage passed to animator

- **Build fails:** Use dev server (build has logger dependency issues)

## Key Files

- `lib/pixi/texture-atlas.ts` - Sprite sheet parsing

- `lib/pixi/enemy-sprites.ts` - Enemy configuration

- `lib/pixi/dragon-sprites.ts` - Dragon system

- `routes/dev/dragon-animated/+page.svelte` - Test page

````
