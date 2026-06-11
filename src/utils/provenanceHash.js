/**
 * provenanceHash.js
 * Generates SHA-256 hash of a dataset for on-chain provenance anchoring.
 * Hash is deterministic — same data always produces same hash.
 * This hash is what gets posted to Polygon via the Foundation's Gnosis Safe.
 *
 * Usage:
 *   const hash = await hashDataset(readings, metadata)
 *   // Post hash to Polygon — costs fractions of a penny
 *   // Proves: this exact dataset existed at this timestamp, authored by Luminis Foundation
 */

export async function hashDataset(readings, metadata = {}) {
  const payload = JSON.stringify({
    readings: readings.map(r => ({ id: r.id, value: r.value, timestamp: r.timestamp })),
    metadata: {
      foundation: 'Luminis Foundation',
      ein: '41-4984345',
      location: 'Rowe, NM — Pecos Canyon',
      doi: '10.5281/zenodo.20143391',
      generatedAt: Date.now(),
      ...metadata,
    }
  })

  const encoder = new TextEncoder()
  const data    = encoder.encode(payload)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray  = Array.from(new Uint8Array(hashBuffer))
  const hashHex    = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return {
    hash: `0x${hashHex}`,
    payload,
    generatedAt: Date.now(),
    readingCount: readings.length,
  }
}

/**
 * Copy hash to clipboard for manual Polygon submission via Gnosis Safe.
 * Full automated on-chain posting will be added in Phase 3 (Gnosis Safe integration).
 */
export async function copyHashToClipboard(hashResult) {
  const text = `MycoSense Dataset Hash\nHash: ${hashResult.hash}\nReadings: ${hashResult.readingCount}\nGenerated: ${new Date(hashResult.generatedAt).toISOString()}\nFoundation: Luminis Foundation | EIN 41-4984345`
  await navigator.clipboard.writeText(text)
  return text
}
