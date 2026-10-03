import { pool } from "../db.js";

export async function findRepositoriesByUserId(userId: number) {
    const result = await pool.query(
        "SELECT id, name FROM repositories WHERE user_id = $1",
        [userId],
    );

    return result.rows;
}