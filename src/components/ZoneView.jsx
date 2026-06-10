/**
 * ZoneView.jsx
 * Collapses the 6-electrode array into 3 zone-level health panels.
 * Each zone shows: aggregate health score, combined waveform sparkline,
 * member electrode list with individual mini-readouts.
 */

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { getSensorConfig } from '../data/mockSensorData'

const ZONE_META = {
  'Rhizosphere A': { desc: 'Root zone · high nutrient exchange',  color: '#a8c5a0' },
  'Substrate B':   { desc: 'Growing substrate · mycelial density', color: '#e8a838' },
  'Canopy C':      { desc: 'Aerial network · volatile signaling',  color: '#7fff7a' },
}

function ZoneMiniChart({ histories, color }) {
  // Merge all sensor histories into a single averaged series
  const maxLen = Math.max(...Object.values(histories).map(h => h.length), 0)
  if (maxLen < 2) return <div className="h-10 flex items-center text-xs font-mono text-myco-spore">awaiting...</div>

  const merged = Array.from({ length: maxLen }, (_, i) => {
    const vals = Object.values(histories)
      .map(h => h[h.length - maxLen + i]?.value)
      .filter(v => v !== undefined)
    return { i, value: vals.reduce((a, b) => a + b, 0) / vals.length }
  })

  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={merged}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function ZoneCard({ zoneName, sensors, readings, processed, history }) {
  const [expanded, setExpanded] = useState(false)
  const meta = ZONE_META[zoneName] || { desc: '', color: '#a8c5a0' }

  // Aggregate health across zone sensors
  const healthScores = sensors.map(s => processed[s.id]?.health ?? 50)
  const avgHealth    = Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length)
  const healthColor  = avgHealth >= 70 ? 'text-myco-pulse' : avgHealth >= 40 ? 'text-myco-amber' : 'text-myco-alert'
  const barColor     = avgHealth >= 70 ? 'bg-myco-pulse'  : avgHealth >= 40 ? 'bg-myco-amber'  : 'bg-myco-alert'

  // Zone histories keyed by sensor id
  const zoneHistories = Object.fromEntries(sensors.map(s => [s.id, history[s.id] || []]))

  return (
    <div className="card">
      {/* Zone header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start justify-between gap-3 text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-display text-sm font-semibold text-myco-mist">{zoneName}</span>
            {expanded ? <ChevronDown size={14} className="text-myco-spore" /> : <ChevronRight size={14} className="text-myco-spore" />}
          </div>
          <p className="text-xs text-myco-spore">{meta.desc}</p>
        </div>
        <div className="text-right shrink-0">
          <p className={`font-mono text-2xl font-bold leading-none ${healthColor}`}>{avgHealth}</p>
          <p className="text-xs text-myco-spore">health</p>
        </div>
      </button>

      {/* Zone sparkline + bar */}
      <div className="mt-2">
        <ZoneMiniChart histories={zoneHistories} color={meta.color} />
        <div className="h-1 w-full bg-myco-moss rounded-full overflow-hidden mt-1">
          <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${avgHealth}%` }} />
        </div>
      </div>

      {/* Expanded: individual electrode rows */}
      {expanded && (
        <div className="mt-4 space-y-2 border-t border-myco-moss pt-3">
          {sensors.map(s => {
            const r = readings[s.id]
            const p = processed[s.id]
            if (!r || !p) return null
            const hc = p.health >= 70 ? 'text-myco-pulse' : p.health >= 40 ? 'text-myco-amber' : 'text-myco-alert'
            return (
              <div key={s.id} className="flex items-center justify-between">
                <div>
                  <span className="label-tag mr-2">{s.id}</span>
                  <span className="text-xs text-myco-mist">{r.label}</span>
                  {p.spike && <span className="ml-2 text-xs text-myco-alert font-mono">⚡</span>}
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm text-myco-mist">{r.value?.toFixed(1)} mV</span>
                  <span className={`ml-3 font-mono text-xs ${hc}`}>{Math.round(p.health)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function ZoneView({ readings, processed, history }) {
  const config = getSensorConfig()

  // Group sensors by zone
  const zones = config.reduce((acc, s) => {
    if (!acc[s.zone]) acc[s.zone] = []
    acc[s.zone].push(s)
    return acc
  }, {})

  return (
    <div className="space-y-3">
      {Object.entries(zones).map(([zoneName, sensors]) => (
        <ZoneCard
          key={zoneName}
          zoneName={zoneName}
          sensors={sensors}
          readings={readings}
          processed={processed}
          history={history}
        />
      ))}
    </div>
  )
}
