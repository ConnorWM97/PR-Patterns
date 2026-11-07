import type { FastifyReply, FastifyRequest } from "fastify";
import {
    getReviewCommentsForPullRequest,
    createReviewCommentForPullRequest,
} from "../services/reviewCommentService.js";

function isMissingPullRequest(
    error: unknown,
): error is { code: string; constraint: string } {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        "constraint" in error &&
        error.code === "23503" &&
        error.constraint === "review_comments_pull_request_id_fkey"
    );
}

export async function getReviewComments(
    request: FastifyRequest<{ Querystring: { pullRequestId: number } }>,
    reply: FastifyReply,
) {
    const comments = await getReviewCommentsForPullRequest(request.query.pullRequestId);

    if (comments === null) {
        return reply.code(404).send({ message: "Pull request not found" });
    }

    return comments;
}

export async function createReviewComment(
    request: FastifyRequest<{
        Body: {
            pullRequestId: number;
            githubId: number;
            author: string;
            createdAt: string;
            body: string;
        };
    }>,
) {
    return createReviewCommentForPullRequest(
        request.body.pullRequestId,
        request.body.githubId,
        request.body.author,
        request.body.createdAt,
        request.body.body,
    );
}