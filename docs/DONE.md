# Prototype Done

When all of the following are true, the prototype is done. Do not build more until a reviewer confirms something is missing.

## User-visible definition

A reviewer, given only the URL, can complete this full flow in under 5 minutes without help:

1. **Land on the Team List** page and see 6 teams (one per cohort)
2. **Click a team** (pick Charlie or Delta for the interesting case) and see the Team Profile with real data from the database
3. **Click "Agent Findings"** and see what the agent auto-populated, what it flagged as needing input, and what it noted as anomalies
4. **Click "Review"** and answer 3 questions — one single-select, one multi-select, one free-text
5. **Return to the Team Profile** and see the completion percentage update with the reviewed fields now marked "human-verified"

If any of those steps fails, the prototype is not done.

## Technical definition

- `npm run dev` runs clean with no console errors
- `npm run db:seed` populates 6 cohorts with distinct, realistic data
- Every page renders for all 6 cohorts without breaking
- `npm run typecheck` passes
- `npm run lint` passes
- `npm run test` passes (at minimum one E2E test covers the full flow above)
- Deployed to a public URL (Vercel) that works in an incognito browser
- README.md explains how to run locally from scratch

## What is explicitly NOT required for done

- Real authentication (stubbed user is fine)
- Every story (M3-M8) — M1 and M2 are enough for the demo
- Real ADO API integration (seed data replaces the agent for M1)
- Real LLM integration for Ada (M4 deferred)
- Every cohort having every field populated (variance IS the story)
- Perfect visual polish on edge cases
- Performance optimization
- Mobile responsiveness beyond "doesn't break catastrophically"

## The contract

Do not ship new features once the above is true. Instead: deploy, test, polish, rest. Only add work if a reviewer identifies a real gap.
