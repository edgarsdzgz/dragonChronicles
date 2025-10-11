/**
 * Background Image Analyzer
 *
 * Analyzes the scrolling background image to determine:
 * - Sky blue band position and height
 * - Ground/horizon line position
 * - Action area boundaries
 */

export interface BackgroundMeasurements {
  /** Image dimensions */
  imageWidth: number;
  imageHeight: number;

  /** Sky blue band measurements (relative to image height) */
  skyBlueBand: {
    /** Top of sky blue band (0.0 = top of image, 1.0 = bottom) */
    top: number;
    /** Bottom of sky blue band */
    bottom: number;
    /** Height of sky blue band */
    height: number;
  };

  /** Ground/horizon measurements */
  ground: {
    /** Where ground starts (horizon line) */
    horizonLine: number;
    /** Ground height */
    height: number;
  };

  /** Action area (where game elements should be placed) */
  actionArea: {
    /** Top of action area */
    top: number;
    /** Bottom of action area */
    bottom: number;
    /** Height of action area */
    height: number;
  };
}

/**
 * Background image measurements (analyzed from 2160x1080 scrolling-background.png)
 */
export const BACKGROUND_MEASUREMENTS = {
  imageWidth: 2160,
  imageHeight: 1080,
  skyBlueBand: {
    top: 0.25, // 25.0% from top (270px)
    bottom: 0.45, // 45.0% from top (486px)
    height: 0.2, // 20.0% of image height (216px)
  },
  ground: {
    horizonLine: 0.65, // 65.0% from top (702px) - where green grass starts
    height: 0.35, // 35.0% of image height (378px)
  },
  actionArea: {
    top: 0.25, // 25.0% from top (270px)
    bottom: 0.75, // 75.0% from top (810px)
    height: 0.5, // 50.0% of image height (540px)
  },
} as const;

/**
 * Analyze the background image structure
 * Returns the pre-calculated measurements from visual analysis
 */
export function analyzeBackgroundImage(): BackgroundMeasurements {
  return BACKGROUND_MEASUREMENTS;
}

/**
 * Convert relative measurements to pixel coordinates for a given screen size
 */
export function getPixelCoordinates(
  measurements: BackgroundMeasurements,
  screenWidth: number,
  screenHeight: number,
): {
  skyBlueBand: {
    top: number;
    bottom: number;
    height: number;
  };
  ground: {
    horizonLine: number;
    height: number;
  };
  actionArea: {
    top: number;
    bottom: number;
    height: number;
  };
} {
  return {
    skyBlueBand: {
      top: measurements.skyBlueBand.top * screenHeight,
      bottom: measurements.skyBlueBand.bottom * screenHeight,
      height: measurements.skyBlueBand.height * screenHeight,
    },
    ground: {
      horizonLine: measurements.ground.horizonLine * screenHeight,
      height: measurements.ground.height * screenHeight,
    },
    actionArea: {
      top: measurements.actionArea.top * screenHeight,
      bottom: measurements.actionArea.bottom * screenHeight,
      height: measurements.actionArea.height * screenHeight,
    },
  };
}

/**
 * Get the center Y position of the action area
 */
export function getActionAreaCenter(measurements: BackgroundMeasurements): number {
  return (measurements.actionArea.top + measurements.actionArea.bottom) / 2;
}

/**
 * Get the center Y position of the sky blue band
 */
export function getSkyBlueBandCenter(measurements: BackgroundMeasurements): number {
  return (measurements.skyBlueBand.top + measurements.skyBlueBand.bottom) / 2;
}

/**
 * Utility functions for positioning game elements
 */
export class BackgroundPositioning {
  private measurements: BackgroundMeasurements;
  private screenWidth: number;
  private screenHeight: number;

  constructor(screenWidth: number, screenHeight: number, measurements?: BackgroundMeasurements) {
    this.measurements = measurements || BACKGROUND_MEASUREMENTS;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
  }

  /**
   * Get Y position for elements in the sky blue band (flying elements)
   */
  getSkyBlueBandY(): number {
    return this.screenHeight * getSkyBlueBandCenter(this.measurements);
  }

  /**
   * Get Y position for elements in the action area center
   */
  getActionAreaY(): number {
    return this.screenHeight * getActionAreaCenter(this.measurements);
  }

  /**
   * Get Y position for ground-based elements (horizon line)
   */
  getGroundY(): number {
    return this.screenHeight * this.measurements.ground.horizonLine;
  }

  /**
   * Get Y position for elements at the top of the action area
   */
  getActionAreaTopY(): number {
    return this.screenHeight * this.measurements.actionArea.top;
  }

  /**
   * Get Y position for elements at the bottom of the action area
   */
  getActionAreaBottomY(): number {
    return this.screenHeight * this.measurements.actionArea.bottom;
  }

  /**
   * Check if a Y position is within the sky blue band
   */
  isInSkyBlueBand(y: number): boolean {
    const top = this.screenHeight * this.measurements.skyBlueBand.top;
    const bottom = this.screenHeight * this.measurements.skyBlueBand.bottom;
    return y >= top && y <= bottom;
  }

  /**
   * Check if a Y position is within the action area
   */
  isInActionArea(y: number): boolean {
    const top = this.screenHeight * this.measurements.actionArea.top;
    const bottom = this.screenHeight * this.measurements.actionArea.bottom;
    return y >= top && y <= bottom;
  }

  /**
   * Get all positioning information for debugging
   */
  getDebugInfo() {
    return {
      screen: { width: this.screenWidth, height: this.screenHeight },
      skyBlueBand: {
        top: this.getActionAreaTopY(),
        center: this.getSkyBlueBandY(),
        bottom: this.screenHeight * this.measurements.skyBlueBand.bottom,
      },
      ground: {
        horizon: this.getGroundY(),
      },
      actionArea: {
        top: this.getActionAreaTopY(),
        center: this.getActionAreaY(),
        bottom: this.getActionAreaBottomY(),
      },
    };
  }
}
