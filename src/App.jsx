/**
 * App.jsx
 * Root component — wires all hooks to Dashboard.
 * Now includes: calibration, data logging, serial bridge.
 */

import { useSensorStream }    from './hooks/useSensorStream'
import { useSignalProcessor } from './hooks/useSignalProcessor'
import { useEcosystemScore }  from './hooks/useEcosystemScore'
import { useDataLogger }      from './hooks/useDataLogger'
import { useCalibration }     from './hooks/useCalibration'
import { useSerialStream }    from './hooks/useSerialStream'
import { Dashboard }          from './components/Dashboard'

export default function App() {
  const {
    readings, history, connectionStatus, lastUpdated, injectSerialData
  } = useSensorStream()

  // Serial bridge feeds into the same stream
  const { serialStatus, portLabel, serialSupported, connectSerial, disconnectSerial } =
    useSerialStream(injectSerialData)

  const processed      = useSignalProcessor(readings, history)
  const ecosystemScore = useEcosystemScore(processed)
  const dataLogger     = useDataLogger(readings)
  const calibration    = useCalibration()

  // Feed live readings into calibration capture buffers
  Object.entries(readings).forEach(([id, r]) => {
    calibration.feedCalibrationSample(id, r.value)
  })

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
    />
  )
}
