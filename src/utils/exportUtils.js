/**
 * exportUtils.js
 * Pure export helpers with no browser dependencies.
 * Safe to import in Node.js, Pi-server scripts, and Vitest (node environment).
 */

/**
 * Build a datestamped CSV filename for a session.
 * @param {string} sessionId
 * @param {number} [ts] - Unix ms timestamp (defaults to now)
 * @returns {string}
 */
export function csvFilename(sessionId, ts = Date.now()) {
  const date = new Date(ts).toISOString().slice(0, 19).replace(/:/g, '-')
  return `mycosense_${sessionId}_${date}.csv`
}

/**
 * Serialize readings to a JSON string conforming to the v1 sensor-reading schema.
 * Does not include calibration or location — callers should merge those in metadata.
 *
 * @param {Array}  readings - flat array of sensor reading objects
 * @param {Object} metadata - { sessionId, location?, calibration? }
 * @returns {string} JSON string
 */
export function readingsToJSON(readings, metadata = {}) {
  const payload = {
    schemaVersion: '1.0.0',
    sessionId: metadata.sessionId ?? `session_${Date.now()}`,
    timestamp: Date.now(),
    ...(metadata.location ? { location: metadata.location } : {}),
    ...(metadata.calibration ? { calibration: metadata.calibration } : {}),
    sensors: readings.map((r) => ({
      id: r.id,
      label: r.label,
      zone: r.zone,
      value: r.value,
      unit: r.unit ?? 'mV',
      timestamp: r.timestamp,
      ...(r.weather ? { weather: r.weather } : {}),
    })),
  }
  return JSON.stringify(payload, null, 2)
}
