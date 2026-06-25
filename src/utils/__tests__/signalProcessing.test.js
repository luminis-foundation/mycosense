import { describe, it, expect } from 'vitest'
import {
  zScoreSpike,
  dominantFrequency,
  crossCorrelation,
  linearTrend,
  signalEntropy,
  signalFatigue,
} from '../signalProcessing.js'

describe('zScoreSpike', () => {
  it('returns isSpike=false when buffer is shorter than windowSize', () => {
    const result = zScoreSpike([1, 2, 3], 20)
    expect(result.isSpike).toBe(false)
    expect(result.zScore).toBe(0)
  })

  it('detects a clear outlier as a spike', () => {
    const buffer = [...new Array(19).fill(10), 999]
    const result = zScoreSpike(buffer, 20, 2.5)
    expect(result.isSpike).toBe(true)
    expect(result.zScore).toBeGreaterThan(2.5)
  })

  it('does not flag a normal value as a spike', () => {
    const buffer = Array.from({ length: 20 }, (_, i) => 10 + Math.sin(i) * 2)
    const result = zScoreSpike(buffer, 20, 2.5)
    expect(result.isSpike).toBe(false)
  })

  it('returns isSpike=false for flat buffer (stdDev=0)', () => {
    const buffer = new Array(20).fill(5)
    const result = zScoreSpike(buffer, 20, 2.5)
    expect(result.isSpike).toBe(false)
  })
})

describe('linearTrend', () => {
  it('returns positive slope for a strictly increasing sequence', () => {
    const buffer = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    expect(linearTrend(buffer, 10)).toBeGreaterThan(0)
  })

  it('returns negative slope for a strictly decreasing sequence', () => {
    const buffer = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    expect(linearTrend(buffer, 10)).toBeLessThan(0)
  })

  it('returns ~0 for a flat signal', () => {
    const buffer = new Array(10).fill(5)
    expect(Math.abs(linearTrend(buffer, 10))).toBeLessThan(0.01)
  })

  it('returns 0 for a buffer with fewer than 3 samples', () => {
    expect(linearTrend([1, 2], 10)).toBe(0)
  })
})

describe('signalEntropy', () => {
  it('returns 0 for identical values', () => {
    const buffer = new Array(20).fill(42)
    expect(signalEntropy(buffer, 20)).toBe(0)
  })

  it('returns positive entropy for a varied signal', () => {
    const buffer = Array.from({ length: 20 }, (_, i) => Math.sin(i) * 50)
    expect(signalEntropy(buffer, 20)).toBeGreaterThan(0)
  })

  it('returns 0 for a buffer shorter than 4 samples', () => {
    expect(signalEntropy([1, 2, 3], 20)).toBe(0)
  })
})

describe('signalFatigue', () => {
  it('does not flag fatigue for a stable oscillating signal', () => {
    const buffer = Array.from({ length: 20 }, (_, i) => Math.sin(i) * 10)
    const result = signalFatigue(buffer, 20)
    expect(result.fatigued).toBe(false)
  })

  it('flags fatigue when second-half variance collapses to near zero', () => {
    const buffer = [
      ...Array.from({ length: 10 }, (_, i) => Math.sin(i) * 50),
      ...new Array(10).fill(0),
    ]
    const result = signalFatigue(buffer, 20)
    expect(result.fatigued).toBe(true)
    expect(result.ratio).toBeLessThan(0.3)
  })

  it('returns not-fatigued for buffer shorter than 8 samples', () => {
    const result = signalFatigue([1, 2, 3, 4], 20)
    expect(result.fatigued).toBe(false)
    expect(result.ratio).toBe(1)
  })
})

describe('crossCorrelation', () => {
  it('returns 1.0 for identical buffers', () => {
    const buf = [1, 3, 5, 7, 9, 11, 13, 15]
    expect(crossCorrelation(buf, buf, 8)).toBeCloseTo(1)
  })

  it('returns -1.0 for perfectly anti-correlated buffers', () => {
    const a = [1, 2, 3, 4, 5, 6, 7, 8]
    const b = a.map((v) => -v)
    expect(crossCorrelation(a, b, 8)).toBeCloseTo(-1)
  })

  it('returns 0 when buffers are shorter than 4 samples', () => {
    expect(crossCorrelation([1, 2], [1, 2], 8)).toBe(0)
  })
})

describe('dominantFrequency', () => {
  it('returns 0 for a buffer shorter than 4 samples', () => {
    expect(dominantFrequency([1, 2, 3], 20)).toBe(0)
  })

  it('returns a non-negative frequency for an oscillating signal', () => {
    const buffer = Array.from({ length: 20 }, (_, i) => Math.sin(i * Math.PI * 0.5) * 10)
    expect(dominantFrequency(buffer, 20)).toBeGreaterThanOrEqual(0)
  })
})
