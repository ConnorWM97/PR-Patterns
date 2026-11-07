import { pool } from "../db.js";

export async function findReviewCommentsByPullRequestId(pullRequestId: number) {
    const result = await pool.query(
        "SELECT id, body FROM review_comments WHERE pull_request_id = $1",
        [pullRequestId],
    );

    return result.rows;
}

export async function createReviewComment(pullRequestId: number, body: string) {
    const result = await pool.query(
        "INSERT INTO review_comments (pull_request_id, body) VALUES ($1, $2) RETURNING id, body",
        [pullRequestId, body],
    );

    return result.rows[0];
}