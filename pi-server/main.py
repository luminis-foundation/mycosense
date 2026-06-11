"""
MycoSense Pi Server
FastAPI + SQLite — runs on Raspberry Pi at mycosense.local:8765
Receives electrode readings from the MycoSense dashboard.
Stores everything locally — no cloud, no external dependencies.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3, time, json
from pathlib import Path

app = FastAPI(title="MycoSense Pi Server", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to local network in production
    allow_methods=["*"],
    allow_headers=["*"],
)

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

class Reading(BaseModel):
    id:        str
    label:     Optional[str] = None
    zone:      Optional[str] = None
    value:     float
    unit:      Optional[str] = 'mV'
    timestamp: int

class ReadingBatch(BaseModel):
    readings:  List[Reading]
    timestamp: Optional[int] = None

@app.get("/status")
def status():
    return { "status": "ok", "server": "MycoSense Pi", "time": int(time.time()) }

@app.post("/readings")
def ingest_readings(batch: ReadingBatch):
    conn   = get_db()
    now    = int(time.time() * 1000)
    cursor = conn.cursor()
    for r in batch.readings:
        cursor.execute(
            "INSERT INTO readings (sensor_id, label, zone, value, unit, timestamp, received_at) VALUES (?,?,?,?,?,?,?)",
            (r.id, r.label, r.zone, r.value, r.unit, r.timestamp, now)
        )
    conn.commit()
    count = cursor.rowcount
    conn.close()
    return { "status": "ok", "stored": len(batch.readings) }

@app.get("/sessions")
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

@app.get("/readings/{sensor_id}")
def get_sensor_readings(sensor_id: str, limit: int = 500):
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM readings WHERE sensor_id = ? ORDER BY timestamp DESC LIMIT ?",
        (sensor_id, limit)
    ).fetchall()
    conn.close()
    return { "sensor_id": sensor_id, "readings": [dict(r) for r in rows] }
