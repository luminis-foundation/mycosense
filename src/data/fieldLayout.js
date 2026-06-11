/**
 * fieldLayout.js
 * Physical placement map for the Pecos River Valley electrode array.
 *
 * Coordinates are relative to a normalized 0–100 field grid.
 * Adjust x/y values to match your actual physical layout.
 * Set useGPS: true and provide lat/lng once real coordinates are surveyed.
 *
 * Zones map to soil/substrate/canopy layers in the field.
 * Hardware: ESP32-C6/S3 electrode nodes → Raspberry Pi 5 coordinator → Jetson Orin Nano (future).
 */

export const FIELD_BOUNDS = {
  // Physical dimensions of the monitored area in meters
  widthM:  12,
  heightM: 8,
  // Label shown on the map
  label: 'Pecos Canyon Research Plot — Rowe, NM · Luminis Foundation',
}

export const ELECTRODE_PLACEMENTS = [
  {
    id:    'E01',
    label: 'Node Alpha',
    zone:  'Rhizosphere A',
    // Normalized grid position (0–100)
    x: 20, y: 65,
    // Optional GPS (leave null until surveyed)
    lat: null, lng: null,
    depth: '15cm',
    substrate: 'ESP32-C6 · native soil probe · reishi inoculated',
    hardware: 'ESP32-C6',
    notes: 'Primary rhizosphere node — near oak root cluster',
  },
  {
    id:    'E02',
    label: 'Node Beta',
    zone:  'Rhizosphere A',
    x: 35, y: 70,
    lat: null, lng: null,
    depth: '12cm',
    substrate: 'ESP32-C6 · native soil probe · reishi inoculated',
    hardware: 'ESP32-C6',
    notes: 'Secondary rhizosphere — cross-linked to Alpha',
  },
  {
    id:    'E03',
    label: 'Node Gamma',
    zone:  'Substrate B',
    x: 50, y: 45,
    lat: null, lng: null,
    depth: '5cm',
    substrate: 'ESP32-S3 · straw/woodchip substrate block',
    hardware: 'ESP32-S3',
    notes: 'Central substrate — highest mycelial density observed',
  },
  {
    id:    'E04',
    label: 'Node Delta',
    zone:  'Substrate B',
    x: 65, y: 50,
    lat: null, lng: null,
    depth: '5cm',
    substrate: 'ESP32-S3 · straw/woodchip substrate block',
    hardware: 'ESP32-S3',
    notes: 'Substrate edge node — moisture gradient zone',
  },
  {
    id:    'E05',
    label: 'Node Epsilon',
    zone:  'Canopy C',
    x: 30, y: 25,
    lat: null, lng: null,
    depth: '2cm',
    substrate: 'ESP32-C6 · aerial mycelium interface · pinon branch',
    hardware: 'ESP32-C6',
    notes: 'Aerial mycelium monitoring — volatile signaling capture',
  },
  {
    id:    'E06',
    label: 'Node Zeta',
    zone:  'Canopy C',
    x: 72, y: 20,
    lat: null, lng: null,
    depth: '2cm',
    substrate: 'ESP32-C6 · aerial mycelium interface · pinon branch',
    hardware: 'ESP32-C6',
    notes: 'Secondary canopy — upwind reference node',
  },
]

export const COORDINATOR_NODE = {
  id:    'PI-01',
  label: 'Pi Coordinator',
  x: 50, y: 85,
  hardware: 'Raspberry Pi 5',
  notes: 'Mesh coordinator · local data store · MQTT broker',
}

export const ZONE_COLORS = {
  'Rhizosphere A': '#a8c5a0',
  'Substrate B':   '#e8a838',
  'Canopy C':      '#7fff7a',
}

export const ZONE_REGIONS = [
  // Soft background regions showing zone extents (normalized coordinates)
  { zone: 'Rhizosphere A', x: 5,  y: 55, w: 45, h: 35 },
  { zone: 'Substrate B',   x: 40, y: 35, w: 35, h: 30 },
  { zone: 'Canopy C',      x: 15, y: 10, w: 70, h: 25 },
]
