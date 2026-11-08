import type { FastifyInstance } from "fastify";
import { startGithubLogin, githubCallback } from "../controllers/authController.js";

export async function authRoutes(fastify: FastifyInstance) {
    fastify.get("/auth/github", startGithubLogin);
    fastify.get("/auth/github/callback", githubCallback);
}