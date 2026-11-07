import { 
    findPullRequestsByRepositoryId,
    createPullRequest,
} from "../repositories/pullRequestRepository.js";

export async function getPullRequestsForRepository(repositoryId: number) {
    return findPullRequestsByRepositoryId(repositoryId);
}

export async function createPullRequestForRepository(
    repositoryId: number,
    githubId: number,
    author: string,
    createdAt: string,
    title: string,
) {
    return await createPullRequest(
        repositoryId,
        githubId,
        author,
        createdAt,
        title,
    );
}