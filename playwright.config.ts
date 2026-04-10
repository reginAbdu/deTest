import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  testIgnore: ['**/order.create.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],
  use: {
    baseURL: process.env['BASE_URL'] || 'https://stats-api.dln.trade',
    trace: 'on',
    httpCredentials: process.env['API_AUTH'] ? {
      username: process.env['API_USER'] || '',
      password: process.env['API_PASSWORD'] || '',
    } : undefined,
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      'accept': 'application/json',
      'accept-language': 'en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7',
      'cache-control': 'no-cache',
      'dnt': '1',
      'pragma': 'no-cache',
      'origin': 'https://app.debridge.com',
      'referer': 'https://app.debridge.com/',
    },
  },

  projects: [
    {
      name: 'api-tests',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  webServer: undefined,
});

