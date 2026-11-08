import { upsertUser } from "../repositories/userRepository.js";
import { createRepository } from "../repositories/repositoryRepository.js";
import { createPullRequest } from "../repositories/pullRequestRepository.js";
import { createReviewComment } from "../repositories/reviewCommentRepository.js";
import { githubGet, githubGetAll } from "../services/githubClient.js";

const FULL_NAME = "ConnorWM97/PR-Patterns";

type GitHubUser = { id: number; login: string };
type GitHubRepo = { full_name: string };
type GitHubPull = {
    id: number;
    number: number;
    title: string;
    created_at: string;
    user: { login: string };
};
type GitHubComment = {
    id: number;
    body: string;
    created_at: string;
    user: { login: string };
};

export async function importAccount(token: string) {
    const githubUser = await githubGet(token, "/user");
    const savedUser = await upsertUser(githubUser.id, githubUser.login, token);

    const githubRepo: GitHubRepo = await githubGet(token, `/repos/${FULL_NAME}`);
    const savedRepo = await createRepository(savedUser.id, githubRepo.full_name);

    const pulls: GitHubPull[] = await githubGetAll(
        token,
        `/repos/${githubRepo.full_name}/pulls?state=all`
    );

    for (const pull of pulls) {
        const savedPull = await createPullRequest(
            savedRepo.id,
            pull.id,
            pull.user.login,
            pull.created_at,
            pull.title,
        );
        
        const comments: GitHubComment[] = await githubGetAll(
            token,
            `/repos/${githubRepo.full_name}/pulls/${pull.number}/comments`,
        );

        for (const comment of comments) {
            await createReviewComment(
                savedPull.id,
                comment.id,
                comment.user.login,
                comment.created_at,
                comment.body,
            );
        }
    }

    return savedUser.id;
}