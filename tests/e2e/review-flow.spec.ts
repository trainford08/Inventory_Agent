import { expect, test } from "@playwright/test";

/**
 * M1 reviewer flow (end-to-end).
 *
 * /review is scoped to the Jobs to be done chunk for Charlie. The agent
 * pre-accepts all HIGH-confidence findings, so most rows render as
 * compact verified "Auto-accepted" rows. This test verifies:
 *   - The full navigation from /teams to the review page
 *   - The rail + main panel render with expected counts
 *   - A Champion can Edit an auto-accepted row and the state transitions
 *     (rail count holds; row label flips to "Edited")
 *   - Navigation away and back persists the change
 */

test.describe("M1 — Champion reviewer flow", () => {
  test("Champion reviews Charlie's Jobs to be done chunk — edits an auto-accepted item", async ({
    page,
  }) => {
    // AC #1: /teams shows the team list
    await page.goto("/teams");
    await expect(
      page.getByRole("heading", { level: 1, name: /team profiles/i }),
    ).toBeVisible();
    const charlieRow = page.getByRole("link", { name: /Charlie Toolkit/ });
    await expect(charlieRow).toBeVisible();

    // AC #2: click Charlie → team profile
    await charlieRow.click();
    await expect(page).toHaveURL(/\/teams\/charlie$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Charlie Toolkit" }),
    ).toBeVisible();

    // AC #3: Agent findings shows summary cards
    await page
      .getByRole("link", { name: /Agent findings/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/teams\/charlie\/findings$/);
    await expect(
      page.getByRole("button", { name: /Auto-populated/i }),
    ).toBeVisible();

    // AC #4/5: Jobs to be done review page
    await page
      .getByRole("link", { name: /^Review/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/teams\/charlie\/review/);

    // Heading + rail + section card
    await expect(
      page.getByRole("heading", { level: 1, name: /Jobs to be done/i }),
    ).toBeVisible();
    await expect(page.getByText(/Reviewing section/i)).toBeVisible();

    // Count on the rail matches Charlie's JTBD count (15)
    await expect(page.getByText(/of\s+15\s+items reviewed/i)).toBeVisible();

    // All 15 are agent-auto-accepted on a fresh seed — verify at least one
    // "Auto-accepted" row renders
    await expect(page.getByText(/Auto-accepted/i).first()).toBeVisible();

    // Edit an auto-accepted row: click its Edit button, change the value,
    // Save. Row label should flip to "Edited".
    const firstEdit = page.getByRole("button", { name: /^Edit$/ }).first();
    await expect(firstEdit).toBeVisible();
    await firstEdit.click();
    const editInput = page.locator('input[type="text"]').first();
    await expect(editInput).toBeVisible();
    await editInput.fill("MOVES");
    await page
      .getByRole("button", { name: /^Save$/ })
      .first()
      .click();

    // After save, an "Edited" label should appear somewhere in the subsection
    await expect(page.getByText(/^Edited/).first()).toBeVisible();

    // Undo affordance is present on edited rows
    await expect(
      page.getByRole("button", { name: /^Undo$/ }).first(),
    ).toBeVisible();

    // Persistence: navigate away + back
    await page.getByRole("link", { name: /Back to team profile/i }).click();
    await expect(page).toHaveURL(/\/teams\/charlie$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/teams\/charlie\/review/);
    await expect(page.getByText(/^Edited/).first()).toBeVisible();
  });
});
