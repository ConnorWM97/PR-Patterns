import { pool } from "../db.js";

export async function findPullRequestsByRepositoryId(repositoryId: number) {
    const result = await pool.query(
        "Select id, title FROM pull_requests WHERE repository_id = $1",
        [repositoryId],
    );

    return result.rows;
}