/**
 * useSignalProcessor.js
 * Derives processed signal metrics from raw history buffers.
 * Returns per-sensor: smoothed value, spike flag, variance, health score.
 */

import { useMemo } from 'react'
import {
  rollingMean,
  rollingStdDev,
  rollingVariance,
  ema,
  isSpike,
  computeElectrodeHealth,
} from '../utils/signalMath'
import { THRESHOLDS, ALERT_MESSAGES } from '../utils/thresholds'

export function useSignalProcessor(readings, history) {
  const processed = useMemo(() => {
    const result = {}

    Object.keys(history).forEach(id => {
      const buf    = history[id].map(h => h.value)
      const latest = readings[id]?.value ?? null

      if (buf.length < 2) {
        result[id] = { smoothed: latest, spike: false, variance: 0, health: 50, alerts: [] }
        return
      }

      const win      = THRESHOLDS.rollingWindowSize
      const mean     = rollingMean(buf, win)
      const stdDev   = rollingStdDev(buf, win)
      const variance = rollingVariance(buf, win)
      const smoothed = buf.length > 1 ? ema(buf[buf.length - 2], latest ?? 0) : latest
      const spike    = latest !== null && isSpike(latest, mean, THRESHOLDS.spikeAmplitude)
      const health   = computeElectrodeHealth(buf, win, THRESHOLDS)

      const alerts = []
      if (spike)                                  alerts.push({ type: 'spike',    msg: ALERT_MESSAGES.spike(id)    })
      if (stdDev < THRESHOLDS.flatlineStdDev)     alerts.push({ type: 'flatline', msg: ALERT_MESSAGES.flatline(id) })
      if (variance > THRESHOLDS.variance.elevated) alerts.push({ type: 'elevated', msg: ALERT_MESSAGES.elevated(id) })

      result[id] = { smoothed, spike, variance, health, stdDev, mean, alerts }
    })

    return result
  }, [readings, history])

  return processed
}
