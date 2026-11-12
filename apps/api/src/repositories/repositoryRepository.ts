import { pool } from "../db.js";

export async function findRepositoriesByUserId(userId: number) {
    const result = await pool.query(
        "SELECT id, name FROM repositories WHERE user_id = $1",
        [userId],
    );

    return result.rows;
}

export async function createRepository(userId: number, name: string) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const inserted = await client.query(
            `INSERT INTO repositories (user_id, name, github_id)
             VALUES ($1, $2, 0)
             RETURNING id, name`,
             [userId, name],
        );
        const row = inserted.rows[0];
        await client.query(
            "UPDATE repositories SET github_id = -id WHERE id = $1",
            [row.id],
        );
        await client.query("COMMIT");
        return row;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function upsertRepository(userId: number, githubId: number, name: string) {
    const claimed = await pool.query(
        `UPDATE repositories
         SET github_id = $2
         WHERE user_id = $1
           AND name = $3
           AND github_id < 0
         RETURNING id, name`,
         [userId, githubId, name],
    );

    if (claimed.rows.length > 0) {
        return claimed.rows[0];
    }
    
    const result = await pool.query(
        `INSERT INTO repositories (user_id, github_id, name)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, github_id)
         DO UPDATE SET name = EXCLUDED.name
         RETURNING id, name`,
        [userId, githubId, name],
    );

    return result.rows[0];
}

export async function deleteRepositoriesExcept(userId: number, githubIds: number[]) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        
        await client.query(
            `DELETE FROM review_comments
             WHERE pull_request_id IN (
                 SELECT pull_requests.id
                 FROM pull_requests
                 JOIN repositories ON repositories.id = pull_requests.repository_id
                 WHERE repositories.user_id = $1
                   AND NOT (repositories.github_id = ANY($2::bigint[]))
             )`,
             [userId, githubIds],
        );
        
        await client.query(
            `DELETE FROM pull_requests
             WHERE repository_id IN (
                 SELECT id
                 FROM repositories
                 WHERE user_id = $1
                   AND NOT (github_id = ANY($2::bigint[]))
             )`,
             [userId, githubIds],
        );

        await client.query(
            `DELETE FROM repositories
             WHERE user_id = $1
               AND NOT (github_id = ANY($2::bigint[]))`,
            [userId, githubIds],
        );

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
