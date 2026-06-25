/**
 * MycoSense Node Firmware v1.1
 * Luminis Foundation — Rowe, New Mexico
 *
 * Compatible: ESP32-C6, ESP32-S3
 * Reads electrode array + weather sensors, publishes via:
 *   - Serial (USB) at 115200 baud — for direct MycoSense dashboard connection
 *   - MQTT over WiFi — for Pi coordinator mesh
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
 *   {"node":"E01","zone":"Rhizosphere A","electrodes":[...],"weather":{...},"ts":1718000000000}
 *
 * CREDENTIALS — never hardcode in source.
 * On first boot with empty NVS the node halts and runs a Serial provisioning
 * dialog (115200 baud). Connect USB, open a serial monitor, and enter:
 *   wifi_ssid, wifi_pass, mqtt_user, mqtt_pass
 * Values are written to ESP32 NVS and the node reboots automatically.
 * To re-provision: erase NVS with the Arduino "Erase Flash" option, reflash,
 * then provision again.
 */

#include <Arduino.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <Preferences.h>
#include <time.h>

// ── Node Identity (set per physical node before flashing) ────────────────────
#define NODE_ID       "E01"
#define NODE_LABEL    "Node Alpha"
#define NODE_ZONE     "Rhizosphere A"
#define NODE_DEPTH    "15cm"

// ── Pin Configuration ─────────────────────────────────────────────────────────
#define ELECTRODE_COUNT   4
const int ELECTRODE_PINS[ELECTRODE_COUNT] = { 0, 1, 2, 3 };  // ADC1 pins

#define DHT_PIN           21
#define DHT_TYPE          DHT22
#define LDR_PIN           6
#define WIND_PIN          10
#define RAIN_PIN          11

#define I2C_SDA           8
#define I2C_SCL           9

// ── Timing ────────────────────────────────────────────────────────────────────
#define SAMPLE_INTERVAL_MS    500
#define WEATHER_INTERVAL_MS   10000
#define MQTT_RECONNECT_MS     5000

// ── MQTT network config (not secret — topology / topic names) ─────────────────
#define MQTT_BROKER   "192.168.4.1"   // Pi IP on local hotspot
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

// Credentials loaded from NVS — never from source
String wifiSsid;
String wifiPass;
String mqttUser;
String mqttPass;

bool bmpAvailable    = false;
bool wifiAvailable   = false;
bool mqttAvailable   = false;
bool ntpAvailable    = false;   // true once wall-clock time is synced

volatile uint16_t windPulses = 0;
volatile uint16_t rainTips   = 0;

unsigned long lastSampleMs  = 0;
unsigned long lastWeatherMs = 0;
unsigned long lastMqttMs    = 0;

float tempC       = 0;
float humidity    = 0;
float pressureHpa = 0;
float lightLux    = 0;
float windKph     = 0;
float rainMm      = 0;

// ── ISR: wind + rain pulse counting ──────────────────────────────────────────
void IRAM_ATTR onWindPulse() { windPulses++; }
void IRAM_ATTR onRainTip()   { rainTips++;   }

// ── Serial provisioning ────────────────────────────────────────────────────────
// Runs only when NVS holds no wifi_ssid. Does not return — reboots after saving.
void provisionCredentials() {
  Serial.println("{\"provision\":true,\"msg\":\"No credentials in NVS. Open serial monitor at 115200 baud.\"}");
  delay(2000);

  auto readLine = []() -> String {
    while (!Serial.available()) delay(50);
    String s = Serial.readStringUntil('\n');
    s.trim();
    return s;
  };

  Serial.println("{\"prompt\":\"wifi_ssid\"}");
  String ssid  = readLine();

  Serial.println("{\"prompt\":\"wifi_pass\"}");
  String pass  = readLine();

  Serial.println("{\"prompt\":\"mqtt_user (blank if no MQTT auth)\"}");
  String mUser = readLine();

  Serial.println("{\"prompt\":\"mqtt_pass (blank if no MQTT auth)\"}");
  String mPass = readLine();

  prefs.begin("myconet", false);
  prefs.putString("wifi_ssid", ssid);
  prefs.putString("wifi_pass", pass);
  prefs.putString("mqtt_user", mUser);
  prefs.putString("mqtt_pass", mPass);
  prefs.end();

  Serial.println("{\"provision\":\"complete\",\"msg\":\"Credentials saved to NVS. Rebooting.\"}");
  delay(500);
  ESP.restart();
}

