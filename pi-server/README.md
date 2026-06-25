# MycoSense Pi Server

Lightweight FastAPI server for Raspberry Pi — receives readings from the MycoSense dashboard and stores them in a local SQLite database.

**Local-only.** This server is designed for a trusted LAN. Do not expose port 8765 to the internet.

## Install (on Pi)

```bash
pip install fastapi uvicorn
```

(`sqlite3` is a Python standard-library module — no pip install needed.)

## Configuration

Set environment variables before running. The server **will not accept any requests** until `MYCOSENSE_API_TOKEN` is set.

```bash
# Generate a token (do this once, save it somewhere safe):
python3 -c "import secrets; print(secrets.token_hex(32))"

# Set on the Pi (add to /etc/environment or a systemd EnvironmentFile):
export MYCOSENSE_API_TOKEN=<your-generated-token>

# CORS: comma-separated list of allowed origins (browser addresses that can call this server)
# Example: your laptop's IP on the hotspot, or the Vercel dashboard origin
export MYCOSENSE_ALLOWED_ORIGINS="http://192.168.4.100:3000"
```

Set the matching token in the dashboard `.env`:
```bash
VITE_PI_TOKEN=<same token>
```

## Run

Bind to the Pi's LAN interface IP only — never `0.0.0.0` in production:

```bash
uvicorn main:app --host 192.168.4.1 --port 8765
```

For persistent background operation, use a systemd unit:

```ini
[Unit]
Description=MycoSense Pi Server
After=network.target

[Service]
EnvironmentFile=/etc/mycosense.env
ExecStart=/usr/local/bin/uvicorn main:app --host 192.168.4.1 --port 8765
WorkingDirectory=/home/pi/mycosense/pi-server
User=pi
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## Endpoints

All endpoints require `Authorization: Bearer <token>`.

- `GET  /status`              — health check
- `POST /readings`            — ingest batch of sensor readings (max 200 per request)
- `GET  /sessions`            — list stored sessions (last 30 days)
- `GET  /readings/{sensor_id}` — query readings for one sensor (max 5 000 rows)

## Security Notes

- CORS is restricted to `MYCOSENSE_ALLOWED_ORIGINS` (defaults to `localhost:3000` only)
- Batch size is capped at 200 readings per POST
- Row query limit is capped at 5 000 rows
- The database grows indefinitely — plan for manual archival on long deployments

Full server code: `pi-server/main.py`
See also: `docs/FIELD_DEPLOYMENT_SECURITY.md`
