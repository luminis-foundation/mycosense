# MycoSense

**Live Ecosystem Health Monitoring via Electrode Sensor Arrays**

A React dashboard developed by the Luminis Foundation for real-time biosensor data visualization — tracking electrical signals from mycelium networks and soil microbiomes as living indicators of ecosystem health.

---

## Vision

Mycelium networks generate measurable electrochemical signals that respond to environmental stress, nutrient flow, and biological activity. MycoSense translates those signals into a readable, real-time interface — making the invisible language of living soil visible.

---

## Stack

- **Frontend:** React 18 + Tailwind CSS
- **Signal Processing:** Custom DSP hooks (rolling window, Z-score spike detection, FFT, entropy)
- **Visualization:** Recharts
- **Tests:** Vitest
- **Deployment:** Static export (offline-first compatible)

---

## Running Locally

```bash
npm install
npm run dev        # dev server at http://localhost:3000
npm run lint       # ESLint
npm run test       # Vitest unit tests
npm run build      # production build
```

Copy `.env.example` to `.env` to configure live hardware. Without `VITE_SENSOR_WS_URL`, the dashboard runs in **mock mode** automatically.

See [`docs/hardware-integration.md`](docs/hardware-integration.md) for WebSocket format, USB serial setup, and ESP32/Pi hardware details.
See [`docs/field-deployment.md`](docs/field-deployment.md) for the session lifecycle (calibrate → collect → export → archive).

---

## Repository Structure

```
mycosense/
├── .github/workflows/ci.yml   # CI: lint, test, build
├── docs/
│   ├── hardware-integration.md  # VITE_SENSOR_WS_URL, serial, ESP32, Pi
│   ├── field-deployment.md      # Mock vs live mode, session protocol
│   └── ethics-and-privacy.md    # Location data, PII, health claim policy
├── esp32-firmware/            # Arduino/PlatformIO sketches
├── pi-server/                 # Raspberry Pi coordinator
├── src/
│   ├── api/                     # WebSocket, serial bridge, Pi sync
│   ├── components/              # Dashboard, SensorCard, charts
│   ├── data/                    # Mock data generator
│   ├── hooks/                   # useSensorStream, useSignalProcessor, etc.
│   ├── schema/                  # Versioned JSON Schema + validator
│   └── utils/                   # DSP math, thresholds, export utilities
├── .env.example
├── package.json
└── vite.config.js
```

---

## Ethics and Privacy

- **No private land GPS coordinates** in published datasets — use coarse grid references only
- **No volunteer PII** in session exports — `sessionId` must be an opaque identifier
- **Signal labels are not ecological diagnoses** — "Stressed" means variance outside a threshold band, not a verified ecological state

See [`docs/ethics-and-privacy.md`](docs/ethics-and-privacy.md) for the full policy.

---

## Luminis Foundation

This project is part of the Luminis Foundation's biosensor and fungal electrophysiology research program.
Preprint: [10.5281/zenodo.20143391](https://doi.org/10.5281/zenodo.20143391)
