CREATE TABLE IF NOT EXISTS reports (
  id               TEXT PRIMARY KEY,
  title            TEXT,
  bug_description  TEXT NOT NULL,
  target_url       TEXT NOT NULL,
  framework        TEXT NOT NULL DEFAULT 'playwright',
  status           TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'success', 'failed')),
  verdict          TEXT CHECK (verdict IN ('reproduced', 'not_reproduced')),
  expected_result  TEXT,
  actual_result    TEXT,
  observed_result  TEXT,
  generated_script TEXT,
  error_message    TEXT,
  attempts         INTEGER NOT NULL DEFAULT 0,
  duration_ms      INTEGER,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS steps (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id       TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  step_order      INTEGER NOT NULL,
  description     TEXT NOT NULL,
  code            TEXT NOT NULL,
  is_verification INTEGER NOT NULL DEFAULT 0,
  status          TEXT CHECK (status IN ('passed', 'failed', 'skipped')),
  duration_ms     INTEGER
);

CREATE TABLE IF NOT EXISTS screenshots (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id   TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  step_order  INTEGER NOT NULL,
  label       TEXT NOT NULL,
  url         TEXT NOT NULL,
  is_failure  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id   TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  level       TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error')),
  message     TEXT NOT NULL,
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_steps_report ON steps(report_id);
CREATE INDEX IF NOT EXISTS idx_screenshots_report ON screenshots(report_id);
CREATE INDEX IF NOT EXISTS idx_logs_report ON logs(report_id);
