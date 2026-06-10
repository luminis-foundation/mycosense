/**
 * useSerialStream.js
 * Hook to manage a SerialBridge connection as an alternative to WebSocket.
 * Exposes connect/disconnect controls and feeds data into the same onData callback.
 */

import { useState, useRef, useCallback } from 'react'
import { SerialBridge, SERIAL_SUPPORTED } from '../api/serialBridge'

export function useSerialStream(onData) {
  const [status, setStatus]       = useState('idle')
  const [portLabel, setPortLabel] = useState(null)
  const bridgeRef = useRef(null)

  const connect = useCallback(async (options = {}) => {
    if (!SERIAL_SUPPORTED) {
      setStatus('unsupported')
      return
    }

    // Disconnect existing connection first
    if (bridgeRef.current) {
      await bridgeRef.current.disconnect()
    }

    const bridge = new SerialBridge(onData, (s) => {
      setStatus(s)
      if (s === 'live') setPortLabel('USB Serial')
      if (s === 'idle' || s === 'disconnected') setPortLabel(null)
    }, options)

    bridgeRef.current = bridge
    await bridge.connect()
  }, [onData])

  const disconnect = useCallback(async () => {
    await bridgeRef.current?.disconnect()
    bridgeRef.current = null
    setPortLabel(null)
  }, [])

  return {
    serialStatus: status,
    portLabel,
    serialSupported: SERIAL_SUPPORTED,
    connectSerial: connect,
    disconnectSerial: disconnect,
  }
}
