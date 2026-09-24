import {defineConfig, devices} from '@playwright/test';

/** Smoke tests against the production build (`npm run e2e` builds first). */
const APP_PORT = 4175;

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {name: 'desktop', use: {...devices['Desktop Chrome']}},
    {name: 'mobile', use: {...devices['Pixel 7']}},
  ],
  reporter: process.env.CI ? [['github'], ['html', {open: 'never'}]] : 'list',
  retries: process.env.CI ? 1 : 0,
  testDir: 'e2e',
  expect: {timeout: 15_000},
  use: {
    baseURL: `http://localhost:${APP_PORT}/`,
    trace: 'retain-on-failure',
    launchOptions: {executablePath: process.env.CHROMIUM_PATH ?? undefined},
  },
  webServer: {
    command: 'npm run serve',
    port: APP_PORT,
    reuseExistingServer: !process.env.CI,
  },
});
