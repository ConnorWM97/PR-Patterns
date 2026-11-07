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
         ON CONFLICT (user_id, name)
         DO UPDATE SET name = EXCLUDED.name
         RETURNING id, name`,
        [userId, name],
    );

    return result.rows[0];
}