# MycoSense Security Model

This document defines the defensive security model for MycoSense.

## Purpose

MycoSense is a local-first ecological sensing platform. It combines a browser dashboard, simulated and live data ingestion paths, Raspberry Pi gateway software, ESP32 firmware, and future field-deployed sensor nodes.

The security model exists to prevent:

- accidental public exposure of local field devices
- unauthorized data ingestion
- tampering with sensor readings
- leakage of WiFi, MQTT, API, or deployment secrets
- confusion between simulated data and live field data
- avoidable loss of research data

## System Components

### Dashboard

The dashboard visualizes sensor and weather readings. In public demo mode, it should run on simulated or mock data unless live publication is explicitly approved.

### Raspberry Pi Gateway

The Pi gateway receives readings and stores local data. It should be treated as field infrastructure, not a public web service.

### ESP32 Nodes

ESP32-C6 or ESP32-S3 nodes collect electrode and environmental readings. They may publish over serial, MQTT, or local network pathways depending on configuration.

### Data Store

The current Pi server stores readings locally. Any future public datasets should be validated, documented, and released intentionally.

## Trust Boundaries

### Boundary 1: Public Internet to Dashboard

Public users may view the demo dashboard. They should not be able to write sensor data, access gateway endpoints, or discover field network details.

### Boundary 2: Dashboard to Pi Gateway

The dashboard may send or receive local data when configured for live hardware. This boundary needs authentication and network restrictions before deployment.

### Boundary 3: ESP32 Node to Pi Gateway

Field nodes should identify themselves and eventually authenticate messages. Unsigned or unauthenticated readings should be considered provisional.

### Boundary 4: Local Field Network to Foundation Systems

The field network should remain isolated unless a deliberate sync workflow is implemented and reviewed.

### Boundary 5: Research Data to Public Dataset

Raw field readings should not become public automatically. Data must be validated, labeled, and reviewed before publication.

## Assets

Important assets include:

- live sensor data
- calibration data
- node identifiers
- field site metadata
- WiFi credentials
- MQTT credentials
- API keys or pre-shared tokens
- local SQLite databases
- firmware source and release versions
- published datasets
- provenance hashes

## Threats

### T1: Public Exposure of Pi Gateway

A Pi gateway listening on all interfaces can be accidentally exposed through router, tunnel, or cloud proxy configuration.

Primary controls:

- local network only
- firewall rules
- authentication on write endpoints
- no public port forwarding
- documented deployment checklist

### T2: Unauthorized Sensor Data Injection

If write endpoints accept unauthenticated data, an attacker or misconfigured client could inject false readings.

Primary controls:

- API key or per-node secret
- payload validation
- batch size limits
- source logging
- future message signing

### T3: Credential Leakage

Hardcoded WiFi or MQTT credentials in source code can leak through Git history or public forks.

Primary controls:

- placeholders only in repository
- `.env.example` for examples
- field secrets stored outside Git
- secret scanning before release

### T4: Node Spoofing

A rogue device could imitate a node identifier and submit fake readings.

Primary controls:

- node inventory
- per-node secret
- gateway allowlist
- signed or keyed messages in later versions
- anomaly detection for impossible readings

### T5: Physical Tampering

Field nodes may be accessible to weather, animals, visitors, or malicious actors.

Primary controls:

- tamper-resistant enclosure
- physical labels
- inspection checklist
- deployment log
- unexpected-reset monitoring

### T6: Research Overclaiming

A public repository can accidentally imply live deployment or field validation before it happens.

Primary controls:

- `FIELD_STATUS.md`
- cautious README language
- milestone review
- explicit distinction between simulated and field-verified data

## Baseline Controls

Before field deployment:

- remove real credentials from firmware
- add API key enforcement for write endpoints
- restrict CORS for the Pi server
- document firewall rules
- create node inventory
- define data retention and backup process
- validate build and run instructions
- review public documentation for overclaiming

## Deferred Controls

These controls are recommended after the prototype stage:

- message signing for sensor payloads
- rotating node secrets
- MQTT TLS or encrypted tunnel where practical
- firmware integrity checks
- automated dependency scanning
- reproducible firmware release builds
- device attestation or boot measurements if hardware allows

## Security Review Cadence

Review this model:

- before first field deployment
- after adding new ingestion endpoints
- after changing firmware communication paths
- before publishing live datasets
- after any suspected security incident

