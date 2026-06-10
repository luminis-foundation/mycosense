/**
 * Dashboard.jsx
 * Main layout shell — tabbed navigation for all views.
 * Tabs: Overview · Zones · Field Map · Calibration · Export · Hardware
 */

import { useState } from 'react'
import { EcosystemStatus }  from './EcosystemStatus'
import { SensorGrid }       from './SensorGrid'
import { AlertBanner }      from './AlertBanner'
import { ZoneView }         from './ZoneView'
import { FieldMap }         from './FieldMap'
import { CalibrationPanel } from './CalibrationPanel'
import { ExportPanel }      from './ExportPanel'
import { SerialConnector }  from './SerialConnector'

const TABS = ['Overview', 'Zones', 'Field Map', 'Calibration', 'Export', 'Hardware']

export function Dashboard({
  readings, processed, history, ecosystemScore, connectionStatus, lastUpdated,
  dataLogger, calibration, serialStatus, portLabel, serialSupported, connectSerial, disconnectSerial,
}) {
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <div className="min-h-screen bg-myco-soil text-myco-mist">
      <AlertBanner alerts={ecosystemScore.allAlerts} />

      {/* Header */}
      <header className="border-b border-myco-bark px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-myco-mycel tracking-wide">
            MycoSense
          </h1>
          <p className="text-xs font-mono text-myco-spore">
            Luminis Foundation · Electrode Array Monitor
          </p>
        </div>
        <div className="text-right">
          <p className="label-tag">Pecos River Valley</p>
          <p className="text-xs font-mono text-myco-spore">Rowe, NM</p>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="border-b border-myco-bark px-6 flex gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2.5 text-xs font-mono whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'text-myco-mycel border-myco-spore'
                : 'text-myco-spore border-transparent hover:text-myco-mist'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className="px-6 py-6 space-y-6 max-w-6xl mx-auto">

        {/* Always visible: ecosystem status */}
        <EcosystemStatus
          ecosystemScore={ecosystemScore}
          connectionStatus={connectionStatus}
          lastUpdated={lastUpdated}
        />

        {/* Tab panels */}
        {activeTab === 'Overview' && (
          <div>
            <p className="label-tag mb-3">Electrode Array</p>
            <SensorGrid readings={readings} processed={processed} history={history} />
          </div>
        )}

        {activeTab === 'Zones' && (
          <div>
            <p className="label-tag mb-3">Zone Aggregation</p>
            <ZoneView readings={readings} processed={processed} history={history} />
          </div>
        )}

        {activeTab === 'Field Map' && (
          <FieldMap readings={readings} processed={processed} />
        )}

        {activeTab === 'Calibration' && (
          <CalibrationPanel
            baselines={calibration.baselines}
            calibrating={calibration.calibrating}
            readings={readings}
            startCalibration={calibration.startCalibration}
            clearCalibration={calibration.clearCalibration}
            applyCalibration={calibration.applyCalibration}
          />
        )}

        {activeTab === 'Export' && (
          <ExportPanel
            recordCount={dataLogger.recordCount}
            isLogging={dataLogger.isLogging}
            exportCSV={dataLogger.exportCSV}
            exportSQLite={dataLogger.exportSQLite}
            clearLog={dataLogger.clearLog}
            toggleLogging={dataLogger.toggleLogging}
          />
        )}

        {activeTab === 'Hardware' && (
          <div className="space-y-4">
            <SerialConnector
              serialStatus={serialStatus}
              portLabel={portLabel}
              connectSerial={connectSerial}
              disconnectSerial={disconnectSerial}
            />
            <div className="card">
              <p className="label-tag mb-2">WebSocket Mode</p>
              <p className="text-xs font-mono text-myco-spore">
                Set <span className="text-myco-mycel">VITE_SENSOR_WS_URL</span> in <span className="text-myco-mycel">.env</span> to connect via network.
                Current status: <span className={connectionStatus === 'mock' ? 'text-myco-amber' : 'text-myco-pulse'}>{connectionStatus}</span>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-myco-bark">
        <p className="text-xs font-mono text-myco-spore text-center">
          MycoSense · DOI 10.5281/zenodo.20143391 · Luminis Foundation 2026
        </p>
      </footer>
    </div>
  )
}
