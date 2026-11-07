import { 
    findPullRequestsByRepositoryId,
    createPullRequest,
} from "../repositories/pullRequestRepository.js";

export async function getPullRequestsForRepository(repositoryId: number) {
    return findPullRequestsByRepositoryId(repositoryId);
}

export async function createPullRequestForRepository(
    repositoryId: number,
    title: string,
) {
    return createPullRequest(repositoryId, title);
}