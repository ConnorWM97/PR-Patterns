import type { FastifyInstance } from "fastify";
import {
    getReviewComments,
    createReviewComment,
} from "../controllers/reviewCommentController.js";

export async function reviewCommentRoutes(fastify: FastifyInstance) {
    fastify.get("/review-comments", getReviewComments);
    fastify.post("/review-comments", createReviewComment);
}