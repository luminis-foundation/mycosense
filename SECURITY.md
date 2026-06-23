# Security Policy — MycoSense

## Scope

MycoSense is local-first research infrastructure. The attack surface is small:

| Component | Network exposure |
|---|---|
| Vercel dashboard (public demo) | Internet — mock data only, no real sensors |
| Pi server (`mycosense.local:8765`) | LAN only — not internet-routable by design |
| ESP32 field nodes | LAN hotspot only — no direct internet access |

**The Pi server must never be exposed to the public internet.** It has no TLS and is designed to trust the local network perimeter, reinforced by the controls below.

## Reporting a Vulnerability

Open a GitHub issue tagged `security`. For sensitive disclosures, email the Luminis Foundation directly (address on our GitHub profile). We aim to respond within 5 business days.

Please include:
- Which component is affected (dashboard / Pi server / ESP32 firmware)
- A description of the issue and its potential impact
- Steps to reproduce (local testing only — do not test against live infrastructure)

## Current Security Controls

### Pi server
- All endpoints require a bearer token (`MYCOSENSE_API_TOKEN` env var)
- CORS restricted to explicit origin list (`MYCOSENSE_ALLOWED_ORIGINS` env var)
- Batch size capped at 200 readings per POST
- Query row limit capped at 5 000 rows
- Binds to the Pi's LAN interface IP, not 0.0.0.0

### ESP32 firmware
- WiFi and MQTT credentials stored in ESP32 NVS (non-volatile storage)
- No credentials in source code
- MQTT authentication via username/password
- NTP sync required before data timestamps are trusted (`ts == -1` means not yet synced)

### Dashboard frontend
- No `dangerouslySetInnerHTML` anywhere
- All sensor values rendered through React text nodes (XSS-safe by default)
- CSV export uses RFC 4180 quoting — prevents spreadsheet formula injection
- sql.js bundled from npm (no CDN dependency)
- Content-Security-Policy configured in `vercel.json`

## Known Limitations (Pre-Field)

- MQTT messages are not signed — a device on the LAN hotspot can inject fake readings
- No replay protection on MQTT
- Pi server has no TLS — suitable for trusted LAN only
- No automatic data retention or log rotation on the Pi

These are tracked and planned for Phase 2 field hardening. See `docs/FIELD_DEPLOYMENT_SECURITY.md`.

## Out of Scope

- Attacks requiring physical access to field hardware
- Attacks against the Vercel CDN or public internet infrastructure
- DoS against the public demo (it has no real sensors)
