import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Vitest handles unit/component tests only. E2E lives in tests/e2e and
    // is owned by Playwright (npm run test:e2e).
    exclude: ["node_modules", ".next", "tests/e2e/**", "dist"],
  },
});
