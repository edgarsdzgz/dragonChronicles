<!-- markdownlint-disable -->

# ADR 0008: Size Budgets & Performance

**Date**: 2025-09-06
**Status**: Accepted

## Context

Draconia Chronicles requires strict performance constraints to ensure optimal user experience across all devices and network conditions..
The requirements include:

- **Fast Loading**: Quick initial load times for user engagement

- **Mobile Performance**: Efficient performance on mobile devices with limited resources

- **Network Efficiency**: Minimal data usage for users on limited connections

- **Memory Management**: Efficient memory usage to prevent crashes

- **Bundle Optimization**: Tree-shaking and code splitting for minimal bundle sizes

- **Performance Monitoring**: Continuous monitoring of performance metrics

- **CI/CD Integration**: Automated performance validation in build pipeline

The game targets a wide range of devices from high-end desktops to budget mobile devices, requiring
careful
optimization
of
all
resources.

## Decision

Implement **comprehensive size budgets and performance constraints** with automated monitoring,
CI/CD
integration,
and
continuous
optimization.

### Size Budget Constraints

#### **Core Bundle Limits**

````typescript

// size-budgets.mjs - Automated size budget validation
const BUDGETS = {
  // Base application bundle
  'apps/web/build/_app/immutable/entry/app.js': {
    maxSize: '200KB',
    maxGzipSize: '60KB',
    description: 'Main application entry point',
  },

  // Shared libraries
  'packages/shared/dist/index.js': {
    maxSize: '50KB',
    maxGzipSize: '15KB',
    description: 'Shared utilities and constants',
  },

  // Database layer
  'packages/db/dist/index.js': {
    maxSize: '100KB',
    maxGzipSize: '30KB',
    description: 'Database persistence layer',
  },

  // Logging system
  'packages/logger/dist/index.js': {
    maxSize: '25KB',
    maxGzipSize: '8KB',
    description: 'Structured logging system',
  },

  // Simulation engine
  'packages/sim/dist/index.js': {
    maxSize: '75KB',
    maxGzipSize: '22KB',
    description: 'Game simulation engine',
  },
};

```javascript

#### **Performance Targets**

```typescript

// Performance benchmarks and targets
const PERFORMANCE_TARGETS = {
  // Loading performance
  firstContentfulPaint: 1.5, // seconds
  largestContentfulPaint: 2.5, // seconds
  firstInputDelay: 100, // milliseconds
  cumulativeLayoutShift: 0.1, // CLS score

  // Runtime performance
  frameRate: 60, // FPS
  memoryUsage: 100, // MB
  simulationLatency: 16.67, // milliseconds (60fps)

  // Bundle performance
  totalBundleSize: 200, // KB gzipped
  criticalPathSize: 60, // KB gzipped
  lazyLoadSize: 140, // KB gzipped
};

```text

### Implementation Strategy

#### **Automated Size Monitoring**

```typescript

// size-budgets.mjs - CI/CD integration
import { readFileSync, statSync } from 'fs';
import { gzipSync } from 'zlib';

function validateSizeBudget(filePath: string, budget: Budget): boolean {
  const stats = statSync(filePath);
  const content = readFileSync(filePath);
  const gzipped = gzipSync(content);

  const sizeKB = Math.round(stats.size / 1024);
  const gzipKB = Math.round(gzipped.length / 1024);

  const sizeLimit = parseSize(budget.maxSize);
  const gzipLimit = parseSize(budget.maxGzipSize);

  if (sizeKB > sizeLimit || gzipKB > gzipLimit) {
    console.error(`❌ Size budget exceeded for ${filePath}`);
    console.error(`  Size: ${sizeKB}KB (limit: ${sizeLimit}KB)`);
    console.error(`  Gzip: ${gzipKB}KB (limit: ${gzipLimit}KB)`);
    return false;
  }

  console.log(`✅ Size budget met for ${filePath}`);
  return true;
}

```javascript

#### **Bundle Analysis**

```typescript

// Bundle analysis and optimization
const bundleAnalysis = {
  // Tree-shaking validation
  validateTreeShaking: () => {
    // Ensure unused code is eliminated
    const bundleContent = readFileSync('dist/bundle.js', 'utf8');
    const unusedPatterns = [/console\.log\(/g, /debugger;/g, /TODO:/g];

    return unusedPatterns.every((pattern) => !pattern.test(bundleContent));
  },

  // Dependency analysis
  analyzeDependencies: () => {
    // Identify large dependencies
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    return Object.entries(dependencies)
      .filter(([name, version]) => getPackageSize(name) > 50) // 50KB threshold
      .map(([name, version]) => ({ name, version, size: getPackageSize(name) }));
  },
};

```javascript

#### **Performance Monitoring**

```typescript

// Performance monitoring and alerting
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};

  startMonitoring(): void {
    // Core Web Vitals monitoring
    this.observeCoreWebVitals();

    // Runtime performance monitoring
    this.observeRuntimePerformance();

    // Memory usage monitoring
    this.observeMemoryUsage();
  }

  private observeCoreWebVitals(): void {
    // First Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcp = entries[entries.length - 1];
      this.metrics.firstContentfulPaint = fcp.startTime;
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcp = entries[entries.length - 1];
      this.metrics.largestContentfulPaint = lcp.startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }

  private observeRuntimePerformance(): void {
    // Frame rate monitoring
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFrameRate = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        this.metrics.frameRate = frameCount;
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFrameRate);
    };

    requestAnimationFrame(measureFrameRate);
  }
}

