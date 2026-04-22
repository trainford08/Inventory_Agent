# CLAUDE.md — Migration Hub

## Project identity

Migration Hub is an AI-first migration surface that moves Microsoft developers from Azure DevOps to GitHub. We are building a high-fidelity, interactive prototype for an interview demo. The prototype becomes the v1 of the real product — nothing gets thrown away.

## The thesis (load-bearing)

The data model is the spine. Every screen, API endpoint, component, and piece of business logic is an expression of the schema. Schema changes → type regenerates → every consumer gets compile errors → we fix them → we ship. This chain is how design flexibility is preserved through rapid iteration.

## Stack

- TypeScript (strict)
- Next.js 16 (App Router, src/ directory)
- React 19
- Tailwind CSS 4
- Prisma + Postgres (Neon)
- Zod (runtime validation)
- Auth.js (authentication — stubbed until M2)
- tRPC (typed API)
- Vitest + Testing Library (unit, component)
- Playwright (E2E, visual)
- Vercel (deploy)

## Hard rules

- Do NOT change `prisma/schema.prisma` without running `prisma migrate dev` afterwards.
- Do NOT ship a task without running `npm run typecheck && npm run lint && npm run test`. All three must pass locally before pushing.
- Do NOT modify `prisma/schema.prisma` without walking the 10-smell schema health checklist. If smells are introduced, either fix in the PR or log in `/docs/schema-debt.md`.
- Do NOT create a new component before searching `/src/components` for an existing one that fits.
- Do NOT write inline styles, raw CSS files, or CSS-in-JS. Use Tailwind utility classes exclusively.
- Do NOT use `any` in TypeScript. If you truly need escape-hatch typing, use `unknown` and narrow.
- Do NOT fetch data in client components. All DB/API calls go through tRPC or Server Components.
- Do NOT commit `.env`, `.env.local`, or any file with real secrets.

## Working style

- Propose before building. For any scope item, summarize (1) files you'll create/edit, (2) user-observable outcome, (3) what could go wrong. Wait for confirmation.
- One story at a time. Do not start M3 work before M1 and M2 are complete.
- Run typecheck, lint, AND tests before "done."
- Walk the schema-health checklist when `prisma/schema.prisma` changes.
- Show before ship (screenshot or URL).
- Rollback is the first tool, not the last. `git reset --hard HEAD` is always an option.
- When unsure, ask. Never assume a convention the repo doesn't already establish.

## Naming conventions (strict)

- Team _profile_ — the structured data model describing a team (identity, codebase, workflows, JTBDs, customizations, risks, ownership). Distinct from a _persona_. If user personas are introduced later, they are a different concept — do not conflate in code, UI, or docs.
- _Champion_ (never "POC", "lead")
- Migration _approach_ (never "strategy" at the top level)
- _Cohort_ — a grouping of teams
- _Agent_ — any autonomous process
- _JTBD_ — job-to-be-done
- _Wave_ — a batch of teams migrated together

### Data model summary

Every Team has: identity (name, slug, org), codebase (repos, language, LFS, size), workflows (pipelines, release processes), JTBDs performed, customizations, risks, ownership. See `prisma/schema.prisma` for the full schema.

## Data model summary

Every Team has: identity (name, slug, org), codebase (repos, language, LFS, size), workflows (pipelines, release processes), JTBDs performed, customizations, risks, ownership. See `prisma/schema.prisma` for the full schema.

## Key user flows (build order — see /docs/stories/)

1. M1 — Champion reviews and completes their team profile (demo spine) ← **START HERE**
2. M2 — Program PM monitors program health via dashboard
3. M3 — Agent runs discovery and populates a team profile
4. M4 — Champion uses Ada to answer migration questions
5. M5 — Champion executes cut-over with runbook guidance
6. M6 — Admin defines cohorts and assigns teams to waves
7. M7 — Agent runs post-migration validation
8. M8 — Program PM reviews risks and mitigations across fleet

## Test data sourcing policy

Fabricated cohort profiles (Alpha, Bravo, Charlie, Delta, Echo, Foxtrot) derived from real, public Microsoft team patterns — anonymized, synthesized, never copied verbatim. Seed data lives in `prisma/seed.ts`. Six cohorts with distinct characteristics stress-test every UI state the product will encounter.

## Where to look

- **Repo structure**: see `README.md`
- **Stories**: see `/docs/stories/M*.md`
- **Prototype done definition**: see `/docs/DONE.md`
- **Schema health checklist**: see `/docs/schema-health.md`
- **Schema debt log**: see `/docs/schema-debt.md`
- **Testing strategy**: see `/docs/testing.md`
