CREATE TABLE IF NOT EXISTS bauman_devices (
  device_id TEXT PRIMARY KEY NOT NULL,
  display_code TEXT NOT NULL UNIQUE,
  public_key_jwk TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','blocked')),
  label TEXT,
  platform TEXT,
  browser TEXT,
  language TEXT,
  timezone TEXT,
  screen TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TEXT,
  approved_by TEXT,
  blocked_at TEXT,
  blocked_by TEXT,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS bauman_devices_status_idx ON bauman_devices(status);
CREATE INDEX IF NOT EXISTS bauman_devices_seen_idx ON bauman_devices(last_seen_at);

CREATE TABLE IF NOT EXISTS bauman_challenges (
  nonce TEXT PRIMARY KEY NOT NULL,
  device_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(device_id) REFERENCES bauman_devices(device_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS bauman_challenges_device_idx ON bauman_challenges(device_id);
CREATE INDEX IF NOT EXISTS bauman_challenges_expiry_idx ON bauman_challenges(expires_at);

CREATE TABLE IF NOT EXISTS bauman_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor TEXT NOT NULL,
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  detail_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS bauman_audit_created_idx ON bauman_audit_log(created_at);
CREATE INDEX IF NOT EXISTS bauman_audit_target_idx ON bauman_audit_log(target);