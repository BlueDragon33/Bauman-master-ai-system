CREATE TABLE IF NOT EXISTS bm_content_reviews (
  review_id TEXT PRIMARY KEY NOT NULL,
  subject_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  revision TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  source_path TEXT,
  summary TEXT,
  request_hash TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  requested_by TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  reviewed_at TEXT,
  reviewed_by TEXT,
  decision_note TEXT,
  published_at TEXT,
  published_by TEXT,
  UNIQUE(subject_id, resource_type, resource_id, revision)
);

CREATE INDEX IF NOT EXISTS bm_content_reviews_status_created_idx
  ON bm_content_reviews(status, created_at DESC);

CREATE INDEX IF NOT EXISTS bm_content_reviews_resource_idx
  ON bm_content_reviews(subject_id, resource_type, resource_id, created_at DESC);

CREATE TABLE IF NOT EXISTS bm_content_review_commands (
  command_id TEXT PRIMARY KEY NOT NULL,
  review_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  expected_status TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  state TEXT DEFAULT 'processing' NOT NULL,
  result_status TEXT,
  actor TEXT NOT NULL,
  execution_nonce TEXT NOT NULL,
  error_code TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS bm_content_review_commands_review_idx
  ON bm_content_review_commands(review_id, created_at DESC);
