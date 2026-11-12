import { Pool } from "pg";

function requiredEnv(name: string): string {
    const value = process.env[name];

    if (value === undefined || value === "") {
        throw new Error(`Missing environment variable ${name}`);
    }
    return value;
}

export const pool = new Pool({
    host: requiredEnv("PGHOST"),
    port: 5432,
    user: requiredEnv("PGUSER"),
    password: requiredEnv("PGPASSWORD"),
    database: requiredEnv("PGDATABASE"),
});

pool.on("error", (error) => {
    console.error("Unexpected error on an idle PostgreSQL connection", error);
});