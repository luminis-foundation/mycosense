# MycoSense IP Chain-of-Title — Public Audit Tracker

**Repository:** `luminis-foundation/mycosense` (public)
**Tracker status:** In progress
**Last updated:** 2026-07-10
**Owner:** Luminis Foundation (MycoSense project)

---

## 1. Purpose and scope

This tracker coordinates a chain-of-title and commit-history audit of the public
MycoSense repository in support of an ongoing counsel review. It covers only
public-safe items:

- the public pull-request timeline;
- high-level commit, license, and contributor review tasks;
- a public-safe audit checklist.

**Confidential details belong in the private audit repository, not here.**
Anything involving legal analysis, patent matters, personal information, or
sensitive historical content is tracked privately and is referenced in this
document only at a high level. Where an item is marked
*"counsel/patent-agent review required"*, the substance of that review lives in
the private audit repository.

This tracker is not legal advice and does not modify any license or rights in
this repository.

---

## 2. Public pull-request timeline

| PR | Title | Status |
|----|-------|--------|
| #1 | feat: MycoSense field research platform foundation | Merged |
| #2 | Security hardening: auth, credentials, CSV injection, CSP, NTP, docs | Merged |
| #3 | security: tighten secret ignores, token warning, and lock file | Merged |
| #4 | Copy: clarify controlled on-site prototype deployment | Merged |
| #5 | Copy: downgrade Step 2 bench status to in-progress | Merged |
| #6 | Public/Private Safety Audit: location, EIN removal, security wording, CSP | Merged |
| #7 | PR D (mycosense): Align paper citation with Zenodo record | Merged |
| #8 | PR A: EIN prevention — gitleaks config + security policy | Open |
| #9 | PR C: Add Apache-2.0 LICENSE | Closed — **not merged** |
| #10 | Licensing & IP: Source-available license, commercial terms, attribution, trademark | Open — **do not merge until counsel/board timing is confirmed** |

Notes:

- PR #9 was closed without merging; license-history verification tasks related
  to it are tracked below and in the private audit repository.
- PR #10 remains open pending counsel/board timing confirmation. It must not be
  merged as part of this audit.

---

## 3. Public-safe audit checklist

### 3.1 Commit-history review

- [ ] Export the full chronological commit log for audit records.
- [ ] Record the audit HEAD commit hash so the audited state is reproducible.
- [ ] Inventory merge commits and PR-linked commits against the PR timeline above.
- [ ] Confirm the commit history is consistent with the public PR timeline
      (no unexplained direct pushes to `main`).

### 3.2 Contributor review

- [ ] Enumerate unique commit authors and committers across all refs.
- [ ] Enumerate co-author trailers.
- [ ] Identify commits carrying AI-assistance trailers or markers, for
      attribution and provenance records.
- [ ] Map files/modules changed per contributor (high level).
- [ ] Confirm contributor identities and roles (details held privately).

### 3.3 License-history review

- [ ] Verify PR #9 (Apache-2.0 LICENSE) was closed and never merged to `main`.
- [ ] Verify whether any `LICENSE`, `LICENSE.md`, or `NOTICE` file ever existed
      on `main` at any point in history.
- [ ] Verify whether `package.json` (or other package metadata) ever declared a
      license identifier on `main`.
- [ ] Review tags, branches, and releases for any license representations.
- [ ] Review README and documentation history for license statements.
- [ ] Confirm the current licensing posture is accurately represented pending
      PR #10 — *counsel/patent-agent review required* before any licensing
      change merges.

### 3.4 Historical exposure review (handled privately)

Removal of content by a later commit does not remove it from Git history, old
blobs, PR diffs, cached views, forks, or archive snapshots. The following
reviews are therefore in scope, with all specifics tracked in the
**private audit repository**:

- [ ] Historical sensitive identifier exposure review — *tracked privately;
      counsel/patent-agent review required.*
- [ ] Historical sensitive location-detail exposure review — *tracked
      privately; counsel/patent-agent review required.*
- [ ] Remediation planning for any residual historical exposure — *tracked
      privately; requires board/admin/counsel approval before any repository
      remediation action.*

No history rewrite, force-push, or other repository remediation is performed
as part of this tracker.

### 3.5 Public-disclosure timeline (high level)

- [ ] Compile a public-safe timeline of when this repository and related public
      materials first became publicly visible — *detailed register maintained
      privately; counsel/patent-agent review required.*

---

## 4. Working rules for this audit

1. No pushes to `main`; all audit work happens on branches via pull requests.
2. No history rewrites and no force-pushes.
3. Nothing in this public tracker may contain personal identifiers, precise
   private location details, legal drafts, or confidential strategy.
4. When in doubt about whether an item is public-safe, it goes to the
   **private audit repository** first.

---

*Questions about this tracker should be raised through Luminis Foundation
project channels. Confidential material must never be added to this file.*
