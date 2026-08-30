-- Ratings collected by functions/api/feedback.ts.
--
--   wrangler d1 create tipza-feedback
--   wrangler d1 execute tipza-feedback --remote --file=migrations/0001_article_feedback.sql
--
-- `voter` is a daily-rotating salted hash used only to collapse repeat votes.
-- It is not reversible, it stops matching the next day, and no IP address is
-- stored. See the endpoint for how it is derived.

CREATE TABLE IF NOT EXISTS article_feedback (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  article    TEXT    NOT NULL,
  locale     TEXT    NOT NULL,
  helpful    INTEGER NOT NULL CHECK (helpful IN (0, 1)),
  reason     TEXT,
  voter      TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS article_feedback_voter
  ON article_feedback (article, voter);

CREATE INDEX IF NOT EXISTS article_feedback_article
  ON article_feedback (article, helpful);
