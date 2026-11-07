import { pool } from "../db.js";

export async function findReviewCommentsByPullRequestId(pullRequestId: number) {
    const result = await pool.query(
        "SELECT id, github_id, author, created_at, body FROM review_comments WHERE pull_request_id = $1",
        [pullRequestId],
    );

    return result.rows;
}

export async function createReviewComment(
    pullRequestId: number,
    githubId: number,
    author: string,
    createdAt: string,
    body: string,
) {
    const result = await pool.query(
        `INSERT INTO review_comments
            (pull_request_id, github_id, author, created_at, body)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, github_id, author, created_at, body`,
        [pullRequestId, githubId, author, createdAt, body],
    );

    return result.rows[0];
}