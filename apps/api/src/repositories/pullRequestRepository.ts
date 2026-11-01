import { pool } from "../db.js";

export async function findPullRequestsByRepositoryId(repositoryId: number) {
    const result = await pool.query(
        "Select id, title FROM pull_requests WHERE repository_id = $1",
        [repositoryId],
    );

    return result.rows;
}

export async function createPullRequest(repositoryId: number, title: string) {
    const result = await pool.query(
        "INSERT INTO pull_requests (repository_id, title) VALUES ($1, $2) RETURNING id, title",
        [repositoryId, title],
    );

    return result.rows[0]
}