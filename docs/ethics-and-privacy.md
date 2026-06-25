# Ethics and Privacy Policy

MycoSense is an open-science research tool. The following policies apply to all data collected, stored, or published using this platform.

---

## 1. No Private Land GPS Coordinates

**Do not store precise GPS coordinates for deployments on private land.**

- Location metadata in the v1 schema uses a coarse **100 m grid reference** (`gridRef`) and a **named site** (`siteName`) only.
- Precise coordinates can identify private property, compromise landowner privacy, and expose research sites to disturbance.
- For public land deployments, a grid reference is still preferred over exact GPS in published datasets.
- If GPS coordinates are recorded in field notes for internal navigation, they must not be included in any public data deposit.

**Acceptable location example:**
```json
"location": {
  "siteName": "Pecos Canyon Research Plot A",
  "gridRef": "13SDV5070",
  "elevationM": 2100
}
```

**Not acceptable in published data:** `{ "lat": 35.5738, "lon": -105.6821 }`

---

## 2. No Volunteer PII in Session Data

MycoSense session files must not contain personally identifying information about volunteers or researchers.

- `sessionId` must be an opaque identifier (e.g. a UUID or `YYYY-MM-DD-plot-ref`). It must not contain names, email addresses, usernames, or device identifiers.
- Do not include researcher names, affiliations, or contact details in exported CSV/JSON/SQLite files intended for public deposit.
- Field notes, lab notebooks, and internal coordination documents that contain names are separate from research data exports and must not be committed to this repository.

---

## 3. No Unverified Environmental Health Claims

Signal labels in MycoSense (**Healthy**, **Moderate**, **Stressed**) describe **electrode signal variance bands**, not verified ecological states.

- A "Stressed" reading means the signal variance has fallen outside the normal band defined in `thresholds.js`. It does not mean the mycelium network or ecosystem is objectively stressed.
- MycoSense does **not** provide a certified diagnostic of soil health, mycelium vitality, biodiversity, or any regulatory environmental indicator.
- Publications, reports, or public communications derived from MycoSense data must include a statement such as: *"Signal health labels reflect electrochemical variance thresholds and are not independently validated ecological diagnostics."*
- Do not use MycoSense outputs as the sole basis for land management decisions or regulatory submissions.

---

## 4. Data Retention and Deletion

- The browser data logger caps its in-memory buffer at 50,000 readings. Data not exported before the session is closed is lost.
- Calibration baselines are persisted to `localStorage` and are device-specific. They can be cleared from the Calibration panel at any time.
- Pi-server stored sessions should be reviewed and deleted after archival to a secure repository. Do not leave raw session files on field hardware indefinitely.
- If a dataset is found to contain PII or private coordinates after archival, contact the Luminis Foundation data steward to arrange correction or removal.

---

## 5. Responsible Communication

- When sharing dashboard screenshots or recordings publicly, ensure no PII or precise location data is visible in the UI.
- The Ecosystem Score is a derived metric for monitoring trend changes across a single deployment. It is not comparable between different sites, electrode types, or substrate conditions without cross-calibration.

---

*These policies apply to all contributors and field researchers using MycoSense under the Luminis Foundation research program.*
