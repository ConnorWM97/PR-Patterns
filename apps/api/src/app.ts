import Fastify from 'fastify';
import { healthRoutes } from "./routes/healthRoutes.js";
import { repositoryRoutes } from "./routes/repositoryRoutes.js";
import { pullRequestRoutes } from "./routes/pullRequestRoutes.js";

export const app = Fastify({ logger: true });

app.register(healthRoutes);
app.register(repositoryRoutes);
app.register(pullRequestRoutes);
async function start() {
    try {
        const port = Number(process.env.PORT ?? 3000);

        await app.listen({
            port,
            host: "0.0.0.0",
        });
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
}

start();