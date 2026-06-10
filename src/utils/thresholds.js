/**
 * thresholds.js
 * Configurable alert thresholds for electrode signal analysis.
 * All values in millivolts (mV) unless noted.
 *
 * Adjust these based on empirical calibration data from your electrode array.
 */

export const THRESHOLDS = {
  // Spike detection — single-reading deviation from rolling mean
  spikeAmplitude: 100,       // mV — flag readings this far from mean

  // Health score boundaries
  healthScore: {
    healthy:  { min: 70, max: 100 },
    moderate: { min: 40, max: 69  },
    stressed: { min: 0,  max: 39  },
  },

  // Signal variance — high variance may indicate stress or noise
  variance: {
    normal: 800,   // mV² — below this is calm
    elevated: 2000, // mV² — above this triggers warning
  },

  // Flatline detection — if std dev falls below this, sensor may be dead
  flatlineStdDev: 2,   // mV

  // Rolling window size for smoothing and anomaly detection
  rollingWindowSize: 20,  // samples
}

export const ALERT_MESSAGES = {
  spike:      (id) => `Spike detected on ${id} — possible signaling event`,
  flatline:   (id) => `${id} signal flat — check electrode contact`,
  elevated:   (id) => `${id} variance elevated — stress response possible`,
  offline:    (id) => `${id} offline — no data received`,
}
