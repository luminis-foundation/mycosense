# MycoSense 🍄

**Live Ecosystem Health Monitoring via Electrode Sensor Arrays**

A React dashboard developed by the Luminis Foundation for real-time biosensor data visualization — tracking electrical signals from mycelium networks and soil microbiomes as living indicators of ecosystem health.

---

## Vision

Mycelium networks generate measurable electrochemical signals that respond to environmental stress, nutrient flow, and biological activity. MycoSense translates those signals into a readable, real-time interface — making the invisible language of living soil visible.

---

## Stack

- **Frontend:** React 18 + Tailwind CSS
- **Data Layer:** WebSocket stream / serial port ingestion
- **Signal Processing:** Custom hooks with rolling window smoothing
- **Visualization:** Recharts
- **Deployment:** Static export (offline-first compatible)

---

## Repository Structure

```
mycosense/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # Main layout shell
│   │   ├── SensorCard.jsx         # Individual electrode readout
│   │   ├── SignalChart.jsx        # Time-series waveform display
│   │   ├── EcosystemStatus.jsx    # Derived health score panel
│   │   ├── AlertBanner.jsx        # Threshold breach notifications
│   │   └── SensorGrid.jsx         # Multi-electrode array overview
│   ├── hooks/
│   │   ├── useSensorStream.js     # WebSocket / mock data ingestion
│   │   ├── useSignalProcessor.js  # Rolling average, spike detection
│   │   └── useEcosystemScore.js   # Derived health index logic
│   ├── api/
│   │   └── sensorClient.js        # WebSocket client + reconnect logic
│   ├── utils/
│   │   ├── signalMath.js          # DSP utilities
│   │   └── thresholds.js          # Configurable alert thresholds
│   ├── data/
│   │   └── mockSensorData.js      # Dev/demo data generator
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## Running Locally

```bash
npm install
npm run dev
```

To connect live hardware, configure `VITE_SENSOR_WS_URL` in `.env`.  
Without hardware, the dashboard runs in mock mode automatically.

---

## Luminis Foundation

This project is part of the Luminis Foundation's biosensor and fungal electrophysiology research program.  
Preprint: [10.5281/zenodo.20143391](https://doi.org/10.5281/zenodo.20143391)
