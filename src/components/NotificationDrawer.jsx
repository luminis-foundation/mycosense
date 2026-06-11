/**
 * NotificationDrawer.jsx
 * Mushroom bell icon in header → slide-out notification drawer.
 * Replaces the AlertBanner that was blocking the UI.
 *
 * Severity colors:
 *   alert   → red (spike, flatline, fatigue)
 *   warning → amber (elevated variance, weather)
 *   info    → sage (system, pi sync)
 */

import { X, CheckCheck, Trash2 } from 'lucide-react'

// Mushroom SVG icon — the bell equivalent for MycoSense
function MushroomIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Cap */}
      <path d="M3 13c0-4.97 4.03-9 9-9s9 4.03 9 9H3z" />
      {/* Stem */}
      <path d="M9 13v4a3 3 0 0 0 6 0v-4" />
      {/* Spots */}
      <circle cx="9.5"  cy="10" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="9"  r="0.8" fill="currentColor" stroke="none" />
      <circle cx="12"   cy="11.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

const SEVERITY_CONFIG = {
  alert:   { dot: 'bg-myco-alert',  text: 'text-myco-alert',  border: 'border-l-myco-alert'  },
  warning: { dot: 'bg-myco-amber',  text: 'text-myco-amber',  border: 'border-l-myco-amber'  },
  info:    { dot: 'bg-myco-spore',  text: 'text-myco-spore',  border: 'border-l-myco-spore'  },
}

const TYPE_LABELS = {
  spike:    '⚡ Spike',
  flatline: '— Flatline',
  fatigue:  '↘ Fatigue',
  elevated: '↑ Variance',
  weather:  '🌤 Weather',
  pi_sync:  '🖥 Pi Sync',
  system:   '⚙ System',
}

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp
  if (diff < 60000)  return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
}

function NotificationItem({ notif, onDismiss }) {
  const cfg = SEVERITY_CONFIG[notif.severity] || SEVERITY_CONFIG.info

  return (
    <div className={`flex items-start gap-3 p-3 border-l-2 ${cfg.border} bg-myco-soil rounded-r-lg ${!notif.read ? 'opacity-100' : 'opacity-60'}`}>
      <div className={`status-dot mt-1 shrink-0 ${cfg.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-mono font-medium ${cfg.text}`}>
            {TYPE_LABELS[notif.type] || notif.type}
          </span>
          {notif.sensorId && (
            <span className="text-xs font-mono text-myco-spore">{notif.sensorId}</span>
          )}
        </div>
        <p className="text-xs text-myco-mist leading-relaxed">{notif.message}</p>
        <p className="text-xs font-mono text-myco-spore mt-1">{timeAgo(notif.timestamp)}</p>
      </div>
      <button
        onClick={() => onDismiss(notif.id)}
        className="text-myco-spore hover:text-myco-mist transition-colors shrink-0 mt-0.5"
      >
        <X size={12} />
      </button>
    </div>
  )
}

export function NotificationBell({ unreadCount, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-myco-moss hover:border-myco-spore transition-colors"
      title="Notifications"
    >
      <MushroomIcon
        size={18}
        className={unreadCount > 0 ? 'text-myco-pulse animate-pulse-slow' : 'text-myco-spore'}
      />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-myco-alert rounded-full text-[10px] font-mono font-bold text-myco-soil flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

export function NotificationDrawer({ isOpen, notifications, onClose, onDismiss, onMarkAllRead, onClearAll }) {
  if (!isOpen) return null

  const unread = notifications.filter(n => !n.read).length

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-myco-soil/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-myco-bark border-l border-myco-moss flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-myco-moss">
          <div className="flex items-center gap-2">
            <MushroomIcon size={16} className="text-myco-mycel" />
            <span className="font-display text-sm font-semibold text-myco-mist">Notifications</span>
            {notifications.length > 0 && (
              <span className="text-xs font-mono text-myco-spore">({notifications.length})</span>
            )}
          </div>
          <button onClick={onClose} className="text-myco-spore hover:text-myco-mist transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex gap-2 px-4 py-2 border-b border-myco-moss">
            {unread > 0 && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-1.5 text-xs font-mono text-myco-spore hover:text-myco-mycel transition-colors"
              >
                <CheckCheck size={12} />
                Mark all read
              </button>
            )}
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 text-xs font-mono text-myco-spore hover:text-myco-alert transition-colors ml-auto"
            >
              <Trash2 size={12} />
              Clear all
            </button>
          </div>
        )}

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
              <MushroomIcon size={32} className="text-myco-spore" />
              <p className="text-xs font-mono text-myco-spore">No notifications</p>
            </div>
          ) : (
            notifications.map(notif => (
              <NotificationItem
                key={notif.id}
                notif={notif}
                onDismiss={onDismiss}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-myco-moss">
          <p className="text-xs font-mono text-myco-spore text-center">
            MycoSense · Luminis Foundation
          </p>
        </div>
      </div>
    </>
  )
}
