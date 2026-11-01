import type { FastifyRequest } from "fastify";
import { 
    getUserRepositories,
    createRepositoryForUser,
} from "../services/repositoryService.js";

export async function getRepositories(
    request: FastifyRequest<{ Querystring: { userId: string } }>,
) {
    const userId = Number(request.query.userId);

    return getUserRepositories(userId);
}

export async function createRepository(
    request: FastifyRequest<{
        Body: { userId: number | string; name: string };
    }>,
) {
    const userId = Number(request.body.userId);
    const name = request.body.name;

    return createRepositoryForUser(userId, name);
}