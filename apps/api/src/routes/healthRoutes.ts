import { healthCheck } from '../controllers/healthController';
import { FastifyInstance } from 'fastify';

export async function healthRoutes(fastify: FastifyInstance) {
    fastify.get("/health", healthCheck);
}