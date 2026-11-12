import { pool } from "../db.js";

export async function findRepositoriesByUserId(userId: number) {
    const result = await pool.query(
        "SELECT id, name FROM repositories WHERE user_id = $1",
        [userId],
    );

    return result.rows;
}

export async function createRepository(userId: number, name: string) {
    const result = await pool.query(
        `INSERT INTO repositories (user_id, name)
         VALUES ($1, $2)
         RETURNING id, name`,
        [userId, name],
    );

    return result.rows[0];
}

export async function upsertRepository(userId: number, name: string) {
    const result = await pool.query(
        `INSERT INTO repositories (user_id, name)
         VALUES ($1, $2)
         ON CONFLICT (user_id, name)
         DO UPDATE SET name = EXCLUDED.name
         RETURNING id, name`,
        [userId, name],
    );

    return result.rows[0];
}

export async function deleteRepositoriesExcept(userId: number, names: string[]) {
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
                   AND NOT (repositories.name = ANY($2::text[]))
             )`,
             [userId, names],
        );
        
        await client.query(
            `DELETE FROM pull_requests
             WHERE repository_id IN (
                 SELECT id
                 FROM repositories
                 WHERE user_id = $1
                   AND NOT (name = ANY($2::text[]))
             )`,
             [userId, names],
        );

        await client.query(
            `DELETE FROM repositories
             WHERE user_id = $1
               AND NOT (name = ANY($2::text[]))`,
            [userId, names],
        );

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