```text

### Optimization Strategies

#### **Code Splitting**

```typescript

// Dynamic imports for code splitting
const routes = {
  '/': () => import('./pages/Home.svelte'),
  '/game': () => import('./pages/Game.svelte'),
  '/settings': () => import('./pages/Settings.svelte'),
  '/dev': () => import('./pages/Dev.svelte'),
};

// Lazy loading for non-critical features
const lazyFeatures = {
  analytics: () => import('./features/analytics'),
  errorReporting: () => import('./features/error-reporting'),
  performanceMonitoring: () => import('./features/performance-monitoring'),
};

```javascript

#### **Asset Optimization**

```typescript

// Asset optimization strategies
const assetOptimization = {
  // Image optimization
  images: {
    format: 'webp', // Modern format with fallback
    quality: 80, // Balance between size and quality
    responsive: true, // Multiple sizes for different devices
    lazy: true, // Lazy loading for images
  },

  // Font optimization
  fonts: {
    preload: true, // Preload critical fonts
    display: 'swap', // Font display strategy
    subset: true, // Character subsetting
  },

  // CSS optimization
  css: {
    minify: true, // Minification
    purge: true, // Remove unused CSS
    critical: true, // Critical CSS inlining
  },
};

```javascript

#### **Memory Management**

```typescript

// Memory management strategies
class MemoryManager {
  private memoryLimit = 100 * 1024 * 1024; // 100MB limit
  private cleanupThreshold = 0.8; // 80% memory usage

  startMonitoring(): void {
    setInterval(() => {
      const memoryUsage = this.getMemoryUsage();

      if (memoryUsage > this.memoryLimit * this.cleanupThreshold) {
        this.performCleanup();
      }
    }, 5000); // Check every 5 seconds
  }

  private performCleanup(): void {
    // Clear unused caches
    this.clearUnusedCaches();

    // Garbage collection hint
    if (window.gc) {
      window.gc();
    }

    // Log cleanup action
    console.log('Memory cleanup performed');
  }
}

```text

## Consequences

### Positive

- **Optimal Performance**: Fast loading and smooth user experience

- **Mobile Compatibility**: Efficient performance on resource-constrained devices

- **Network Efficiency**: Minimal data usage for users on limited connections

- **Automated Monitoring**: Continuous performance validation and alerting

- **CI/CD Integration**: Automated performance gates in build pipeline

- **User Experience**: Consistent performance across all devices and networks

### Negative

- **Development Constraints**: Strict limits may slow development

- **Feature Limitations**: Some features may be excluded due to size constraints

- **Monitoring Overhead**: Performance monitoring adds complexity

- **Optimization Effort**: Requires ongoing optimization and maintenance

- **Testing Complexity**: More complex testing for performance validation

### Operational Impact

- **Development Workflow**:

  - Size budget validation in CI/CD pipeline

  - Performance monitoring and optimization

  - Bundle analysis and dependency management

- **Testing Strategy**:

  - Performance testing across devices and networks

  - Bundle size validation and optimization

  - Memory usage testing and monitoring

- **Deployment**:

  - Performance validation before deployment

  - Bundle size monitoring and alerting

  - Performance regression detection

### Integration Points

#### **CI/CD Pipeline (W7)**

- Size budget validation in build pipeline

- Performance testing and monitoring

- Automated performance regression detection

#### **PWA Implementation (W6)**

- Bundle size optimization for PWA features

- Performance monitoring for offline functionality

- Cache optimization for performance

#### **Logging System (W5)**

- Performance logging and monitoring

- Memory usage tracking and optimization

- Performance metrics collection and analysis

### Migration Path

The size budget system was established during W7 and has proven successful:

1. **W7**: Core size budget implementation and CI/CD integration

1. **W8**: Performance monitoring and optimization

1. **Future**: Advanced performance optimization and monitoring

### Future Enhancements

- **Advanced Monitoring**: Real-time performance monitoring and alerting

- **Predictive Optimization**: AI-driven performance optimization

- **Advanced Caching**: Intelligent caching strategies for performance

- **Performance Analytics**: Detailed performance analytics and insights

## References

- [Web Performance Best Practices](https://web.dev/performance/)

- [Bundle Size Optimization](https://webpack.js.org/guides/code-splitting/)

- [Core Web Vitals](https://web.dev/vitals/)

- [W7 Implementation](../engineering/development-workflow.md)

- [Performance Optimization Guide](../optimization/CODE*OPTIMIZATION*GUIDE.md)
````
