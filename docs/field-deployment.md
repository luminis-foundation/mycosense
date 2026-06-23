# Field Deployment Protocol

This document describes how to verify the dashboard in **mock mode**, prepare for a **live hardware session**, and complete the post-session data archival workflow.

---

## 1. Mock Mode (No Hardware Required)

Mock mode is the default when `VITE_SENSOR_WS_URL` is not set. It generates synthetic electrode signals that exercise all signal processing paths.

### Verification checklist

- [ ] Run `npm run dev` — dashboard loads at `http://localhost:3000`
- [ ] Header shows **Mock** status indicator (not Live)
- [ ] All 6 sensor cards show animated waveforms and updating health scores
- [ ] Ecosystem score updates every 500 ms
- [ ] Notifications drawer receives occasional spike and fatigue alerts
- [ ] Export → CSV produces a downloadable file with correct headers
- [ ] Export → JSON produces a v1-schema-compatible file

Mock mode is **not suitable for research data collection**. Use it for UI development, demos, and schema validation only.

---

## 2. Live Hardware Mode Pre-Flight

### 2a. Environment setup

```bash
cp .env.example .env
# Edit .env and set:
# VITE_SENSOR_WS_URL=ws://<pi-ip>:8765
npm run build
```

Serve the built `dist/` from a local web server (e.g. `npx serve dist`) or from the Pi itself.

### 2b. Pre-deployment hardware checklist

- [ ] All ESP32 nodes powered and joined to the local WiFi network
- [ ] Raspberry Pi coordinator running the `pi-server` process
- [ ] Dashboard WebSocket status shows **Live** (top right of header)
- [ ] All 6 sensor cards show non-zero readings
- [ ] No persistent OFFLINE alerts in the notifications drawer

### 2c. Electrode placement by zone

| Zone | Depth / Position | Electrode IDs | Notes |
|---|---|---|---|
| Rhizosphere A | 12–15 cm below surface | E01, E02 | Root-zone contact; moisten soil before insertion if dry |
| Substrate B | 5 cm depth in mycelial block | E03, E04 | Maintain flush contact with substrate surface |
| Canopy C | 2 cm above substrate surface, aerial | E05, E06 | Shield from direct sunlight to avoid thermal drift |

Place electrodes a minimum of **20 cm apart** to reduce capacitive coupling between nodes.

---

## 3. Session Lifecycle

### Step 1 — Calibrate

1. With all electrodes in place and the network stable, open **Calibration** in the dashboard.
2. Allow electrodes to equilibrate for **5 minutes** before capturing baselines.
3. Click **Capture Baseline** for each electrode. The system records a 30-sample rolling mean as the zero reference.
4. Calibration data is saved to `localStorage` and persists across page reloads.

### Step 2 — Collect

- Minimum recommended session length: **30 minutes**
- Optimal session: **2–4 hours** (covers diurnal variation in light and temperature)
- The data logger buffers up to 50,000 readings (≈14 hours at 500 ms intervals)
- Pi sync uploads batches automatically; verify the Pi `/status` endpoint shows readings accumulating

### Step 3 — Export

At session end, open **Export** and:

1. Click **Download CSV** — saves a timestamped `.csv` file to your downloads folder
2. Click **Download JSON** — saves a v1-schema-compatible `.json` file
3. Optionally click **Download SQLite** for a queryable `.sqlite` database
4. Click **Generate Provenance Hash** and record the SHA-256 hash for archival

### Step 4 — Archival

- Upload CSV/JSON to the Luminis Foundation data repository or a Zenodo deposit
- Include the provenance hash in the deposit metadata
- Cross-reference with the session log (date, site, electrode layout, weather notes)
- See `docs/ethics-and-privacy.md` before including location data in public deposits

---

## 4. Switching Between Mock and Live Mode

| Condition | Mode | How to confirm |
|---|---|---|
| `VITE_SENSOR_WS_URL` not set | Mock | Header badge: **Mock** |
| `VITE_SENSOR_WS_URL` set, server reachable | Live | Header badge: **Live** |
| `VITE_SENSOR_WS_URL` set, server unreachable | Reconnecting → Mock fallback | Header badge: **Reconnecting** then **Mock** after 8 retries |

To force mock mode during a live build for testing purposes, clear `VITE_SENSOR_WS_URL` in `.env` and rebuild.
