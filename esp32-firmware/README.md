# MycoSense ESP32 Node Firmware

**Luminis Foundation · Rowe, New Mexico**
Compatible: ESP32-C6, ESP32-S3

---

## Required Arduino Libraries

Install via Arduino IDE → Library Manager:

| Library | Version | Purpose |
|---|---|---|
| ArduinoJson | ^7.0 | JSON serialization |
| DHT sensor library | ^1.4 | DHT22 temp/humidity |
| Adafruit BMP280 | ^2.6 | Barometric pressure |
| Adafruit Unified Sensor | ^1.1 | Sensor abstraction |
| PubSubClient | ^2.8 | MQTT client |

Board: **ESP32** (Espressif) — install via Boards Manager
URL: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`

---

## Wiring Diagram

```
ESP32-C6 / ESP32-S3
─────────────────────────────────────────────
ELECTRODES (analog reads — millivolt range)
  GPIO 0  ──── Electrode channel 0 (+ probe tip)
  GPIO 1  ──── Electrode channel 1
  GPIO 2  ──── Electrode channel 2
  GPIO 3  ──── Electrode channel 3
  GND     ──── Reference electrode (buried ~20cm from probes)

WEATHER SENSORS
  GPIO 21 ──── DHT22 data pin
              DHT22 VCC → 3.3V
              DHT22 GND → GND
              10kΩ pullup between VCC and data

  GPIO 8  ──── I2C SDA → BMP280 SDA
  GPIO 9  ──── I2C SCL → BMP280 SCL
              BMP280 VCC → 3.3V
              BMP280 GND → GND

  GPIO 6  ──── LDR (light sensor)
              LDR one leg → 3.3V
              LDR other leg → GPIO 6 + 10kΩ to GND

  GPIO 10 ──── Anemometer signal (wind pulses)
              Anemometer VCC → 3.3V or 5V (check spec)
              Anemometer GND → GND

  GPIO 11 ──── Rain gauge tipping bucket signal
              Rain gauge GND → GND

POWER
  VIN     ──── Solar charge controller output (5V)
              or USB for bench testing
```

---

## Node Configuration

Before flashing each node, update these defines in `mycosense_node.ino`:

```cpp
#define NODE_ID    "E01"           // E01–E06
#define NODE_LABEL "Node Alpha"    // Human name
#define NODE_ZONE  "Rhizosphere A" // Zone
#define NODE_DEPTH "15cm"          // Electrode depth
```

And WiFi credentials:
```cpp
#define WIFI_SSID  "LuminisNet"
#define WIFI_PASS  "mycofield"
#define MQTT_BROKER "192.168.4.1"  // Pi IP
```

---

## Flash Instructions

1. Install Arduino IDE 2.x
2. Add ESP32 board URL in Preferences
3. Install all libraries above
4. Open `mycosense_node.ino`
5. Set NODE_ID, NODE_LABEL, NODE_ZONE for this physical node
6. Select board: **ESP32C6 Dev Module** or **ESP32S3 Dev Module**
7. Select correct COM port
8. Upload

---

## Serial Output Format

At 115200 baud, each node outputs newline-delimited JSON every 500ms:

```json
{
  "node": "E01",
  "label": "Node Alpha",
  "zone": "Rhizosphere A",
  "depth": "15cm",
  "ts": 12345678,
  "electrodes": [
    {"ch": 0, "mV": 42.5, "pin": 0},
    {"ch": 1, "mV": -18.2, "pin": 1},
    {"ch": 2, "mV": 7.1, "pin": 2},
    {"ch": 3, "mV": -3.4, "pin": 3}
  ],
  "weather": {
    "tempC": 24.1,
    "humidity": 38.5,
    "pressureHpa": 843.2,
    "lightLux": 28000,
    "windKph": 4.8,
    "rainMm": 0.0
  }
}
```

The MycoSense dashboard serial bridge reads this format directly.
The Pi MQTT server also receives this on `mycosense/readings`.

---

## Solar Power Setup

For remote field deployment:
- 5W–10W solar panel → charge controller → 18650 LiPo pack → ESP32 VIN
- ESP32-C6 draws ~80mA active, ~10µA deep sleep
- With 2000mAh battery + 5W panel: runs indefinitely in NM sun

---

## Electrode Construction

Simple DIY mycelium electrodes:
- **Material:** Stainless steel rods (3mm) or copper wire (insulated except tip)
- **Length:** 20–30cm total, 5–15cm insertion depth depending on zone
- **Spacing:** 5–10cm between probes in same node cluster
- **Reference:** Single buried rod ~20cm from cluster, connected to GND

*Luminis Foundation · EIN 41-4984345 · github.com/luminis-foundation/mycosense*
