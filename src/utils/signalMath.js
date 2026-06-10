/**
 * signalMath.js
 * Digital signal processing utilities for electrode data.
 */

/**
 * Rolling mean over last N values.
 */
export function rollingMean(buffer, windowSize) {
  const window = buffer.slice(-windowSize)
  return window.reduce((a, b) => a + b, 0) / window.length
}

/**
 * Rolling standard deviation over last N values.
 */
export function rollingStdDev(buffer, windowSize) {
  const window = buffer.slice(-windowSize)
  const mean = rollingMean(buffer, windowSize)
  const variance = window.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / window.length
  return Math.sqrt(variance)
}

/**
 * Rolling variance over last N values.
 */
export function rollingVariance(buffer, windowSize) {
  const window = buffer.slice(-windowSize)
  const mean = rollingMean(buffer, windowSize)
  return window.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / window.length
}

/**
 * Exponential moving average — smoother for real-time display.
 * alpha: smoothing factor 0–1 (lower = smoother, more lag)
 */
export function ema(prevEma, newValue, alpha = 0.15) {
  return alpha * newValue + (1 - alpha) * prevEma
}

/**
 * Detect spike: returns true if value deviates from mean by more than threshold.
 */
export function isSpike(value, mean, thresholdMv) {
  return Math.abs(value - mean) > thresholdMv
}

/**
 * Normalize a value to 0–100 range given expected min/max.
 */
export function normalize(value, min, max) {
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
}

/**
 * Map raw electrode readings to a 0–100 health score.
 * Higher activity within normal range = healthier signal.
 * Flatline or extreme variance = lower score.
 */
export function computeElectrodeHealth(buffer, windowSize, thresholds) {
  if (buffer.length < 3) return 50 // not enough data yet

  const stdDev   = rollingStdDev(buffer, windowSize)
  const variance = rollingVariance(buffer, windowSize)

  // Flatline penalty
  if (stdDev < thresholds.flatlineStdDev) return 10

  // High variance penalty
  if (variance > thresholds.variance.elevated) {
    return Math.max(10, 40 - normalize(variance, thresholds.variance.elevated, thresholds.variance.elevated * 3) * 0.3)
  }

  // Normal activity → score based on activity level
  const activityScore = normalize(stdDev, thresholds.flatlineStdDev, Math.sqrt(thresholds.variance.normal))
  return Math.min(95, 50 + activityScore * 0.45)
}
