/**
 * SensorCard.jsx
 * Individual electrode readout card.
 * Shows: current value, smoothed trend, spike indicator, health bar, waveform.
 * Expanded stats: z-score, Hz, entropy, trend arrow.
 */

import { SignalChart } from './SignalChart'
import { Zap } from 'lucide-react'

function HealthBar({ score }) {
  const color = score >= 70 ? 'bg-myco-pulse' : score >= 40 ? 'bg-myco-amber' : 'bg-myco-alert'
  return (
    <div className="h-1 w-full bg-myco-moss rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${score}%` }}
      />
    </div>
  )
}

export function SensorCard({ reading, processed, history }) {
  const { id, label, zone, value, unit } = reading
  const { smoothed, spike, health, stdDev, zScore, dominantHz, entropy, trend, fatigued } = processed

  return (
    <div className={`card card-hover transition-all duration-300 ${spike ? 'border-myco-alert' : 'border-myco-moss'}`}>
      {/* Spike accent bar */}
      <div className={`h-0.5 w-full rounded-full mb-3 transition-all duration-500 ${spike ? 'bg-myco-alert' : 'bg-myco-moss'}`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="label-tag">{id}</p>
          <p className="text-sm font-display text-myco-mist font-medium">{label}</p>
          <p className="text-xs text-myco-spore">{zone}</p>
        </div>
        <div className="text-right">
          {spike && (
            <div className="flex items-center gap-1 text-myco-alert text-xs font-mono mb-1">
              <Zap size={12} />
              <span>spike</span>
            </div>
          )}
          <p className="value-display text-xl leading-none">
            {value !== undefined ? value.toFixed(1) : '—'}
          </p>
          <p className="text-xs text-myco-spore">{unit}</p>
        </div>
      </div>

      {/* Waveform */}
      <SignalChart historyBuffer={history} spike={spike} />

      {/* Stats row — expanded */}
      <div className="mt-2 space-y-1">
        <HealthBar score={health} />
        <div className="grid grid-cols-2 gap-x-3 text-xs font-mono text-myco-spore mt-1">
          <span>health <span className={health >= 70 ? 'text-myco-pulse' : health >= 40 ? 'text-myco-amber' : 'text-myco-alert'}>{Math.round(health)}%</span></span>
          <span>σ {stdDev?.toFixed(1) ?? '—'}</span>
          <span>z <span className={zScore > 2.5 ? 'text-myco-alert' : 'text-myco-spore'}>{zScore?.toFixed(1) ?? '—'}</span></span>
          <span>Hz {dominantHz?.toFixed(2) ?? '—'}</span>
          <span>entropy {entropy?.toFixed(2) ?? '—'}</span>
          <span>trend {trend > 0.01 ? '↑' : trend < -0.01 ? '↓' : '→'}</span>
        </div>
      </div>
    </div>
  )
}
