-- Feedback テーブル作成 (Manual Migration for Cloudflare D1)
-- Run this in Cloudflare D1 Studio

CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
