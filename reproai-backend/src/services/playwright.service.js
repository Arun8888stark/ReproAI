import { expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';
import { launchBrowser } from './browser.js';

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
const clean = msg => String(msg).replace(/\u001b\[[0-9;]*m/g, '').split('\nCall log')[0].trim();

async function ariaSnapshot(page) {
  const tree = await page.locator('body').ariaSnapshot();
  return tree.length > 12000 ? `${tree.slice(0, 12000)}\n...(truncated)` : tree;
}

export async function scanPage(url) {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    return await ariaSnapshot(page);
  } finally {
    await browser.close();
  }
}

export async function executeSteps({ reportId, baseURL, steps, verification }) {
  const dir = path.join(env.storageDir, 'screenshots', reportId);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  const all = [
    ...steps.map(s => ({ ...s, isVerification: false })),
    { ...verification, isVerification: true },
  ];
  const result = { steps: [], screenshots: [], logs: [], verdict: null };
  const log = (level, message) => result.logs.push({ level, message, createdAt: new Date().toISOString() });

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    page.setDefaultTimeout(5000);
    const assert = expect.configure({ timeout: 4000 });

    for (const [i, step] of all.entries()) {
      const order = i + 1;
      const started = Date.now();
      let error = null;
      try {
        await new AsyncFunction('page', 'expect', 'baseURL', step.code)(page, assert, baseURL);
      } catch (e) {
        error = e;
      }

      const file = `step-${order}.png`;
      await page.screenshot({ path: path.join(dir, file) }).catch(() => {});
      result.screenshots.push({ order, label: step.description, url: `/screenshots/${reportId}/${file}`, isFailure: !!error });
      result.steps.push({ ...step, order, status: error ? 'failed' : 'passed', durationMs: Date.now() - started });

      if (!error) {
        log('info', `Step ${order} passed: ${step.description}`);
        continue;
      }

      const message = clean(error.message);
      const bugConfirmed = step.isVerification && error.matcherResult !== undefined && !/element\(s\) not found/.test(error.message);
      if (bugConfirmed) {
        result.verdict = 'reproduced';
        result.observed = String(error.matcherResult.actual ?? '');
        log('warn', `Bug reproduced at step ${order}: ${step.description}\n${message}`);
      } else {
        result.failedStep = order;
        result.error = message;
        result.snapshot = await ariaSnapshot(page).catch(() => '');
        log('error', `Step ${order} failed: ${step.description}\n${message}`);
      }
      all.slice(i + 1).forEach((s, j) => result.steps.push({ ...s, order: order + j + 1, status: 'skipped', durationMs: 0 }));
      return result;
    }

    result.verdict = 'not_reproduced';
    log('info', 'All steps passed. The app behaved as expected.');
    return result;
  } finally {
    await browser.close();
  }
}
