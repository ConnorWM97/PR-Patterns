import type { FastifyInstance } from "fastify";
import { getPatternList } from "../controllers/patternController.js";

export async function patternRoutes(fastify: FastifyInstance) {
    fastify.get("/patterns", {
        schema: {
            querystring: {
                type: "object",
                properties: {
                    repositoryId: { type: "integer", minimum: 1 },
                    author: { type: "string", minLength: 1 },
                },
            },
        },
    }, getPatternList);
}
