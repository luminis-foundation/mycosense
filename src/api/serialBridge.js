/**
 * serialBridge.js
 * Web Serial API bridge for USB-connected electrode hardware.
 *
 * Connects to a microcontroller (Arduino, RP2040, ESP32, etc.) over USB serial.
 * Expects newline-delimited JSON or CSV from the device:
 *
 *   JSON mode: {"id":"E01","value":42.5,"unit":"mV"}\n
 *   CSV mode:  E01,42.5,mV\n
 *
 * Browser support: Chrome/Edge (Chromium) only. Firefox not supported.
 * Requires HTTPS or localhost.
 *
 * Usage:
 *   const bridge = new SerialBridge(onData, onStatus)
 *   await bridge.connect()   // prompts user to select port
 *   bridge.disconnect()
 */

export const SERIAL_SUPPORTED = 'serial' in navigator

export class SerialBridge {
  constructor(onData, onStatusChange, options = {}) {
    this.onData          = onData
    this.onStatusChange  = onStatusChange
    this.baudRate        = options.baudRate  ?? 115200
    this.format          = options.format    ?? 'json'   // 'json' | 'csv'
    this.csvOrder        = options.csvOrder  ?? ['id', 'value', 'unit']
    this.port            = null
    this.reader          = null
    this.alive           = false
    this.buffer          = ''
  }

  /**
   * Opens port picker and begins reading.
   */
  async connect() {
    if (!SERIAL_SUPPORTED) {
      console.error('[SerialBridge] Web Serial API not supported in this browser.')
      this.onStatusChange?.('unsupported')
      return false
    }

    try {
      this.port = await navigator.serial.requestPort()
      await this.port.open({ baudRate: this.baudRate })
      this.alive = true
      this.onStatusChange?.('live')
      console.info('[SerialBridge] Connected.')
      this._readLoop()
      return true
    } catch (err) {
      if (err.name === 'NotFoundError') {
        // User dismissed port picker — not an error
        this.onStatusChange?.('idle')
      } else {
        console.error('[SerialBridge] Connect error:', err)
        this.onStatusChange?.('error')
      }
      return false
    }
  }

  /**
   * Continuous read loop — decodes UTF-8 stream into lines.
   */
  async _readLoop() {
    const decoder = new TextDecoderStream()
    this.port.readable.pipeTo(decoder.writable)
    this.reader  = decoder.readable.getReader()

    try {
      while (this.alive) {
        const { value, done } = await this.reader.read()
        if (done) break

        this.buffer += value
        const lines  = this.buffer.split('\n')
        this.buffer  = lines.pop()  // incomplete last line stays in buffer

        lines.forEach(line => {
          const trimmed = line.trim()
          if (!trimmed) return
          try {
            const parsed = this._parseLine(trimmed)
            if (parsed) this.onData([parsed])
          } catch (e) {
            console.warn('[SerialBridge] Parse error:', e, '→', trimmed)
          }
        })
      }
    } catch (err) {
      if (this.alive) {
        console.error('[SerialBridge] Read error:', err)
        this.onStatusChange?.('disconnected')
      }
    } finally {
      this.reader?.releaseLock()
    }
  }

  /**
   * Parse a single line from the device.
   */
  _parseLine(line) {
    if (this.format === 'json') {
      const obj = JSON.parse(line)
      return {
        id:        obj.id        ?? 'UNK',
        label:     obj.label     ?? obj.id ?? 'Unknown',
        zone:      obj.zone      ?? 'Unknown',
        value:     parseFloat(obj.value),
        unit:      obj.unit      ?? 'mV',
        timestamp: obj.timestamp ?? Date.now(),
      }
    }

    if (this.format === 'csv') {
      const parts = line.split(',')
      const obj   = {}
      this.csvOrder.forEach((key, i) => { obj[key] = parts[i]?.trim() })
      return {
        id:        obj.id    ?? 'UNK',
        label:     obj.label ?? obj.id ?? 'Unknown',
        zone:      obj.zone  ?? 'Unknown',
        value:     parseFloat(obj.value),
        unit:      obj.unit  ?? 'mV',
        timestamp: Date.now(),
      }
    }

    return null
  }

  async disconnect() {
    this.alive = false
    try {
      await this.reader?.cancel()
      await this.port?.close()
    } catch {}
    this.onStatusChange?.('idle')
    console.info('[SerialBridge] Disconnected.')
  }
}
