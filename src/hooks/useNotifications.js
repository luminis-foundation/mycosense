/**
 * useNotifications.js
 * Central notification store for all system alerts.
 * Collects signal alerts, weather warnings, Pi sync status,
 * and system events into a single notification queue.
 * Replaces the AlertBanner blocking overlay.
 */

import { useState, useCallback, useRef } from 'react'

const MAX_NOTIFICATIONS = 50

export const NOTIF_TYPES = {
  SPIKE:      'spike',
  FLATLINE:   'flatline',
  FATIGUE:    'fatigue',
  ELEVATED:   'elevated',
  WEATHER:    'weather',
  PI_SYNC:    'pi_sync',
  SYSTEM:     'system',
}

export const NOTIF_SEVERITY = {
  INFO:    'info',
  WARNING: 'warning',
  ALERT:   'alert',
}

function severityFromType(type) {
  switch(type) {
    case NOTIF_TYPES.SPIKE:
    case NOTIF_TYPES.FLATLINE:
    case NOTIF_TYPES.FATIGUE:   return NOTIF_SEVERITY.ALERT
    case NOTIF_TYPES.ELEVATED:
    case NOTIF_TYPES.WEATHER:   return NOTIF_SEVERITY.WARNING
    default:                     return NOTIF_SEVERITY.INFO
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [isOpen, setIsOpen]               = useState(false)
  const idRef = useRef(0)

  const push = useCallback((type, message, meta = {}) => {
    const notif = {
      id:        ++idRef.current,
      type,
      message,
      severity:  meta.severity || severityFromType(type),
      sensorId:  meta.sensorId || null,
      timestamp: Date.now(),
      read:      false,
    }

    setNotifications(prev => [notif, ...prev].slice(0, MAX_NOTIFICATIONS))
    setUnreadCount(prev => prev + 1)
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  const dismiss = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  const openDrawer = useCallback(() => {
    setIsOpen(true)
    // Mark all read when drawer opens
    setTimeout(() => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    }, 300)
  }, [])

  const closeDrawer = useCallback(() => setIsOpen(false), [])

  // Ingest alerts from signal processor
  const ingestAlerts = useCallback((processedMap) => {
    Object.entries(processedMap).forEach(([sensorId, proc]) => {
      proc.alerts?.forEach(alert => {
        push(alert.type, alert.msg, { sensorId })
      })
    })
  }, [push])

  return {
    notifications,
    unreadCount,
    isOpen,
    push,
    markAllRead,
    dismiss,
    clearAll,
    openDrawer,
    closeDrawer,
    ingestAlerts,
  }
}
