import { healthCheck } from "../controllers/healthController.js";
import type { FastifyInstance } from "fastify";

export async function healthRoutes(fastify: FastifyInstance) {
    fastify.get("/health", healthCheck);
}