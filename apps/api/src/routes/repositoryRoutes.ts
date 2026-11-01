import type { FastifyInstance } from "fastify";
import { 
    getRepositories,
    createRepository,
} from "../controllers/repositoryController.js";

export async function repositoryRoutes(fastify: FastifyInstance) {
    fastify.get("/repositories", getRepositories);
    fastify.post("/repositories", createRepository);
}