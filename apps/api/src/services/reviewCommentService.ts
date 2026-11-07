import {
    findReviewCommentsByPullRequestId,
    createReviewComment,
} from "../repositories/reviewCommentRepository.js";
import { findPullRequestById } from "../repositories/pullRequestRepository.js";

export async function getReviewCommentsForPullRequest(pullRequestId: number) {
    const pullRequest = await findPullRequestById(pullRequestId);

    if (pullRequest === null) {
        return null;
    }

    return findReviewCommentsByPullRequestId(pullRequestId);
}

export async function createReviewCommentForPullRequest(
    pullRequestId: number,
    githubId: number,
    author: string,
    createdAt: string,
    body: string,
) {
    return createReviewComment(pullRequestId, githubId, author, createdAt, body);
}