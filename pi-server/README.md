# MycoSense Pi Server

Lightweight FastAPI server for Raspberry Pi — receives readings from the MycoSense dashboard and stores them in a local SQLite database.

## Install (on Pi)
```bash
pip install fastapi uvicorn sqlite3
```

## Run
```bash
uvicorn main:app --host 0.0.0.0 --port 8765
```

## Endpoints
- `GET  /status`   — health check
- `POST /readings` — ingest batch of sensor readings
- `GET  /sessions` — list all stored sessions

Full server code: `pi-server/main.py`
