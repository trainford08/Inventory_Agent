# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: review-flow.spec.ts >> M1 — Champion reviewer flow >> Champion reviews Charlie's Jobs to be done chunk — edits an auto-accepted item
- Location: tests/e2e/review-flow.spec.ts:17:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /team profiles/i, level: 1 })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /team profiles/i, level: 1 })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
    - generic [ref=e2]:
        - complementary [ref=e3]:
            - link "M Migration Hub v2.1" [ref=e4] [cursor=pointer]:
                - /url: /dashboard
                - generic [ref=e5]: M
                - generic [ref=e6]:
                    - generic [ref=e7]: Migration Hub
                    - generic [ref=e8]: v2.1
            - generic [ref=e9]:
                - generic [ref=e10]: Program
                - link "Dashboard" [ref=e11] [cursor=pointer]:
                    - /url: /dashboard
                    - img [ref=e12]
                    - generic [ref=e17]: Dashboard
                - generic [ref=e18] [cursor=pointer]:
                    - img [ref=e19]
                    - generic [ref=e22]: All teams
            - generic [ref=e23]:
                - generic [ref=e24]: This team
                - link "Overview" [ref=e25] [cursor=pointer]:
                    - /url: /teams/alpha
                    - img [ref=e26]
                    - generic [ref=e29]: Overview
                - link "Agent findings" [ref=e30] [cursor=pointer]:
                    - /url: /teams/alpha/findings
                    - img [ref=e31]
                    - generic [ref=e34]: Agent findings
                - link "Complete profile" [ref=e35] [cursor=pointer]:
                    - /url: /teams/alpha/complete
                    - img [ref=e36]
                    - generic [ref=e39]: Complete profile
                - generic [ref=e40] [cursor=pointer]:
                    - img [ref=e41]
                    - generic [ref=e44]: People
                - generic [ref=e45] [cursor=pointer]:
                    - img [ref=e46]
                    - generic [ref=e48]: Risks
                    - generic [ref=e49]: "3"
            - generic [ref=e51]:
                - generic [ref=e52]: AK
                - generic [ref=e53]:
                    - generic [ref=e54]: Aisha Khan
                    - generic [ref=e55]: Principal PM
                - img [ref=e56]
        - generic [ref=e58]:
            - generic [ref=e60] [cursor=pointer]:
                - img [ref=e61]
                - text: Search teams, risks, JTBDs
                - generic [ref=e64]: ⌘K
            - main [ref=e65]:
                - generic [ref=e67]:
                    - heading "404" [level=1] [ref=e68]
                    - heading "This page could not be found." [level=2] [ref=e70]
    - button "Open Next.js Dev Tools" [ref=e76] [cursor=pointer]:
        - img [ref=e77]
    - alert [ref=e80]
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  |
  3  | /**
  4  |  * M1 reviewer flow (end-to-end).
  5  |  *
  6  |  * /review is scoped to the Jobs to be done chunk for Charlie. The agent
  7  |  * pre-accepts all HIGH-confidence findings, so most rows render as
  8  |  * compact verified "Auto-accepted" rows. This test verifies:
  9  |  *   - The full navigation from /teams to the review page
  10 |  *   - The rail + main panel render with expected counts
  11 |  *   - A Champion can Edit an auto-accepted row and the state transitions
  12 |  *     (rail count holds; row label flips to "Edited")
  13 |  *   - Navigation away and back persists the change
  14 |  */
  15 |
  16 | test.describe("M1 — Champion reviewer flow", () => {
  17 |   test("Champion reviews Charlie's Jobs to be done chunk — edits an auto-accepted item", async ({
  18 |     page,
  19 |   }) => {
  20 |     // AC #1: /teams shows the team list
  21 |     await page.goto("/teams");
  22 |     await expect(
  23 |       page.getByRole("heading", { level: 1, name: /team profiles/i }),
> 24 |     ).toBeVisible();
     |       ^ Error: expect(locator).toBeVisible() failed
  25 |     const charlieRow = page.getByRole("link", { name: /Charlie Toolkit/ });
  26 |     await expect(charlieRow).toBeVisible();
  27 |
  28 |     // AC #2: click Charlie → team profile
  29 |     await charlieRow.click();
  30 |     await expect(page).toHaveURL(/\/teams\/charlie$/);
  31 |     await expect(
  32 |       page.getByRole("heading", { level: 1, name: "Charlie Toolkit" }),
  33 |     ).toBeVisible();
  34 |
  35 |     // AC #3: Agent findings shows summary cards
  36 |     await page
  37 |       .getByRole("link", { name: /Agent findings/i })
  38 |       .first()
  39 |       .click();
  40 |     await expect(page).toHaveURL(/\/teams\/charlie\/findings$/);
  41 |     await expect(
  42 |       page.getByRole("button", { name: /Auto-populated/i }),
  43 |     ).toBeVisible();
  44 |
  45 |     // AC #4/5: Jobs to be done review page
  46 |     await page
  47 |       .getByRole("link", { name: /^Review/ })
  48 |       .first()
  49 |       .click();
  50 |     await expect(page).toHaveURL(/\/teams\/charlie\/review/);
  51 |
  52 |     // Heading + rail + section card
  53 |     await expect(
  54 |       page.getByRole("heading", { level: 1, name: /Jobs to be done/i }),
  55 |     ).toBeVisible();
  56 |     await expect(page.getByText(/Reviewing section/i)).toBeVisible();
  57 |
  58 |     // Count on the rail matches Charlie's JTBD count (15)
  59 |     await expect(page.getByText(/of\s+15\s+items reviewed/i)).toBeVisible();
  60 |
  61 |     // All 15 are agent-auto-accepted on a fresh seed — verify at least one
  62 |     // "Auto-accepted" row renders
  63 |     await expect(page.getByText(/Auto-accepted/i).first()).toBeVisible();
  64 |
  65 |     // Edit an auto-accepted row: click its Edit button, change the value,
  66 |     // Save. Row label should flip to "Edited".
  67 |     const firstEdit = page.getByRole("button", { name: /^Edit$/ }).first();
  68 |     await expect(firstEdit).toBeVisible();
  69 |     await firstEdit.click();
  70 |     const editInput = page.locator('input[type="text"]').first();
  71 |     await expect(editInput).toBeVisible();
  72 |     await editInput.fill("MOVES");
  73 |     await page
  74 |       .getByRole("button", { name: /^Save$/ })
  75 |       .first()
  76 |       .click();
  77 |
  78 |     // After save, an "Edited" label should appear somewhere in the subsection
  79 |     await expect(page.getByText(/^Edited/).first()).toBeVisible();
  80 |
  81 |     // Undo affordance is present on edited rows
  82 |     await expect(
  83 |       page.getByRole("button", { name: /^Undo$/ }).first(),
  84 |     ).toBeVisible();
  85 |
  86 |     // Persistence: navigate away + back
  87 |     await page.getByRole("link", { name: /Back to team profile/i }).click();
  88 |     await expect(page).toHaveURL(/\/teams\/charlie$/);
  89 |     await page.goBack();
  90 |     await expect(page).toHaveURL(/\/teams\/charlie\/review/);
  91 |     await expect(page.getByText(/^Edited/).first()).toBeVisible();
  92 |   });
  93 | });
  94 |
```
