/**
 * useEcosystemScore.js
 * Derives a single aggregate ecosystem health score from all electrode readings.
 * Weights can be tuned per zone or sensor once empirical data is available.
 */

import { useMemo } from 'react'
import { THRESHOLDS } from '../utils/thresholds'

export function useEcosystemScore(processed) {
  const score = useMemo(() => {
    const sensors = Object.values(processed)
    if (sensors.length === 0) return { score: 0, label: 'No Data', color: 'mist' }

    const avg = sensors.reduce((sum, s) => sum + (s.health ?? 50), 0) / sensors.length
    const rounded = Math.round(avg)

    let label, color
    if (rounded >= THRESHOLDS.healthScore.healthy.min) {
      label = 'Healthy'
      color = 'pulse'
    } else if (rounded >= THRESHOLDS.healthScore.moderate.min) {
      label = 'Moderate'
      color = 'amber'
    } else {
      label = 'Stressed'
      color = 'alert'
    }

    // Collect all active alerts across all sensors
    const allAlerts = sensors.flatMap(s => s.alerts ?? [])

    return { score: rounded, label, color, allAlerts }
  }, [processed])

  return score
}
