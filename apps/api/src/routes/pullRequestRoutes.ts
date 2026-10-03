import type { FastifyInstance } from "fastify";
import { getPullRequests } from "../controllers/pullRequestController.js";

export async function pullRequestRoutes(fastify: FastifyInstance) {
    fastify.get("/pull-requests", getPullRequests);
}