# Defensive Red Team and Blue Team Plan

This plan defines safe security testing for MycoSense.

## Purpose

The purpose is to improve the security and reliability of MycoSense before live field deployment.

This plan is defensive. It applies only to systems owned by Luminis Foundation or explicitly authorized for testing.

## Rules of Engagement

Allowed:

- repository review
- local development testing
- owned Raspberry Pi testing
- owned ESP32 node testing
- configuration review
- dependency review
- documentation review
- simulation of likely failure modes

Not allowed:

- testing third-party systems
- scanning public networks without written authorization
- credential harvesting
- destructive testing on field devices
- denial-of-service testing against production systems
- publishing exploit details before remediation
- touching unrelated personal or organizational systems

## Test Environments

Use these stages:

1. Documentation review
2. Local development review
3. Bench hardware review
4. Isolated field-network review
5. Pre-publication review

Do not jump to field testing until documentation and local review are complete.

## Red Team Questions

Use these questions to find weaknesses safely.

### Documentation and Claims

- Does the README overstate live deployment status?
- Are simulated data and live data clearly separated?
- Are field deployment prerequisites documented?
- Are security responsibilities clear?

### Secrets

- Are any real credentials committed?
- Are placeholder credentials clearly labeled?
- Are `.env` files excluded from Git?
- Are node secrets unique or at least planned?

### Pi Gateway

- Are write endpoints authenticated?
- Are batch sizes limited?
- Is CORS restricted for production use?
- Is the gateway intended to be local-only?
- Are logs useful for incident review?

### ESP32 Nodes

- Can a node be uniquely identified?
- Are hardcoded production credentials avoided?
- Is firmware version visible?
- Is the node inventory documented?

### Data Integrity

- Can invalid sensor payloads be rejected?
- Can obviously impossible readings be flagged?
- Is raw data separated from validated data?
- Is publication status documented?

## Blue Team Controls

Use these controls to reduce risk:

- `SECURITY.md` for policy
- `FIELD_STATUS.md` for deployment status
- `docs/SECURITY_MODEL.md` for threat model
- `docs/FIELD_DEPLOYMENT_SECURITY.md` for field checklist
- API key or per-node token for write endpoints
- local-only Pi gateway
- restricted CORS in production
- secret scanning before release
- node inventory
- incident notes for anomalies

## Finding Severity

### Critical

Immediate risk to secrets, public infrastructure, or research integrity.

Examples:

- real secrets committed
- public write endpoint exposed
- live field data published incorrectly

### High

Likely to compromise data integrity or field gateway security.

Examples:

- unauthenticated data ingestion
- unrestricted public CORS paired with exposed gateway
- no field node identity plan

### Medium

Important weakness but not immediately compromising.

Examples:

- stale documentation
- missing deployment checklist
- unclear data classification

### Low

Cleanup or clarity issue.

Examples:

- missing README links
- outdated component names
- formatting issues

## Finding Template

Use this template for each finding:

```md
## Finding: [short title]

Severity: Critical | High | Medium | Low
Component: Dashboard | Pi Server | ESP32 Firmware | Docs | Deployment
Status: Open | Fixed | Deferred

### Summary
Short description.

### Impact
What could go wrong.

### Evidence
File path, line, or safe observation.

### Recommended Fix
Defensive correction.

### Verification
How to confirm the fix safely.
```

## Blue Team Verification Checklist

Before closing a hardening pass, confirm:

- no real credentials are committed
- README links to security and field status docs
- Pi server production guidance is local-first
- firmware docs warn against committed secrets
- dashboard still builds
- simulated demo still works
- live field deployment is not overclaimed
- unresolved issues are listed as deferred

