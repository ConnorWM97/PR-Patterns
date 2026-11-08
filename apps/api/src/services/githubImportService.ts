import { upsertUser } from "../repositories/userRepository.js";
import { upsertRepository } from "../repositories/repositoryRepository.js";
import { upsertPullRequest } from "../repositories/pullRequestRepository.js";
import { upsertReviewComment } from "../repositories/reviewCommentRepository.js";
import { githubGet, githubGetAll } from "../services/githubClient.js";


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
    pull_request_url: string;
    user: { login: string };
};

export async function importAccount(token: string) {
    const githubUser = await githubGet(token, "/user");
    const savedUser = await upsertUser(githubUser.id, githubUser.login, token);

    const repos: GitHubRepo[] = await githubGetAll(
        token,
        "/user/repos?affiliation=owner&visibility=public",
    );

    for (const githubRepo of repos) {
        const savedRepo = await upsertRepository(savedUser.id, githubRepo.full_name);

        const pulls: GitHubPull[] = await githubGetAll(
            token,
            `/repos/${githubRepo.full_name}/pulls?state=all`,
        );

        const pullIdsByNumber = new Map<number, number>();

        for (const pull of pulls) {
            const savedPull = await upsertPullRequest(
                savedRepo.id,
                pull.id,
                pull.user.login,
                pull.created_at,
                pull.title,
            );
            pullIdsByNumber.set(pull.number, savedPull.id);
        }

        const comments: GitHubComment[] = await githubGetAll(
            token,
            `/repos/${githubRepo.full_name}/pulls/comments`,
        );

        for (const comment of comments) {
            const pullNumber = Number(comment.pull_request_url.split("/").at(-1));
            const pullRequestId = pullIdsByNumber.get(pullNumber);

            if (pullRequestId === undefined) {
                continue;
            }

            await upsertReviewComment(
                pullRequestId,
                comment.id,
                comment.user.login,
                comment.created_at,
                comment.body,
            );
        }
    }

    return savedUser.id;
}
