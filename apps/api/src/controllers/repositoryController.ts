import { getUserRepositories } from "../services/repositoryService.js";

export async function getRepositories(request) {
    const userId = Number(request.query.userId);

    const repositories = await getUserRepositories(userId);

    return repositories;
}