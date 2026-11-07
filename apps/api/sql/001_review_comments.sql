CREATE TABLE IF NOT EXISTS review_comments (
    id SERIAL PRIMARY KEY,
    pull_request_id INTEGER NOT NULL,
    body TEXT NOT NULL
);