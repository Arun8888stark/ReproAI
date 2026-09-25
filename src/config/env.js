import 'dotenv/config';
import path from 'node:path';

export const env = {
  port: Number(process.env.PORT) || 8080,
  demoPort: Number(process.env.DEMO_PORT) || 8081,
  llmProvider: (process.env.LLM_PROVIDER || 'gemini').toLowerCase(),
  geminiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  groqKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  browserChannel: process.env.BROWSER_CHANNEL || undefined,
  maxAttempts: Number(process.env.MAX_ATTEMPTS) || 3,
  runTimeoutMs: Number(process.env.RUN_TIMEOUT_MS) || 120000,
  storageDir: path.resolve('storage'),
};