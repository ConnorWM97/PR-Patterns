import type { FastifyRequest } from "fastify";
import { getPullRequestsForRepository } from "../services/pullRequestService.js";

export async function getPullRequests(
    request: FastifyRequest<{ Querystring: { repositoryId: string } }>,
) {
    const repositoryId = Number(request.query.repositoryId);

    return getPullRequestsForRepository(repositoryId);
}