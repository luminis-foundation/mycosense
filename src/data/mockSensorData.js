/**
 * mockSensorData.js
 * Generates realistic electrode signal data for development and demo.
 * Simulates mycelium network electrochemical activity with:
 *   - Baseline drift (slow oscillation)
 *   - Spike events (nutrient signaling analog)
 *   - Noise floor
 *   - Occasional anomalies (stress response analog)
 */

const SENSOR_CONFIG = [
  { id: 'E01', label: 'Node Alpha',   zone: 'Rhizosphere A', baseHz: 0.8  },
  { id: 'E02', label: 'Node Beta',    zone: 'Rhizosphere A', baseHz: 1.2  },
  { id: 'E03', label: 'Node Gamma',   zone: 'Substrate B',   baseHz: 0.5  },
  { id: 'E04', label: 'Node Delta',   zone: 'Substrate B',   baseHz: 1.0  },
  { id: 'E05', label: 'Node Epsilon', zone: 'Canopy C',      baseHz: 0.3  },
  { id: 'E06', label: 'Node Zeta',    zone: 'Canopy C',      baseHz: 0.9  },
]

let tick = 0

/**
 * Generate a single voltage reading for one electrode.
 * Returns millivolts (mV), roughly -200 to +200 mV range.
 */
function generateReading(sensor) {
  const t = tick * 0.05
  const baseline = Math.sin(t * sensor.baseHz) * 80
  const noise = (Math.random() - 0.5) * 20
  const spike = Math.random() < 0.03 ? (Math.random() > 0.5 ? 1 : -1) * Math.random() * 120 : 0
  return parseFloat((baseline + noise + spike).toFixed(2))
}

/**
 * Returns a full sensor snapshot — all electrodes at current tick.
 */
export function getMockSnapshot() {
  tick++
  const timestamp = Date.now()

  return SENSOR_CONFIG.map(sensor => ({
    id:        sensor.id,
    label:     sensor.label,
    zone:      sensor.zone,
    value:     generateReading(sensor),
    timestamp,
    unit:      'mV',
    weather: {
      tempC:       22 + Math.sin(tick * 0.01) * 8 + (Math.random() - 0.5) * 2,
      humidity:    45 + Math.sin(tick * 0.008) * 15 + (Math.random() - 0.5) * 3,
      pressureHpa: 843 + Math.sin(tick * 0.005) * 3,
      lightLux:    Math.max(0, 30000 + Math.sin(tick * 0.02) * 25000 + (Math.random() - 0.5) * 5000),
      windKph:     Math.max(0, 8 + Math.sin(tick * 0.015) * 6 + (Math.random() - 0.5) * 2),
      rainMm:      Math.random() < 0.02 ? Math.random() * 0.3 : 0,
    },
  }))
}

/**
 * Returns sensor config (without readings) for initializing UI.
 */
export function getSensorConfig() {
  return SENSOR_CONFIG
}

/**
 * Starts a mock streaming loop, calling onData every intervalMs.
 * Returns a cleanup function.
 */
export function startMockStream(onData, intervalMs = 500) {
  const id = setInterval(() => {
    onData(getMockSnapshot())
  }, intervalMs)
  return () => clearInterval(id)
}
