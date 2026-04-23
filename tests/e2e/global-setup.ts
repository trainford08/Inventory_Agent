import { spawnSync } from "node:child_process";

/**
 * Reseed the database before E2E tests run so the reviewer flow starts
 * from a known zero-state (0% completion for every team).
 */
export default async function globalSetup() {
  console.log("\n[e2e global-setup] Reseeding database...");
  const result = spawnSync("npx", ["tsx", "prisma/seed.ts"], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`Seed failed with exit code ${result.status}`);
  }
  console.log("[e2e global-setup] Seed complete.\n");
}
