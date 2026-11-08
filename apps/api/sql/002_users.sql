CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    github_id BIGINT NOT NULL UNIQUE,
    login TEXT NOT NULL,
    access_token TEXT NOT NULL
);

BEGIN;

UPDATE pull_requests AS pr
SET repository_id = kept.id
FROM repositories AS duplicate
JOIN repositories AS kept
    ON kept.user_id = duplicate.user_id
    AND kept.name = duplicate.name
    AND kept.id < duplicate.id
WHERE pr.repository_id = duplicate.id;

DELETE FROM repositories AS duplicate
USING repositories AS kept
WHERE kept.user_id = duplicate.user_id
    AND kept.name = duplicate.name
    AND kept.id < duplicate.id;

CREATE UNIQUE INDEX IF NOT EXISTS repositories_user_id_name_key
    ON repositories (user_id, name);

COMMIT;