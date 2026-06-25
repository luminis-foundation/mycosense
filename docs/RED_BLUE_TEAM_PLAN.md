# Red / Blue Team Plan — MycoSense

This document records the findings from the first defensive security review of MycoSense and tracks the hardening response.

---

## Review Summary

- **Date:** 2026-06
- **Scope:** Defensive red-team, read-only, local testing only. No third-party infrastructure targeted.
- **Components reviewed:** React dashboard, Pi FastAPI server, ESP32 firmware, deployment model, documentation.
- **Overall pre-hardening risk:** Medium-High for any field deployment. Low for the mock-only Vercel demo.

---

## Findings and Fix Status

### Critical

| ID | Finding | File | Status |
|---|---|---|---|
| C1 | WiFi credentials hardcoded in public repo | `esp32-firmware/mycosense_node/mycosense_node.ino:59–60` | **Fixed** — credentials moved to ESP32 NVS; Serial provisioning added |
| C2 | Pi server has no authentication on any endpoint | `pi-server/main.py` | **Fixed** — bearer token auth on all endpoints |

### High

| ID | Finding | File | Status |
|---|---|---|---|
| H1 | CORS wildcard on Pi server | `pi-server/main.py:17–22` | **Fixed** — restricted to `MYCOSENSE_ALLOWED_ORIGINS` env var |
| H2 | MQTT no authentication, no encryption | `mycosense_node.ino:151–156` | **Fixed** — MQTT user/pass from NVS; Mosquitto config documented |
| H3 | sql.js loaded from CDN without SRI | `src/utils/dataExport.js:59–70` | **Fixed** — sql.js installed via npm, no CDN |
| H4 | Pi binds to 0.0.0.0 | `pi-server/README.md` | **Fixed** — documented `--host 192.168.4.1`; systemd unit example updated |

### Medium

| ID | Finding | File | Status |
|---|---|---|---|
| M1 | No request size or rate limits on Pi server | `pi-server/main.py` | **Fixed** — batch cap 200, row limit cap 5 000 |
| M2 | CSV formula injection | `src/utils/dataExport.js:29` | **Fixed** — RFC 4180 quoting on all fields |
| M3 | ESP32 timestamp uses `millis()` not wall clock | `mycosense_node.ino:207` | **Fixed** — NTP sync with fallback `ts: -1` |
| M4 | No MQTT message signing or replay protection | firmware | **Open** — planned Phase 2 |
| M5 | PiClient queue unbounded on Pi unavailability | `src/api/piClient.js:68` | **Fixed** — MAX_QUEUE cap at 5 000 |
| M6 | `security hardening` file was empty | repo root | **Fixed** — replaced with `SECURITY.md` and `docs/` |
| M7 | `pip install sqlite3` incorrect in README | `pi-server/README.md` | **Fixed** |

### Low

| ID | Finding | File | Status |
|---|---|---|---|
| L1 | No CSP on Vercel deployment | `vercel.json` | **Fixed** — CSP, X-Frame-Options, X-Content-Type-Options added |
| L2 | MQTT buffer 512 bytes — tight for 6 electrodes | `mycosense_node.ino:138` | **Fixed** — increased to 768 bytes |
| L3 | Serial output reveals node identity | firmware boot messages | **Accepted** — USB access required; low-sensitivity data |
| L4 | Calibration data in localStorage without integrity | `useCalibration.js` | **Accepted** — no XSS surface; low operational impact |
| L5 | Unused `#include <esp_now.h>` | `mycosense_node.ino:31` | **Fixed** — removed |

---

## Open Items (Phase 2)

These are known gaps that require more significant architectural work and are deferred to Phase 2 field hardening:

1. **MQTT message signing** — HMAC-SHA256 per message using a shared secret in ESP32 NVS and Pi config. Prevents LAN injection without a compromised credential.
2. **MQTT sequence numbers** — monotonic counter per node to detect replay or message drop.
3. **NTP on isolated hotspot** — Pi acts as local NTP server (chrony, stratum 2) for nodes with no internet path to `pool.ntp.org`.
4. **Pi TLS** — mTLS or at minimum HTTPS via a self-signed CA for the LAN API, removing plaintext token exposure on the wire.
5. **ESP32 Secure Boot** — prevents firmware replacement by an attacker with physical node access.
6. **OTA firmware update mechanism** — signed updates pushed from Pi to reduce physical reflash burden at field sites.
7. **Data retention policy** — automated SQLite archival / pruning on the Pi to prevent SD card exhaustion.

---

## Safe Local Tests

These tests can be run against a local dev instance only.

### Verify bearer token is enforced
```bash
# Pi server running locally at 127.0.0.1:8765

# Should succeed (with correct token):
curl -H "Authorization: Bearer <your_token>" http://127.0.0.1:8765/status

# Should fail 401 (wrong token):
curl -H "Authorization: Bearer wrongtoken" http://127.0.0.1:8765/status

# Should fail 403 (no token):
curl http://127.0.0.1:8765/status

# Should fail 422 (batch too large):
python3 -c "
import json, urllib.request
batch = {'readings': [{'id':'E01','value':1.0,'timestamp':0}] * 201}
req = urllib.request.Request('http://127.0.0.1:8765/readings',
  data=json.dumps(batch).encode(),
  headers={'Content-Type':'application/json','Authorization':'Bearer <token>'},
  method='POST')
print(urllib.request.urlopen(req).read())
"
```

### Verify CSV quoting
```js
// In browser console (dashboard running in mock mode):
import { readingsToCSV } from './src/utils/dataExport.js'
const row = readingsToCSV([{
  timestamp: 0, id: '=EVIL()', label: 'label with "quotes"', zone: 'a,b',
  value: 1.0, unit: 'mV'
}])
console.log(row)
// Every field should be wrapped in double-quotes with internal quotes doubled
```

### Verify CORS restriction
```bash
# From browser console on a page NOT in ALLOWED_ORIGINS:
fetch('http://127.0.0.1:8765/status', {
  headers: { 'Authorization': 'Bearer <token>' }
}).then(r => r.json()).then(console.log)
// Should fail with CORS error
```

### Verify firmware provisioning flow
```
1. Flash firmware to ESP32 with empty NVS (Erase Flash before upload)
2. Open serial monitor at 115200 baud
3. Confirm: {"provision":true,"msg":"No credentials in NVS..."}
4. Enter test credentials
5. Confirm: {"provision":"complete","msg":"Credentials saved to NVS. Rebooting."}
6. Confirm: {"status":"ready","node":"E01","wifi":true,...}
```

---

## Acceptance Criteria

A deployment is considered hardening-complete when:

- [ ] `curl http://<pi-ip>:8765/status` returns 401 without a token
- [ ] `curl -H "Authorization: Bearer <token>" http://<pi-ip>:8765/status` returns 200
- [ ] Pi is unreachable from outside the hotspot network
- [ ] No ESP32 node connects to WiFi without provisioned NVS credentials
- [ ] MQTT broker rejects connections without correct username/password
- [ ] Dashboard shows "Mock" status when no `VITE_SENSOR_WS_URL` is set
- [ ] Dashboard shows "Live" status and "Pi connected" when connected to real hardware with token configured
- [ ] CSV export opens in Excel/LibreOffice without formula injection (test with `=SUM(1+1)` in a node label)
- [ ] No credentials, tokens, or passwords appear in any committed file

---

## Commit Reference

All hardening changes listed above are in branch `claude/mycosense-security-review-7j1dcy`.
