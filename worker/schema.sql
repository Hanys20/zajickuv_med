CREATE TABLE IF NOT EXISTS admin_user (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  body TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS honey_availability (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  availability TEXT NOT NULL CHECK(availability IN ('available','sold-out'))
);

CREATE TABLE IF NOT EXISTS pricing (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data TEXT NOT NULL
);
