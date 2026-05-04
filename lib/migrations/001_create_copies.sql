CREATE TABLE IF NOT EXISTS copies (
  id         TEXT NOT NULL PRIMARY KEY,
  card_id    TEXT NOT NULL,
  condition  TEXT NOT NULL,
  location   TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_copies_card_id ON copies (card_id);
