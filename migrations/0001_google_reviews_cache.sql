CREATE TABLE IF NOT EXISTS google_reviews_cache (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  response_json TEXT,
  response_status INTEGER NOT NULL DEFAULT 200,
  fetched_at INTEGER,
  refresh_after INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO google_reviews_cache (id, refresh_after) VALUES (1, 0);
