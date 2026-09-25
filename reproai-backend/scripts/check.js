import { env } from '../src/config/env.js';

const ok = msg => console.log(`  OK    ${msg}`);
const fail = (msg, e) => { console.log(`  FAIL  ${msg}\n        ${e?.message ?? e}`); process.exitCode = 1; };

console.log('\nReproAI setup check\n');

const [major, minor] = process.versions.node.split('.').map(Number);
major > 22 || (major === 22 && minor >= 13) ? ok(`Node.js ${process.versions.node}`) : fail('Node.js version', 'Need 22.13 or newer');

try {
  await import('../src/db/index.js');
  ok('SQLite database (storage/reproai.db)');
} catch (e) { fail('SQLite database', e); }

try {
  const { launchBrowser } = await import('../src/services/browser.js');
  const browser = await launchBrowser();
  const page = await browser.newPage();
  await page.setContent('<h1>ok</h1>');
  await browser.close();
  ok(`Browser (${env.browserChannel || 'playwright chromium'})`);
} catch (e) { fail(`Browser (${env.browserChannel || 'playwright chromium'}). Try BROWSER_CHANNEL=chrome or msedge in .env`, e); }

const model = env.llmProvider === 'groq' ? env.groqModel : env.geminiModel;
try {
  const { ping } = await import('../src/services/gemini.service.js');
  const reply = await ping();
  ok(`AI provider ${env.llmProvider} (${model}) replied: ${JSON.stringify(reply)}`);
} catch (e) { fail(`AI provider ${env.llmProvider} (${model})`, e); }

console.log(process.exitCode ? '\nFix the FAIL lines above, then run npm run check again.\n' : '\nAll good. Run: npm start\n');