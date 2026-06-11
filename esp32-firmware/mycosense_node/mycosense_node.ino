/**
 * MycoSense Node Firmware v1.0
 * Luminis Foundation — Rowe, New Mexico
 *
 * Compatible: ESP32-C6, ESP32-S3
 * Reads electrode array + weather sensors, publishes via:
 *   - Serial (USB) at 115200 baud — for direct MycoSense dashboard connection
 *   - MQTT over WiFi — for Pi coordinator mesh
 *   - ESP-NOW — for offline mesh between nodes (no router needed)
 *
 * Electrode inputs:    GPIO 0–5 (analog, ADC1)
 * Weather sensors:
 *   - DHT22 (temp + humidity): GPIO 21
 *   - BMP280 (pressure + altitude): I2C SDA 8 / SCL 9
 *   - LDR light sensor: GPIO 6 (analog)
 *   - Wind: anemometer pulse on GPIO 10
 *   - Rain: tipping bucket pulse on GPIO 11
 *
 * Output format (Serial + MQTT):
 *   JSON per reading cycle, newline delimited
 *   {"node":"E01","zone":"Rhizosphere A","electrodes":[...],"weather":{...},"ts":1234567890}
 */

#include <Arduino.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <esp_now.h>
#include <Preferences.h>

// ── Node Identity (flash this per node) ──────────────────────────────────────
#define NODE_ID       "E01"
#define NODE_LABEL    "Node Alpha"
#define NODE_ZONE     "Rhizosphere A"
#define NODE_DEPTH    "15cm"

// ── Pin Configuration ─────────────────────────────────────────────────────────
#define ELECTRODE_COUNT   4           // electrodes per node
const int ELECTRODE_PINS[ELECTRODE_COUNT] = { 0, 1, 2, 3 };  // ADC1 pins

#define DHT_PIN           21
#define DHT_TYPE          DHT22
#define LDR_PIN           6
#define WIND_PIN          10
#define RAIN_PIN          11

#define I2C_SDA           8
#define I2C_SCL           9

// ── Timing ────────────────────────────────────────────────────────────────────
#define SAMPLE_INTERVAL_MS    500     // electrode sampling rate
#define WEATHER_INTERVAL_MS   10000  // weather read every 10s (DHT22 limit)
#define MQTT_RECONNECT_MS     5000

// ── WiFi + MQTT (configure via Serial command or hardcode for field) ──────────
#define WIFI_SSID     "LuminisNet"     // your Pi hotspot SSID
#define WIFI_PASS     "mycofield"      // your Pi hotspot password
#define MQTT_BROKER   "192.168.4.1"   // Pi IP on local network
#define MQTT_PORT     1883
#define MQTT_TOPIC    "mycosense/readings"
#define MQTT_WEATHER  "mycosense/weather"
#define MQTT_STATUS   "mycosense/status"

// ── Globals ───────────────────────────────────────────────────────────────────
DHT               dht(DHT_PIN, DHT_TYPE);
Adafruit_BMP280   bmp;
WiFiClient        wifiClient;
PubSubClient      mqtt(wifiClient);
Preferences       prefs;

bool bmpAvailable    = false;
bool wifiAvailable   = false;
bool mqttAvailable   = false;

volatile uint16_t windPulses = 0;
volatile uint16_t rainTips   = 0;

unsigned long lastSampleMs  = 0;
unsigned long lastWeatherMs = 0;
unsigned long lastMqttMs    = 0;

// Weather state
float tempC       = 0;
float humidity    = 0;
float pressureHpa = 0;
float lightLux    = 0;
float windKph     = 0;
float rainMm      = 0;

// ── ISR: wind + rain pulse counting ──────────────────────────────────────────
void IRAM_ATTR onWindPulse() { windPulses++; }
void IRAM_ATTR onRainTip()   { rainTips++;   }

// ── Setup ─────────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("{\"boot\":\"MycoSense Node " NODE_ID "\",\"fw\":\"1.0\"}");

  // ADC config
  analogSetAttenuation(ADC_11db);  // 0–3.3V range

  // DHT
  dht.begin();

  // BMP280
  Wire.begin(I2C_SDA, I2C_SCL);
  bmpAvailable = bmp.begin(0x76);
  if (!bmpAvailable) bmpAvailable = bmp.begin(0x77);
  if (bmpAvailable) {
    bmp.setSampling(Adafruit_BMP280::MODE_NORMAL,
                    Adafruit_BMP280::SAMPLING_X2,
                    Adafruit_BMP280::SAMPLING_X16,
                    Adafruit_BMP280::FILTER_X16,
                    Adafruit_BMP280::STANDBY_MS_500);
  }

  // Wind + rain interrupts
  pinMode(WIND_PIN, INPUT_PULLUP);
  pinMode(RAIN_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(WIND_PIN), onWindPulse, FALLING);
  attachInterrupt(digitalPinToInterrupt(RAIN_PIN), onRainTip,   FALLING);

  // WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  unsigned long wStart = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - wStart < 8000) {
    delay(200);
  }
  wifiAvailable = (WiFi.status() == WL_CONNECTED);

  // MQTT
  if (wifiAvailable) {
    mqtt.setServer(MQTT_BROKER, MQTT_PORT);
    mqtt.setBufferSize(512);
    mqttConnect();
  }

  Serial.println("{\"status\":\"ready\",\"node\":\"" NODE_ID "\",\"wifi\":" +
    String(wifiAvailable ? "true" : "false") + ",\"bmp\":" +
    String(bmpAvailable  ? "true" : "false") + "}");
}

