import { getUserRepositories } from '../services/repositoryService';

export async function getRepositories(request) {
    const userId = request.user.id;

    const repositories = await getUserRepositories(userId);

    return repositories;
}