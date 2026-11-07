ALTER TABLE review_comments
    ADD CONSTRAINT review_comments_pull_request_id_fkey
    FOREIGN KEY (pull_request_id) REFERENCES pull_requests (id);