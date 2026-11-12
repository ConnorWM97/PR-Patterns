CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    github_id BIGINT NOT NULL UNIQUE,
    login TEXT NOT NULL
);

BEGIN;

UPDATE pull_requests AS pr
SET repository_id = kept.id
FROM repositories AS duplicate
JOIN (
    SELECT user_id, name, MIN(id) AS id
    FROM repositories
    GROUP BY user_id, name
) AS kept
    ON kept.user_id = duplicate.user_id
    AND kept.name = duplicate.name
    AND kept.id < duplicate.id
WHERE pr.repository_id = duplicate.id;

DELETE FROM repositories AS duplicate
USING (
    SELECT user_id, name, MIN(id) AS id
    FROM repositories
    GROUP BY user_id, name
) AS kept
WHERE kept.user_id = duplicate.user_id
    AND kept.name = duplicate.name
    AND duplicate.id <> kept.id;

CREATE UNIQUE INDEX IF NOT EXISTS repositories_user_id_name_key
    ON repositories (user_id, name);

ALTER TABLE users DROP COLUMN IF EXISTS access_token;

ALTER TABLE repositories ADD COLUMN IF NOT EXISTS github_id BIGINT;

UPDATE repositories
SET github_id = -id::bigint
WHERE github_id IS NULL;

ALTER TABLE repositories ALTER COLUMN github_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'repositories'::regclass
          AND conname = 'repositories_user_id_github_id_key'
    ) THEN
        ALTER TABLE repositories
            ADD CONSTRAINT repositories_user_id_github_id_key
            UNIQUE (user_id, github_id);
    END IF;
END $$;

COMMIT;
