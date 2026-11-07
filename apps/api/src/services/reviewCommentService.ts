import {
    findReviewCommentsByPullRequestId,
    createReviewComment,
} from "../repositories/reviewCommentRepository.js";

export async function getReviewCommentsForPullRequest(pullRequestId: number) {
    return findReviewCommentsByPullRequestId(pullRequestId);
}

export async function createReviewCommentForPullRequest(
    pullRequestId: number,
    body: string,
) {
    return createReviewComment(pullRequestId, body);
}