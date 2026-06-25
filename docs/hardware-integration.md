# Hardware Integration Guide

MycoSense supports three ingestion paths: **WebSocket**, **USB Serial**, and **Raspberry Pi local sync**. Without any hardware configured the dashboard falls back to **mock mode** automatically — no extra setup needed for development.

---

## 1. Environment Variable

Copy `.env.example` to `.env` and set your sensor server URL:

```
VITE_SENSOR_WS_URL=ws://192.168.1.50:8765
```

- If `VITE_SENSOR_WS_URL` is empty or absent the dashboard runs in mock mode.
- The value is baked into the static build at `vite build` time. Rebuild after changing it.
- Do **not** commit `.env` to version control.

---

## 2. WebSocket Ingestion (`src/api/sensorClient.js`)

The sensor server must push JSON frames over WebSocket. Each frame must contain a `sensors` array:

```json
{
  "sensors": [
    { "id": "E01", "value": 42.5, "timestamp": 1700000000000, "unit": "mV" },
    { "id": "E02", "value": -18.3, "timestamp": 1700000000000, "unit": "mV" }
  ]
}
```

Fields per sensor reading:

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Must match a configured electrode id (`E01`–`E06`) |
| `value` | number | yes | Millivolts |
| `timestamp` | integer | yes | Unix ms |
| `unit` | string | yes | Must be `"mV"` |
| `label` | string | no | Overrides default label from sensor config |
| `zone` | string | no | Overrides default zone |
| `weather` | object | no | See weather sub-object below |

Optional `weather` sub-object:

```json
"weather": {
  "tempC": 22.1,
  "humidity": 45.0,
  "pressureHpa": 843.2,
  "lightLux": 12000,
  "windKph": 5.4,
  "rainMm": 0.0
}
```

The client reconnects automatically with exponential backoff (up to 8 attempts, base delay 1 s). Status is shown in the dashboard header.

For the full versioned schema see [`src/schema/v1/sensor-reading.schema.json`](../src/schema/v1/sensor-reading.schema.json).

---

## 3. USB Serial Ingestion (`src/api/serialBridge.js`)

Requires **Chrome or Edge** (Chromium-based, Web Serial API). Does not work in Firefox or Safari. Must be served over HTTPS or `localhost`.

Connect your microcontroller via USB, then open **Hardware → Serial Connector** in the dashboard and click **Connect**.

### Supported wire formats

**JSON line** (preferred):
```
{"id":"E01","value":42.5,"unit":"mV"}
```

**CSV line**:
```
E01,42.5,mV
```

One reading per newline. The bridge parses both formats automatically.

### Firmware settings

- Baud rate: **115200** (configurable in `serialBridge.js`)
- Line ending: `\n` or `\r\n`
- Send one reading object per line; multiple sensors can be sent in separate lines within the same tick

See the firmware sketches in [`esp32-firmware/`](../esp32-firmware/) for reference implementations.

---

## 4. Raspberry Pi Coordinator (`src/api/piClient.js`)

The Pi acts as a local data persistence layer and network bridge.

- mDNS hostname: `mycosense.local:8765` (configurable)
- Discovery: dashboard auto-discovers via mDNS; fallback to IP in settings
- Batching: readings are queued in the browser and POSTed in batches of 50 every 5 s
- Failed batches are re-queued to avoid data loss

Pi server endpoints:

| Method | Path | Description |
|---|---|---|
| `POST` | `/readings` | Batch upload of sensor readings |
| `GET` | `/status` | Health check |
| `GET` | `/sessions` | List stored sessions |

See [`pi-server/`](../pi-server/) for the server implementation.

---

## 5. Hardware Reference

| Node | Hardware | Sensors per node | Zone |
|---|---|---|---|
| E01, E02 | ESP32-C6 | 2 electrodes + BME280 | Rhizosphere A |
| E03, E04 | ESP32-C6 | 2 electrodes + BME280 | Substrate B |
| E05, E06 | ESP32-S3 | 2 electrodes + VEML7700 | Canopy C |
| Coordinator | Raspberry Pi 5 | — | Network hub + storage |

---

## 6. Troubleshooting

**Dashboard shows "Mock" status despite VITE_SENSOR_WS_URL being set**
- Rebuild after changing `.env`: `npm run build` (env vars are baked in at build time)
- Check the browser console for WebSocket connection errors
- Verify the Pi or sensor server is reachable from the browser host

**Serial port not appearing in the connect dialog**
- Confirm you are using Chrome or Edge
- Confirm the page is served over HTTPS or `localhost`
- On Linux: add your user to the `dialout` group — `sudo usermod -aG dialout $USER`

**Readings arriving but values look wrong**
- Run calibration capture (Hardware → Calibration) before each session to zero electrode baselines
- Check electrode contact and soil moisture — dry soil raises impedance significantly
