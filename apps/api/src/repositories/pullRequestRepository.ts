import { pool } from "../db.js";

export async function findPullRequestsByRepositoryId(repositoryId: number) {
    const result = await pool.query(
        "Select id, github_id, author, created_at, title FROM pull_requests WHERE repository_id = $1",
        [repositoryId],
    );

    return result.rows;
}

export async function findPullRequestById(id: number) {
    const result = await pool.query(
        "SELECT id FROM pull_requests WHERE id = $1",
        [id],
    );

    return result.rows[0] ?? null;
}

export async function createPullRequest(
    repositoryId: number,
    githubId: number,
    author: string,
    createdAt: string,
    title: string
) {
    const result = await pool.query(
        `INSERT INTO pull_requests
            (repository_id, github_id, author, created_at, title)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, github_id, author, created_at, title`,
        [repositoryId, githubId, author, createdAt, title],
    );

    return result.rows[0]
}