CREATE TABLE IF NOT EXISTS bm_automation_policy (
  id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
  auto_approve_devices INTEGER DEFAULT 0 NOT NULL CHECK (auto_approve_devices IN (0, 1)),
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_by TEXT
);

INSERT OR IGNORE INTO bm_automation_policy (id, auto_approve_devices, updated_by)
VALUES (1, 0, 'system:init');
