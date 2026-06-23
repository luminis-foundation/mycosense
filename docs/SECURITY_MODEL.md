# MycoSense Security Model

## Design Principles

1. **Local-first, not cloud-first.** All sensor data stays on the researcher's hardware unless explicitly exported. No telemetry, no analytics, no third-party data processors.
2. **Network perimeter is the primary trust boundary.** The Pi server trusts the LAN hotspot. The hotspot is the outer perimeter. Defense in depth is applied within that perimeter.
3. **Mock mode is always safe.** The public demo never contacts real hardware.
4. **No secrets in source.** Credentials belong in environment variables or device NVS, never in committed code.

## Trust Zones

```
[ Internet ]
      │
      ▼
[ Vercel CDN ] ── serves static dashboard bundle (mock mode only)
      │
      │  (no path from Vercel to Pi — mDNS doesn't traverse internet)
      │
[ LAN Hotspot: 192.168.4.x ]
      │
      ├── [ Researcher's Browser ] ── dashboard with live hardware
      │         │  HTTP (bearer token)
      │         ▼
      │   [ Pi Server :8765 ] ── FastAPI + SQLite
      │         ▲
      │         │  MQTT (authenticated)
      │         │
      └── [ ESP32 Nodes ] ── electrode + weather sensors
```

## Authentication

### Pi server
- Bearer token (`MYCOSENSE_API_TOKEN` environment variable)
- Token is a 64-character hex secret generated at deploy time
- Dashboard sends token in `Authorization: Bearer <token>` header
- Set `VITE_PI_TOKEN` in dashboard `.env` to match

### MQTT
- Username/password authentication (`mqtt_user` / `mqtt_pass` in ESP32 NVS)
- Mosquitto password file on Pi: `sudo mosquitto_passwd /etc/mosquitto/passwd myconode`
- Add `require_certificate false` + `password_file /etc/mosquitto/passwd` to `mosquitto.conf`

### Dashboard → ESP32
- No direct path. Dashboard receives data from Pi server or USB serial.
- Web Serial API requires explicit user port selection (browser permission gate)

## Data Flow and Sensitivity

| Data | Sensitivity | Where stored |
|---|---|---|
| Raw electrode readings (mV) | Low — non-identifying sensor values | Browser memory, Pi SQLite, optional CSV/SQLite export |
| Weather (temp, humidity, etc.) | Low | Same as above |
| Node placement metadata | Low — physical coordinates not yet surveyed | `fieldLayout.js` (source code, intentionally public) |
| Calibration baselines | Low | Browser localStorage |
| Provenance hash | Publishable — designed to be posted on-chain | Clipboard only; researcher controls posting |
| WiFi credentials | High | ESP32 NVS only — not in source |
| Pi API token | High | Environment variable on Pi and in `.env` — not in source |
| MQTT credentials | High | ESP32 NVS + Mosquitto passwd file — not in source |

## Threat Model

### Threats within scope
| Threat | Mitigated by |
|---|---|
| Fake sensor readings injected via HTTP | Pi server bearer token auth |
| Cross-origin requests from malicious website | Restricted CORS allow-list |
| Oversized request body exhausting Pi RAM/disk | Batch size cap (200 readings), row limit cap (5 000) |
| WiFi credentials extracted from public repo | Credentials removed from source; stored in NVS |
| Formula injection in CSV exports | RFC 4180 quoting on all fields |
| CDN-served malicious JavaScript | sql.js bundled from npm; CSP blocks external scripts |
| Browser session reading Pi data cross-origin | CORS + bearer token required |

### Threats not in scope for current phase
| Threat | Reason / Plan |
|---|---|
| MQTT message injection by LAN device | Requires HMAC signing — planned Phase 2 |
| MQTT replay attacks | Requires monotonic sequence numbers — planned Phase 2 |
| Pi server TLS | Suitable for LAN only; TLS adds complexity without a CA |
| Physical tampering with field nodes | Physical security is site-operator responsibility |
| Firmware extraction via JTAG | Secure boot not yet configured |
| OTA firmware update attacks | No OTA mechanism; physical reflash required |

## Configuration Checklist

Before any lab or field deployment:

- [ ] Generate `MYCOSENSE_API_TOKEN`: `python3 -c "import secrets; print(secrets.token_hex(32))"`
- [ ] Set `MYCOSENSE_API_TOKEN` in Pi systemd unit or `/etc/environment`
- [ ] Set `MYCOSENSE_ALLOWED_ORIGINS` to the dashboard's actual origin
- [ ] Set `VITE_PI_TOKEN` in dashboard `.env` to match the above token
- [ ] Provision each ESP32 node via USB serial (first boot dialog)
- [ ] Configure Mosquitto password file with MQTT credentials matching NVS
- [ ] Bind Pi uvicorn to the LAN interface IP, not `0.0.0.0`
- [ ] Verify Pi is not reachable from outside the hotspot (no second internet-facing interface active)
