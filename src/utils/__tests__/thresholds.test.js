import { describe, it, expect } from 'vitest'
import { THRESHOLDS, ALERT_MESSAGES } from '../thresholds.js'

describe('THRESHOLDS', () => {
  it('has a positive numeric spikeAmplitude', () => {
    expect(typeof THRESHOLDS.spikeAmplitude).toBe('number')
    expect(THRESHOLDS.spikeAmplitude).toBeGreaterThan(0)
  })

  it('healthScore bands cover 0–100 without gap or overlap', () => {
    const { healthy, moderate, stressed } = THRESHOLDS.healthScore
    expect(healthy.max).toBe(100)
    expect(healthy.min).toBeGreaterThan(moderate.max)
    expect(moderate.min).toBeGreaterThan(stressed.max)
    expect(stressed.min).toBe(0)
  })

  it('variance thresholds are in ascending order', () => {
    expect(THRESHOLDS.variance.elevated).toBeGreaterThan(THRESHOLDS.variance.normal)
  })

  it('has a positive flatlineStdDev', () => {
    expect(THRESHOLDS.flatlineStdDev).toBeGreaterThan(0)
  })

  it('has a positive rollingWindowSize', () => {
    expect(THRESHOLDS.rollingWindowSize).toBeGreaterThan(0)
  })
})

describe('ALERT_MESSAGES', () => {
  const id = 'E03'

  it('spike message is a non-empty string containing the sensor id', () => {
    const msg = ALERT_MESSAGES.spike(id)
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
    expect(msg).toContain(id)
  })

  it('flatline message contains the sensor id', () => {
    expect(ALERT_MESSAGES.flatline(id)).toContain(id)
  })

  it('elevated message contains the sensor id', () => {
    expect(ALERT_MESSAGES.elevated(id)).toContain(id)
  })

  it('offline message contains the sensor id', () => {
    expect(ALERT_MESSAGES.offline(id)).toContain(id)
  })
})
