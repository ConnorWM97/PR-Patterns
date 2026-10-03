import { findPullRequestsByRepositoryId } from "../repositories/pullRequestRepository.js";

export async function getPullRequestsForRepository(repositoryId: number) {
    return findPullRequestsByRepositoryId(repositoryId);
}