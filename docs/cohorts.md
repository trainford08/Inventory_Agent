# Cohort profiles

The demo seed ships six fabricated teams (Alpha → Foxtrot) that together
stress-test every UI state the product will encounter. Each one is
deliberately designed to exercise a different slice of migration
complexity — from a frictionless team that barely needs review to a
rolled-back team parked on the sidelines. Every number in the app's
dashboard, review flow, and team profile derives from this data.

> Source: `prisma/cohorts/{alpha,bravo,charlie,delta,echo,foxtrot}.ts`

| Cohort                  | Tagline                     | State       | Wave | Engineers | Tier   | Classification | Health   | Effort (wks)     | Target cutover              |
| ----------------------- | --------------------------- | ----------- | ---- | --------- | ------ | -------------- | -------- | ---------------- | --------------------------- |
| **Alpha Platform**      | The easy yes                | Not started | 1    | 3         | Tier 3 | —              | On track | 4–6 (HIGH conf)  | +42 days                    |
| **Bravo Services**      | The typical healthy team    | Discovering | 1    | 6         | Tier 2 | —              | On track | 8–12 (MED conf)  | +70 days                    |
| **Charlie Toolkit**     | The interesting one         | Reviewing   | 2    | 11        | Tier 1 | FedRAMP High   | At risk  | 18–24 (MED conf) | +98 days · **2 wks behind** |
| **Delta Data Platform** | The heavyweight             | In progress | 2    | 14        | Tier 1 | FedRAMP High   | On track | 30–40 (MED conf) | +56 days                    |
| **Echo Mobile**         | The Champion still has work | Not started | 3    | 4         | Tier 2 | —              | Blocked  | — (LOW conf)     | +120 days                   |
| **Foxtrot Archive**     | The edge case               | Rolled back | —    | 2         | Tier 3 | —              | Done     | —                | —                           |

---

## Alpha Platform — "The easy yes"

Small, modern TypeScript team with one clean monorepo, a standard YAML
pipeline, no customizations, and no open risks. The agent
auto-populates almost everything; the Champion has very little to review.

- **Role in the demo:** proves the fast-path — discovery runs, most
  findings pre-accept, Champion clicks through quickly.
- **Champion:** Alex Chen (Engineering Lead) — 3 engineers
- **Codebase:** TypeScript, 2.3 GB total across `alpha-service` +
  `alpha-worker`, no LFS
- **Notable traits:** clean build pipeline, HIGH confidence on effort
  estimate (4–6 FTE-weeks), 2-week slack buffer

---

## Bravo Services — "The typical healthy team"

A normal-cadence team: eight repos, YAML-first pipelines with two classic
release definitions, a couple of ADO extensions that don't map 1:1 to
GitHub, normal workload. A handful of review items but no blockers.

- **Role in the demo:** the baseline case — some judgment calls, steady
  review pace, the median experience.
- **Champion:** Jordan Kim (Staff Engineer) — 6 engineers
- **Codebase:** multi-repo, mixed languages, ~58 active work items
- **Notable traits:** 2.5 of ~10 FTE-weeks already spent; 1-week slack;
  classic releases that need a decision on what to do post-cutover

---

## Charlie Toolkit — "The interesting one"

The richest team for surfacing real-world enterprise migration pitfalls.
Mid-size team straddling a modern C# platform and a legacy PowerShell
tooling surface. Classic build pipelines, an on-prem signing service,
**FedRAMP High** classification, and roughly a dozen genuine migration
decisions the Champion has to make.

- **Role in the demo:** every interesting review UX — NEEDS_INPUT
  findings, anomalies, low-confidence evidence, compliance-driven blockers.
- **Champion:** Rory McDonald (Principal Engineer) — 11 engineers
- **Notable traits:**
  - FedRAMP High → tenant data-residency matters (GHE.com, not github.com)
  - FedRAMP audit pipeline is classic, brittle, and blocks cutover
  - On-prem signing service has no direct GitHub equivalent
  - **At risk** health, −2 weeks of slack (already behind target)
  - Largest pool of demo-time judgment calls → best cohort to drive the
    review flow demo

---

## Delta Data Platform — "The heavyweight"

Large Scala-heavy data platform mid-flight. A 98 GB monorepo, a 38 GB
LFS-tracked data repo, submodules pointing into other ADO projects, and
canary deployments coordinated across four regions. Most decisions have
already been made; what remains is execution risk.

- **Role in the demo:** the "monster repo" case — Git LFS front-and-centre,
  submodule handling, staged cutover mechanics.
- **Champion:** Elena Volkov (Engineering Director) — 14 engineers
- **Notable traits:**
  - FedRAMP High classification (same tenancy constraint as Charlie)
  - **IN_PROGRESS** — 20 of 30–40 FTE-weeks already burned
  - Zero slack — any delay slips cutover
  - 418 active work items; pipeline activity is the heaviest of any cohort

---

## Echo Mobile — "The Champion still has work"

Cross-platform mobile team (iOS + Android) mid-review. Discovery left
several `NEEDS_INPUT` findings around signing keys, App Center
integration, and mobile-specific CI gates. The Champion hasn't answered
most yet, so completion percent sits well below peers.

- **Role in the demo:** the sluggish reviewer case — exercises the
  "needs your attention" surfaces, reminder flows, and LOW-confidence
  effort estimate states.
- **Champion:** Karen Lee (Mobile Lead) — 4 engineers
- **Notable traits:**
  - **Blocked** health; effort estimate cannot be computed (confidence: LOW)
  - No effort estimate, no slack, no target cutover yet — everything
    downstream of the Champion's input
  - Mobile-specific risks (signing keys, App Center) drive the profile
    rather than infrastructure

---

## Foxtrot Archive — "The edge case"

Rolled back after a cut-over attempt last quarter. Legacy C++ build
chain, deprecated PowerShell signing, archived repos still pinned to
classic release definitions. Parked until the LFS tooling + signing path
that Delta unblocks becomes available.

- **Role in the demo:** the `ROLLED_BACK` / `DONE` state — proves the
  product handles post-mortem and paused teams gracefully.
- **Champion:** Miranda Flint (Engineering Manager) — 2 engineers
- **Notable traits:**
  - Unassigned wave, no effort estimate, no cutover date
  - Health reads `DONE` even though migration isn't — because the team
    is intentionally parked
  - Minimal activity: only 4 active work items

---

## Design intent

The cohorts are curated so that:

1. **Every health state is represented** — On track, At risk, Blocked, Done
2. **Every lifecycle state is represented** — Not started, Discovering,
   Reviewing, In progress, Rolled back
3. **The "hero demo" team has the most interesting review** — Charlie
   Toolkit is the cohort Migration Hub demos are built around
4. **The fleet has variety that matters** — tier, classification, team
   size, effort confidence, and slack buffer all span meaningfully, so
   program-PM surfaces (dashboard, pulse, attention queue) have real
   signal to render
