/**
 * sensorClient.js
 * WebSocket client for live electrode sensor ingestion.
 * Auto-reconnects on disconnect with exponential backoff.
 *
 * Expected message format from hardware/server:
 * {
 *   sensors: [
 *     { id: "E01", value: 42.5, timestamp: 1718000000000, unit: "mV" },
 *     ...
 *   ]
 * }
 */

const DEFAULT_WS_URL = import.meta.env.VITE_SENSOR_WS_URL || null

export class SensorClient {
  constructor(url = DEFAULT_WS_URL, onData, onStatusChange) {
    this.url           = url
    this.onData        = onData
    this.onStatusChange = onStatusChange
    this.ws            = null
    this.retries       = 0
    this.maxRetries    = 8
    this.baseDelay     = 1000  // ms
    this.alive         = false
  }

  connect() {
    if (!this.url) {
      console.info('[MycoSense] No WS URL configured — running in mock mode.')
      this.onStatusChange?.('mock')
      return
    }

    try {
      this.ws = new WebSocket(this.url)
      this.onStatusChange?.('connecting')

      this.ws.onopen = () => {
        console.info('[MycoSense] WebSocket connected.')
        this.retries = 0
        this.alive   = true
        this.onStatusChange?.('live')
      }

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data)
          if (parsed?.sensors) {
            this.onData(parsed.sensors)
          }
        } catch (err) {
          console.warn('[MycoSense] Malformed message:', err)
        }
      }

      this.ws.onclose = () => {
        console.warn('[MycoSense] WebSocket closed.')
        this.alive = false
        this.onStatusChange?.('disconnected')
        this._scheduleReconnect()
      }

      this.ws.onerror = (err) => {
        console.error('[MycoSense] WebSocket error:', err)
        this.onStatusChange?.('error')
      }

    } catch (err) {
      console.error('[MycoSense] Failed to connect:', err)
      this._scheduleReconnect()
    }
  }

  _scheduleReconnect() {
    if (this.retries >= this.maxRetries) {
      console.error('[MycoSense] Max reconnect attempts reached.')
      this.onStatusChange?.('failed')
      return
    }
    const delay = this.baseDelay * Math.pow(2, this.retries)
    console.info(`[MycoSense] Reconnecting in ${delay}ms (attempt ${this.retries + 1})`)
    this.retries++
    setTimeout(() => this.connect(), delay)
  }

  disconnect() {
    this.alive = false
    this.ws?.close()
  }
}
