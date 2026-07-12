import Fastify from 'fastify';

const app = Fastify();

await app.listen({
    port: 3000
});