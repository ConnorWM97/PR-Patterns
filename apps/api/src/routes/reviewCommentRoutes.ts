import type { FastifyInstance } from "fastify";
import {
    getReviewComments,
    createReviewComment,
} from "../controllers/reviewCommentController.js";

export async function reviewCommentRoutes(fastify: FastifyInstance) {
    fastify.get("/review-comments", {
        schema: {
            querystring: {
                type: "object",
                required: ["pullRequestId"],
                properties: {
                    pullRequestId: { type: "integer", minimum: 1 },
                },
            },
        },
    }, getReviewComments);
    fastify.post("/review-comments", {
        schema: {
            body: {
                type: "object",
                required: ["pullRequestId", "githubId", "author", "createdAt", "body"],
                properties: {
                    pullRequestId: { type: "integer", minimum: 1},
                    githubId: { type: "integer", minimum: 1},
                    author: { type: "string", minLength: 1 },
                    createdAt: { type: "string", minLength: 1, format: "date-time" },
                    body: { type: "string", minLength: 1 },
                },
            },
        },
    }, createReviewComment);
}