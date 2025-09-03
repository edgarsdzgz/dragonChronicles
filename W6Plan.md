<!-- markdownlint-disable -->

# W6 Planning Document: PWA & Update UX

## Issue Analysis

**Workpack**: W6 - PWA & Update UX  
**Phase**: Phase 0 (Foundational Scaffolding & Guardrails)  
**Priority**: High (enables offline functionality and modern web app experience)  
**Dependencies**: W1-W5 complete ✅

### Current State

- ✅ **W1**: Repo & Standards (monorepo, TS strict, ESLint+Prettier, Husky v9+, commitlint, templates)
- ✅ **W2**: App Shell & Render Host (SvelteKit, Pixi mount, HUD toggle, pooling primitives)
- ✅ **W3**: Worker Sim Harness (worker protocol v1, RNG, fixed clock, offline stub, autorecover)
- ✅ **W4**: Persistence v1 (Dexie schema, Zod, atomic writes, export/import, migration scaffold)
- ✅ **W5**: Logging v1 (ring buffer caps, Dexie sink, console sink, export, perf lab)

### Requirements from GDD

- **PWA Installation**: Workbox service worker, manifest/icons, install prompt
- **Update UX**: Update toast, service worker registration, automatic updates
- **Offline Support**: Precaching strategy, offline fallbacks
- **Performance**: Bundle size budgets, caching strategies

## Implementation Plan

### Phase 1: PWA Foundation Setup

1. **Service Worker Registration**
   - Implement service worker registration in SvelteKit
   - Add Workbox integration for caching strategies
   - Set up service worker lifecycle management

2. **Web App Manifest**
   - Create comprehensive `manifest.json`
   - Design and implement app icons (multiple sizes)
   - Configure PWA installation criteria

3. **Basic Caching Strategy**
   - Implement precaching for core assets
   - Set up runtime caching for dynamic content
   - Configure offline fallback strategies

### Phase 2: Update UX Implementation

1. **Service Worker Update Detection**
   - Implement update checking mechanism
   - Add update notification system
   - Create update toast UI component

2. **Update Flow Management**
   - Handle service worker updates gracefully
   - Implement user-controlled update installation
   - Add update progress indicators

3. **Offline Experience Enhancement**
   - Improve offline simulation capabilities
   - Add offline status indicators
   - Implement offline-first data strategies

### Phase 3: Integration & Testing

1. **SvelteKit Integration**
   - Integrate with existing app shell
   - Ensure compatibility with Pixi.js rendering
   - Test offline simulation functionality

2. **Performance Validation**
   - Verify bundle size budgets (≤200 KB gz base app)
   - Test PWA installation flow
   - Validate offline functionality

3. **Cross-Platform Testing**
   - Test on multiple browsers
   - Validate mobile PWA experience
   - Ensure accessibility compliance

## Risk Assessment

### High Risk

- **Service Worker Complexity**: Service workers can be complex to debug and maintain
  - _Mitigation_: Use Workbox for proven patterns, extensive testing, clear error handling

- **Browser Compatibility**: PWA features vary across browsers
  - _Mitigation_: Progressive enhancement, feature detection, fallback strategies

### Medium Risk

- **Bundle Size Impact**: PWA features could increase bundle size
  - _Mitigation_: Lazy loading, code splitting, careful dependency management

- **Offline State Management**: Complex offline/online state transitions
  - _Mitigation_: Clear state machines, user feedback, graceful degradation

### Low Risk

- **Icon Design**: Multiple icon sizes and formats required
  - _Mitigation_: Use design tools, automated icon generation, standard PWA patterns

## Technical Architecture

### Service Worker Structure

```typescript
// sw.js (Workbox-based)
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

// Precache core assets
precacheAndRoute(self.__WB_MANIFEST);

// Handle navigation
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')));

// Cache strategies for different asset types
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({ cacheName: 'images' }),
);
```

### Update Detection Flow

```typescript
// update-manager.ts
export class UpdateManager {
  private swRegistration: ServiceWorkerRegistration | null = null;

  async checkForUpdates(): Promise<boolean> {
    if (!this.swRegistration) return false;

    await this.swRegistration.update();
    return this.hasWaitingWorker();
  }

  async applyUpdate(): Promise<void> {
    if (this.swRegistration?.waiting) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
}
```

### PWA Manifest Structure

