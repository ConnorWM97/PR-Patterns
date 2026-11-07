CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    github_id BIGINT NOT NULL UNIQUE,
    login TEXT NOT NULL,
    access_token TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS repositories_user_id_name_key
    ON repositories (user_id, name);