import { defineConfig, devices } from '@playwright/test';

const port = 8788;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(process.env.CI ? { channel: 'chrome' as const } : {}),
      },
    },
  ],
  webServer: {
    command: `pnpm build:e2e && pnpm exec wrangler pages dev dist --port ${port} --ip 127.0.0.1`,
    env: {
      ...process.env,
      VISITS_LOCAL_STORE: 'memory',
    },
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
