import { defineConfig } from '@playwright/test';
import { isEmpty, toNumber } from 'lodash';

import dotenv from 'dotenv';
import { screenshotFolder } from './tests/automation/constants/variables';

dotenv.config();

const useSessionReporter = !isEmpty(process.env.PLAYWRIGHT_CUSTOM_REPORTER);

export default defineConfig({
  timeout: 350000,
  globalTimeout: 6000000,
  reporter: [
    useSessionReporter ? ['./sessionReporter.ts'] : ['list'],
    ['allure-playwright'],
  ],
  testDir: './tests/automation',
  testIgnore: '*.js',
  outputDir: './tests/automation/test-results',
  retries: process.env.PLAYWRIGHT_RETRIES_COUNT
    ? toNumber(process.env.PLAYWRIGHT_RETRIES_COUNT)
    : 0,
  repeatEach: process.env.PLAYWRIGHT_REPEAT_COUNT
    ? toNumber(process.env.PLAYWRIGHT_REPEAT_COUNT)
    : 0,
  workers: toNumber(process.env.PLAYWRIGHT_WORKERS_COUNT) || 1,
  reportSlowTests: null,
  fullyParallel: true, // otherwise, tests in the same file are not run in parallel
  globalSetup: './global.setup', // clean leftovers of previous test runs on start, runs only once
  snapshotPathTemplate:  screenshotFolder + '/{testName}/{arg}-{platform}{ext}',
});