// ── MQTT connect ──────────────────────────────────────────────────────────────
void mqttConnect() {
  if (!wifiAvailable) return;
  String clientId = "mycosense-" + String(NODE_ID);
  if (mqtt.connect(clientId.c_str())) {
    mqttAvailable = true;
    mqtt.publish(MQTT_STATUS, ("{\"node\":\"" + String(NODE_ID) + "\",\"status\":\"online\"}").c_str(), true);
  }
}

// ── Read electrodes ───────────────────────────────────────────────────────────
// ADC reads 0–4095 (12-bit). Convert to millivolts relative to center (1.65V).
// Positive = above center, negative = below center.
float readElectrodeMv(int pin) {
  int raw     = analogRead(pin);
  float volts = (raw / 4095.0) * 3.3;
  float mV    = (volts - 1.65) * 1000.0;  // center at 0
  return mV;
}

// ── Read weather ──────────────────────────────────────────────────────────────
void readWeather() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (!isnan(h) && !isnan(t)) {
    humidity = h;
    tempC    = t;
  }

  if (bmpAvailable) {
    pressureHpa = bmp.readPressure() / 100.0;
  }

  // Light (LDR: raw ADC → approximate lux, calibrate per sensor)
  int ldrRaw = analogRead(LDR_PIN);
  lightLux   = map(ldrRaw, 0, 4095, 0, 100000);  // rough approximation

  // Wind speed: pulses in last interval → kph (calibrate per anemometer spec)
  // Typical: 1 pulse/sec = 2.4 kph
  noInterrupts();
  uint16_t wPulses = windPulses;
  uint16_t rTips   = rainTips;
  windPulses = 0;
  rainTips   = 0;
  interrupts();

  float intervalSec = WEATHER_INTERVAL_MS / 1000.0;
  windKph = (wPulses / intervalSec) * 2.4;
  rainMm  = rTips * 0.2794;  // standard tipping bucket = 0.2794mm per tip
}

// ── Build + send JSON reading ─────────────────────────────────────────────────
void sendReading() {
  StaticJsonDocument<512> doc;

  doc["node"]  = NODE_ID;
  doc["label"] = NODE_LABEL;
  doc["zone"]  = NODE_ZONE;
  doc["depth"] = NODE_DEPTH;
  doc["ts"]    = millis();  // replace with NTP timestamp when available

  JsonArray electrodes = doc.createNestedArray("electrodes");
  for (int i = 0; i < ELECTRODE_COUNT; i++) {
    JsonObject e = electrodes.createNestedObject();
    e["ch"]  = i;
    e["mV"]  = readElectrodeMv(ELECTRODE_PINS[i]);
    e["pin"] = ELECTRODE_PINS[i];
  }

  JsonObject weather = doc.createNestedObject("weather");
  weather["tempC"]      = tempC;
  weather["humidity"]   = humidity;
  weather["pressureHpa"] = pressureHpa;
  weather["lightLux"]   = lightLux;
  weather["windKph"]    = windKph;
  weather["rainMm"]     = rainMm;

  // Always output to Serial (USB bridge picks this up)
  serializeJson(doc, Serial);
  Serial.println();

  // MQTT if available
  if (mqttAvailable && mqtt.connected()) {
    char buf[512];
    serializeJson(doc, buf, sizeof(buf));
    mqtt.publish(MQTT_TOPIC, buf);
  }
}

// ── Loop ──────────────────────────────────────────────────────────────────────
void loop() {
  unsigned long now = millis();

  // MQTT keepalive
  if (mqttAvailable) {
    if (!mqtt.connected() && now - lastMqttMs > MQTT_RECONNECT_MS) {
      mqttConnect();
      lastMqttMs = now;
    }
    mqtt.loop();
  }

  // Electrode sample
  if (now - lastSampleMs >= SAMPLE_INTERVAL_MS) {
    lastSampleMs = now;
    sendReading();
  }

  // Weather read
  if (now - lastWeatherMs >= WEATHER_INTERVAL_MS) {
    lastWeatherMs = now;
    readWeather();
  }
}
