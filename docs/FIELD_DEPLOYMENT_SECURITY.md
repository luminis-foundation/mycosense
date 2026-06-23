# Field Deployment Security Checklist

This checklist applies before any MycoSense hardware is deployed outside a controlled bench-test environment.

## Deployment Rule

Do not mark MycoSense as field-deployed until all of the following are true:

- hardware has been purchased
- firmware has been flashed
- bench testing has passed
- Pi gateway has been configured
- field enclosure and power have been tested
- deployment location has been recorded
- first live data collection has been validated

## Pre-Deployment Inventory

For each node, record:

- node ID
- hardware board type
- firmware version
- flash date
- physical label
- sensor package
- electrode type
- deployment zone
- expected power source
- assigned secret or credential status
- maintainer

## Secrets and Credentials

Before deployment:

- remove real WiFi passwords from source files
- remove real MQTT passwords from source files
- remove API keys from source files
- store node secrets outside Git
- use one secret per field node where practical
- rotate any secret that was committed during testing

Development placeholders are acceptable only when clearly marked as examples.

## Raspberry Pi Gateway Hardening

Before deployment:

- change default user passwords
- disable password SSH if key-based SSH is available
- disable unnecessary services
- enable firewall rules
- allow inbound traffic only from expected local devices
- avoid public port forwarding
- avoid exposing the Pi server directly to the public internet
- back up the SQLite database before resetting the device
- verify time synchronization if timestamps matter

## Pi Server API Expectations

The Pi server should:

- require authentication for write endpoints
- validate payload shape
- limit batch size
- reject unknown or oversized payloads
- log rejected writes without storing sensitive tokens
- restrict CORS in production
- return minimal error details to clients

## ESP32 Node Expectations

Each node should:

- have a unique node ID
- use a unique secret or gateway allowlist entry where practical
- identify firmware version in boot/status output
- avoid storing production secrets in public firmware files
- support serial bench testing without requiring cloud services
- publish only expected JSON fields

## MQTT Expectations

For prototype field deployments:

- keep MQTT on the local field network
- avoid unauthenticated public brokers
- use username/password or a pre-shared token if supported
- use topic names that do not leak sensitive field site details
- log node online/offline status

For future deployments:

- evaluate MQTT over TLS or a secure local tunnel
- evaluate signed payloads
- evaluate per-node topic permissions

## Physical Security

For each deployed enclosure:

- use weather-resistant housing
- protect cable entry points
- label the device with non-sensitive identifier only
- avoid public display of network credentials
- record enclosure condition at install
- inspect for tampering after storms or maintenance visits

## Data Protection

Field data should be classified before publication:

- public demo data
- internal raw field data
- validated research data
- publication-ready dataset

Do not publish raw field data automatically. Validate sensors, timestamps, calibration, and metadata first.

## Field Maintenance Checklist

During each field visit:

- inspect enclosure
- inspect power system
- inspect electrodes and cabling
- check node ID and firmware version
- export or back up local data
- record abnormal readings
- document physical changes
- rotate credentials if compromise is suspected

## Incident Response Trigger Conditions

Open an incident note if any of these occur:

- unknown device appears on the field network
- unexpected gateway exposure is discovered
- suspicious writes appear in the database
- field node is missing or physically altered
- secrets are committed to Git
- public site displays live data before approval
- dataset is published with incorrect live/simulated status

