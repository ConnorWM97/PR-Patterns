CREATE TABLE IF NOT EXISTS review_comments (
    id SERIAL PRIMARY KEY,
    pull_request_id INTEGER NOT NULL REFERENCES pull_requests (id),
    github_id BIGINT NOT NULL UNIQUE,
    author TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    body TEXT NOT NULL
);