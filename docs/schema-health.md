# Schema Health Checklist

This is the authoritative checklist for schema tech debt. Walk all 10 smells whenever you modify `prisma/schema.prisma`. If any smell is introduced, either fix in the PR or log in `/docs/schema-debt.md`.

## How to use

1. Before pushing a PR that touches `prisma/schema.prisma`, walk all 10 smells against the diff.
2. For each smell, write down: did this PR introduce it, leave it unchanged, or fix an existing case?
3. If introduced and not fixable now: add an entry to `/docs/schema-debt.md`.
4. Every tier boundary (after M1, M3, M6), run the deep refresh — fix everything in the debt log.

## The 10 smells

### 01. String fields shadowing enums

A `String` field that gets filtered/compared against a fixed set of values should be an `enum`. String enums typo-silently; real enums fail at compile time.

**Example of the smell:**

```prisma
category String  // "Code & repos", "Pipelines", "Auth"
```

**The fix:**

```prisma
category RiskCategory

enum RiskCategory {
  CODE_AND_REPOS
  PIPELINES
  AUTH
}
```

### 02. Duplicate nullable fields

Two nullable fields on the same model describing the same concept. One should win; the other deleted or refactored.

**Example of the smell:**

```prisma
cohort         Cohort?
assignedCohort String?   // duplicates meaning of cohort
```

### 03. JSON blobs being queried

A `Json` or `String` field storing structured data that code parses to filter/sort/group. Once you query inside the blob, the blob should be structured fields.

**Example of the smell:**

```prisma
metadata Json  // ...but code does JSON.parse(metadata).frequency to filter
```

### 04. State encoded in multiple booleans

Three boolean flags modeling one concept. Should be one enum with the valid states. Boolean combos allow impossible states.

**Example of the smell:**

```prisma
isStarted   Boolean @default(false)
isCompleted Boolean @default(false)
isFailed    Boolean @default(false)
```

### 05. Fields that belong in a new model

Appending `lastAgentRunAt`, `lastAgentRunId`, `lastAgentRunCount` to `Team` when those describe a distinct concept (e.g., `AgentRunSummary`). Keep Team focused on team identity.

### 06. Missing junction tables

A relation modeled as 1-many that is now many-many in practice. If a Risk affects multiple Teams, or an Agent produces Findings for multiple AgentRuns, you need a junction model.

### 07. Orphan fields

Fields defined in `schema.prisma` that are never referenced in code, fixtures, or API surfaces. Dead weight that still loads on every query. Delete or explain why they stay.

### 08. Naming drift

Same concept referenced by different names across models (`migrationApproach`, `migrationStrategy`, `approachType`). CLAUDE.md names the canonical term. Schema should match.

### 09. Missing audit fields where they matter

Fields updated by both humans and agents without `updatedBy` / `updatedSource`. If the UI surfaces "who changed this," the schema must record it.

### 10. Missing indexes on filter columns

A field used in `WHERE` or `ORDER BY` without `@@index` or `@unique`. Cheap to add early; expensive to add after tables grow.

## Two-layer cadence

**Per PR — light check (5 minutes):** Walk the 10 smells against the schema diff. If a smell is present but not worth fixing in this PR, log it in `/docs/schema-debt.md`.

**Per tier — deep refresh (1–2 hours):** At the end of each tier (after M1, M3, M6), dedicated refactor PR. Drain the debt log. No new features.

## Automation path

- **Phase 1 (now):** Manual checklist only
- **Phase 2:** `prisma format` + `prisma validate` in CI (smells 06, 10)
- **Phase 3:** Custom `npm run schema:check` script (smells 01, 07, 08)
- **Phase 4:** AST-based analysis cross-referencing codebase usage (smells 02, 03, 05, 09)

Never skip Phase 1 because later phases exist. Tooling catches what it knows to look for; humans catch what tooling doesn't yet.
