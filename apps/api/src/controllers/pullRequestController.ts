import type { FastifyRequest, FastifyReply } from "fastify";
import { 
    getPullRequestsForRepository,
    createPullRequestForRepository,
} from "../services/pullRequestService.js";

function isMissingRepository(
    error: unknown,
): error is { code: string; constraint: string } {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        "constraint" in error &&
        error.code === "23503" &&
        error.constraint === "pull_requests_repository_id_fkey"
    );
}

export async function getPullRequests(
    request: FastifyRequest<{ Querystring: { repositoryId: string } }>,
) {
    const repositoryId = Number(request.query.repositoryId);

    return getPullRequestsForRepository(repositoryId);
}

export async function createPullRequest(
    request: FastifyRequest<{
        Body: {
            repositoryId: number;
            githubId: number;
            author: string;
            createdAt: string;
            title: string;
        };
    }>,
    reply: FastifyReply,
) {
    try {
        return await createPullRequestForRepository(
            request.body.repositoryId,
            request.body.githubId,
            request.body.author,
            request.body.createdAt,
            request.body.title,
        );
    } catch (error) {
        if (isMissingRepository(error)) {
            return reply.code(404).send({ message: "Repository not found" });
        }

        throw error;
    }
}