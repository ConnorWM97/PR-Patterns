import type { FastifyInstance } from "fastify";
import { getRepositories } from "../controllers/repositoryController.js";

export async function repositoryRoutes(fastify: FastifyInstance) {
    fastify.get("/repositories", getRepositories);
}