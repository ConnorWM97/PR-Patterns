import type { FastifyRequest } from "fastify";
import { 
    getPullRequestsForRepository,
    createPullRequestForRepository,
} from "../services/pullRequestService.js";

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
) {
    return createPullRequestForRepository(
        request.body.repositoryId,
        request.body.githubId,
        request.body.author,
        request.body.createdAt,
        request.body.title,
    );
}