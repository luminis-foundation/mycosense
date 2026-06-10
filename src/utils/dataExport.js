/**
 * dataExport.js
 * CSV and SQLite logging utilities for electrode session data.
 *
 * CSV export: browser download, works everywhere, no dependencies.
 * SQLite export: uses sql.js (WASM) to build a proper .sqlite file in-browser.
 *
 * SQLite schema:
 *   readings(id TEXT, label TEXT, zone TEXT, value REAL, timestamp INTEGER, unit TEXT)
 *   sessions(session_id TEXT, started_at INTEGER, ended_at INTEGER, notes TEXT)
 */

// ─── CSV Export ──────────────────────────────────────────────────────────────

/**
 * Convert a flat array of reading objects to CSV string.
 */
export function readingsToCSV(readings) {
  const headers = ['timestamp', 'datetime', 'sensor_id', 'label', 'zone', 'value_mV', 'unit']
  const rows = readings.map(r => [
    r.timestamp,
    new Date(r.timestamp).toISOString(),
    r.id,
    r.label,
    r.zone,
    r.value,
    r.unit ?? 'mV',
  ])
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

/**
 * Trigger a browser download of a CSV file.
 */
export function downloadCSV(readings, filename = null) {
  const csv  = readingsToCSV(readings)
  const name = filename ?? `mycosense_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

// ─── SQLite Export ────────────────────────────────────────────────────────────

/**
 * Build and download a SQLite database file from session data.
 * Requires sql.js loaded via CDN (add to index.html or import dynamically).
 *
 * @param {Array}  readings   - flat array of all session readings
 * @param {Object} sessionMeta - { sessionId, startedAt, endedAt, notes }
 */
export async function downloadSQLite(readings, sessionMeta = {}) {
  // Dynamically load sql.js from CDN if not already loaded
  if (!window.initSqlJs) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js'
      script.onload  = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  const SQL = await window.initSqlJs({
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`
  })

  const db = new SQL.Database()

  // Create schema
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_id  TEXT PRIMARY KEY,
      started_at  INTEGER,
      ended_at    INTEGER,
      notes       TEXT
    );
    CREATE TABLE IF NOT EXISTS readings (
      rowid       INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id  TEXT,
      sensor_id   TEXT,
      label       TEXT,
      zone        TEXT,
      value       REAL,
      timestamp   INTEGER,
      unit        TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_sensor    ON readings(sensor_id);
    CREATE INDEX IF NOT EXISTS idx_timestamp ON readings(timestamp);
  `)

  // Insert session
  const sid = sessionMeta.sessionId ?? `session_${Date.now()}`
  db.run(
    `INSERT OR REPLACE INTO sessions VALUES (?, ?, ?, ?)`,
    [sid, sessionMeta.startedAt ?? Date.now(), sessionMeta.endedAt ?? Date.now(), sessionMeta.notes ?? '']
  )

  // Insert readings in batches
  const stmt = db.prepare(
    `INSERT INTO readings (session_id, sensor_id, label, zone, value, timestamp, unit)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
  readings.forEach(r => {
    stmt.run([sid, r.id, r.label ?? '', r.zone ?? '', r.value, r.timestamp, r.unit ?? 'mV'])
  })
  stmt.free()

  // Export and download
  const data = db.export()
  db.close()
  const blob = new Blob([data], { type: 'application/octet-stream' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `mycosense_${sid}.sqlite`
  a.click()
  URL.revokeObjectURL(url)
}
