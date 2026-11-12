CREATE TABLE IF NOT EXISTS repositories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pull_requests (
    id SERIAL PRIMARY KEY,
    repository_id INTEGER NOT NULL REFERENCES repositories (id),
    github_id BIGINT NOT NULL UNIQUE,
    author TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    title TEXT NOT NULL
);

-- Older databases already have pull_requests without github_id, author, or
-- created_at. CREATE TABLE IF NOT EXISTS leaves that table as-is, so add the
-- columns, keep every existing row, then match the fresh-database constraints.
-- github_id uses -id: unique per row, and negative so it cannot collide with
-- a real GitHub id. author and created_at have no source data.
BEGIN;

ALTER TABLE pull_requests ADD COLUMN IF NOT EXISTS github_id BIGINT;
ALTER TABLE pull_requests ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE pull_requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

UPDATE pull_requests
SET github_id = -id::bigint
WHERE github_id IS NULL;

UPDATE pull_requests
SET author = 'unknown'
WHERE author IS NULL;

UPDATE pull_requests
SET created_at = TIMESTAMPTZ '1970-01-01 00:00:00+00'
WHERE created_at IS NULL;

ALTER TABLE pull_requests ALTER COLUMN github_id SET NOT NULL;
ALTER TABLE pull_requests ALTER COLUMN author SET NOT NULL;
ALTER TABLE pull_requests ALTER COLUMN created_at SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'pull_requests'::regclass
          AND conname = 'pull_requests_github_id_key'
    ) THEN
        ALTER TABLE pull_requests
            ADD CONSTRAINT pull_requests_github_id_key UNIQUE (github_id);
    END IF;
END $$;

DELETE FROM review_comments
WHERE pull_request_id IN (
    SELECT pull_requests.id
    FROM pull_requests
    LEFT JOIN repositories ON repositories.id = pull_requests.repository_id
    WHERE repositories.id IS NULL
);

DELETE FROM pull_requests
WHERE NOT EXISTS (
    SELECT 1
    FROM repositories
    WHERE repositories.id = pull_requests.repository_id
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'pull_requests'::regclass
          AND conname = 'pull_requests_repository_id_fkey'
    ) THEN
        ALTER TABLE pull_requests
            ADD CONSTRAINT pull_requests_repository_id_fkey
            FOREIGN KEY (repository_id) REFERENCES repositories (id);
    END IF;
END $$;

COMMIT;