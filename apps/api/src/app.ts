import Fastify from 'fastify';
import { healthRoutes } from "./routes/healthRoutes.js";
import { repositoryRoutes } from "./routes/repositoryRoutes.js";
import { pullRequestRoutes } from "./routes/pullRequestRoutes.js";

export const app = Fastify();

app.register(healthRoutes);
app.register(repositoryRoutes);
app.register(pullRequestRoutes);
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