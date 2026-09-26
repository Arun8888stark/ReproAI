# ReproAI Frontend

React + Vite + React Router + react-icons. Connected to the ReproAI backend.

## Run

```bash
npm install
npm run dev          # http://localhost:5173
```

The backend must be running first (`npm start` in `reproai-backend`, port 8080).
`vite.config.js` forwards `/api` and `/screenshots` to `http://127.0.0.1:8080`.

## Pages

| Route | Page | Backend API |
|---|---|---|
| `/` | Dashboard: bug form, results, recent reports | `POST /api/generate`, `POST /api/reports/:id/run`, `GET /api/reports` |
| `/history` | All reports | `GET /api/reports` |
| `/reports/:id` | Report details, delete, re-generate, run | `GET/DELETE /api/reports/:id`, `POST /api/reports/:id/regenerate` |
| `/analytics` | Totals and evaluation | `GET /api/analytics`, `GET /api/evaluation` |
| `/settings` | Profile and backend status | `GET /api/health` |
