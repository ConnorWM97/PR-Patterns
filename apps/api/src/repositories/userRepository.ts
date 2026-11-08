import { pool } from "../db.js";

export async function upsertUser(githubId: number, login: string, accessToken: string) {
    const result = await pool.query(
        `INSERT INTO users (github_id, login, access_token)
         Values ($1, $2, $3)
         ON CONFLICT (github_id)
         DO UPDATE SET
             login = EXCLUDED.login,
             access_token = EXCLUDED.access_token
         RETURNING id, login`,
         [githubId, login, accessToken],
    );

    return result.rows[0];
}