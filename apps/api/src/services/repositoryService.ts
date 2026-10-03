import { findRepositoriesByUserId } from "../repositories/repositoryRepository.js";

export async function getUserRepositories(userId: number) {
    return findRepositoriesByUserId(userId);
}