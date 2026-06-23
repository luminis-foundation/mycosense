# Field Deployment Security Guide

This guide covers what to do before deploying ESP32 nodes and a Pi coordinator into an outdoor research site. Follow this checklist in order. Do not skip steps.

> **Status:** Lab-validated. First full field deployment has not yet occurred.

---

## Before You Leave the Lab

### 1. Generate the Pi API token

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output. You will need it in steps 2 and 3.

### 2. Configure the Pi server

Create `/etc/mycosense.env`:

```bash
MYCOSENSE_API_TOKEN=<paste token here>
MYCOSENSE_ALLOWED_ORIGINS=http://192.168.4.100:3000
```

Add to your systemd unit (`/etc/systemd/system/mycosense-pi.service`):

```ini
[Service]
EnvironmentFile=/etc/mycosense.env
ExecStart=/usr/bin/uvicorn main:app --host 192.168.4.1 --port 8765
WorkingDirectory=/home/pi/mycosense/pi-server
User=pi
```

> **`--host 192.168.4.1`** — bind only to the hotspot interface, not to any internet-facing adapter.

Reload and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable mycosense-pi
sudo systemctl start mycosense-pi
```

### 3. Configure Mosquitto MQTT broker

Install and configure on the Pi:
```bash
sudo apt install mosquitto mosquitto-clients
sudo mosquitto_passwd -c /etc/mosquitto/passwd myconode
# Enter a password — this becomes mqtt_pass in your ESP32 NVS
```

`/etc/mosquitto/conf.d/mycosense.conf`:
```
listener 1883 192.168.4.1
allow_anonymous false
password_file /etc/mosquitto/passwd
```

```bash
sudo systemctl restart mosquitto
```

### 4. Provision each ESP32 node

For each node:
1. Flash the firmware via Arduino IDE (USB cable)
2. Open the serial monitor at 115200 baud
3. On first boot, the node halts and shows provisioning prompts
4. Enter:
   - `wifi_ssid`: your Pi hotspot SSID
   - `wifi_pass`: your Pi hotspot password
   - `mqtt_user`: `myconode` (or whichever user you created)
   - `mqtt_pass`: the password you set in step 3
5. The node saves credentials to NVS and reboots automatically
6. Verify it connects: `{"status":"ready","node":"E01","wifi":true,"ntp":true}`

> **NTP note:** `"ntp":false` means the Pi's hotspot has no internet uplink for time sync. Either configure the Pi as an NTP server (chrony + set-local-stratum) or accept that timestamps will be `ts: -1` until sync is available.

### 5. Configure the dashboard `.env`

```bash
VITE_PI_URL=http://192.168.4.1:8765
VITE_PI_TOKEN=<same token as MYCOSENSE_API_TOKEN>
VITE_SENSOR_WS_URL=
```

Build and deploy (or run dev server on the researcher's laptop connected to the hotspot).

---

## At the Field Site

### Physical node placement
- Record actual physical positions (x, y, depth) for updating `fieldLayout.js` post-deployment
- GPS survey each node after insertion — update `lat`/`lng` fields
- Note substrate type and depth in field notebook

### Network checks before leaving
```bash
# From a device on the hotspot:
curl -H "Authorization: Bearer <token>" http://192.168.4.1:8765/status
# Expected: {"status":"ok","server":"MycoSense Pi","time":...}

# Verify no access without token:
curl http://192.168.4.1:8765/status
# Expected: 403 or 401

# Verify Pi is not reachable from outside the hotspot:
# Disconnect from hotspot, try: curl http://192.168.4.1:8765/status
# Expected: connection refused
```

### Physical tamper considerations
- Note whether nodes have any physical access controls (locked enclosures)
- If site has public access, document this in field notes
- USB ports on ESP32 enclosures: anyone with USB access can read serial output (non-sensitive) and potentially reflash (if enclosure is open)

---

## Data Retention

The Pi stores all readings in `mycosense.sqlite` indefinitely. For multi-week deployments:

```bash
# Check database size periodically
du -sh /path/to/mycosense.sqlite

# Export and archive old data before SD card fills
# Use the dashboard Export tab, or:
sqlite3 mycosense.sqlite ".dump" > backup_$(date +%Y%m%d).sql
```

No automated retention policy is configured. Plan for manual management.

---

## Returning from the Field

1. Export all session data from the dashboard before powering down
2. Generate a provenance hash for each session dataset
3. Archive the SQLite database from the Pi
4. Update `fieldLayout.js` with surveyed GPS coordinates
5. Document any anomalies, tamper observations, or sensor failures in field notes

---

## Incident Response

If you suspect data was injected or tampered with:

1. Stop the Pi server: `sudo systemctl stop mycosense-pi`
2. Make a copy of the database before any further writes: `cp mycosense.sqlite mycosense_incident_$(date +%Y%m%d_%H%M%S).sqlite`
3. Check `received_at` vs `timestamp` columns — a large discrepancy suggests injected readings
4. Check for readings with `sensor_id` values not matching your known node IDs
5. Check for `ts: -1` readings mixed with real timestamped readings (could indicate a replay)
6. Rotate the API token and MQTT password before redeploying
7. Re-flash all ESP32 nodes and re-provision credentials

If the Pi's SD card was physically accessed, treat all data on that card as untrusted.
