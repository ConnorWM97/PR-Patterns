CREATE TABLE IF NOT EXISTS review_comments (
    id SERIAL PRIMARY KEY,
    pull_request_id INTEGER NOT NULL REFERENCES pull_requests (id),
    github_id BIGINT NOT NULL UNIQUE,
    author TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    body TEXT NOT NULL
);

-- Same upgrade as pull_requests: a table created before these columns existed
-- is left unchanged by CREATE TABLE IF NOT EXISTS.
BEGIN;

ALTER TABLE review_comments ADD COLUMN IF NOT EXISTS github_id BIGINT;
ALTER TABLE review_comments ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE review_comments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

UPDATE review_comments
SET github_id = -id::bigint
WHERE github_id IS NULL;

UPDATE review_comments
SET author = 'unknown'
WHERE author IS NULL;

UPDATE review_comments
SET created_at = TIMESTAMPTZ '1970-01-01 00:00:00+00'
WHERE created_at IS NULL;

ALTER TABLE review_comments ALTER COLUMN github_id SET NOT NULL;
ALTER TABLE review_comments ALTER COLUMN author SET NOT NULL;
ALTER TABLE review_comments ALTER COLUMN created_at SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'review_comments'::regclass
          AND conname = 'review_comments_github_id_key'
    ) THEN
        ALTER TABLE review_comments
            ADD CONSTRAINT review_comments_github_id_key UNIQUE (github_id);
    END IF;
END $$;

COMMIT;