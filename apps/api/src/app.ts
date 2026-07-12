import Fastify from 'fastify';
import { healthRoutes } from './routes/healthRoutes';
import { repositoryRoutes } from './routes/repositoryRoutes';

export const app = Fastify();

app.register(healthRoutes);
app.register(repositoryRoutes);

async function start() {
    try {
        await app.listen({
            port: 3000,
            host: "0.0.0.0",
        });
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
}

start();