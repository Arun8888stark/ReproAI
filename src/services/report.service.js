import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { buildScript } from '../utils/scriptBuilder.js';
import * as repo from '../repositories/report.repo.js';
import * as gemini from './gemini.service.js';
import { scanPage, executeSteps } from './playwright.service.js';

const withTimeout = (promise, ms) =>
  Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new AppError(504, `Run took longer than ${ms / 1000}s`)), ms))]);

function toDto({ report: r, steps, screenshots, logs }) {
  return {
    reportId: r.id,
    title: r.title,
    bugDescription: r.bug_description,
    targetUrl: r.target_url,
    framework: r.framework,
    executionStatus: r.status,
    verdict: r.verdict,
    steps: steps.filter(s => !s.is_verification).map(s => ({ order: s.step_order, description: s.description, status: s.status })),
    verificationStep: steps.filter(s => s.is_verification).map(s => ({ order: s.step_order, description: s.description, status: s.status }))[0] ?? null,
    generatedScript: r.generated_script,
    screenshots: screenshots.map(s => ({ order: s.step_order, label: s.label, url: s.url, isFailure: !!s.is_failure })),
    logs: logs.map(l => ({ level: l.level, message: l.message, createdAt: l.created_at })),
    expectedResult: r.expected_result,
    actualResult: r.actual_result,
    observedResult: r.observed_result,
    errorMessage: r.error_message,
    attempts: r.attempts,
    durationMs: r.duration_ms,
    createdAt: r.created_at,
  };
}

async function execute(id, targetUrl, plan) {
  let run;
  let attempts = 0;
  const healLogs = [];
  while (true) {
    attempts++;
    run = await executeSteps({ reportId: id, baseURL: targetUrl, steps: plan.steps, verification: plan.verification });
    if (run.verdict || attempts >= env.maxAttempts) break;
    const fix = await gemini.fixPlan({ plan, failedStep: run.failedStep, error: run.error, snapshot: run.snapshot });
    if (!fix.steps?.length || !fix.verification?.code) break;
    healLogs.push({ level: 'info', message: `Attempt ${attempts} failed at step ${run.failedStep}. Self-heal: ${fix.fix}`, createdAt: new Date().toISOString() });
    plan = { ...plan, steps: fix.steps, verification: fix.verification };
  }
  return { run, plan, attempts, logs: [...healLogs, ...run.logs] };
}

function finish(id, targetUrl, { run, plan, attempts, logs }, started) {
  repo.saveRun(id, { steps: run.steps, screenshots: run.screenshots, logs });
  repo.updateReport(id, {
    status: run.verdict ? 'success' : 'failed',
    verdict: run.verdict,
    observed_result: run.observed ?? null,
    generated_script: buildScript({ title: plan.title, targetUrl, steps: plan.steps, verification: plan.verification }),
    error_message: run.verdict ? null : run.error,
    attempts,
    duration_ms: Date.now() - started,
  });
}

async function pipeline(id, { bugDescription, targetUrl }, started) {
  const snapshot = await scanPage(targetUrl);
  const plan = await gemini.generatePlan({ bugDescription, targetUrl, snapshot });
  if (!plan.steps?.length || !plan.verification?.code) throw new AppError(502, 'Gemini returned an incomplete plan');
  repo.updateReport(id, { title: plan.title, expected_result: plan.expectedResult, actual_result: plan.actualResult });
  finish(id, targetUrl, await execute(id, targetUrl, plan), started);
}

async function runSafely(id, input) {
  const started = Date.now();
  repo.updateReport(id, { status: 'in_progress', error_message: null });
  try {
    await withTimeout(pipeline(id, input, started), env.runTimeoutMs);
  } catch (e) {
    repo.updateReport(id, { status: 'failed', error_message: e.message, duration_ms: Date.now() - started });
    repo.addLog(id, 'error', e.message);
  }
}

function load(id) {
  const data = repo.getReport(id);
  if (!data) throw new AppError(404, `Report ${id} not found`);
  return data;
}

export async function generateReport({ bugDescription, targetUrl, framework = 'playwright' }) {
  const id = crypto.randomUUID();
  repo.createReport({ id, bugDescription: bugDescription.trim(), targetUrl, framework });
  await runSafely(id, { bugDescription, targetUrl });
  return toDto(load(id));
}

export const listReports = () =>
  repo.listReports().map(r => ({
    reportId: r.id,
    title: r.title || r.bug_description.slice(0, 40),
    targetUrl: r.target_url,
    executionStatus: r.status,
    verdict: r.verdict,
    createdAt: r.created_at,
  }));

export const getReport = id => toDto(load(id));

export function deleteReport(id) {
  if (!repo.deleteReport(id)) throw new AppError(404, `Report ${id} not found`);
  fs.rmSync(path.join(env.storageDir, 'screenshots', id), { recursive: true, force: true });
}

export async function regenerateReport(id) {
  const { report } = load(id);
  await runSafely(id, { bugDescription: report.bug_description, targetUrl: report.target_url });
  return toDto(load(id));
}

export async function rerunReport(id) {
  const { report, steps } = load(id);
  if (!steps.length) throw new AppError(409, 'This report has no steps to run. Use regenerate instead.');
  const started = Date.now();
  const plan = {
    title: report.title,
    expectedResult: report.expected_result,
    steps: steps.filter(s => !s.is_verification).map(s => ({ description: s.description, code: s.code })),
    verification: steps.filter(s => s.is_verification).map(s => ({ description: s.description, code: s.code }))[0],
  };
  repo.updateReport(id, { status: 'in_progress' });
  try {
    finish(id, report.target_url, await withTimeout(execute(id, report.target_url, plan), env.runTimeoutMs), started);
  } catch (e) {
    repo.updateReport(id, { status: 'failed', error_message: e.message, duration_ms: Date.now() - started });
    repo.addLog(id, 'error', e.message);
  }
  return toDto(load(id));
}

export const getAnalytics = () => repo.getAnalytics();
