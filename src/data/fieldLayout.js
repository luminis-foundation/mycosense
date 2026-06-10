/**
 * fieldLayout.js
 * Physical placement map for the Pecos River Valley electrode array.
 *
 * Coordinates are relative to a normalized 0–100 field grid.
 * Adjust x/y values to match your actual physical layout.
 * Set useGPS: true and provide lat/lng once real coordinates are surveyed.
 *
 * Zones map to soil/substrate/canopy layers in the field.
 */

export const FIELD_BOUNDS = {
  // Physical dimensions of the monitored area in meters
  widthM:  12,
  heightM: 8,
  // Label shown on the map
  label: 'Pecos Canyon Research Plot — Rowe, NM',
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
    substrate: 'Native soil · reishi mycelium inoculated',
    notes: 'Primary rhizosphere node — near oak root cluster',
  },
  {
    id:    'E02',
    label: 'Node Beta',
    zone:  'Rhizosphere A',
    x: 35, y: 70,
    lat: null, lng: null,
    depth: '12cm',
    substrate: 'Native soil · reishi mycelium inoculated',
    notes: 'Secondary rhizosphere — cross-linked to Alpha',
  },
  {
    id:    'E03',
    label: 'Node Gamma',
    zone:  'Substrate B',
    x: 50, y: 45,
    lat: null, lng: null,
    depth: '5cm',
    substrate: 'Straw/woodchip substrate block',
    notes: 'Central substrate — highest mycelial density observed',
  },
  {
    id:    'E04',
    label: 'Node Delta',
    zone:  'Substrate B',
    x: 65, y: 50,
    lat: null, lng: null,
    depth: '5cm',
    substrate: 'Straw/woodchip substrate block',
    notes: 'Substrate edge node — moisture gradient zone',
  },
  {
    id:    'E05',
    label: 'Node Epsilon',
    zone:  'Canopy C',
    x: 30, y: 25,
    lat: null, lng: null,
    depth: '2cm',
    substrate: 'Aerial — pinon branch interface',
    notes: 'Aerial mycelium monitoring — volatile signaling capture',
  },
  {
    id:    'E06',
    label: 'Node Zeta',
    zone:  'Canopy C',
    x: 72, y: 20,
    lat: null, lng: null,
    depth: '2cm',
    substrate: 'Aerial — pinon branch interface',
    notes: 'Secondary canopy — upwind reference node',
  },
]

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