// ── Setup ─────────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("{\"boot\":\"MycoSense Node " NODE_ID "\",\"fw\":\"1.1\"}");

  // Load credentials from NVS
  prefs.begin("myconet", true);   // read-only
  wifiSsid = prefs.getString("wifi_ssid", "");
  wifiPass = prefs.getString("wifi_pass", "");
  mqttUser = prefs.getString("mqtt_user", "");
  mqttPass = prefs.getString("mqtt_pass", "");
  prefs.end();

  if (wifiSsid.isEmpty()) {
    provisionCredentials();   // does not return
  }

  // ADC
  analogSetAttenuation(ADC_11db);  // 0–3.3 V range

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
  WiFi.begin(wifiSsid.c_str(), wifiPass.c_str());
  unsigned long wStart = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - wStart < 8000) {
    delay(200);
  }
  wifiAvailable = (WiFi.status() == WL_CONNECTED);

  // NTP — required for research-grade timestamps
  if (wifiAvailable) {
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
    time_t now = 0;
    unsigned long ntpStart = millis();
    // Wait up to 10 s; sanity-check: Unix epoch > 2021-01-01
    while (now < 1609459200L && millis() - ntpStart < 10000) {
      delay(500);
      time(&now);
    }
    ntpAvailable = (now > 1609459200L);
  }

  // MQTT
  if (wifiAvailable) {
    mqtt.setServer(MQTT_BROKER, MQTT_PORT);
    mqtt.setBufferSize(768);   // headroom for 6-electrode + weather payloads
    mqttConnect();
  }

  Serial.println("{\"status\":\"ready\",\"node\":\"" NODE_ID "\",\"wifi\":" +
    String(wifiAvailable ? "true" : "false") + ",\"ntp\":" +
    String(ntpAvailable  ? "true" : "false") + ",\"bmp\":" +
    String(bmpAvailable  ? "true" : "false") + "}");
}

// ── MQTT connect ──────────────────────────────────────────────────────────────
void mqttConnect() {
  if (!wifiAvailable) return;
  String clientId = "mycosense-" + String(NODE_ID);
  bool ok = mqttUser.isEmpty()
    ? mqtt.connect(clientId.c_str())
    : mqtt.connect(clientId.c_str(), mqttUser.c_str(), mqttPass.c_str());
  if (ok) {
    mqttAvailable = true;
    mqtt.publish(MQTT_STATUS,
      ("{\"node\":\"" + String(NODE_ID) + "\",\"status\":\"online\"}").c_str(), true);
  }
}

// ── Read electrodes ───────────────────────────────────────────────────────────
// ADC reads 0–4095 (12-bit). Convert to millivolts relative to center (1.65 V).
float readElectrodeMv(int pin) {
  int raw     = analogRead(pin);
  float volts = (raw / 4095.0) * 3.3;
  float mV    = (volts - 1.65) * 1000.0;
  return mV;
}

// ── Read weather ──────────────────────────────────────────────────────────────
void readWeather() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (!isnan(h) && !isnan(t)) { humidity = h; tempC = t; }

  if (bmpAvailable) pressureHpa = bmp.readPressure() / 100.0;

  int ldrRaw = analogRead(LDR_PIN);
  lightLux   = map(ldrRaw, 0, 4095, 0, 100000);

  noInterrupts();
  uint16_t wPulses = windPulses;
  uint16_t rTips   = rainTips;
  windPulses = 0;
  rainTips   = 0;
  interrupts();

  float intervalSec = WEATHER_INTERVAL_MS / 1000.0;
  windKph = (wPulses / intervalSec) * 2.4;   // calibrate per anemometer spec
  rainMm  = rTips * 0.2794;                   // standard tipping bucket = 0.2794 mm/tip
}

// ── Build + send JSON reading ─────────────────────────────────────────────────
void sendReading() {
  StaticJsonDocument<768> doc;

  doc["node"]  = NODE_ID;
  doc["label"] = NODE_LABEL;
  doc["zone"]  = NODE_ZONE;
  doc["depth"] = NODE_DEPTH;

  // Use NTP wall-clock time (ms since Unix epoch).
  // ts == -1 means NTP has not synced — do not use for research timestamps.
  time_t wallClock;
  time(&wallClock);
  doc["ts"] = ntpAvailable ? (long long)wallClock * 1000LL : -1LL;

  JsonArray electrodes = doc.createNestedArray("electrodes");
  for (int i = 0; i < ELECTRODE_COUNT; i++) {
    JsonObject e = electrodes.createNestedObject();
    e["ch"]  = i;
    e["mV"]  = readElectrodeMv(ELECTRODE_PINS[i]);
    e["pin"] = ELECTRODE_PINS[i];
  }

  JsonObject weather = doc.createNestedObject("weather");
  weather["tempC"]       = tempC;
  weather["humidity"]    = humidity;
  weather["pressureHpa"] = pressureHpa;
  weather["lightLux"]    = lightLux;
  weather["windKph"]     = windKph;
  weather["rainMm"]      = rainMm;

  // Always output to Serial (USB bridge picks this up)
  serializeJson(doc, Serial);
  Serial.println();

  // MQTT if available
  if (mqttAvailable && mqtt.connected()) {
    char buf[768];
    serializeJson(doc, buf, sizeof(buf));
    mqtt.publish(MQTT_TOPIC, buf);
  }
}

// ── Loop ──────────────────────────────────────────────────────────────────────
void loop() {
  unsigned long now = millis();

  if (mqttAvailable) {
    if (!mqtt.connected() && now - lastMqttMs > MQTT_RECONNECT_MS) {
      mqttConnect();
      lastMqttMs = now;
    }
    mqtt.loop();
  }

  if (now - lastSampleMs >= SAMPLE_INTERVAL_MS) {
    lastSampleMs = now;
    sendReading();
  }

  if (now - lastWeatherMs >= WEATHER_INTERVAL_MS) {
    lastWeatherMs = now;
    readWeather();
  }
}
