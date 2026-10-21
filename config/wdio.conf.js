/**
 * WebdriverIO configuration for the Android regression suite.
 *
 * Environment variables (all optional, see .env.example):
 *   APP_PATH            path to the APK (default apps/my-demo-app.apk)
 *   APPIUM_EXTERNAL     "true" to connect to an Appium server you started yourself
 *   APPIUM_HOST/PORT    where that server listens (default 127.0.0.1:4723)
 *   SPEC_FILE_RETRIES   how often a failed spec file is re-run (default 1)
 *   TIMEOUT_FACTOR      multiply all waits, e.g. 2 on slow CI emulators
 */
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { androidCapabilities } from './capabilities.js';
import { saveFailureArtifacts } from '../helpers/artifacts.js';
import { timeouts } from './timeouts.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportsDir = path.join(root, 'reports');
const useExternalAppium = process.env.APPIUM_EXTERNAL === 'true';
const appiumPort = Number(process.env.APPIUM_PORT || 4723);

export const config = {
  runner: 'local',
  rootDir: root,
  specs: ['./test/specs/**/*.spec.js'],
  suites: {
    login: ['./test/specs/login.spec.js'],
    catalog: ['./test/specs/catalog.spec.js', './test/specs/sort.spec.js'],
    product: ['./test/specs/product.spec.js'],
    cart: ['./test/specs/cart.spec.js'],
    checkout: ['./test/specs/checkout.spec.js'],
    session: ['./test/specs/session.spec.js', './test/specs/restart.spec.js'],
  },
  // One emulator, one session at a time: parallel sessions on one device fight over the UI.
  maxInstances: 1,
  capabilities: [androidCapabilities()],

  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: appiumPort,
  path: '/',
  services: useExternalAppium
    ? []
    : [
        [
          'appium',
          {
            command: 'appium',
            args: { address: '127.0.0.1', port: appiumPort },
            logPath: path.join(reportsDir, 'appium'),
          },
        ],
      ],

  logLevel: process.env.WDIO_LOG_LEVEL || 'warn',
  bail: 0,
  waitforTimeout: timeouts.element,
  connectionRetryTimeout: 180_000,
  connectionRetryCount: 2,

  // Environment flakiness (emulator hiccups, ADB drops) is handled by re-running the
  // whole spec file once in a fresh session. Assertion failures that are real bugs
  // fail again on the retry and stay red.
  specFileRetries: Number(process.env.SPEC_FILE_RETRIES ?? 1),
  specFileRetriesDelay: 5,
  specFileRetriesDeferred: true,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    // Tests tagged @known-defect document open app bugs. They are quarantined from the
    // regular run (so the run stays a signal) and executed with `npm run test:known-defects`.
    grep: '@known-defect',
    invert: process.env.KNOWN_DEFECTS !== 'only',
    timeout: Math.round(180_000 * (Number(process.env.TIMEOUT_FACTOR || 1) || 1)),
  },

  reporters: [
    ['spec', { showPreface: false }],
    [
      'junit',
      {
        outputDir: path.join(reportsDir, 'junit'),
        outputFileFormat: (options) => `results-${options.cid}.xml`,
        // Keep "CART-02" intact in test names (the default pattern also strips hyphens).
        suiteNameFormat: /[^a-zA-Z0-9@\-().,"]+/,
      },
    ],
  ],

  afterTest: async function (test, _context, { passed }) {
    if (!passed) {
      await saveFailureArtifacts(driver, test, path.join(reportsDir, 'failures'));
    }
  },

  // A failing beforeEach hook skips the test, so afterTest never sees it. Capture it here.
  afterHook: async function (test, _context, { passed }) {
    if (!passed) {
      await saveFailureArtifacts(driver, test, path.join(reportsDir, 'failures'));
    }
  },
};
