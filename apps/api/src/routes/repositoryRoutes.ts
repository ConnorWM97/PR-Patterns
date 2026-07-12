import { FastifyInstance } from "fastify";
import { getRepositories } from "../controllers/repositoryController";

export async function repositoryRoutes(fastify: FastifyInstance) {
    fastify.get("/repositories", getRepositories);
}