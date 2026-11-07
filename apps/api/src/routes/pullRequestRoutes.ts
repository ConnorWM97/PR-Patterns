import type { FastifyInstance } from "fastify";
import { 
    getPullRequests,
    createPullRequest,
} from "../controllers/pullRequestController.js";

export async function pullRequestRoutes(fastify: FastifyInstance) {
    fastify.get("/pull-requests", getPullRequests);
    fastify.post("/pull-requests", {
        schema: {
            body: {
                type: "object",
                required: ["repositoryId", "githubId", "author", "createdAt", "title"],
                properties: {
                    repositoryId: { type: "integer", minimum: 1 },
                    githubId: { type: "integer", minimum: 1 },
                    author: { type: "string", minLength: 1 },
                    createdAt: { type: "string", minLength: 1 },
                    title: { type: "string", minLength: 1 },
                },
            },
        },
    }, createPullRequest);
}