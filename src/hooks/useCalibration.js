/**
 * useCalibration.js
 * Per-electrode baseline calibration.
 *
 * Calibration captures a rolling mean over a short window and stores it
 * as the "zero reference" for that electrode. Processed values are then
 * expressed as deviation from baseline (delta mV).
 *
 * State is persisted to localStorage so calibration survives page reloads.
 */

import { useState, useCallback, useRef } from 'react'
import { rollingMean } from '../utils/signalMath'

const STORAGE_KEY = 'mycosense_calibration'
const CAL_WINDOW  = 30  // samples to average when capturing baseline

function loadCalibration() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveCalibration(cal) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cal)) } catch { /* storage unavailable — ignore */ }
}

export function useCalibration() {
  const [baselines, setBaselines] = useState(loadCalibration)
  const [calibrating, setCalibrating] = useState({})  // { sensorId: true } while capturing
  const captureBuffers = useRef({})                    // temp buffers during capture

  /**
   * Start capturing baseline for a sensor.
   * Will resolve after CAL_WINDOW readings.
   */
  const startCalibration = useCallback((sensorId) => {
    captureBuffers.current[sensorId] = []
    setCalibrating(prev => ({ ...prev, [sensorId]: true }))
  }, [])

  /**
   * Feed a new reading during active calibration.
   * Called by the main data loop for all sensors.
   */
  const feedCalibrationSample = useCallback((sensorId, value) => {
    if (!captureBuffers.current[sensorId]) return

    captureBuffers.current[sensorId].push(value)

    if (captureBuffers.current[sensorId].length >= CAL_WINDOW) {
      const baseline = rollingMean(captureBuffers.current[sensorId], CAL_WINDOW)
      const rounded  = parseFloat(baseline.toFixed(3))

      delete captureBuffers.current[sensorId]

      setBaselines(prev => {
        const updated = { ...prev, [sensorId]: { baseline: rounded, capturedAt: Date.now() } }
        saveCalibration(updated)
        return updated
      })
      setCalibrating(prev => {
        const next = { ...prev }
        delete next[sensorId]
        return next
      })
    }
  }, [])

  /**
   * Clear calibration for a single sensor (or all if no id given).
   */
  const clearCalibration = useCallback((sensorId = null) => {
    setBaselines(prev => {
      const updated = sensorId ? { ...prev } : {}
      if (sensorId) delete updated[sensorId]
      saveCalibration(updated)
      return updated
    })
  }, [])

  /**
   * Apply calibration offset to a raw value.
   * Returns { raw, delta, calibrated } — delta is the offset from baseline.
   */
  const applyCalibration = useCallback((sensorId, rawValue) => {
    const cal = baselines[sensorId]
    if (!cal) return { raw: rawValue, delta: null, calibrated: false }
    return {
      raw:        rawValue,
      delta:      parseFloat((rawValue - cal.baseline).toFixed(2)),
      baseline:   cal.baseline,
      calibrated: true,
    }
  }, [baselines])

  return {
    baselines,
    calibrating,
    startCalibration,
    feedCalibrationSample,
    clearCalibration,
    applyCalibration,
  }
}
