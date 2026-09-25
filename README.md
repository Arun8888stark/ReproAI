# ReproAI Backend

Node.js 22.13+ · Express · SQLite (built into Node) · Gemini or Groq · Playwright

## Setup

```bash
npm install
copy .env.example .env      # Windows (use cp on Mac/Linux), then add GROQ_API_KEY (or GEMINI_API_KEY)
npm run check               # checks Node, database, browser and Gemini
npm start                   # terminal 1: API :8080, demo app :8081
npm run test:api            # terminal 2: end-to-end test
npm run eval                # full dataset evaluation (server must be running)
```

`BROWSER_CHANNEL=msedge` uses the Edge already installed on Windows. Set `chrome` for Google Chrome,
or leave it empty after running `npx playwright install chromium`.

`LLM_PROVIDER=groq` or `gemini`. If both keys are set, the other provider is used automatically when the first is busy.

## API (base: http://localhost:8080/api)

| Method | Route | Purpose |
|---|---|---|
| POST | `/generate` | `{ bugDescription, targetUrl, framework? }` → full report |
| GET | `/reports` | History list |
| GET | `/reports/:id` | Report details |
| DELETE | `/reports/:id` | Delete report + screenshots (204) |
| POST | `/reports/:id/run` | Re-run saved steps (Run Test) |
| POST | `/reports/:id/regenerate` | Ask Gemini again (Re-generate) |
| GET | `/analytics` | Totals + reports per day |
| GET | `/evaluation` | Latest `npm run eval` results (or null) |
| GET | `/health` | Health check |

Screenshots: `http://localhost:8080/screenshots/<reportId>/step-N.png`

`executionStatus`: `in_progress` | `success` | `failed` · `verdict`: `reproduced` | `not_reproduced`
Errors: `{ "error": "message" }` with a 4xx/5xx status.
