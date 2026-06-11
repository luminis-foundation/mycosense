/**
 * App.jsx
 * Root component — wires all hooks to Dashboard.
 * Now includes: calibration, data logging, serial bridge, Pi sync, loading screen.
 */

import { useState, useEffect } from 'react'
import { useSensorStream }    from './hooks/useSensorStream'
import { useSignalProcessor } from './hooks/useSignalProcessor'
import { useEcosystemScore }  from './hooks/useEcosystemScore'
import { useDataLogger }      from './hooks/useDataLogger'
import { useCalibration }     from './hooks/useCalibration'
import { useSerialStream }    from './hooks/useSerialStream'
import { usePiSync }          from './hooks/usePiSync'
import { useWeatherStream }   from './hooks/useWeatherStream'
import { useNotifications }   from './hooks/useNotifications'
import { Dashboard }          from './components/Dashboard'
import { LoadingScreen }      from './components/LoadingScreen'

export default function App() {
  const [ready, setReady] = useState(false)
  useEffect(() => { setTimeout(() => setReady(true), 1500) }, [])

  const {
    readings, history, connectionStatus, lastUpdated, injectSerialData
  } = useSensorStream()

  // Serial bridge feeds into the same stream
  const { serialStatus, portLabel, serialSupported, connectSerial, disconnectSerial } =
    useSerialStream(injectSerialData)

  const processed      = useSignalProcessor(readings, history)
  const ecosystemScore = useEcosystemScore(processed)
  const { weatherByZone, weatherHistory, getConditionLabel } = useWeatherStream(readings)

  const zoneHealthScores = {
    'Rhizosphere A': Math.round((processed['E01']?.health + processed['E02']?.health) / 2) || 0,
    'Substrate B':   Math.round((processed['E03']?.health + processed['E04']?.health) / 2) || 0,
    'Canopy C':      Math.round((processed['E05']?.health + processed['E06']?.health) / 2) || 0,
  }
  const { piStatus, enqueue } = usePiSync()
  const dataLogger     = useDataLogger(readings, enqueue)

  const {
    notifications,
    unreadCount,
    isOpen: notificationsOpen,
    push: pushNotification,
    markAllRead,
    dismiss: dismissNotification,
    clearAll: clearAllNotifications,
    openDrawer: openNotifications,
    closeDrawer: closeNotifications,
    ingestAlerts,
  } = useNotifications()

  // Ingest signal alerts into notification system
  useEffect(() => {
    if (Object.keys(processed).length > 0) {
      ingestAlerts(processed)
    }
  }, [processed, ingestAlerts])
  const calibration    = useCalibration()

  // Feed live readings into calibration capture buffers
  Object.entries(readings).forEach(([id, r]) => {
    calibration.feedCalibrationSample(id, r.value)
  })

  if (!ready) return <LoadingScreen />

  return (
    <Dashboard
      readings={readings}
      processed={processed}
      history={history}
      ecosystemScore={ecosystemScore}
      connectionStatus={connectionStatus}
      lastUpdated={lastUpdated}
      // Data export
      dataLogger={dataLogger}
      // Calibration
      calibration={calibration}
      // Serial
      serialStatus={serialStatus}
      portLabel={portLabel}
      serialSupported={serialSupported}
      connectSerial={connectSerial}
      disconnectSerial={disconnectSerial}
      // Pi sync
      piStatus={piStatus}
      // Weather
      weatherByZone={weatherByZone}
      zoneHealthScores={zoneHealthScores}
      getConditionLabel={getConditionLabel}
      // Notifications
      unreadCount={unreadCount}
      openNotifications={openNotifications}
      closeNotifications={closeNotifications}
      notificationsOpen={notificationsOpen}
      notifications={notifications}
      dismissNotification={dismissNotification}
      markAllRead={markAllRead}
      clearAllNotifications={clearAllNotifications}
    />
  )
}
