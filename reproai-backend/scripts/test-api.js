import 'dotenv/config';

const API = `http://127.0.0.1:${process.env.PORT || 8080}/api`;
const DEMO = `http://localhost:${process.env.DEMO_PORT || 8081}`;

try {
  console.log('Health:', await (await fetch(`${API}/health`)).json());
} catch {
  console.log(`Cannot reach ${API}. Start the server first with: npm start (in another terminal)`);
  process.exit(1);
}

console.log('Generating a report (10-40s)...');
const res = await fetch(`${API}/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bugDescription: 'I answered all quiz questions correctly (4, New Delhi, Hyper Text Markup Language) but my score shows 0',
    targetUrl: `${DEMO}/#/quiz`,
  }),
});
const r = await res.json();
if (!res.ok) {
  console.log(`HTTP ${res.status}:`, r);
  process.exit(1);
}

console.log({
  reportId: r.reportId,
  title: r.title,
  executionStatus: r.executionStatus,
  verdict: r.verdict,
  attempts: r.attempts,
  observedResult: r.observedResult,
  errorMessage: r.errorMessage,
});
console.table(r.steps);
r.logs.forEach(l => console.log(`[${l.level}] ${l.message}`));
console.log(`\nFirst screenshot: http://localhost:${process.env.PORT || 8080}${r.screenshots[0]?.url}`);
