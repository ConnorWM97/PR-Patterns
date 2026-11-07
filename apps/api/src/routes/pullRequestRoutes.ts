import type { FastifyInstance } from "fastify";
import { 
    getPullRequests,
    createPullRequest,
} from "../controllers/pullRequestController.js";

export async function pullRequestRoutes(fastify: FastifyInstance) {
    fastify.get("/pull-requests", getPullRequests);
    fastify.post("/pull-requests", createPullRequest);
}