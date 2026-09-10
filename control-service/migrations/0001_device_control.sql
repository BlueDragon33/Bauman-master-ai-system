CREATE TABLE IF NOT EXISTS bm_devices (
  device_id TEXT PRIMARY KEY NOT NULL,
  display_code TEXT UNIQUE NOT NULL,
  public_jwk_json TEXT NOT NULL,
  device_type TEXT DEFAULT 'unknown' NOT NULL,
  display_name TEXT,
  label TEXT,
  status TEXT DEFAULT 'pending' NOT NULL,
  edit_enabled INTEGER DEFAULT 0 NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  last_seen_at INTEGER NOT NULL,
  approved_at TEXT,
  approved_by TEXT,
  blocked_at TEXT
);

CREATE INDEX IF NOT EXISTS bm_devices_status_created_idx
  ON bm_devices(status, created_at DESC);
CREATE INDEX IF NOT EXISTS bm_devices_last_seen_idx
  ON bm_devices(last_seen_at DESC);

CREATE TABLE IF NOT EXISTS bm_control_commands (
  command_id TEXT PRIMARY KEY NOT NULL,
  device_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  expected_status TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  state TEXT DEFAULT 'processing' NOT NULL,
  result_status TEXT,
  actor TEXT NOT NULL,
  control_device_id TEXT,
  execution_nonce TEXT NOT NULL,
  error_code TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS bm_control_commands_device_idx
  ON bm_control_commands(device_id, created_at DESC);

CREATE TABLE IF NOT EXISTS bm_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  detail_json TEXT DEFAULT '{}' NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS bm_audit_created_idx
  ON bm_audit_log(created_at DESC);
