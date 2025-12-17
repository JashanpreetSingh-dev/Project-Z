/**
 * React Bits Animation Configuration
 * 
 * Centralized configuration for React Bits animation components
 * to ensure consistent animation timing and behavior across the app
 */

export const reactBitsConfig = {
  // Animation timing
  timing: {
    fast: 0.2,
    normal: 0.5,
    slow: 0.8,
  },
  
  // Stagger delays
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.15,
  },
  
  // Card animations
  card: {
    hoverScale: 1.02,
    tiltIntensity: 10,
    defaultDelay: 0.1,
  },
  
  // Text animations
  text: {
    defaultStaggerDelay: 0.05,
    defaultDelay: 0.1,
  },
  
  // Button animations
  button: {
    magneticStrength: 0.15,
    scaleAmount: 1.05,
  },
  
  // Performance settings
  performance: {
    // Use will-change for better performance
    useWillChange: true,
    // Reduce animations on low-end devices
    reduceOnLowEnd: true,
  },
} as const;

