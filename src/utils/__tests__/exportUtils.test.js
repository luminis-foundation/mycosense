import { describe, it, expect } from 'vitest'
import { readingsToCSV } from '../dataExport.js'
import { readingsToJSON, csvFilename } from '../exportUtils.js'

const SAMPLE_READINGS = [
  {
    id: 'E01',
    label: 'Node Alpha',
    zone: 'Rhizosphere A',
    value: 42.5,
    unit: 'mV',
    timestamp: 1700000000000,
    weather: { tempC: 22, humidity: 50, pressureHpa: 843, lightLux: 5000, windKph: 5, rainMm: 0 },
  },
  {
    id: 'E02',
    label: 'Node Beta',
    zone: 'Rhizosphere A',
    value: -18.3,
    unit: 'mV',
    timestamp: 1700000000001,
  },
]

describe('readingsToCSV', () => {
  it('produces a string with a header row', () => {
    const csv = readingsToCSV(SAMPLE_READINGS)
    const lines = csv.split('\n')
    expect(lines[0]).toContain('timestamp')
    expect(lines[0]).toContain('sensor_id')
    expect(lines[0]).toContain('value_mV')
  })

  it('produces one data row per reading', () => {
    const csv = readingsToCSV(SAMPLE_READINGS)
    const lines = csv.split('\n')
    // header + 2 data rows
    expect(lines).toHaveLength(3)
  })

  it('includes the sensor id and value in the correct columns', () => {
    const csv = readingsToCSV(SAMPLE_READINGS)
    expect(csv).toContain('E01')
    expect(csv).toContain('42.5')
    expect(csv).toContain('E02')
    expect(csv).toContain('-18.3')
  })

  it('defaults unit to mV when not present', () => {
    const reading = { id: 'E03', label: 'X', zone: 'Y', value: 1, timestamp: 1 }
    expect(readingsToCSV([reading])).toContain('mV')
  })
})

describe('readingsToJSON', () => {
  it('produces valid JSON', () => {
    const json = readingsToJSON(SAMPLE_READINGS, { sessionId: 'test-001' })
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('sets schemaVersion to 1.0.0', () => {
    const obj = JSON.parse(readingsToJSON(SAMPLE_READINGS, { sessionId: 'test-001' }))
    expect(obj.schemaVersion).toBe('1.0.0')
  })

  it('includes the sessionId from metadata', () => {
    const obj = JSON.parse(readingsToJSON(SAMPLE_READINGS, { sessionId: 'my-session' }))
    expect(obj.sessionId).toBe('my-session')
  })

  it('has a sensors array with correct length', () => {
    const obj = JSON.parse(readingsToJSON(SAMPLE_READINGS, { sessionId: 's' }))
    expect(obj.sensors).toHaveLength(SAMPLE_READINGS.length)
  })

  it('each sensor entry has required v1 schema fields', () => {
    const obj = JSON.parse(readingsToJSON(SAMPLE_READINGS, { sessionId: 's' }))
    obj.sensors.forEach((s) => {
      expect(s).toHaveProperty('id')
      expect(s).toHaveProperty('label')
      expect(s).toHaveProperty('zone')
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('unit')
      expect(s).toHaveProperty('timestamp')
    })
  })

  it('includes weather when present on a reading', () => {
    const obj = JSON.parse(readingsToJSON(SAMPLE_READINGS, { sessionId: 's' }))
    expect(obj.sensors[0].weather).toBeDefined()
  })

  it('omits weather when not present on a reading', () => {
    const obj = JSON.parse(readingsToJSON(SAMPLE_READINGS, { sessionId: 's' }))
    expect(obj.sensors[1].weather).toBeUndefined()
  })

  it('includes optional location when supplied in metadata', () => {
    const obj = JSON.parse(
      readingsToJSON(SAMPLE_READINGS, {
        sessionId: 's',
        location: { siteName: 'Pecos Plot A' },
      })
    )
    expect(obj.location.siteName).toBe('Pecos Plot A')
  })
})

describe('csvFilename', () => {
  it('starts with mycosense_', () => {
    expect(csvFilename('sess-1')).toMatch(/^mycosense_/)
  })

  it('includes the sessionId', () => {
    expect(csvFilename('my-session')).toContain('my-session')
  })

  it('ends with .csv', () => {
    expect(csvFilename('sess-1')).toMatch(/\.csv$/)
  })

  it('uses the provided timestamp for the date portion', () => {
    // 2024-01-15T10:30:00.000Z
    const name = csvFilename('sess-1', 1705314600000)
    expect(name).toContain('2024-01-15')
  })
})
