-- Apply to the dedicated CONTACT_DB, not to the admin DB. Times are UTC epoch seconds.
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  fingerprint TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  product TEXT NOT NULL,
  message TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (delivery_status IN ('pending', 'sending', 'sent', 'queued', 'uncertain')),
  attempts INTEGER NOT NULL DEFAULT 0,
  attempted_at INTEGER,
  last_error TEXT,
  provider_message_id TEXT
);
CREATE INDEX IF NOT EXISTS contact_message_fingerprint ON contact_messages(fingerprint, created_at);
CREATE INDEX IF NOT EXISTS contact_message_created ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS contact_message_status ON contact_messages(delivery_status, created_at);
CREATE TABLE IF NOT EXISTS contact_attempts (
  id TEXT PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS contact_attempt_ip_time ON contact_attempts(ip_hash, created_at);
CREATE INDEX IF NOT EXISTS contact_attempt_created ON contact_attempts(created_at);
