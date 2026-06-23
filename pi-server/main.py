"""
MycoSense Pi Server
FastAPI + SQLite — runs on Raspberry Pi at mycosense.local:8765
Receives electrode readings from the MycoSense dashboard.
Stores everything locally — no cloud, no external dependencies.

Required environment variables (set in /etc/environment or a systemd unit):
  MYCOSENSE_API_TOKEN  — bearer token for all endpoints.
                         Generate: python3 -c "import secrets; print(secrets.token_hex(32))"
  MYCOSENSE_ALLOWED_ORIGINS — comma-separated CORS origins allowed to call this server.
                         Example: "http://192.168.4.100:3000,https://mycosense.vercel.app"
                         Defaults to localhost only if unset.
"""

from fastapi import FastAPI, Depends, HTTPException, status as http_status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional
import sqlite3, time, os
from pathlib import Path

app = FastAPI(title="MycoSense Pi Server", version="1.1.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
_origins_env  = os.environ.get("MYCOSENSE_ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = [o.strip() for o in _origins_env.split(",") if o.strip()] \
                  or ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

# ── Auth ──────────────────────────────────────────────────────────────────────
_API_TOKEN = os.environ.get("MYCOSENSE_API_TOKEN", "")
_security  = HTTPBearer(auto_error=True)

async def verify_token(creds: HTTPAuthorizationCredentials = Depends(_security)):
    if not _API_TOKEN:
        raise HTTPException(
            status_code=http_status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Server misconfigured: MYCOSENSE_API_TOKEN is not set",
        )
    if creds.credentials != _API_TOKEN:
        raise HTTPException(
            status_code=http_status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ── Constants ─────────────────────────────────────────────────────────────────
MAX_BATCH_SIZE = 200    # readings per POST
MAX_LIMIT      = 5000   # rows per GET /readings/{sensor_id}

DB_PATH = Path(__file__).parent / "mycosense.sqlite"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS readings (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            sensor_id   TEXT NOT NULL,
            label       TEXT,
            zone        TEXT,
            value       REAL NOT NULL,
            unit        TEXT DEFAULT 'mV',
            timestamp   INTEGER NOT NULL,
            received_at INTEGER NOT NULL
        )
    """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_sensor    ON readings(sensor_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_timestamp ON readings(timestamp)")
    conn.commit()
    conn.close()

init_db()

# ── Models ────────────────────────────────────────────────────────────────────
class Reading(BaseModel):
    id:        str            = Field(..., max_length=64)
    label:     Optional[str] = Field(None, max_length=128)
    zone:      Optional[str] = Field(None, max_length=128)
    value:     float
    unit:      Optional[str] = Field('mV', max_length=16)
    timestamp: int

class ReadingBatch(BaseModel):
    readings:  List[Reading]
    timestamp: Optional[int] = None

# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/status", dependencies=[Depends(verify_token)])
def get_status():
    return { "status": "ok", "server": "MycoSense Pi", "time": int(time.time()) }

@app.post("/readings", dependencies=[Depends(verify_token)])
def ingest_readings(batch: ReadingBatch):
    if len(batch.readings) > MAX_BATCH_SIZE:
        raise HTTPException(
            status_code=http_status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Batch too large (max {MAX_BATCH_SIZE} readings per request)",
        )
    conn   = get_db()
    now    = int(time.time() * 1000)
    cursor = conn.cursor()
    for r in batch.readings:
        cursor.execute(
            "INSERT INTO readings (sensor_id, label, zone, value, unit, timestamp, received_at) VALUES (?,?,?,?,?,?,?)",
            (r.id, r.label, r.zone, r.value, r.unit, r.timestamp, now)
        )
    conn.commit()
    conn.close()
    return { "status": "ok", "stored": len(batch.readings) }

@app.get("/sessions", dependencies=[Depends(verify_token)])
def get_sessions():
    conn = get_db()
    rows = conn.execute("""
        SELECT
            DATE(timestamp/1000, 'unixepoch') as date,
            MIN(timestamp) as start_ms,
            MAX(timestamp) as end_ms,
            COUNT(*) as reading_count,
            COUNT(DISTINCT sensor_id) as sensor_count
        FROM readings
        GROUP BY DATE(timestamp/1000, 'unixepoch')
        ORDER BY date DESC
        LIMIT 30
    """).fetchall()
    conn.close()
    return { "sessions": [dict(r) for r in rows] }

@app.get("/readings/{sensor_id}", dependencies=[Depends(verify_token)])
def get_sensor_readings(sensor_id: str, limit: int = 500):
    limit = min(max(1, limit), MAX_LIMIT)
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM readings WHERE sensor_id = ? ORDER BY timestamp DESC LIMIT ?",
        (sensor_id, limit)
    ).fetchall()
    conn.close()
    return { "sensor_id": sensor_id, "readings": [dict(r) for r in rows] }
