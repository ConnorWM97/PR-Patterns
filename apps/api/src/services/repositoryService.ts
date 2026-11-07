import { 
    findRepositoriesByUserId,
    createRepository,
} from "../repositories/repositoryRepository.js";

export async function getUserRepositories(userId: number) {
    return findRepositoriesByUserId(userId);
}

export async function createRepositoryForUser(userId: number, name: string) {
    return createRepository(userId, name);
}