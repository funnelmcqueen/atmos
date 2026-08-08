import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import 'dotenv/config'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /*
   * Always serial, locally as well as on CI.
   *
   * The suite runs against `next dev`, which compiles routes on first request.
   * Parallel workers hitting different uncompiled routes at once — the Payload
   * admin bundle worst of all — push the first request past the 30s hook
   * timeout, so admin's beforeAll login fails and takes its whole describe
   * block with it. That looks like a broken app and is only cold-start cost.
   * One worker trades a couple of minutes of wall clock for a suite whose red
   * means something.
   */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      // Use Playwright's bundled Chromium (headless shell) rather than the
      // Chrome-for-Testing `chromium` channel: the branded chrome.exe needs a
      // VC++ runtime that isn't present on every machine, and the bundled build
      // is the portable default.
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    reuseExistingServer: true,
    url: 'http://localhost:3000',
    env: {
      ...process.env,
      // The forms slice sends notification email on submit. Stub the transport
      // so a suite run never reaches Resend — checked before RESEND_API_KEY in
      // lib/email.ts, so a real key in .env is still stubbed here.
      //
      // Only applies to a server Playwright starts. With `reuseExistingServer`
      // and a dev server already up, that server's environment wins — so if you
      // are running `pnpm dev` in another terminal, set this there too.
      ATMOS_EMAIL_TRANSPORT: 'stub',
    },
  },
})
