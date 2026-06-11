/**
 * usePiSync.js
 * Manages Pi client lifecycle and sync status.
 * Exposes piStatus and enqueue for the data logger to use.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { PiClient } from '../api/piClient'

export function usePiSync() {
  const [piStatus, setPiStatus] = useState('discovering')
  const clientRef = useRef(null)

  useEffect(() => {
    const client = new PiClient(setPiStatus)
    clientRef.current = client
    client.start()
    return () => client.stop()
  }, [])

  const enqueue = useCallback((readings) => {
    clientRef.current?.enqueue(readings)
  }, [])

  return { piStatus, enqueue }
}
