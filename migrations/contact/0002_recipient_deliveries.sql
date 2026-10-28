-- Independent, durable delivery state for every configured recipient.
CREATE TABLE contact_deliveries (
  message_id TEXT NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
  recipient TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (delivery_status IN ('pending','sending','sent','queued','uncertain')),
  attempts INTEGER NOT NULL DEFAULT 0,
  attempted_at INTEGER,
  last_error TEXT,
  provider_message_id TEXT,
  PRIMARY KEY (message_id, recipient)
);
CREATE INDEX contact_delivery_status ON contact_deliveries(delivery_status, attempted_at);
