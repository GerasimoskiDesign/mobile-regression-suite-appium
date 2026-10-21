/**
 * Appium capabilities, driven by environment variables so the same config runs on a
 * laptop emulator, a CI emulator or a real device without edits.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_ID } from '../selectors/strategies.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const DEFAULT_APP_PATH = path.join(root, 'apps', 'my-demo-app.apk');

export function androidCapabilities(env = process.env) {
  const caps = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': env.DEVICE_NAME || 'Android Emulator',
    'appium:app': path.resolve(env.APP_PATH || DEFAULT_APP_PATH),
    'appium:appPackage': APP_ID,
    'appium:appWaitActivity': '*',
    'appium:autoGrantPermissions': true,
    // Install once per session; tests reset state with a cold restart instead.
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:newCommandTimeout': 240,
    // First-run installs of the UiAutomator2 server are slow on CI emulators.
    'appium:uiautomator2ServerInstallTimeout': 120_000,
    'appium:uiautomator2ServerLaunchTimeout': 120_000,
    'appium:adbExecTimeout': 120_000,
    'appium:androidInstallTimeout': 180_000,
    'appium:disableWindowAnimation': true,
  };
  if (env.UDID) {
    caps['appium:udid'] = env.UDID;
  }
  if (env.PLATFORM_VERSION) {
    caps['appium:platformVersion'] = env.PLATFORM_VERSION;
  }
  return caps;
}
