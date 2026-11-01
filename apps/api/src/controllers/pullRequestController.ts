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
        Body: { repositoryId: number | string; title: string };
    }>,
) {
    const repositoryId = Number(request.body.repositoryId);
    const title = request.body.title;

    return createPullRequestForRepository(repositoryId, title);
}