```json
{
  "name": "Draconia Chronicles",
  "short_name": "Draconia",
  "description": "Idle dragon shooter with offline simulation",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#4a90e2",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## TODO List

### Phase 1: PWA Foundation (Priority: High)

- [ ] Install Workbox dependencies
- [ ] Create service worker registration logic
- [ ] Design and generate app icons (192x192, 512x512)
- [ ] Create comprehensive web app manifest
- [ ] Implement basic service worker with Workbox
- [ ] Test PWA installation flow

### Phase 2: Update UX (Priority: High)

- [ ] Implement update detection mechanism
- [ ] Create update notification toast component
- [ ] Add service worker update handling
- [ ] Implement user-controlled update installation
- [ ] Test update flow end-to-end

### Phase 3: Offline Enhancement (Priority: Medium)

- [ ] Enhance offline simulation capabilities
- [ ] Add offline status indicators
- [ ] Implement offline-first data strategies
- [ ] Test offline functionality thoroughly

### Phase 4: Integration & Testing (Priority: High)

- [ ] Integrate with existing SvelteKit app shell
- [ ] Ensure Pixi.js compatibility
- [ ] Validate performance budgets
- [ ] Cross-browser testing
- [ ] Accessibility compliance verification

### Phase 5: Documentation & Polish (Priority: Medium)

- [ ] Update GDD with W6 completion
- [ ] Document PWA features and capabilities
- [ ] Create PWA installation guide
- [ ] Update project status documentation

## Acceptance Criteria

### Functional Requirements

- ✅ PWA can be installed on supported devices
- ✅ Service worker provides offline functionality
- ✅ Update notifications work correctly
- ✅ Offline simulation continues to function
- ✅ App icons display correctly in all contexts

### Performance Requirements

- ✅ Bundle size remains within budget (≤200 KB gz base app)
- ✅ PWA installation completes in <5 seconds
- ✅ Offline functionality maintains 60fps simulation
- ✅ Service worker registration completes in <2 seconds

### Quality Requirements

- ✅ Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- ✅ Mobile PWA experience is smooth
- ✅ Accessibility compliance maintained
- ✅ Error handling is graceful and user-friendly

### Integration Requirements

- ✅ Seamless integration with existing app shell
- ✅ Pixi.js rendering continues to work offline
- ✅ Existing logging and persistence systems unaffected
- ✅ Worker simulation harness remains functional

## Dependencies & Prerequisites

### External Dependencies

- **Workbox**: Service worker library for caching strategies
- **PWA Builder**: Icon generation and manifest validation tools
- **Lighthouse**: PWA validation and performance testing

### Internal Dependencies

- ✅ **W1**: Repo standards and build pipeline
- ✅ **W2**: SvelteKit app shell and Pixi.js integration
- ✅ **W3**: Worker simulation harness (offline capability)
- ✅ **W4**: Persistence layer (offline data storage)
- ✅ **W5**: Logging system (offline logging capability)

### Development Environment

- **Node.js**: 20.x (already configured)
- **PNPM**: 9.15.9 (already configured)
- **TypeScript**: Strict mode (already configured)
- **ESLint/Prettier**: Already configured

## Success Metrics

### Primary Metrics

- **PWA Installation Rate**: >80% on supported devices
- **Offline Functionality**: 100% core features available offline
- **Update Flow Success**: >95% successful update installations
- **Performance Impact**: <5% increase in bundle size

### Secondary Metrics

- **Cross-Browser Compatibility**: 100% on major browsers
- **Mobile Experience**: Smooth PWA experience on mobile devices
- **Accessibility**: Maintains existing accessibility standards
- **Error Handling**: <1% unhandled service worker errors

## Timeline Estimate

### Phase 1: PWA Foundation (2-3 days)

- Service worker setup and Workbox integration
- Icon design and generation
- Manifest creation and validation

### Phase 2: Update UX (2-3 days)

- Update detection and notification system
- Update flow implementation
- User experience refinement

### Phase 3: Offline Enhancement (1-2 days)

- Offline capability improvements
- Status indicators and user feedback
- Data strategy optimization

### Phase 4: Integration & Testing (2-3 days)

- Full integration testing
- Performance validation
- Cross-browser testing

### Phase 5: Documentation & Polish (1 day)

- Documentation updates
- Final testing and validation
- Preparation for W7

**Total Estimated Time**: 8-12 days

## Next Steps

1. **User Review**: Present this plan for approval
2. **Implementation**: Begin with Phase 1 after approval
3. **Regular Updates**: Daily progress updates and plan adjustments
4. **Testing**: Continuous testing throughout implementation
5. **Documentation**: Update all relevant documentation upon completion

## Notes

- This workpack focuses on modern web app capabilities and offline functionality
- PWA features will significantly improve user experience and engagement
- Offline simulation capabilities align with the game's idle mechanics
- Performance budgets must be carefully maintained
- Cross-browser compatibility is critical for broad user adoption
