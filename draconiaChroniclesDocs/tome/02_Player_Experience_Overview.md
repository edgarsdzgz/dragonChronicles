--- tome*version: 2.2 file: /draconiaChroniclesDocs/tome/02*Player*Experience*Overview.md canonical*precedence: v2.1*GDD status: detailed last_updated: 2025-01-12 ---

# 02 — Player Experience Overview

## First Session Journey (0-10 minutes)

### Onboarding Flow

1. **Splash Screen** → Dragon naming → Welcome message

1. **Begin Journey** (no blockers, immediate play)

1. **Minimal Tutorial**:

    - Distance ticks visible

    - Enemies spawn automatically

    - Arcana drops on kills

    - **Return** hint appears after first few kills

### First Session Goals

- **Immediate Engagement**: Player sees action within 30 seconds

- **Clear Progression**: Distance increases, enemies get harder

- **Economic Understanding**: Arcana = power, spending = progress

- **Return Mechanics**: Hint to return to Draconia for upgrades

### Success Metrics

- Player reaches 100m within 5 minutes

- Player makes first upgrade within 3 minutes

- Player understands Return mechanics by 8 minutes

## First Hour Experience (10-60 minutes)

### Progression Curve

- **Enchants**: Firepower/Scales with geometric ×1.12 cost growth

- **Tier-Up**: 15-25× last level cost for major power spikes

- **First Boss**: Encountered around 30-45 minutes

- **Return Cadence**: 2-3 returns per hour target

### Discovery Elements

- **Research Lab**: Unlocked after first Return

- **Tech Trees**: Only Ember Potency & Draconic Vitality visible initially

- **Hidden Nodes**: Discovery through Research creates "aha!" moments

### Engagement Hooks

- **Micro-Ramps**: Visible progress every 5m early, 10m later

- **Elemental Counterplay**: Fire/Ice/Lightning interactions

- **Lane Objects**: Destructible objects with strategic value

## Daily Rhythm (24-hour cycle)

### Offline Progression Model

```bash

8h Linear → Diminishing Decay
├── Base Cap: 24h
├── META Cap: 96h (unlocked later)
└── Rested Bonus: +50% for 15min, 30min cooldown

```text

### Daily Session Structure

1. **Morning Return**: Offline gains applied, rested bonus available

1. **Active Play**: 30-60 minutes of progression

1. **Evening Optimization**: City investments, research queue management

1. **Night Idle**: Background progression continues

### Weekly Progression

- **Monday-Friday**: Steady progression, research completion

- **Weekend**: Extended sessions, boss attempts, city building

- **Monthly**: Major milestones, new regions unlocked

## Device-Specific UX Patterns

### Desktop Experience

- **Multi-Pane Layout**: Journey, Logs, and Tabs visible simultaneously

- **Keyboard Shortcuts**: Hotkeys for abilities and common actions

- **Precision Controls**: Mouse targeting for manual abilities

- **Performance**: 60fps target with full visual effects

### Mobile Experience

- **Bottom Sheets**: Settings, stats, and menus slide up from bottom

- **FAB (Floating Action Button)**: Primary action (Return, Upgrade) bottom-right

- **Touch Targets**: 44×44 minimum for accessibility

- **Gesture Scope**: Scroll/zoom only, no complex gestures

- **Performance**: ≥40fps target, reduced effects on lower-end devices

### Tablet Experience

- **Hybrid Layout**: Desktop-like on landscape, mobile-like on portrait

- **Touch Optimization**: Larger touch targets, gesture-friendly

- **Split-Screen**: Journey + UI panels side-by-side

## Accessibility & Inclusive Design

### Visual Accessibility

- **High Contrast Mode**: Alternative color schemes for visibility

- **Font Scaling**: 100%-200% zoom support

- **Color-Blind Support**: No red/green reliance, distinct visual patterns

- **Reduced Motion**: Animation alternatives for vestibular disorders

### Motor Accessibility

- **Large Touch Targets**: 44×44 minimum, 48×48 preferred

- **Keyboard Navigation**: Full game playable with keyboard only

- **Voice Control**: Basic commands for mobile devices

- **Switch Control**: External switch support for motor impairments

### Cognitive Accessibility

- **Clear Information Hierarchy**: Important info prominently displayed

- **Consistent Patterns**: Predictable UI behavior across all screens

- **Progress Indicators**: Clear feedback on all actions

- **Help System**: Contextual help and tooltips available

## Progression Psychology

### Dopamine Loops

- **Micro-Rewards**: Arcana drops, distance milestones

- **Macro-Rewards**: Boss defeats, research completions

- **Discovery Rewards**: New tech nodes, tier unlocks

- **Social Rewards**: Achievement sharing, progress comparison

### Flow State Design

- **Challenge Balance**: Difficulty matches player skill level

- **Clear Goals**: Always know what to do next

- **Immediate Feedback**: Actions have visible consequences

- **Distraction-Free**: Minimal UI clutter during active play

### Retention Hooks

- **Daily Login**: Rested bonus encourages regular play

- **Weekly Goals**: Longer-term objectives for extended engagement

- **Seasonal Events**: Limited-time content for variety

- **Community Features**: Sharing progress, comparing achievements

## Error Handling & Recovery

### Graceful Degradation

- **Network Issues**: Offline mode continues core gameplay

- **Performance Issues**: Automatic quality reduction

- **Input Errors**: Clear error messages with recovery suggestions

- **Save Corruption**: Automatic backup and recovery systems

### Player Support

- **In-Game Help**: Contextual tooltips and guides

- **FAQ System**: Common questions answered within game

- **Bug Reporting**: Easy way to report issues with context

- **Community Support**: Player forums and knowledge sharing

## Analytics & Telemetry

### Player Behavior Tracking

- **Session Length**: How long players engage

- **Drop-off Points**: Where players commonly quit

- **Feature Usage**: Which systems players engage with most

- **Progression Patterns**: How players advance through content

### Performance Monitoring

- **Load Times**: How quickly game starts and loads

- **Frame Rates**: Performance across different devices

- **Crash Rates**: Stability monitoring and improvement

- **User Satisfaction**: Feedback collection and analysis

### A/B Testing Framework

- **UI Variations**: Testing different interface designs

- **Progression Tuning**: Balancing difficulty and rewards

- **Feature Rollouts**: Gradual feature introduction

- **Monetization**: Testing different premium currency approaches

## Acceptance Criteria

- [ ] First-time player can reach 100m within 5 minutes

- [ ] Player makes first upgrade within 3 minutes of starting

- [ ] Return mechanics are understood by 8 minutes

- [ ] First boss encountered within 45 minutes

- [ ] Daily rhythm encourages 30-60 minute sessions

- [ ] Offline progression feels meaningful and fair

- [ ] All accessibility requirements met (WCAG 2.1 AA)

- [ ] Performance targets achieved (60fps desktop, ≥40fps mobile)

- [ ] Telemetry captures key player behavior metrics

- [ ] Error handling provides clear recovery paths
