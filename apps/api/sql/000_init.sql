CREATE TABLE IF NOT EXISTS repositories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pull_requests (
    id SERIAL PRIMARY KEY,
    repository_id INTEGER NOT NULL,
    github_id BIGINT NOT NULL UNIQUE,
    author TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    title TEXT NOT NULL
);