/**
 * ExportPanel.jsx
 * Session data export controls — CSV and SQLite download buttons,
 * logging toggle, record counter, and session clear.
 */

import { Database, Download, Pause, Play, Trash2 } from 'lucide-react'

export function ExportPanel({ recordCount, isLogging, exportCSV, exportSQLite, clearLog, toggleLogging }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database size={14} className="text-myco-spore" />
          <span className="label-tag">Session Log</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`status-dot ${isLogging ? 'bg-myco-pulse animate-pulse' : 'bg-myco-spore'}`} />
          <span className="text-xs font-mono text-myco-spore">
            {isLogging ? 'recording' : 'paused'}
          </span>
        </div>
      </div>

      <p className="font-mono text-myco-pulse text-2xl font-bold mb-1">
        {recordCount.toLocaleString()}
      </p>
      <p className="text-xs text-myco-spore mb-4">readings logged this session</p>

      <div className="flex flex-wrap gap-2">
        {/* Toggle logging */}
        <button
          onClick={toggleLogging}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-myco-moss text-xs font-mono text-myco-mycel hover:border-myco-spore transition-colors"
        >
          {isLogging ? <Pause size={12} /> : <Play size={12} />}
          {isLogging ? 'Pause' : 'Resume'}
        </button>

        {/* Export CSV */}
        <button
          onClick={exportCSV}
          disabled={recordCount === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-myco-spore text-xs font-mono text-myco-mist hover:border-myco-mycel transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Download size={12} />
          CSV
        </button>

        {/* Export SQLite */}
        <button
          onClick={exportSQLite}
          disabled={recordCount === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-myco-spore text-xs font-mono text-myco-mist hover:border-myco-mycel transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Download size={12} />
          SQLite
        </button>

        {/* Clear log */}
        <button
          onClick={clearLog}
          disabled={recordCount === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-myco-alert text-xs font-mono text-myco-alert hover:bg-myco-alert hover:text-myco-soil transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Trash2 size={12} />
          Clear
        </button>
      </div>
    </div>
  )
}
