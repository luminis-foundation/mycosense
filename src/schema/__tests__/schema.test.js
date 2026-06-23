import { describe, it, expect } from 'vitest'
import { schema, validateReading } from '../index.js'
import { getMockSnapshot } from '../../data/mockSensorData.js'

const validPayload = () => ({
  schemaVersion: '1.0.0',
  sessionId: 'test-session-001',
  timestamp: Date.now(),
  sensors: getMockSnapshot(),
})

describe('schema object', () => {
  it('has the correct $id', () => {
    expect(schema.$id).toBe('mycosense/sensor-reading/v1')
  })

  it('requires the expected top-level fields', () => {
    expect(schema.required).toContain('schemaVersion')
    expect(schema.required).toContain('sessionId')
    expect(schema.required).toContain('timestamp')
    expect(schema.required).toContain('sensors')
  })
})

describe('validateReading — valid payloads', () => {
  it('accepts a well-formed payload with mock sensor data', () => {
    const result = validateReading(validPayload())
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('accepts a payload with optional location and calibration fields', () => {
    const payload = {
      ...validPayload(),
      location: { siteName: 'Pecos Plot A', gridRef: '13SDV5070', elevationM: 2100 },
      calibration: {
        E01: { baselineMv: 5.2, capturedAt: Date.now() },
      },
    }
    const result = validateReading(payload)
    expect(result.valid).toBe(true)
  })
})

describe('validateReading — invalid payloads', () => {
  it('rejects null', () => {
    expect(validateReading(null).valid).toBe(false)
  })

  it('rejects an array', () => {
    expect(validateReading([]).valid).toBe(false)
  })

  it('rejects a missing schemaVersion', () => {
    const payload = validPayload()
    delete payload.schemaVersion
    const result = validateReading(payload)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('schemaVersion'))).toBe(true)
  })

  it('rejects a wrong schemaVersion', () => {
    const result = validateReading({ ...validPayload(), schemaVersion: '2.0.0' })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('schemaVersion'))).toBe(true)
  })

  it('rejects an empty sessionId', () => {
    const result = validateReading({ ...validPayload(), sessionId: '' })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('sessionId'))).toBe(true)
  })

  it('rejects a non-integer timestamp', () => {
    const result = validateReading({ ...validPayload(), timestamp: 1234.56 })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('timestamp'))).toBe(true)
  })

  it('rejects an empty sensors array', () => {
    const result = validateReading({ ...validPayload(), sensors: [] })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('sensors'))).toBe(true)
  })

  it('rejects a sensor with wrong unit', () => {
    const payload = validPayload()
    payload.sensors[0] = { ...payload.sensors[0], unit: 'V' }
    const result = validateReading(payload)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('unit'))).toBe(true)
  })
})
