import { pool } from "../db.js";

export async function upsertUser(githubId: number, login: string) {
    const result = await pool.query(
        `INSERT INTO users (github_id, login)
         Values ($1, $2)
         ON CONFLICT (github_id)
         DO UPDATE SET
             login = EXCLUDED.login
         RETURNING id, login`,
         [githubId, login],
    );

    return result.rows[0];
}