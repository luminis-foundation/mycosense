/**
 * AlertBanner.jsx
 * Displays active alerts — spike events, flatlines, elevated variance.
 * Auto-dismisses after 8 seconds. Stacks up to 5 visible.
 */

import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export function AlertBanner({ alerts }) {
  const [visible, setVisible] = useState([])

  useEffect(() => {
    if (!alerts || alerts.length === 0) return

    const newAlerts = alerts.map(a => ({
      ...a,
      key: `${a.type}-${Date.now()}-${Math.random()}`,
    }))

    setVisible(prev => [...prev, ...newAlerts].slice(-5))

    const timer = setTimeout(() => {
      setVisible(prev => prev.slice(newAlerts.length))
    }, 8000)

    return () => clearTimeout(timer)
  }, [alerts])

  const dismiss = (key) => {
    setVisible(prev => prev.filter(a => a.key !== key))
  }

  if (visible.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {visible.map(alert => (
        <div
          key={alert.key}
          className="flex items-start gap-3 bg-myco-bark border border-myco-alert rounded-lg px-4 py-3 shadow-lg"
        >
          <AlertTriangle size={16} className="text-myco-alert mt-0.5 shrink-0" />
          <span className="text-sm font-mono text-myco-mist flex-1">{alert.msg}</span>
          <button
            onClick={() => dismiss(alert.key)}
            className="text-myco-spore hover:text-myco-mist transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
