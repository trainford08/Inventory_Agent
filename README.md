# Migration Hub

An AI-first migration surface that moves Microsoft developers from Azure DevOps to GitHub.

Built as a high-fidelity interactive prototype for an interview demo. Architected so the prototype becomes the v1 of the real product — nothing gets thrown away.

## The thesis

The data model is the spine. Every screen, API endpoint, component, and piece of business logic is an expression of the schema. Schema changes → TypeScript regenerates → every consumer gets compile errors → we fix them → we ship.

## Stack

TypeScript · Next.js 16 (App Router, src/ directory) · React 19 · Tailwind CSS 4 · Prisma + Postgres (Neon) · Zod · tRPC · Auth.js · Vitest · Playwright · Vercel

## Local setup

    npm install
    # Edit .env with your DATABASE_URL
    npx prisma migrate dev
    npm run dev

## Daily commands

    npm run dev             # http://localhost:3000
    npm run typecheck       # Verify TypeScript
    npm run lint            # Run ESLint
    npm run test            # Unit + component tests (Vitest)
    npm run test:e2e        # Playwright end-to-end
    npm run test:visual     # Playwright visual regression
    npm run db:studio       # Browse DB in GUI
    npm run db:reset        # Drop, migrate, reseed
    npm run db:seed         # Repopulate seeded cohort data
    npm run schema:check    # Schema-health checklist

Before opening a PR: npm run typecheck && npm run lint && npm run test

## Repo structure

    migration-hub/
    ├── CLAUDE.md                  Project memory for Claude Code
    ├── README.md                  This file
    ├── docs/
    │   ├── DONE.md                Prototype done definition
    │   ├── testing.md             Testing strategy
    │   ├── schema-health.md       10-smell checklist
    │   ├── schema-debt.md         Debt log
    │   └── stories/               M1.md through M8.md
    ├── prisma/
    │   ├── schema.prisma          The data model (source of truth)
    │   ├── seed.ts                Fabricated cohort data
    │   └── migrations/            Migration history
    ├── src/
    │   ├── app/                   Next.js App Router
    │   ├── components/            Reusable React components
    │   ├── lib/                   Utility functions
    │   ├── server/                tRPC routers, server-only code
    │   └── generated/prisma/      Auto-generated Prisma Client
    └── tests/
        ├── e2e/                   Playwright end-to-end flows
        ├── fixtures/              Shared test fixtures per cohort
        └── __snapshots__/         Visual regression baselines

## Story status

| #   | Story                         | Size | Status      |
| --- | ----------------------------- | ---- | ----------- |
| M1  | Champion reviews team profile | L    | Not started |
| M2  | Program PM dashboard          | M    | Not started |
| M3  | Agent runs discovery          | M    | Not started |
| M4  | Ada chat assistant            | L    | Not started |
| M5  | Cut-over runbook              | M    | Not started |
| M6  | Cohorts & waves               | M    | Not started |
| M7  | Post-migration validation     | S    | Not started |
| M8  | Risks across fleet            | S    | Not started |

## License

Private — internal interview prototype.
