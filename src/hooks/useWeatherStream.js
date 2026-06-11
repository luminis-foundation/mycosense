/**
 * useWeatherStream.js
 * Manages weather data from on-site ESP32 weather sensors.
 * Weather arrives in the same JSON stream as electrode readings —
 * extracted from the "weather" field of each node's payload.
 *
 * Also maintains per-zone weather history for correlation analysis.
 */

import { useState, useEffect, useRef, useCallback } from 'react'

const HISTORY_LENGTH = 120  // weather samples per zone

const ZONE_NODES = {
  'Rhizosphere A': ['E01', 'E02'],
  'Substrate B':   ['E03', 'E04'],
  'Canopy C':      ['E05', 'E06'],
}

const WEATHER_DEFAULTS = {
  tempC:       null,
  humidity:    null,
  pressureHpa: null,
  lightLux:    null,
  windKph:     null,
  rainMm:      null,
  timestamp:   null,
}

export function useWeatherStream(readings) {
  const [weatherByZone, setWeatherByZone] = useState({})
  const [weatherHistory, setWeatherHistory] = useState({})
  const historyRef = useRef({})

  // Extract weather from readings whenever new data arrives
  const processWeather = useCallback((readings) => {
    const byZone = {}

    Object.entries(ZONE_NODES).forEach(([zone, nodeIds]) => {
      // Average weather across nodes in same zone
      const zoneReadings = nodeIds
        .map(id => readings[id])
        .filter(r => r && r.weather)

      if (zoneReadings.length === 0) {
        byZone[zone] = { ...WEATHER_DEFAULTS, zone }
        return
      }

      const avg = (key) => {
        const vals = zoneReadings.map(r => r.weather[key]).filter(v => v !== null && v !== undefined)
        return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
      }

      const weather = {
        zone,
        tempC:       avg('tempC'),
        humidity:    avg('humidity'),
        pressureHpa: avg('pressureHpa'),
        lightLux:    avg('lightLux'),
        windKph:     avg('windKph'),
        rainMm:      avg('rainMm'),
        timestamp:   Date.now(),
      }

      byZone[zone] = weather

      // Update history
      if (!historyRef.current[zone]) historyRef.current[zone] = []
      historyRef.current[zone] = [
        ...historyRef.current[zone].slice(-(HISTORY_LENGTH - 1)),
        weather,
      ]
    })

    setWeatherByZone(byZone)
    setWeatherHistory({ ...historyRef.current })
  }, [])

  useEffect(() => {
    if (Object.keys(readings).length > 0) {
      processWeather(readings)
    }
  }, [readings, processWeather])

  // Derive conditions summary for display
  const getConditionLabel = useCallback((weather) => {
    if (!weather || weather.tempC === null) return { label: 'No sensor', icon: '—' }
    const { tempC, humidity, lightLux, windKph, rainMm } = weather

    if (rainMm > 0.1)              return { label: 'Raining',   icon: '🌧', color: 'text-blue-400'  }
    if (windKph > 20)              return { label: 'Windy',     icon: '💨', color: 'text-myco-mist' }
    if (lightLux > 50000)          return { label: 'Sunny',     icon: '☀️', color: 'text-myco-amber' }
    if (lightLux > 10000)          return { label: 'Partly cloudy', icon: '⛅', color: 'text-myco-mist' }
    if (lightLux < 2000)           return { label: 'Overcast',  icon: '☁️', color: 'text-myco-spore' }
    if (tempC > 35)                return { label: 'Hot',       icon: '🔆', color: 'text-myco-alert' }
    if (tempC < 5)                 return { label: 'Cold',      icon: '❄️', color: 'text-blue-300'  }
    return                                { label: 'Clear',     icon: '🌤', color: 'text-myco-pulse' }
  }, [])

  return { weatherByZone, weatherHistory, getConditionLabel }
}
