import type { FastifyReply, FastifyRequest } from "fastify";
import { getPatterns } from "../services/patternService.js";

export async function getPatternList(
    request: FastifyRequest<{
        Querystring: { repositoryId?: number; author?: string };
    }>,
    reply: FastifyReply,
) {
    const hasRepository = request.query.repositoryId !== undefined;
    const hasAuthor = request.query.author !== undefined;

    if (hasRepository === hasAuthor) {
        return reply.code(400).send({
            message: "Provide a repositoryId or an author",
        });
    }

    if (hasRepository) {
        return getPatterns({ repositoryId: request.query.repositoryId as number });
    }

    return getPatterns({ author: request.query.author as string });
}