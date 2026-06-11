/**
 * signalProcessing.js
 * Advanced DSP for mycelium electrode array analysis.
 * 
 * Algorithms:
 * - Adaptive spike detection (Z-score based, not fixed threshold)
 * - Frequency domain analysis (dominant frequency via Goertzel)
 * - Cross-correlation between electrode pairs (network coherence)
 * - Trend detection (linear regression over window)
 * - Signal entropy (complexity measure — high entropy = active network)
 * - Fatigue detection (signal degradation over time)
 */

// ── Z-Score Spike Detection ──────────────────────────────────────────────────
// More robust than fixed threshold — adapts to each electrode's baseline
export function zScoreSpike(buffer, windowSize, zThreshold = 2.5) {
  if (buffer.length < windowSize) return { isSpike: false, zScore: 0 }
  const window = buffer.slice(-windowSize)
  const mean = window.reduce((a, b) => a + b, 0) / window.length
  const stdDev = Math.sqrt(window.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / window.length)
  if (stdDev === 0) return { isSpike: false, zScore: 0 }
  const latest = buffer[buffer.length - 1]
  const zScore = Math.abs((latest - mean) / stdDev)
  return { isSpike: zScore > zThreshold, zScore: parseFloat(zScore.toFixed(2)) }
}

// ── Goertzel Dominant Frequency ──────────────────────────────────────────────
// Estimates the dominant oscillation frequency in the signal window
// sampleRateHz = 1000/intervalMs (e.g. 500ms interval = 2Hz sample rate)
export function dominantFrequency(buffer, windowSize, sampleRateHz = 2) {
  const window = buffer.slice(-windowSize)
  if (window.length < 4) return 0
  const N = window.length
  let maxPower = 0
  let dominantHz = 0
  const freqsToTest = Array.from({ length: Math.floor(N / 2) }, (_, i) => (i + 1) * sampleRateHz / N)
  freqsToTest.forEach(freq => {
    const k = freq * N / sampleRateHz
    const omega = 2 * Math.PI * k / N
    const coeff = 2 * Math.cos(omega)
    let s1 = 0, s2 = 0
    window.forEach(x => { const s = x + coeff * s1 - s2; s2 = s1; s1 = s })
    const power = s2 * s2 + s1 * s1 - coeff * s1 * s2
    if (power > maxPower) { maxPower = power; dominantHz = freq }
  })
  return parseFloat(dominantHz.toFixed(3))
}

// ── Cross-Correlation (Network Coherence) ────────────────────────────────────
// Measures how synchronized two electrodes are — high = coherent network activity
export function crossCorrelation(bufferA, bufferB, windowSize) {
  const a = bufferA.slice(-windowSize)
  const b = bufferB.slice(-windowSize)
  const len = Math.min(a.length, b.length)
  if (len < 4) return 0
  const meanA = a.reduce((s, v) => s + v, 0) / len
  const meanB = b.reduce((s, v) => s + v, 0) / len
  let num = 0, denA = 0, denB = 0
  for (let i = 0; i < len; i++) {
    const da = a[i] - meanA, db = b[i] - meanB
    num += da * db; denA += da * da; denB += db * db
  }
  const denom = Math.sqrt(denA * denB)
  return denom === 0 ? 0 : parseFloat((num / denom).toFixed(3))
}

// ── Linear Trend ─────────────────────────────────────────────────────────────
// Returns slope of signal over window — positive = rising, negative = falling
export function linearTrend(buffer, windowSize) {
  const w = buffer.slice(-windowSize)
  if (w.length < 3) return 0
  const n = w.length
  const xMean = (n - 1) / 2
  const yMean = w.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  w.forEach((y, x) => { num += (x - xMean) * (y - yMean); den += Math.pow(x - xMean, 2) })
  return den === 0 ? 0 : parseFloat((num / den).toFixed(4))
}

// ── Signal Entropy ────────────────────────────────────────────────────────────
// Shannon entropy of quantized signal — high entropy = complex/active network
export function signalEntropy(buffer, windowSize, bins = 10) {
  const w = buffer.slice(-windowSize)
  if (w.length < 4) return 0
  const min = Math.min(...w), max = Math.max(...w)
  if (max === min) return 0
  const binSize = (max - min) / bins
  const counts = new Array(bins).fill(0)
  w.forEach(v => {
    const bin = Math.min(Math.floor((v - min) / binSize), bins - 1)
    counts[bin]++
  })
  const probs = counts.map(c => c / w.length).filter(p => p > 0)
  return parseFloat((-probs.reduce((s, p) => s + p * Math.log2(p), 0)).toFixed(3))
}

// ── Fatigue Detection ─────────────────────────────────────────────────────────
// Compares variance of first vs second half of buffer — declining = fatigue
export function signalFatigue(buffer, windowSize) {
  const w = buffer.slice(-windowSize)
  if (w.length < 8) return { fatigued: false, ratio: 1 }
  const half = Math.floor(w.length / 2)
  const first = w.slice(0, half), second = w.slice(half)
  const variance = arr => {
    const m = arr.reduce((a, b) => a + b, 0) / arr.length
    return arr.reduce((s, v) => s + Math.pow(v - m, 2), 0) / arr.length
  }
  const ratio = variance(second) / (variance(first) || 1)
  return { fatigued: ratio < 0.3, ratio: parseFloat(ratio.toFixed(3)) }
}
