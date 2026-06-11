/**
 * EcosystemStatus.jsx
 * Aggregate ecosystem health score — the "vital signs" panel.
 * Big number, health label, status ring, alert summary.
 */

import { Activity } from 'lucide-react'

const COLOR_MAP = {
  pulse: { ring: '#7fff7a', text: 'text-myco-pulse' },
  amber: { ring: '#e8a838', text: 'text-myco-amber' },
  alert: { ring: '#e05c3a', text: 'text-myco-alert' },
  mist:  { ring: '#c8d8c4', text: 'text-myco-mist'  },
}

export function EcosystemStatus({ ecosystemScore, connectionStatus, lastUpdated }) {
  const { score, label, color, allAlerts } = ecosystemScore
  const colors = COLOR_MAP[color] || COLOR_MAP.mist

  const statusLabel = {
    live:          { dot: 'bg-myco-pulse animate-pulse', text: 'Live' },
    mock:          { dot: 'bg-myco-amber animate-pulse', text: 'Mock' },
    connecting:    { dot: 'bg-myco-amber',               text: 'Connecting' },
    disconnected:  { dot: 'bg-myco-alert',               text: 'Disconnected' },
    error:         { dot: 'bg-myco-alert',               text: 'Error' },
    failed:        { dot: 'bg-myco-alert',               text: 'Failed' },
    initializing:  { dot: 'bg-myco-spore',               text: 'Initializing' },
  }[connectionStatus] || { dot: 'bg-myco-spore', text: connectionStatus }

  const updatedStr = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString()
    : '—'

  return (
    <div className="card border-glow card-hover flex flex-col gap-4">
      {/* Title + connection status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-myco-spore" />
          <span className="label-tag">Ecosystem Health</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`status-dot ${statusLabel.dot}`} />
          <span className="text-xs font-mono text-myco-spore">{statusLabel.text}</span>
        </div>
      </div>

      {/* Score */}
      <div className="flex items-end gap-3">
        <span className={`font-display text-7xl font-bold leading-none ${colors.text} ${score >= 70 ? 'text-shadow-glow' : ''}`}>
          {score}
        </span>
        <div className="pb-2">
          <p className={`font-display text-xl font-medium ${colors.text}`}>{label}</p>
          <p className="text-xs font-mono text-myco-spore">updated {updatedStr}</p>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-2 w-full bg-myco-moss rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${score}%`,
            backgroundColor: colors.ring,
          }}
        />
      </div>

      {/* Alert count */}
      {allAlerts.length > 0 ? (
        <p className="text-xs font-mono text-myco-alert">
          {allAlerts.length} active alert{allAlerts.length > 1 ? 's' : ''}
        </p>
      ) : (
        <p className="text-xs font-mono text-myco-spore">No active alerts</p>
      )}
    </div>
  )
}
