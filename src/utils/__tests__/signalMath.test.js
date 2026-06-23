import { describe, it, expect } from 'vitest'
import {
  rollingMean,
  rollingStdDev,
  ema,
  isSpike,
  normalize,
  computeElectrodeHealth,
} from '../signalMath.js'
import { THRESHOLDS } from '../thresholds.js'

describe('rollingMean', () => {
  it('computes mean of last N values', () => {
    // window of 3 from [1,2,3,4,5] = [3,4,5], mean = 4
    expect(rollingMean([1, 2, 3, 4, 5], 3)).toBeCloseTo(4)
  })

  it('uses full buffer when windowSize >= length', () => {
    expect(rollingMean([10, 20, 30], 10)).toBeCloseTo(20)
  })
})

describe('rollingStdDev', () => {
  it('returns 0 for a flat buffer', () => {
    expect(rollingStdDev([5, 5, 5, 5, 5], 5)).toBeCloseTo(0)
  })

  it('returns correct stdDev for known values', () => {
    // [2,4,4,4,5,5,7,9]: mean=5, population variance=4, stdDev=2
    expect(rollingStdDev([2, 4, 4, 4, 5, 5, 7, 9], 8)).toBeCloseTo(2)
  })
})

describe('ema', () => {
  it('with alpha=1 equals the new value', () => {
    expect(ema(100, 42, 1)).toBeCloseTo(42)
  })

  it('with alpha=0 returns the previous ema unchanged', () => {
    expect(ema(100, 42, 0)).toBeCloseTo(100)
  })

  it('converges toward target over many iterations', () => {
    let val = 0
    for (let i = 0; i < 100; i++) val = ema(val, 100, 0.15)
    expect(val).toBeGreaterThan(95)
  })
})

describe('isSpike', () => {
  it('returns true when deviation exceeds threshold', () => {
    expect(isSpike(250, 50, 100)).toBe(true)
  })

  it('returns false when deviation is within threshold', () => {
    expect(isSpike(60, 50, 100)).toBe(false)
  })

  it('returns false when deviation equals threshold exactly', () => {
    // Math.abs(150 - 50) = 100, not > 100
    expect(isSpike(150, 50, 100)).toBe(false)
  })
})

describe('normalize', () => {
  it('returns 50 for the midpoint', () => {
    expect(normalize(50, 0, 100)).toBeCloseTo(50)
  })

  it('clamps to 0 for values below min', () => {
    expect(normalize(-10, 0, 100)).toBe(0)
  })

  it('clamps to 100 for values above max', () => {
    expect(normalize(200, 0, 100)).toBe(100)
  })

  it('returns 0 at min', () => {
    expect(normalize(0, 0, 100)).toBeCloseTo(0)
  })

  it('returns 100 at max', () => {
    expect(normalize(100, 0, 100)).toBeCloseTo(100)
  })
})

describe('computeElectrodeHealth', () => {
  it('returns 50 when buffer has fewer than 3 samples', () => {
    expect(computeElectrodeHealth([10, 20], 20, THRESHOLDS)).toBe(50)
  })

  it('returns low score for a completely flat signal (flatline)', () => {
    const flatBuffer = new Array(20).fill(10)
    expect(computeElectrodeHealth(flatBuffer, 20, THRESHOLDS)).toBeLessThanOrEqual(10)
  })

  it('returns a healthy score for a moderately active signal', () => {
    const activeBuffer = Array.from({ length: 20 }, (_, i) => Math.sin(i * 0.5) * 20)
    expect(computeElectrodeHealth(activeBuffer, 20, THRESHOLDS)).toBeGreaterThan(50)
  })
})
