/**
 * PiSyncPanel.jsx
 * Raspberry Pi sync status and on-chain provenance hash controls.
 */

import { useState } from 'react'
import { Server, Hash, CheckCircle, WifiOff, Loader } from 'lucide-react'

const STATUS_CONFIG = {
  discovering: { icon: Loader,      color: 'text-myco-amber',  label: 'Discovering Pi...',  spin: true  },
  connected:   { icon: CheckCircle, color: 'text-myco-pulse',  label: 'Pi connected',        spin: false },
  unavailable: { icon: WifiOff,     color: 'text-myco-spore',  label: 'No Pi detected',      spin: false },
  error:       { icon: WifiOff,     color: 'text-myco-alert',  label: 'Pi error',            spin: false },
}

export function PiSyncPanel({ piStatus, generateProvenanceHash, recordCount }) {
  const [hashResult, setHashResult]   = useState(null)
  const [hashing, setHashing]         = useState(false)
  const [copied, setCopied]           = useState(false)

  const cfg = STATUS_CONFIG[piStatus] || STATUS_CONFIG.unavailable
  const Icon = cfg.icon

  const handleHash = async () => {
    if (recordCount === 0) return
    setHashing(true)
    try {
      const result = await generateProvenanceHash()
      setHashResult(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } finally {
      setHashing(false)
    }
  }

  return (
    <div className="card space-y-4">
      {/* Pi status */}
      <div className="flex items-center gap-2">
        <Server size={14} className="text-myco-spore" />
        <span className="label-tag">Local Pi Sync</span>
        <div className="ml-auto flex items-center gap-1.5">
          <Icon size={13} className={`${cfg.color} ${cfg.spin ? 'animate-spin' : ''}`} />
          <span className={`text-xs font-mono ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>

      {piStatus === 'unavailable' && (
        <p className="text-xs font-mono text-myco-spore">
          Run the Pi server on your local network at <span className="text-myco-mycel">mycosense.local:8765</span>.
          Dashboard works fully without it.
        </p>
      )}

      {piStatus === 'connected' && (
        <p className="text-xs font-mono text-myco-spore">
          Readings syncing to Pi every 5 seconds. Data persists locally on your hardware.
        </p>
      )}

      {/* Provenance hash */}
      <div className="border-t border-myco-moss pt-4">
        <div className="flex items-center gap-2 mb-2">
          <Hash size={13} className="text-myco-spore" />
          <span className="label-tag">On-Chain Provenance</span>
        </div>
        <p className="text-xs text-myco-spore mb-3">
          Generate a SHA-256 hash of the current session dataset. Copy it to your Gnosis Safe on Polygon to anchor authorship immutably on-chain.
        </p>

        <button
          onClick={handleHash}
          disabled={hashing || recordCount === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-myco-spore text-xs font-mono text-myco-mist hover:border-myco-mycel transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Hash size={12} className={hashing ? 'animate-spin' : ''} />
          {hashing ? 'Hashing...' : 'Generate & Copy Hash'}
        </button>

        {hashResult && (
          <div className="mt-3 p-3 bg-myco-soil rounded-lg border border-myco-moss">
            <p className="text-xs font-mono text-myco-spore mb-1">{hashResult.readingCount} readings · {new Date(hashResult.generatedAt).toLocaleTimeString()}</p>
            <p className="text-xs font-mono text-myco-mycel break-all">{hashResult.hash.slice(0, 20)}...{hashResult.hash.slice(-8)}</p>
            {copied && <p className="text-xs font-mono text-myco-pulse mt-1">✓ Copied to clipboard</p>}
          </div>
        )}
      </div>
    </div>
  )
}
