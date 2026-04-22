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

_No entries yet. Add entries as smells are identified._

---

## Cleared entries

_Move entries here once resolved, with the commit SHA that fixed them._
