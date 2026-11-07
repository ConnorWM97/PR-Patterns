import { Pool } from "pg";

export const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "pr_patterns",
});

pool.on("error", (error) => {
    console.error("Unexpected error on an idle PostgreSQL connection", error);
});