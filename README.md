# MycoSense 🍄

**Live Ecosystem Health Monitoring via Electrode Sensor Arrays**

A React dashboard developed by the Luminis Foundation for real-time biosensor data visualization — tracking electrical signals from mycelium networks and soil microbiomes as living indicators of ecosystem health.

The repository includes the browser dashboard, ESP32 sensor-node firmware, and a Raspberry Pi gateway scaffold.

---

## Vision

Mycelium networks generate measurable electrochemical signals that respond to environmental stress, nutrient flow, and biological activity. MycoSense translates those signals into a readable, real-time interface — making the invisible language of living soil visible.

---

## Stack

- **Frontend:** React 18 + Tailwind CSS
- **Data Layer:** WebSocket stream / serial port ingestion
- **Signal Processing:** Custom hooks with rolling window smoothing
- **Visualization:** Recharts
- **ESP32 Firmware:** Arduino/C++ scaffold for sensor nodes (ESP32-C6 / ESP32-S3)
- **Pi Gateway:** Python-based Raspberry Pi coordinator for local data ingestion
- **Deployment:** Static export (offline-first compatible); public demo at `mycosense.vercel.app` (simulated data)

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
│   │   ├── NotificationDrawer.jsx # Threshold breach notifications
│   │   ├── SensorGrid.jsx         # Multi-electrode array overview
│   │   ├── CalibrationPanel.jsx   # Sensor calibration interface
│   │   ├── ExportPanel.jsx        # Data export and provenance
│   │   ├── FieldMap.jsx           # Spatial zone layout
│   │   ├── WeatherPanel.jsx       # Microclimate and weather display
│   │   ├── ZoneView.jsx           # Zone health detail view
│   │   ├── PiSyncPanel.jsx        # Raspberry Pi sync status
│   │   ├── SerialConnector.jsx    # Web Serial API bridge
│   │   └── LoadingScreen.jsx      # Startup loading state
│   ├── hooks/
│   │   ├── useSensorStream.js     # WebSocket / mock data ingestion
│   │   ├── useSignalProcessor.js  # Rolling average, spike detection
│   │   ├── useEcosystemScore.js   # Derived health index logic
│   │   ├── useCalibration.js      # Calibration state management
│   │   ├── useDataLogger.js       # Local data logging
│   │   ├── useNotifications.js    # Notification state and history
│   │   ├── usePiSync.js           # Pi gateway sync hooks
│   │   ├── useSerialStream.js     # Serial port data stream
│   │   └── useWeatherStream.js    # Weather data ingestion
│   ├── api/
│   │   ├── sensorClient.js        # WebSocket client + reconnect logic
│   │   ├── serialBridge.js        # Serial-to-stream bridge
│   │   └── piClient.js            # Raspberry Pi gateway client
│   ├── utils/
│   │   ├── signalMath.js          # DSP utilities
│   │   ├── signalProcessing.js    # Extended signal processing
│   │   ├── thresholds.js          # Configurable alert thresholds
│   │   ├── dataExport.js          # Export formatting and download
│   │   └── provenanceHash.js      # Data provenance hashing
│   ├── data/
│   │   ├── mockSensorData.js      # Dev/demo data generator
│   │   └── fieldLayout.js         # Field zone layout definitions
│   ├── pages/
│   │   └── AboutPage.jsx          # About / info page
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── esp32-firmware/                 # ESP32 sensor node firmware scaffold
│   └── mycosense_node/
│       └── mycosense_node.ino
├── pi-server/                      # Raspberry Pi gateway scaffold
│   └── main.py
├── docs/                           # Security and deployment documentation
│   ├── SECURITY_MODEL.md
│   ├── FIELD_DEPLOYMENT_SECURITY.md
│   └── RED_BLUE_TEAM_PLAN.md
├── public/
├── SECURITY.md
├── FIELD_STATUS.md
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

## Security and Field Status

MycoSense is local-first research infrastructure. The public dashboard currently runs in simulated or mock data mode unless explicitly configured otherwise.

Before live field deployment, review:

- [`FIELD_STATUS.md`](FIELD_STATUS.md)
- [`SECURITY.md`](SECURITY.md)
- [`docs/SECURITY_MODEL.md`](docs/SECURITY_MODEL.md)
- [`docs/FIELD_DEPLOYMENT_SECURITY.md`](docs/FIELD_DEPLOYMENT_SECURITY.md)
- [`docs/RED_BLUE_TEAM_PLAN.md`](docs/RED_BLUE_TEAM_PLAN.md)

Do not commit real WiFi credentials, MQTT passwords, API keys, private keys, or production `.env` files.

---

## Luminis Foundation

This project is part of the Luminis Foundation's biosensor and fungal electrophysiology research program.
Preprint: [10.5281/zenodo.20143391](https://doi.org/10.5281/zenodo.20143391)
