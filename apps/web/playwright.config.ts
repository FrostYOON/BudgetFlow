import path from "node:path";
import { defineConfig } from "@playwright/test";

const repoRoot = path.resolve(__dirname, "../..");
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001",
    trace: "retain-on-failure",
  },
  webServer: skipWebServer
    ? undefined
    : [
        {
          command: "pnpm --filter @budgetflow/api dev",
          cwd: repoRoot,
          url: "http://localhost:3000/api/v1",
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
        {
          command: "pnpm --filter @budgetflow/web dev",
          cwd: repoRoot,
          url: "http://localhost:3001/sign-in",
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      ],
  reporter: [["list"]],
});
