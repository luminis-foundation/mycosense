/**
 * piClient.js
 * Raspberry Pi local server client.
 * Auto-discovers Pi on local network via mDNS hostname or configured IP.
 * Falls back gracefully — dashboard works fully without a Pi present.
 *
 * Pi server expected at: http://mycosense.local:8765 (configurable via .env)
 * Endpoints:
 *   POST /readings  — batch post sensor readings
 *   GET  /status    — ping / health check
 *   GET  /sessions  — list stored sessions
 *
 * Auth: set VITE_PI_TOKEN in .env to match MYCOSENSE_API_TOKEN on the Pi.
 * If unset, auth header is omitted (Pi server will reject if token is configured).
 */

const PI_URL    = import.meta.env.VITE_PI_URL   || 'http://mycosense.local:8765'
const PI_TOKEN  = import.meta.env.VITE_PI_TOKEN || ''
const BATCH_SIZE     = 50     // readings per POST
const BATCH_INTERVAL = 5000   // ms between flushes
const MAX_QUEUE      = 5000   // prevent unbounded growth when Pi is unreachable

function authHeaders() {
  return PI_TOKEN ? { 'Authorization': `Bearer ${PI_TOKEN}` } : {}
}

export class PiClient {
  constructor(onStatusChange) {
    this.onStatusChange = onStatusChange
    this.queue   = []
    this.status  = 'discovering'
    this.alive   = false
    this.timer   = null
  }

  async start() {
    const reachable = await this._ping()
    if (reachable) {
      this.alive  = true
      this.status = 'connected'
      this.onStatusChange?.('connected')
      this._startFlushLoop()
    } else {
      this.status = 'unavailable'
      this.onStatusChange?.('unavailable')
    }
  }

  async _ping() {
    try {
      const res = await fetch(`${PI_URL}/status`, {
        signal: AbortSignal.timeout(2000),
        headers: authHeaders(),
      })
      return res.ok
    } catch { return false }
  }

  enqueue(readings) {
    if (!this.alive) return
    this.queue.push(...readings)
    // Drop oldest readings if queue grows beyond cap (Pi persistently unreachable)
    if (this.queue.length > MAX_QUEUE) {
      this.queue.splice(0, this.queue.length - MAX_QUEUE)
    }
  }

  _startFlushLoop() {
    this.timer = setInterval(() => this._flush(), BATCH_INTERVAL)
  }

  async _flush() {
    if (this.queue.length === 0) return
    const batch = this.queue.splice(0, BATCH_SIZE)
    try {
      await fetch(`${PI_URL}/readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ readings: batch, timestamp: Date.now() }),
        signal: AbortSignal.timeout(3000)
      })
    } catch {
      // Re-queue on transient failure — don't lose data
      this.queue.unshift(...batch)
      // Re-apply cap after re-queue
      if (this.queue.length > MAX_QUEUE) {
        this.queue.splice(0, this.queue.length - MAX_QUEUE)
      }
    }
  }

  stop() {
    clearInterval(this.timer)
    this.alive = false
  }
}
