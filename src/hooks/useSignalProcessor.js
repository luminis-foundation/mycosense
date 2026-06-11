/**
 * useSignalProcessor.js
 * Derives full signal metrics from raw history buffers.
 * Uses advanced DSP from signalProcessing.js
 */

import { useMemo } from 'react'
import { rollingMean, rollingStdDev, rollingVariance, ema, computeElectrodeHealth } from '../utils/signalMath'
import { zScoreSpike, dominantFrequency, linearTrend, signalEntropy, signalFatigue } from '../utils/signalProcessing'
import { THRESHOLDS, ALERT_MESSAGES } from '../utils/thresholds'

export function useSignalProcessor(readings, history) {
  const processed = useMemo(() => {
    const result = {}
    Object.keys(history).forEach(id => {
      const buf    = history[id].map(h => h.value)
      const latest = readings[id]?.value ?? null
      if (buf.length < 2) {
        result[id] = { smoothed: latest, spike: false, zScore: 0, variance: 0, health: 50, alerts: [], trend: 0, entropy: 0, dominantHz: 0, fatigued: false }
        return
      }
      const win        = THRESHOLDS.rollingWindowSize
      const mean       = rollingMean(buf, win)
      const stdDev     = rollingStdDev(buf, win)
      const variance   = rollingVariance(buf, win)
      const smoothed   = buf.length > 1 ? ema(buf[buf.length - 2], latest ?? 0) : latest
      const { isSpike, zScore } = zScoreSpike(buf, win)
      const health     = computeElectrodeHealth(buf, win, THRESHOLDS)
      const trend      = linearTrend(buf, win)
      const entropy    = signalEntropy(buf, win)
      const dominantHz = dominantFrequency(buf, win)
      const { fatigued } = signalFatigue(buf, win)

      const alerts = []
      if (isSpike)                                    alerts.push({ type: 'spike',    msg: ALERT_MESSAGES.spike(id)    })
      if (stdDev < THRESHOLDS.flatlineStdDev)         alerts.push({ type: 'flatline', msg: ALERT_MESSAGES.flatline(id) })
      if (variance > THRESHOLDS.variance.elevated)    alerts.push({ type: 'elevated', msg: ALERT_MESSAGES.elevated(id) })
      if (fatigued)                                   alerts.push({ type: 'fatigue',  msg: `${id} signal fatigue — check electrode contact` })

      result[id] = { smoothed, spike: isSpike, zScore, variance, health, stdDev, mean, alerts, trend, entropy, dominantHz, fatigued }
    })
    return result
  }, [readings, history])
  return processed
}
