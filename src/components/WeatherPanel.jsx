/**
 * WeatherPanel.jsx
 * Per-zone live weather display from on-site ESP32 weather sensors.
 * Shows temp, humidity, pressure, light, wind, rain per zone.
 * Correlates with zone electrode health scores.
 */

import { Thermometer, Droplets, Wind, Cloud, Sun, CloudRain } from 'lucide-react'

function WeatherStat({ icon: Icon, label, value, unit, color = 'text-myco-mist' }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={11} className="text-myco-spore shrink-0" />
      <span className="text-xs font-mono text-myco-spore">{label}</span>
      <span className={`text-xs font-mono ml-auto ${color}`}>
        {value !== null && value !== undefined ? `${typeof value === 'number' ? value.toFixed(1) : value}${unit}` : '—'}
      </span>
    </div>
  )
}

function ZoneWeatherCard({ zone, weather, zoneHealth, getConditionLabel }) {
  const condition = getConditionLabel(weather)
  const hasData   = weather && weather.tempC !== null

  const ZONE_COLORS = {
    'Rhizosphere A': 'border-l-[#a8c5a0]',
    'Substrate B':   'border-l-[#e8a838]',
    'Canopy C':      'border-l-[#7fff7a]',
  }

  return (
    <div className={`card border-l-2 ${ZONE_COLORS[zone] || 'border-l-myco-moss'}`}>
      {/* Zone header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="label-tag">{zone}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-base">{condition.icon}</span>
            <span className={`text-xs font-mono ${condition.color || 'text-myco-spore'}`}>
              {condition.label}
            </span>
          </div>
        </div>
        {zoneHealth !== undefined && (
          <div className="text-right">
            <p className="text-xs font-mono text-myco-spore">zone health</p>
            <p className={`font-mono text-lg font-bold ${
              zoneHealth >= 70 ? 'text-myco-pulse' :
              zoneHealth >= 40 ? 'text-myco-amber' : 'text-myco-alert'
            }`}>{Math.round(zoneHealth)}%</p>
          </div>
        )}
      </div>

      {!hasData ? (
        <p className="text-xs font-mono text-myco-spore">
          Awaiting ESP32 weather sensor — data arrives with electrode stream
        </p>
      ) : (
        <div className="space-y-1.5">
          <WeatherStat icon={Thermometer} label="temp"     value={weather.tempC}       unit="°C"  color={weather.tempC > 35 ? 'text-myco-alert' : weather.tempC < 5 ? 'text-blue-300' : 'text-myco-mist'} />
          <WeatherStat icon={Droplets}   label="humidity"  value={weather.humidity}    unit="%"   />
          <WeatherStat icon={Cloud}      label="pressure"  value={weather.pressureHpa} unit=" hPa" />
          <WeatherStat icon={Sun}        label="light"     value={weather.lightLux !== null ? Math.round(weather.lightLux / 1000) : null} unit="k lux" color="text-myco-amber" />
          <WeatherStat icon={Wind}       label="wind"      value={weather.windKph}     unit=" kph" color={weather.windKph > 20 ? 'text-myco-alert' : 'text-myco-mist'} />
          <WeatherStat icon={CloudRain}  label="rain"      value={weather.rainMm}      unit=" mm"  color={weather.rainMm > 0 ? 'text-blue-400' : 'text-myco-spore'} />
        </div>
      )}
    </div>
  )
}

export function WeatherPanel({ weatherByZone, zoneHealthScores, getConditionLabel }) {
  const zones = ['Rhizosphere A', 'Substrate B', 'Canopy C']

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="label-tag">On-Site Microclimate</p>
        <p className="text-xs font-mono text-myco-spore">per ESP32 weather sensor · Pecos Canyon</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {zones.map(zone => (
          <ZoneWeatherCard
            key={zone}
            zone={zone}
            weather={weatherByZone[zone]}
            zoneHealth={zoneHealthScores?.[zone]}
            getConditionLabel={getConditionLabel}
          />
        ))}
      </div>

      <p className="text-xs font-mono text-myco-spore">
        Weather data arrives embedded in the ESP32 electrode stream — DHT22 (temp/humidity),
        BMP280 (pressure), LDR (light), anemometer (wind), tipping bucket (rain).
        No external API. Sovereign, hyperlocal, offline-first.
      </p>
    </div>
  )
}
