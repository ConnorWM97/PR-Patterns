import type { FastifyRequest } from "fastify";
import {
    getReviewCommentsForPullRequest,
    createReviewCommentForPullRequest,
} from "../services/reviewCommentService.js";

export async function getReviewComments(
    request: FastifyRequest<{ Querystring: { pullRequestId: string } }>,
) {
    const pullRequestId = Number(request.query.pullRequestId);

    return getReviewCommentsForPullRequest(pullRequestId);
}

export async function createReviewComment(
    request: FastifyRequest<{
        Body: { pullRequestId: number | string; body: string };
    }>,
) {
    const pullRequestId = Number(request.body.pullRequestId);
    const body = request.body.body;

    return createReviewCommentForPullRequest(pullRequestId, body);
}