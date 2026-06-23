import schema from './v1/sensor-reading.schema.json' assert { type: 'json' }

export { schema }

const REQUIRED_FIELDS = ['schemaVersion', 'sessionId', 'timestamp', 'sensors']
const REQUIRED_SENSOR_FIELDS = ['id', 'label', 'zone', 'value', 'unit', 'timestamp']

/**
 * Lightweight structural validator — checks required fields and basic types
 * without pulling in a full JSON Schema library.
 *
 * For strict validation against the full schema, use AJV or ajv-cli:
 *   npx ajv validate -s src/schema/v1/sensor-reading.schema.json -d <file.json>
 *
 * @param {unknown} payload
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateReading(payload) {
  const errors = []

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { valid: false, errors: ['payload must be a non-null object'] }
  }

  for (const field of REQUIRED_FIELDS) {
    if (!(field in payload)) errors.push(`missing required field: ${field}`)
  }

  if (payload.schemaVersion !== '1.0.0') {
    errors.push(`schemaVersion must be "1.0.0", got "${payload.schemaVersion}"`)
  }

  if (typeof payload.sessionId !== 'string' || payload.sessionId.length === 0) {
    errors.push('sessionId must be a non-empty string')
  }

  if (typeof payload.timestamp !== 'number' || !Number.isInteger(payload.timestamp) || payload.timestamp < 0) {
    errors.push('timestamp must be a non-negative integer (Unix ms)')
  }

  if (!Array.isArray(payload.sensors) || payload.sensors.length === 0) {
    errors.push('sensors must be a non-empty array')
  } else {
    payload.sensors.forEach((sensor, i) => {
      for (const field of REQUIRED_SENSOR_FIELDS) {
        if (!(field in sensor)) errors.push(`sensors[${i}]: missing required field: ${field}`)
      }
      if (sensor.unit !== 'mV') errors.push(`sensors[${i}]: unit must be "mV"`)
      if (typeof sensor.value !== 'number') errors.push(`sensors[${i}]: value must be a number`)
    })
  }

  return { valid: errors.length === 0, errors }
}
