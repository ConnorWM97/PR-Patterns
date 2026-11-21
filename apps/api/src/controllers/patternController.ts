import type { FastifyReply, FastifyRequest } from "fastify";
import { getPatterns } from "../services/patternService.js";

export async function getPatternList(
    request: FastifyRequest<{
        Querystring: { repositoryId?: number; author?: string };
    }>,
    reply: FastifyReply,
) {
    const repositoryId = request.query.repositoryId;
    const author = request.query.author;

    if (repositoryId !== undefined && author === undefined) {
        return getPatterns({ repositoryId });
    }

    if (author !== undefined && repositoryId === undefined) {
        return getPatterns({ author });
    }

    return reply.code(400).send({
        message: "Provide a repositoryId or an author",
    });
}
