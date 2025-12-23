// Track user behavior for mystical seed generation
export interface BehaviorData {
  hoverTime: number;              // Time spent hovering over shuffle button (ms)
  pageTime: number;               // Total time on page (ms)
  mouseMovements: MouseMovement[]; // Mouse movement history
  clickTimings: number[];         // Timestamps of clicks
}

export interface MouseMovement {
  x: number;
  y: number;
  timestamp: number;
}

export class SeedGenerator {
  private behaviorData: BehaviorData;
  private pageStartTime: number;

  constructor() {
    this.pageStartTime = Date.now();
    this.behaviorData = {
      hoverTime: 0,
      pageTime: 0,
      mouseMovements: [],
      clickTimings: [],
    };
  }

  // Track mouse movement
  trackMouseMove(x: number, y: number): void {
    this.behaviorData.mouseMovements.push({
      x,
      y,
      timestamp: Date.now(),
    });
    // Keep only last 100 movements to avoid memory issues
    if (this.behaviorData.mouseMovements.length > 100) {
      this.behaviorData.mouseMovements.shift();
    }
  }

  // Track hover time
  addHoverTime(ms: number): void {
    this.behaviorData.hoverTime += ms;
  }

  // Track click
  trackClick(): void {
    this.behaviorData.clickTimings.push(Date.now());
    // Keep only last 50 clicks
    if (this.behaviorData.clickTimings.length > 50) {
      this.behaviorData.clickTimings.shift();
    }
  }

  // Generate seed from behavior data
  generateSeed(): number {
    this.behaviorData.pageTime = Date.now() - this.pageStartTime;

    // Calculate mouse movement distance
    let mouseDistance = 0;
    let mouseSpeed = 0;
    if (this.behaviorData.mouseMovements.length > 1) {
      for (let i = 1; i < this.behaviorData.mouseMovements.length; i++) {
        const prev = this.behaviorData.mouseMovements[i - 1];
        const curr = this.behaviorData.mouseMovements[i];
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        mouseDistance += distance;
        
        const timeDiff = curr.timestamp - prev.timestamp;
        if (timeDiff > 0) {
          mouseSpeed += distance / timeDiff;
        }
      }
    }

    // Calculate click timing pattern
    let clickPattern = 0;
    if (this.behaviorData.clickTimings.length > 1) {
      for (let i = 1; i < this.behaviorData.clickTimings.length; i++) {
        const timeDiff = this.behaviorData.clickTimings[i] - this.behaviorData.clickTimings[i - 1];
        clickPattern += timeDiff % 1000; // Modulo to keep it reasonable
      }
    }

    // Combine all factors into seed
    const seed = this.hash(
      this.behaviorData.hoverTime * 1000 +
      this.behaviorData.pageTime * 500 +
      mouseDistance * 10 +
      mouseSpeed * 5 +
      clickPattern +
      this.behaviorData.mouseMovements.length * 7 +
      this.behaviorData.clickTimings.length * 3
    );

    return seed;
  }

  // Simple hash function
  private hash(value: number): number {
    // Convert to string and hash
    const str = value.toString();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Get current behavior data (for debugging)
  getBehaviorData(): BehaviorData {
    return { ...this.behaviorData };
  }

  // Reset behavior tracking (optional)
  reset(): void {
    this.pageStartTime = Date.now();
    this.behaviorData = {
      hoverTime: 0,
      pageTime: 0,
      mouseMovements: [],
      clickTimings: [],
    };
  }
}

