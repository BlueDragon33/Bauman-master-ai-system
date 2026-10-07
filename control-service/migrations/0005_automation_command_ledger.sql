ALTER TABLE bm_automation_policy ADD COLUMN revision INTEGER DEFAULT 1 NOT NULL;

CREATE TABLE IF NOT EXISTS bm_automation_commands (
  command_id TEXT PRIMARY KEY NOT NULL,
  payload_hash TEXT NOT NULL,
  state TEXT DEFAULT 'processing' NOT NULL,
  result_json TEXT,
  actor TEXT NOT NULL,
  control_device_id TEXT,
  execution_nonce TEXT NOT NULL,
  error_code TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS bm_automation_commands_created_idx
  ON bm_automation_commands(created_at DESC);
