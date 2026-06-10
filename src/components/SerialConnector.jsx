/**
 * SerialConnector.jsx
 * USB serial port connection controls.
 * Shows connect/disconnect button, baud rate selector, format picker,
 * and browser support warning for non-Chromium browsers.
 */

import { useState } from 'react'
import { Usb, Unplug, AlertTriangle } from 'lucide-react'
import { SERIAL_SUPPORTED } from '../api/serialBridge'

const BAUD_RATES = [9600, 19200, 38400, 57600, 115200, 230400, 460800]

export function SerialConnector({ serialStatus, portLabel, connectSerial, disconnectSerial }) {
  const [baudRate, setBaudRate] = useState(115200)
  const [format, setFormat]     = useState('json')
  const isConnected = serialStatus === 'live'

  if (!SERIAL_SUPPORTED) {
    return (
      <div className="card flex items-start gap-3">
        <AlertTriangle size={16} className="text-myco-amber mt-0.5 shrink-0" />
        <div>
          <p className="label-tag mb-1">USB Serial</p>
          <p className="text-xs text-myco-spore">
            Web Serial API requires Chrome or Edge. Use WebSocket mode or switch browsers.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Usb size={14} className="text-myco-spore" />
        <span className="label-tag">USB Serial Bridge</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className={`status-dot ${
            isConnected         ? 'bg-myco-pulse animate-pulse' :
            serialStatus === 'connecting' ? 'bg-myco-amber animate-pulse' :
            serialStatus === 'error'      ? 'bg-myco-alert' :
            'bg-myco-spore'
          }`} />
          <span className="text-xs font-mono text-myco-spore">
            {isConnected ? portLabel ?? 'Connected' : serialStatus}
          </span>
        </div>
      </div>

      {!isConnected && (
        <div className="flex gap-3 mb-4">
          {/* Baud rate */}
          <div>
            <p className="label-tag mb-1">Baud rate</p>
            <select
              value={baudRate}
              onChange={e => setBaudRate(Number(e.target.value))}
              className="bg-myco-soil border border-myco-moss rounded px-2 py-1 text-xs font-mono text-myco-mist focus:outline-none focus:border-myco-spore"
            >
              {BAUD_RATES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Data format */}
          <div>
            <p className="label-tag mb-1">Format</p>
            <select
              value={format}
              onChange={e => setFormat(e.target.value)}
              className="bg-myco-soil border border-myco-moss rounded px-2 py-1 text-xs font-mono text-myco-mist focus:outline-none focus:border-myco-spore"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {!isConnected ? (
          <button
            onClick={() => connectSerial({ baudRate, format })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-myco-spore text-myco-soil text-xs font-mono font-medium hover:bg-myco-mycel transition-colors"
          >
            <Usb size={13} />
            Select Port
          </button>
        ) : (
          <button
            onClick={disconnectSerial}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-myco-alert text-myco-alert text-xs font-mono hover:bg-myco-alert hover:text-myco-soil transition-colors"
          >
            <Unplug size={13} />
            Disconnect
          </button>
        )}
      </div>

      <p className="text-xs font-mono text-myco-spore mt-3">
        Expects newline-delimited {format === 'json' ? 'JSON objects' : 'CSV rows'} from device.{' '}
        {format === 'json'
          ? 'Fields: id, value, unit (mV), zone, label'
          : 'Column order: id, value, unit'}
      </p>
    </div>
  )
}
