# Schema Debt Log

Running log of schema tech debt identified but deferred. Drain at tier boundaries.

## How to use

When the schema-health checklist (see `/docs/schema-health.md`) surfaces a smell that isn't worth fixing in the current PR, add an entry here.

## Template

An entry has these parts:

- **Smell number** — which of the 10 from schema-health.md (01 through 10)
- **Introduced in** — commit SHA or PR number
- **What's wrong** — one-sentence description
- **Proposed fix** — one-sentence description
- **Blocker to fix now** — why deferring (e.g., "requires data migration across 3 models")
- **Target refresh** — Tier 1 / Tier 2 / Tier 3

## Log

### Entry 1 — Effort/planning fields on `Team`

- **Smell number** — 05 (fields that belong in a new model)
- **Introduced in** — team_profile_fidelity migration (M1 fidelity pass)
- **What's wrong** — Six planning-related fields on `Team` (`effortEstimateLowWeeks`, `effortEstimateHighWeeks`, `effortConfidence`, `effortProgressWeeks`, `targetCutoverAt`, `slackWeeks`) describe a distinct concept (migration plan / estimate) that may need versioning over time.
- **Proposed fix** — Extract to a `MigrationPlan` model with its own history. `Team.currentPlanId` points to the active plan.
- **Blocker to fix now** — Demo prototype has a single snapshot per team; versioning has no user-observable benefit yet. Adding a model adds query complexity without product payoff at M1.
- **Target refresh** — Tier 2 (after M6, when cohorts/waves introduce real planning cadence)

### Entry 3 — Discovery snapshot counters on `Team`

- **Smell number** — 05 (fields that belong in a new model)
- **Introduced in** — realistic_discovery_run migration
- **What's wrong** — `workItemsActive`, `workItemsClosed90d`, `buildArtifactCount`, `wikiPageCount` are point-in-time snapshot values that really belong on `AgentRun` or a dedicated `DiscoverySnapshot` model.
- **Proposed fix** — Move these counters to `AgentRun` so they carry the run's timestamp + agent context, not ambient on `Team`.
- **Blocker to fix now** — Demo treats the latest run as canonical; no historical comparison is required yet.
- **Target refresh** — Tier 2 (when M8 introduces fleet-level trend views)

### Entry 4 — `visibility`, `authMethod`, `category` as String on new ADO models

- **Smell number** — 01 (string field shadowing enum)
- **Introduced in** — realistic_discovery_run migration
- **What's wrong** — `AdoProject.visibility` (private/public), `ServiceConnection.authMethod` (small set), `Extension.category` (small set), `ReleaseDefinition.gateTypes[]` (small set) are Strings for speed but are drawn from known enums.
- **Proposed fix** — Promote to enums once the canonical lists stabilize.
- **Blocker to fix now** — Catalog of authMethod values and gateTypes is still evolving as real discovery runs reveal new patterns. Premature enum churn.
- **Target refresh** — Tier 1 (before M3, when real agent output drives canonical lists)

### Entry 2 — `securityClassification` as String

- **Smell number** — 01 (string field shadowing enum)
- **Introduced in** — team_profile_fidelity migration (M1 fidelity pass)
- **What's wrong** — `Team.securityClassification` is a `String` but values are drawn from a small well-known set (FedRAMP High, FedRAMP Moderate, DoD IL5, etc.).
- **Proposed fix** — Promote to `SecurityClassification` enum once we validate the canonical set with the real Microsoft context.
- **Blocker to fix now** — We don't yet know the authoritative list; enumerating early could force rename later. Safer as String until we see real data.
- **Target refresh** — Tier 1 (before M3, when agent discovery populates this field from real ADO data)

---

## Cleared entries

_Move entries here once resolved, with the commit SHA that fixed them._
