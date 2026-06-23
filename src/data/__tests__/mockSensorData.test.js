import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getMockSnapshot, getSensorConfig, startMockStream } from '../mockSensorData.js'

describe('getSensorConfig', () => {
  it('returns exactly 6 sensor configs', () => {
    expect(getSensorConfig()).toHaveLength(6)
  })

  it('each sensor has required string and number fields', () => {
    getSensorConfig().forEach((sensor) => {
      expect(typeof sensor.id).toBe('string')
      expect(typeof sensor.label).toBe('string')
      expect(typeof sensor.zone).toBe('string')
      expect(typeof sensor.baseHz).toBe('number')
      expect(sensor.baseHz).toBeGreaterThan(0)
    })
  })

  it('sensor ids are all unique', () => {
    const ids = getSensorConfig().map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getMockSnapshot', () => {
  it('returns exactly 6 readings', () => {
    expect(getMockSnapshot()).toHaveLength(6)
  })

  it('each reading has all required fields', () => {
    getMockSnapshot().forEach((reading) => {
      expect(typeof reading.id).toBe('string')
      expect(typeof reading.label).toBe('string')
      expect(typeof reading.zone).toBe('string')
      expect(typeof reading.value).toBe('number')
      expect(typeof reading.timestamp).toBe('number')
      expect(reading.unit).toBe('mV')
    })
  })

  it('each reading includes a weather object with numeric fields', () => {
    getMockSnapshot().forEach((reading) => {
      expect(reading.weather).toBeDefined()
      expect(typeof reading.weather.tempC).toBe('number')
      expect(typeof reading.weather.humidity).toBe('number')
      expect(typeof reading.weather.pressureHpa).toBe('number')
      expect(typeof reading.weather.lightLux).toBe('number')
      expect(typeof reading.weather.windKph).toBe('number')
      expect(typeof reading.weather.rainMm).toBe('number')
    })
  })

  it('sensor values stay within expected mV range across 100 snapshots', () => {
    for (let i = 0; i < 100; i++) {
      getMockSnapshot().forEach((reading) => {
        expect(reading.value).toBeGreaterThan(-350)
        expect(reading.value).toBeLessThan(350)
      })
    }
  })

  it('timestamps fall within the current second', () => {
    const before = Date.now()
    const snapshot = getMockSnapshot()
    const after = Date.now()
    snapshot.forEach((reading) => {
      expect(reading.timestamp).toBeGreaterThanOrEqual(before)
      expect(reading.timestamp).toBeLessThanOrEqual(after)
    })
  })
})

describe('startMockStream', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls onData on each interval tick', () => {
    const onData = vi.fn()
    const stop = startMockStream(onData, 500)
    vi.advanceTimersByTime(1500)
    expect(onData).toHaveBeenCalledTimes(3)
    stop()
  })

  it('cleanup function stops further callbacks', () => {
    const onData = vi.fn()
    const stop = startMockStream(onData, 500)
    vi.advanceTimersByTime(500)
    stop()
    vi.advanceTimersByTime(1000)
    expect(onData).toHaveBeenCalledTimes(1)
  })

  it('passes a snapshot array to onData', () => {
    const onData = vi.fn()
    const stop = startMockStream(onData, 500)
    vi.advanceTimersByTime(500)
    expect(onData.mock.calls[0][0]).toHaveLength(6)
    stop()
  })
})
