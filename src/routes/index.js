import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';
import * as reports from '../controllers/report.controller.js';
import { validateGenerate } from '../middleware/validate.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true }));
router.post('/generate', validateGenerate, reports.generate);
router.get('/reports', reports.list);
router.get('/reports/:id', reports.getOne);
router.delete('/reports/:id', reports.remove);
router.post('/reports/:id/run', reports.rerun);
router.post('/reports/:id/regenerate', reports.regenerate);
router.get('/analytics', reports.analytics);
router.get('/evaluation', (_req, res) => {
  const file = path.join(env.storageDir, 'eval-results.json');
  res.json(fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null);
});

export default router;
