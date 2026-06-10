/**
 * CalibrationPanel.jsx
 * Per-electrode baseline calibration interface.
 * Shows current baseline, capture progress, delta readout, and clear controls.
 */

import { Target, RefreshCw, X } from 'lucide-react'
import { getSensorConfig } from '../data/mockSensorData'

const CAL_WINDOW = 30

export function CalibrationPanel({ baselines, calibrating, readings, startCalibration, clearCalibration, applyCalibration }) {
  const config = getSensorConfig()

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Target size={14} className="text-myco-spore" />
        <span className="label-tag">Calibration</span>
        <span className="text-xs font-mono text-myco-spore ml-auto">baseline offset per electrode</span>
      </div>

      <div className="space-y-3">
        {config.map(sensor => {
          const cal       = baselines[sensor.id]
          const isActive  = !!calibrating[sensor.id]
          const reading   = readings[sensor.id]
          const applied   = reading ? applyCalibration(sensor.id, reading.value) : null

          return (
            <div key={sensor.id} className="flex items-center gap-3 py-2 border-b border-myco-moss last:border-0">
              {/* Sensor identity */}
              <div className="w-28 shrink-0">
                <p className="label-tag">{sensor.id}</p>
                <p className="text-xs text-myco-mist">{sensor.label}</p>
              </div>

              {/* Baseline info */}
              <div className="flex-1">
                {cal ? (
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs font-mono text-myco-spore">baseline</p>
                      <p className="font-mono text-sm text-myco-mycel">{cal.baseline} mV</p>
                    </div>
                    {applied?.calibrated && (
                      <div>
                        <p className="text-xs font-mono text-myco-spore">Δ now</p>
                        <p className={`font-mono text-sm ${
                          Math.abs(applied.delta) < 20 ? 'text-myco-pulse' :
                          Math.abs(applied.delta) < 60 ? 'text-myco-amber' : 'text-myco-alert'
                        }`}>
                          {applied.delta > 0 ? '+' : ''}{applied.delta} mV
                        </p>
                      </div>
                    )}
                    <p className="text-xs font-mono text-myco-spore ml-auto">
                      {new Date(cal.capturedAt).toLocaleTimeString()}
                    </p>
                  </div>
                ) : isActive ? (
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 bg-myco-moss rounded-full overflow-hidden">
                      <div className="h-full bg-myco-amber rounded-full animate-pulse w-1/2" />
                    </div>
                    <span className="text-xs font-mono text-myco-amber">capturing...</span>
                  </div>
                ) : (
                  <p className="text-xs font-mono text-myco-spore">not calibrated</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => startCalibration(sensor.id)}
                  disabled={isActive}
                  title="Capture baseline"
                  className="p-1.5 rounded border border-myco-moss text-myco-spore hover:text-myco-mycel hover:border-myco-spore transition-colors disabled:opacity-30"
                >
                  <RefreshCw size={12} className={isActive ? 'animate-spin' : ''} />
                </button>
                {cal && (
                  <button
                    onClick={() => clearCalibration(sensor.id)}
                    title="Clear calibration"
                    className="p-1.5 rounded border border-myco-moss text-myco-spore hover:text-myco-alert hover:border-myco-alert transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Clear all */}
      <button
        onClick={() => clearCalibration()}
        className="mt-4 text-xs font-mono text-myco-alert hover:underline"
      >
        Clear all calibrations
      </button>
    </div>
  )
}
