import db, { transaction } from '../db/index.js';

const now = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const plain = row => (row ? { ...row } : null);

export const createReport = ({ id, bugDescription, targetUrl, framework }) =>
  db.prepare('INSERT INTO reports (id, bug_description, target_url, framework) VALUES (?, ?, ?, ?)')
    .run(id, bugDescription, targetUrl, framework);

export function updateReport(id, fields) {
  const values = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v ?? null]));
  const cols = Object.keys(values);
  db.prepare(`UPDATE reports SET ${cols.map(c => `${c} = @${c}`).join(', ')}, updated_at = @updated_at WHERE id = @id`)
    .run({ ...values, updated_at: now(), id });
}

export function saveRun(reportId, { steps, screenshots, logs }) {
  transaction(() => {
    for (const table of ['steps', 'screenshots', 'logs']) db.prepare(`DELETE FROM ${table} WHERE report_id = ?`).run(reportId);

    const insertStep = db.prepare('INSERT INTO steps (report_id, step_order, description, code, is_verification, status, duration_ms) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const insertShot = db.prepare('INSERT INTO screenshots (report_id, step_order, label, url, is_failure) VALUES (?, ?, ?, ?, ?)');
    const insertLog = db.prepare('INSERT INTO logs (report_id, level, message, created_at) VALUES (?, ?, ?, ?)');

    steps.forEach(s => insertStep.run(reportId, s.order, s.description, s.code, s.isVerification ? 1 : 0, s.status, s.durationMs));
    screenshots.forEach(s => insertShot.run(reportId, s.order, s.label, s.url, s.isFailure ? 1 : 0));
    logs.forEach(l => insertLog.run(reportId, l.level, l.message, l.createdAt));
  });
}

export const addLog = (reportId, level, message) =>
  db.prepare('INSERT INTO logs (report_id, level, message, created_at) VALUES (?, ?, ?, ?)').run(reportId, level, message, now());

export const listReports = () =>
  db.prepare('SELECT id, title, bug_description, target_url, status, verdict, created_at FROM reports ORDER BY created_at DESC').all().map(plain);

export function getReport(id) {
  const report = plain(db.prepare('SELECT * FROM reports WHERE id = ?').get(id));
  if (!report) return null;
  return {
    report,
    steps: db.prepare('SELECT * FROM steps WHERE report_id = ? ORDER BY step_order').all(id).map(plain),
    screenshots: db.prepare('SELECT * FROM screenshots WHERE report_id = ? ORDER BY step_order').all(id).map(plain),
    logs: db.prepare('SELECT * FROM logs WHERE report_id = ? ORDER BY id').all(id).map(plain),
  };
}

export const deleteReport = id => Number(db.prepare('DELETE FROM reports WHERE id = ?').run(id).changes) > 0;

export const getAnalytics = () => ({
  totals: plain(db.prepare(`SELECT
      COUNT(*) AS total,
      COALESCE(SUM(status = 'success'), 0) AS success,
      COALESCE(SUM(status = 'failed'), 0) AS failed,
      COALESCE(SUM(status = 'in_progress'), 0) AS inProgress,
      COALESCE(SUM(verdict = 'reproduced'), 0) AS reproduced,
      COALESCE(SUM(verdict = 'not_reproduced'), 0) AS notReproduced,
      ROUND(AVG(duration_ms) / 1000.0, 1) AS avgSeconds,
      ROUND(AVG(attempts), 2) AS avgAttempts
    FROM reports`).get()),
  perDay: db.prepare(`SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count
    FROM reports GROUP BY day ORDER BY day DESC LIMIT 14`).all().map(plain),
});
