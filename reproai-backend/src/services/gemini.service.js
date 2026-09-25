import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

let client;
let mock = null;
export const setMock = fn => (mock = fn);

const sleep = ms => new Promise(r => setTimeout(r, ms));
const isBusy = msg => /503|429|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|rate limit|overloaded/i.test(msg);
const parse = text => JSON.parse(text.replace(/```json|```/g, '').trim());

async function callGemini(system, user) {
  if (!env.geminiKey) throw new Error('GEMINI_API_KEY is missing in .env');
  client ??= new GoogleGenAI({ apiKey: env.geminiKey });
  const res = await client.models.generateContent({
    model: env.geminiModel,
    contents: user,
    config: { systemInstruction: system, responseMimeType: 'application/json', temperature: 0.2 },
  });
  return parse(res.text);
}

async function callGroq(system, user) {
  if (!env.groqKey) throw new Error('GROQ_API_KEY is missing in .env');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.groqKey}` },
    body: JSON.stringify({
      model: env.groqModel,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  return parse((await res.json()).choices[0].message.content);
}

const PROVIDERS = { gemini: callGemini, groq: callGroq };

async function withRetry(call, system, user) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await call(system, user);
    } catch (e) {
      if (!isBusy(e.message) || attempt >= 3) throw e;
      await sleep(3000 * attempt);
    }
  }
}

async function askJSON(system, user) {
  if (mock) return mock(system, user);
  const primary = env.llmProvider === 'groq' ? 'groq' : 'gemini';
  const backup = primary === 'groq' ? 'gemini' : 'groq';
  const backupReady = backup === 'groq' ? env.groqKey : env.geminiKey;
  try {
    return await withRetry(PROVIDERS[primary], system, user);
  } catch (e) {
    if (!backupReady) throw new AppError(502, `${primary} request failed: ${e.message}`);
    try {
      return await withRetry(PROVIDERS[backup], system, user);
    } catch (e2) {
      throw new AppError(502, `${primary} failed (${e.message}); ${backup} failed (${e2.message})`);
    }
  }
}

export const ping = () => askJSON('Reply ONLY with JSON: {"ok": true}', 'ping');

const RULES = `Code rules:
- Each "code" uses only the variables page, expect, baseURL. No imports, no test() wrapper.
- Use ONLY elements from the accessibility snapshot. Prefer page.getByRole(role, { name }), getByLabel, getByText.
- One user action per step.
- "verification.code" is ONE expect(...) assertion of the EXPECTED correct behaviour, so it FAILS while the bug exists.
  Prefer toHaveText, toContainText, toHaveValue, toHaveCount or toBeVisible on a specific element.
- Copy text formats exactly as they appear in the snapshot (spacing, punctuation, currency symbols). For numbers prefer a regex that tolerates spaces, e.g. /3\\s*\\/\\s*3/.`;

const PLAN_PROMPT = `You convert a non-technical bug report into an executable Playwright reproduction.
Reply ONLY with JSON:
{
  "title": "short bug title, max 6 words",
  "expectedResult": "the correct behaviour",
  "actualResult": "the wrong behaviour the user reported",
  "steps": [{ "description": "plain-English step", "code": "Playwright code" }],
  "verification": { "description": "what correct behaviour looks like", "code": "expect(...) assertion" }
}
The first step must be { "description": "Open the page", "code": "await page.goto(baseURL);" }.
${RULES}`;

const FIX_PROMPT = `A Playwright reproduction failed because of a SCRIPT problem (wrong selector, timing), not because of the bug.
Reply ONLY with JSON: { "steps": [...], "verification": {...}, "fix": "one sentence describing the change" }
Same shapes as the input. Use elements from the snapshot taken where it failed.
Keep the verification checking the SAME expected behaviour. Never weaken, remove or invert it.
${RULES}`;

export const generatePlan = ({ bugDescription, targetUrl, snapshot }) =>
  askJSON(PLAN_PROMPT, `Target URL: ${targetUrl}
Bug report: ${bugDescription}
Accessibility snapshot of the page:
${snapshot}`);

export const fixPlan = ({ plan, failedStep, error, snapshot }) =>
  askJSON(FIX_PROMPT, `Expected behaviour: ${plan.expectedResult}
Current plan: ${JSON.stringify({ steps: plan.steps, verification: plan.verification })}
Failed at step ${failedStep} with error:
${error}
Accessibility snapshot where it failed:
${snapshot}`);