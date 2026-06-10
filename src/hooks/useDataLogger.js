/**
 * useDataLogger.js
 * Accumulates sensor readings across a session for export.
 * Keeps a rolling flat log (capped at maxRecords to avoid memory bloat).
 * Exposes exportCSV and exportSQLite actions.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { downloadCSV, downloadSQLite } from '../utils/dataExport'

const MAX_RECORDS = 50_000  // ~14hrs at 1 reading/sensor/500ms × 6 sensors

export function useDataLogger(readings) {
  const logRef      = useRef([])
  const sessionStart = useRef(Date.now())
  const [recordCount, setRecordCount] = useState(0)
  const [isLogging, setIsLogging]     = useState(true)

  // Append incoming readings to log
  useEffect(() => {
    if (!isLogging) return
    const snapshot = Object.values(readings)
    if (snapshot.length === 0) return

    logRef.current = [...logRef.current, ...snapshot].slice(-MAX_RECORDS)
    setRecordCount(logRef.current.length)
  }, [readings, isLogging])

  const exportCSV = useCallback(() => {
    downloadCSV(logRef.current)
  }, [])

  const exportSQLite = useCallback(async () => {
    await downloadSQLite(logRef.current, {
      sessionId:  `session_${sessionStart.current}`,
      startedAt:  sessionStart.current,
      endedAt:    Date.now(),
      notes:      'MycoSense electrode session — Luminis Foundation',
    })
  }, [])

  const clearLog = useCallback(() => {
    logRef.current = []
    sessionStart.current = Date.now()
    setRecordCount(0)
  }, [])

  const toggleLogging = useCallback(() => {
    setIsLogging(prev => !prev)
  }, [])

  return { recordCount, isLogging, exportCSV, exportSQLite, clearLog, toggleLogging }
}
