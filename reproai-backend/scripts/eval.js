import fs from 'node:fs';
import { env } from '../src/config/env.js';
import { generateReport } from '../src/services/report.service.js';

const cases = JSON.parse(fs.readFileSync('dataset/bugs.json', 'utf8'));
const base = `http://localhost:${env.demoPort}`;
const rows = [];

for (const c of cases) {
  process.stdout.write(`${c.id} ... `);
  const r = await generateReport({ bugDescription: c.description, targetUrl: base + c.path });
  rows.push({ id: c.id, expected: c.expected, got: r.verdict ?? 'script_error', attempts: r.attempts, seconds: +(r.durationMs / 1000).toFixed(1) });
  console.log(rows.at(-1).got);
}

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const bugs = rows.filter(r => r.expected === 'reproduced');
const summary = {
  total: rows.length,
  validityRate: pct(rows.filter(r => r.got !== 'script_error').length, rows.length),
  reproductionRate: pct(bugs.filter(r => r.got === 'reproduced').length, bugs.length),
  accuracy: pct(rows.filter(r => r.got === r.expected).length, rows.length),
  avgAttempts: +(rows.reduce((s, r) => s + r.attempts, 0) / rows.length).toFixed(2),
  avgSeconds: +(rows.reduce((s, r) => s + r.seconds, 0) / rows.length).toFixed(1),
};

fs.writeFileSync('storage/eval-results.json', JSON.stringify({ at: new Date().toISOString(), summary, rows }, null, 2));
console.table(rows);
console.log(summary);
process.exit(0);
