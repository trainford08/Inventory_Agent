# Testing Strategy

This doc is the authoritative guide for what to test, where tests live, and how to run them in Migration Hub. If a test doesn't fit one of the layers below, the design is wrong — don't stretch a layer to cover it.

## Why this strategy exists

The prototype lives or dies on the "schema as spine" thesis. When the schema changes, TypeScript tells us every consumer that's broken — but only for shape. Tests close the loop on _behavior_: that completion % is computed right, that the review flow mutates the right rows, that empty sections render deliberately, that every cohort survives every page.

Tests are also the gate that turns the prototype into v1. Anything shipped without a test is a regression waiting to happen once the demo becomes a real product.

## The four layers

### 1. Unit tests (Vitest)

**What:** pure functions — completion %, Zod schemas, data transformers, URL builders, anything that takes input → returns output with no I/O.

**Where:** co-located with the source, `.test.ts` suffix.

```
src/lib/completion.ts
src/lib/completion.test.ts
```

**Rules:**

- No DB. If a function needs DB to test, refactor it into a pure core + a thin I/O wrapper, test the core.
- No mocks for our own code. Mocks mean the test doesn't check what runs in production.
- One assertion per behavior, not per function. Name tests for the behavior: `returns 100% when every finding is human-verified`.

### 2. Component tests (Vitest + Testing Library)

**What:** individual React components rendered with controlled props. Verify DOM output, user interaction, empty and loaded states.

**Where:** co-located with the component, `.test.tsx` suffix.

```
src/components/TeamCard.tsx
src/components/TeamCard.test.tsx
```

**Rules:**

- Pass props directly — do not import server-side loaders into component tests.
- For components that render team data, parameterize the test across all 6 cohort fixtures (see Fixtures below). A component that only works for Alpha is a broken component.
- Assert on what the user sees (`getByRole`, `getByText`), not implementation details (class names, internal state).

### 3. End-to-end tests (Playwright)

**What:** full user flows against a running app with a seeded DB. Few in number, high value per test.

**Where:** `tests/e2e/<flow-name>.spec.ts`. Shared global setup in `tests/e2e/global-setup.ts`.

**Config:** `playwright.config.ts` at repo root. Dev server auto-starts via `webServer` (reuses the existing one if `localhost:3000` is already up). Chromium-only for now.

**Fresh state per run:** `tests/e2e/global-setup.ts` re-runs `prisma/seed.ts` before the test suite so every E2E starts from a deterministic zero-state (0% completion across all teams).

**Current specs:**

- `tests/e2e/review-flow.spec.ts` — M1 reviewer flow end-to-end. Covers all five M1 acceptance criteria (team list → profile → Agent findings → drawer drill-down → Review → answer 3 question types → submit → live count decrement → Verified pill persists).

**Rules:**

- Run against the real dev DB reset + seeded per run (never mocked).
- One spec per user story milestone. M1 gets `review-flow.spec.ts`; M2 will get `pm-dashboard.spec.ts`; etc.
- Use accessible selectors (`getByRole`, `getByText`, `getByLabel`) over `data-testid`. Fall back to `data-testid` only when no accessible handle exists.
- Keep assertion counts meaningful — verify state transitions (counts dropping, banners appearing, badges showing), not just "element exists."

### 4. Visual regression (Playwright snapshots)

**What:** per-cohort snapshots of each key page. Catches unintended UI drift when schema or components change.

**Where:** Playwright-managed, baselines in `tests/__snapshots__/`.

**Rules:**

- Snapshot every M1 page × all 6 cohorts. Six near-identical screens prove nothing — the whole point is that Alpha looks empty-and-clean while Foxtrot looks messy-and-archived.
- Update snapshots deliberately (`playwright --update-snapshots`), never reflexively. A snapshot diff usually means something real changed.

## Fixtures

Shared test fixtures live in `tests/fixtures/`. One fixture per cohort:

```
tests/fixtures/alpha.ts
tests/fixtures/bravo.ts
tests/fixtures/charlie.ts
tests/fixtures/delta.ts
tests/fixtures/echo.ts
tests/fixtures/foxtrot.ts
tests/fixtures/index.ts   // exports all six as an array for parameterized tests
```

Fixtures are plain TypeScript objects matching the Prisma types. They are **not** the same as seed data — seed data lives in `prisma/seed.ts` and populates the real DB; fixtures are in-memory data for component tests that never touch the DB. The two can share helpers but must stay independently editable: a component test should not require a DB reset.

## What to test

**DO test:**

- Completion % across every combination of Finding status.
- Every component against all 6 cohort fixtures.
- The M1 reviewer flow end-to-end (one Playwright spec covering the DONE.md flow).
- Every tRPC mutation: happy path, invalid input (Zod rejects), stale state.
- Empty states for every profile section (no customizations, no risks, archived repos only, orphan ownership).

**DON'T test:**

- Next.js routing, Prisma client internals, Tailwind CSS output, Testing Library itself — trust upstream.
- Implementation details that would change with a harmless refactor (internal hook names, CSS class strings).
- Schema validity — `prisma validate` in CI handles that.

## Mocking policy

Avoid mocks for internal code. When something is hard to test, the test is signaling a design problem — not a tooling problem.

- **DB access:** refactor pure logic out of I/O boundaries. Test the pure logic directly; integration-test the boundary with a real dev DB.
- **External APIs (ADO, GitHub):** wrap in a thin adapter with an interface. Stub the interface in unit tests. Do not stub `fetch` directly.
- **Time / randomness:** inject clocks and RNGs as parameters, never `Date.now()` or `Math.random()` inline.

Mocks that silently diverge from production behavior are worse than no tests.

## Running locally

| Command               | What it runs                      |
| --------------------- | --------------------------------- |
| `npm run test`        | Vitest unit + component (CI gate) |
| `npm run test:watch`  | Vitest in watch mode during dev   |
| `npm run test:ui`     | Vitest browser UI                 |
| `npm run test:e2e`    | Playwright E2E specs              |
| `npm run test:visual` | Playwright visual snapshots       |

Before pushing a PR: `npm run typecheck && npm run lint && npm run test`. E2E and visual run in CI on the deploy preview.

## When a test fails

Fix the test or fix the code. Never comment out or `.skip()` without an issue link and a target-fix date. A skipped test is debt; track it like any other debt.

If a test is flaky, quarantine it with `.skip()` + a comment naming the suspected cause, file a follow-up, and fix before the story merges. Flaky E2E is a blocker, not a quirk.

## What this doc doesn't cover (yet)

- **Performance tests:** not needed for M1. Add a layer when M2's dashboard introduces aggregation queries over the fleet.
- **Accessibility tests:** `@axe-core/playwright` can be wired into the E2E flow later. Flag in schema-debt or a story when UX hardening starts.
- **Load tests:** not a prototype concern.

Extend this doc when a new test type earns its seat. Do not add a layer speculatively.
