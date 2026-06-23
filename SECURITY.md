# Security Policy

MycoSense is a Luminis Foundation research project for local-first ecological sensing, simulated dashboard operation, and future field hardware deployments.

This policy defines how security issues should be handled for the `luminis-foundation/mycosense` repository.

## Supported Scope

Security review applies to:

- React dashboard code in `src/`
- Raspberry Pi gateway code in `pi-server/`
- ESP32 firmware in `esp32-firmware/`
- configuration examples such as `.env.example`
- documentation for deployment, field nodes, and data handling

The current public demo is expected to run in mock or simulated data mode unless explicitly configured otherwise.

## Current Deployment Position

MycoSense should be treated as a research prototype and field-readiness scaffold until live hardware has been purchased, flashed, tested, installed, and validated.

Do not describe MycoSense as field-deployed or field-verified until real hardware has collected validated live data in the intended environment.

## Reporting Vulnerabilities

If you find a vulnerability, report it privately to the Luminis Foundation maintainer rather than opening a public issue with exploit details.

Recommended report contents:

- affected file or component
- short description of the issue
- impact assessment
- safe reproduction notes, if applicable
- recommended fix
- whether any secrets, credentials, or private data may have been exposed

Do not include working exploit code, credential material, private keys, or destructive instructions in a public issue.

## Security Principles

MycoSense follows these principles:

1. Local-first by default.
2. No public internet exposure for field gateways unless a dedicated security review approves it.
3. No real credentials in Git.
4. Per-device identity for field nodes.
5. Least privilege for services, tokens, and network access.
6. Clear separation between simulated demo mode and live field mode.
7. Evidence preservation for research data and incident response.
8. Defensive testing only, limited to systems owned or explicitly authorized by Luminis Foundation.

## Secrets Policy

Never commit:

- WiFi passwords
- MQTT passwords
- API keys
- private keys
- SSH keys
- Vercel tokens
- GitHub tokens
- production `.env` files
- field node secrets

Use `.env.example` for placeholders only. Real secrets should be stored outside the repository and injected at deployment time.

## Field Node Security Expectations

Before live field deployment, each node should have:

- unique node identifier
- unique pre-shared secret or equivalent device credential
- documented firmware version
- documented flash date
- physical label matching the deployment record
- tamper inspection procedure
- local data retention and recovery plan

## Raspberry Pi Gateway Security Expectations

Before live field deployment, the Pi gateway should:

- run only on the local research network
- use a non-default admin password
- disable unnecessary services
- restrict inbound network access
- require authentication for write endpoints
- avoid permissive CORS in production
- log ingestion events and service errors
- back up local data before field reset or redeploy

## Public Demo Security Expectations

The public demo should:

- use mock or simulated data unless live publication is approved
- avoid exposing private network addresses or secrets
- avoid accepting arbitrary untrusted sensor submissions from the public internet
- clearly label simulated data where appropriate

## Defensive Testing Rules

Allowed:

- code review
- dependency review
- configuration review
- local test environment validation
- owned-device network exposure review
- authentication and authorization verification
- log review
- data integrity checks

Not allowed in this project workflow:

- targeting third-party systems
- credential harvesting
- persistence testing against systems not owned by Luminis Foundation
- destructive testing on field devices
- public release of exploit steps before remediation

## Minimum Review Before Field Deployment

Before the first physical deployment, complete:

- `docs/SECURITY_MODEL.md`
- `docs/FIELD_DEPLOYMENT_SECURITY.md`
- `docs/RED_BLUE_TEAM_PLAN.md`
- node inventory
- Pi gateway checklist
- backup and incident response procedure
- field data classification decision

