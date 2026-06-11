/**
 * useSensorStream.js
 * Main data ingestion hook.
 * Automatically falls back to mock mode when no WS URL is configured.
 * Now exports injectSerialData for the serial bridge to feed data in.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { SensorClient } from '../api/sensorClient'
import { startMockStream, getSensorConfig } from '../data/mockSensorData'

const HISTORY_LENGTH = 120  // samples kept per sensor for chart display

export function useSensorStream() {
  const [readings, setReadings]       = useState({})
  const [history, setHistory]         = useState({})
  const [connectionStatus, setConnectionStatus] = useState('initializing')
  const [lastUpdated, setLastUpdated] = useState(null)

  const historyRef = useRef({})

  // Initialize history buffers from sensor config
  useEffect(() => {
    const config = getSensorConfig()
    const init = {}
    config.forEach(s => { init[s.id] = [] })
    historyRef.current = init
    setHistory(init)
  }, [])

  const handleData = useCallback((snapshot) => {
    const newReadings = {}
    const newHistory  = { ...historyRef.current }

    snapshot.forEach(reading => {
      if (reading.weather) {
        newReadings[reading.id] = { ...reading, weather: reading.weather }
      } else {
        newReadings[reading.id] = reading
      }
      if (!newHistory[reading.id]) newHistory[reading.id] = []
      newHistory[reading.id] = [
        ...newHistory[reading.id].slice(-(HISTORY_LENGTH - 1)),
        { value: reading.value, timestamp: reading.timestamp }
      ]
    })

    historyRef.current = newHistory
    setReadings(prev => ({ ...prev, ...newReadings }))
    setHistory({ ...newHistory })
    setLastUpdated(Date.now())
  }, [])

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_SENSOR_WS_URL
    if (!wsUrl) {
      setConnectionStatus('mock')
      const stop = startMockStream(handleData, 500)
      return stop
    }
    const client = new SensorClient(wsUrl, handleData, setConnectionStatus)
    client.connect()
    return () => client.disconnect()
  }, [handleData])

  // Exposed so serial bridge can inject data into the same pipeline
  const injectSerialData = useCallback((snapshot) => {
    handleData(snapshot)
  }, [handleData])

  return { readings, history, connectionStatus, lastUpdated, injectSerialData }
}
